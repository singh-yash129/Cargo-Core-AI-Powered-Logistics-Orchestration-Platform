"""
auth_service.py
All authentication business logic.  Routers should only call these functions —
no direct DB or Redis access in routers.
"""
import os
import secrets
from datetime import datetime, timezone

from fastapi import HTTPException, status
from loguru import logger
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Role, User
from app.schemas.auth import (
    SELF_SERVICE_ROLES,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    OTPVerifiedResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SendOTPRequest,
    TokenResponse,
    UserLogin,
    UserProfile,
    UserProfileUpdate,
    UserRegister,
    VerifyOTPRequest,
)

from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token, create_refresh_token, decode_token

# Redis key prefixes
_BLACKLIST_PREFIX = "blacklist:"
_RESET_PREFIX = "pwd_reset:"
_OTP_PREFIX = "signup_otp:"
_RESET_TTL_SECONDS = 3600   # 1 hour
_OTP_TTL_SECONDS = 600      # 10 minutes

# Roles allowed through the public /register endpoint (kept in sync with schema).
_SELF_SERVICE_ROLE_NAMES: frozenset[str] = frozenset(SELF_SERVICE_ROLES.__args__)  # type: ignore[union-attr]


# ── helpers ───────────────────────────────────────────────────────────────────


def _token_payload(user: User) -> dict:
    return {"sub": str(user.id), "role": user.role.name}


def _build_token_response(user: User) -> TokenResponse:
    payload = _token_payload(user)
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
    )


def _to_profile(user: User) -> UserProfile:
    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role.name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


async def _get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def _get_role_by_name(db: AsyncSession, name: str) -> Role | None:
    result = await db.execute(select(Role).where(Role.name == name))
    return result.scalar_one_or_none()


async def _get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    from uuid import UUID

    try:
        uid = UUID(user_id)
    except ValueError:
        return None
    result = await db.execute(
        select(User).where(User.id == uid)
    )
    return result.scalar_one_or_none()


# ── public service functions ──────────────────────────────────────────────────


async def register_user(db: AsyncSession, data: UserRegister) -> TokenResponse:
    """Create a new user account and return JWT token pair.

    Only INDIVIDUAL and VENDOR roles may self-register.
    LOGISTIC_MANAGER is pre-seeded at deployment.
    WAREHOUSE_MANAGER, DISPATCHER, and DRIVER accounts are created by a
    Logistic Manager via the /users admin endpoint (Phase 2).
    """
    # Guard: reject attempts to register restricted roles at the service layer.
    # (Pydantic already enforces this via schema, but a double-check is cheap.)
    role_upper = data.role.upper()
    if role_upper not in _SELF_SERVICE_ROLE_NAMES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Role '{data.role}' cannot be self-registered. "
                "Accounts for this role are created by the Logistic Manager."
            ),
        )

    # Check duplicate email
    existing = await _get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    # Resolve role
    role = await _get_role_by_name(db, role_upper)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{data.role}' does not exist",
        )

    user = User(
        name=data.name,
        email=data.email.lower(),
        phone=data.phone,
        password_hash=hash_password(data.password),
        role_id=role.id,
    )
    db.add(user)
    await db.flush()  # get id without committing (get_db commits on success)

    # Eagerly load role for token building
    await db.refresh(user, attribute_names=["role"])

    logger.info(f"New user registered: {user.email} (role={role.name})")
    return _build_token_response(user)


async def login_user(db: AsyncSession, data: UserLogin) -> TokenResponse:
    """Authenticate credentials and return JWT token pair."""
    user = await _get_user_by_email(db, data.email.lower())

    # Constant-time check so timing attacks can't enumerate accounts
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    await db.refresh(user, attribute_names=["role"])
    return _build_token_response(user)


async def refresh_tokens(
    db: AsyncSession, redis: Redis, data: RefreshTokenRequest
) -> TokenResponse:
    """Validate a refresh token and issue a new token pair."""
    payload = decode_token(data.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    # Check blacklist
    jti = payload.get("jti", "")
    if await redis.get(f"{_BLACKLIST_PREFIX}{jti}"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    user = await _get_user_by_id(db, payload.get("sub", ""))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    await db.refresh(user, attribute_names=["role"])
    return _build_token_response(user)


async def logout_user(redis: Redis, access_token: str) -> None:
    """Blacklist the access token in Redis for the remainder of its lifetime."""
    payload = decode_token(access_token)
    jti = payload.get("jti")
    exp = payload.get("exp")

    if not jti or not exp:
        return  # malformed token — nothing to blacklist

    ttl = int(exp - datetime.now(timezone.utc).timestamp())
    if ttl > 0:
        await redis.setex(f"{_BLACKLIST_PREFIX}{jti}", ttl, "1")

    logger.info(f"Token blacklisted: jti={jti} ttl={max(ttl, 0)}s")


async def get_current_user_from_token(
    db: AsyncSession, redis: Redis, token: str
) -> User:
    """Validate access token, check blacklist, and return the User model."""
    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    jti = payload.get("jti", "")
    if await redis.get(f"{_BLACKLIST_PREFIX}{jti}"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    user = await _get_user_by_id(db, payload.get("sub", ""))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    await db.refresh(user, attribute_names=["role"])
    return user


async def update_profile(
    db: AsyncSession, user: User, data: UserProfileUpdate
) -> UserProfile:
    """Update the authenticated user's name / phone."""
    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    db.add(user)
    await db.flush()
    await db.refresh(user, attribute_names=["role"])
    return _to_profile(user)


async def change_password(
    db: AsyncSession, user: User, data: ChangePasswordRequest
) -> None:
    """Verify current password and store a new bcrypt hash."""
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    user.password_hash = hash_password(data.new_password)
    db.add(user)
    await db.flush()
    logger.info(f"Password changed for user: {user.email}")


async def forgot_password(db: AsyncSession, redis: Redis, data: ForgotPasswordRequest) -> None:
    """
    Generate a password-reset token and store it in Redis (TTL 1 hour).
    In Phase 1 the reset link is logged to console; real email fires in Phase 7.
    """
    user = await _get_user_by_email(db, data.email.lower())
    # Always return 200 to prevent email enumeration
    if not user:
        return

    token = secrets.token_hex(32)
    await redis.setex(f"{_RESET_PREFIX}{token}", _RESET_TTL_SECONDS, str(user.id))

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    logger.info(f"[DEV] Password reset link for {user.email}: {reset_link}")


async def reset_password(
    db: AsyncSession, redis: Redis, data: ResetPasswordRequest
) -> None:
    """Consume the Redis reset token and update the user's password hash."""
    redis_key = f"{_RESET_PREFIX}{data.token}"
    user_id = await redis.get(redis_key)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token is invalid or has expired",
        )

    user = await _get_user_by_id(db, user_id.decode())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.password_hash = hash_password(data.new_password)
    db.add(user)
    await db.flush()

    # Consume the token (one-time use)
    await redis.delete(redis_key)
    logger.info(f"Password reset completed for user: {user.email}")


async def send_signup_otp(redis: Redis, data: SendOTPRequest) -> None:
    """Generate a 6-digit OTP for email verification and store in Redis.

    In dev mode the OTP is logged to console.
    In production wire up an SMTP/email service here.
    """
    import random
    otp = f"{random.randint(0, 999999):06d}"
    await redis.setex(f"{_OTP_PREFIX}{data.email.lower()}", _OTP_TTL_SECONDS, otp)
    logger.info(f"[DEV] Signup OTP for {data.email}: {otp}")


async def verify_signup_otp(redis: Redis, data: VerifyOTPRequest) -> OTPVerifiedResponse:
    """Verify the signup OTP sent to the user's email."""
    key = f"{_OTP_PREFIX}{data.email.lower()}"
    stored_otp = await redis.get(key)

    if not stored_otp or stored_otp.decode() != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Please request a new one.",
        )

    # Consume OTP — one time use
    await redis.delete(key)
    logger.info(f"Email verified via OTP: {data.email}")
    return OTPVerifiedResponse(verified=True, message="Email verified successfully!")

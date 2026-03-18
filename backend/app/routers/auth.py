from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginResponse,
    MessageResponse,
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
from app.services import auth_service
from app.utils.redis import get_redis

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Self-service sign-up (Individual & Vendor only)",
    description=(
        "Creates a new account for **INDIVIDUAL** or **VENDOR** roles only. "
        "Logistic Manager is pre-seeded at deployment. "
        "Warehouse Manager, Dispatcher, and Driver accounts are provisioned "
        "by the Logistic Manager via the /users admin endpoint."
    ),
)
async def register(
    data: UserRegister,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    return await auth_service.register_user(db, data)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Issue JWT tokens with user profile",
)
async def login(
    data: UserLogin,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    return await auth_service.login_user(db, data)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
async def refresh(
    data: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    return await auth_service.refresh_tokens(db, redis, data)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Invalidate access token via Redis blacklist",
)
async def logout(
    redis: Annotated[Redis, Depends(get_redis)],
    authorization: Annotated[str | None, Header()] = None,
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization.removeprefix("Bearer ").strip()
    await auth_service.logout_user(redis, token)
    return MessageResponse(message="Successfully logged out")


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get current user profile",
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return UserProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.put(
    "/me",
    response_model=UserProfile,
    summary="Update current user profile",
)
async def update_me(
    data: UserProfileUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await auth_service.update_profile(db, current_user, data)


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change password",
)
async def change_password(
    data: ChangePasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await auth_service.change_password(db, current_user, data)
    return MessageResponse(message="Password changed successfully")


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request password reset email",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    await auth_service.forgot_password(db, redis, data)
    return MessageResponse(
        message="If that email is registered, a reset link has been sent"
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Confirm password reset with token",
)
async def reset_password(
    data: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    await auth_service.reset_password(db, redis, data)
    return MessageResponse(message="Password has been reset successfully")


@router.post(
    "/send-otp",
    response_model=MessageResponse,
    summary="Send email verification OTP for signup",
)
async def send_otp(
    data: SendOTPRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    await auth_service.send_signup_otp(db, redis, data)
    return MessageResponse(message=f"OTP sent to {data.email}")


@router.post(
    "/verify-otp",
    response_model=OTPVerifiedResponse,
    summary="Verify email OTP before completing signup",
)
async def verify_otp(
    data: VerifyOTPRequest,
    redis: Annotated[Redis, Depends(get_redis)],
):
    return await auth_service.verify_signup_otp(redis, data)

@router.post(
    '/google-login',
    response_model=LoginResponse,
    summary='Login or Register with Google',
)
async def google_login(
    data: GoogleLoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    return await auth_service.google_login_or_register(db, redis, data)


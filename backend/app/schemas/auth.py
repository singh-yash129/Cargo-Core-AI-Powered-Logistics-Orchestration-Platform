from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

# Roles that are allowed to self-register via the public /register endpoint.
# LOGISTIC_MANAGER is pre-seeded at deployment.
# WAREHOUSE_MANAGER, DISPATCHER, and DRIVER are created by Logistic Manager.
SELF_SERVICE_ROLES = Literal["INDIVIDUAL", "VENDOR"]


# ── Request Schemas ───────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    password: str = Field(..., min_length=8)
    role: SELF_SERVICE_ROLES = Field(
        default="INDIVIDUAL",
        description="Self-service registration is restricted to INDIVIDUAL and VENDOR roles only.",
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, max_length=20)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


# ── Response Schemas ──────────────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: UUID
    name: str
    email: str
    phone: str | None
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    message: str


class OTPVerifiedResponse(BaseModel):
    verified: bool
    message: str

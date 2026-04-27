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
    username: str | None = Field(default=None, min_length=3, max_length=64)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None)
    password: str = Field(..., min_length=8)
    role: SELF_SERVICE_ROLES = Field(
        default="INDIVIDUAL",
        description="Self-service registration is restricted to INDIVIDUAL and VENDOR roles only.",
    )
    company_name: str | None = Field(default=None, max_length=255)
    tax_id: str | None = Field(default=None, max_length=100)
    contact_person: str | None = Field(default=None, max_length=255)
    business_email: EmailStr | None = None
    business_phone: str | None = Field(default=None, max_length=20)


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=255, description="Email address or username")
    password: str


class UserProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    date_of_birth: str | None = None
    address: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str  # This is the 6-digit OTP from email
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


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserProfile"  # Forward reference since UserProfile is defined below


class UserProfile(BaseModel):
    id: UUID
    name: str
    username: str
    email: str
    phone: str | None
    address: str | None
    role: str
    warehouse_id: UUID | None = None
    warehouse_name: str | None = None
    warehouse_address: str | None = None
    warehouse_is_active: bool | None = None
    warehouse_status: str | None = None
    is_active: bool
    approval_status: str = "APPROVED"
    company_name: str | None = None
    tax_id: str | None = None
    contact_person: str | None = None
    business_email: str | None = None
    business_phone: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class RegistrationResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: UserProfile | None = None
    pending_approval: bool = False
    message: str | None = None


class MessageResponse(BaseModel):
    message: str


class SignupOtpSendResponse(BaseModel):
    message: str
    email: str
    sent_at: datetime | None = None
    debug_otp: str | None = None


class OTPVerifiedResponse(BaseModel):
    verified: bool
    message: str


class GoogleLoginRequest(BaseModel):
    credential: str
    role: SELF_SERVICE_ROLES = 'INDIVIDUAL'

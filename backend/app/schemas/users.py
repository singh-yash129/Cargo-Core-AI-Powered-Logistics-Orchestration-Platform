from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserAdminCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    username: str | None = Field(default=None, min_length=3, max_length=64)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    password: str = Field(..., min_length=8)
    role: str = Field(..., max_length=50)
    warehouse_id: UUID | None = None


class UserAdminUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    is_active: bool | None = None
    approval_status: str | None = Field(default=None, max_length=20)
    approval_note: str | None = None


class AssignRoleRequest(BaseModel):
    role: str = Field(..., max_length=50)


class AssignWarehouseRequest(BaseModel):
    warehouse_id: UUID


class UserAdminResponse(BaseModel):
    id: UUID
    name: str
    username: str
    email: str
    phone: str | None
    role: str
    warehouse_id: UUID | None
    is_active: bool
    approval_status: str = "APPROVED"
    approval_note: str | None = None
    approval_reviewed_at: datetime | None = None
    company_name: str | None = None
    tax_id: str | None = None
    contact_person: str | None = None
    business_email: str | None = None
    business_phone: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    items: list[UserAdminResponse]
    total: int
    page: int
    page_size: int

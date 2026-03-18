from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    order_type: str = Field(..., max_length=20)
    warehouse_id: UUID | None = None
    pickup_addr: str = Field(..., min_length=5)
    delivery_addr: str = Field(..., min_length=5)
    cargo_type: str | None = None
    vehicle_type: str | None = None
    labor_count: int = Field(default=0, ge=0)
    base_amount: float = Field(default=0, ge=0)
    vehicle_amount: float = Field(default=0, ge=0)
    labor_amount: float = Field(default=0, ge=0)
    materials_amount: float = Field(default=0, ge=0)
    packing_amount: float = Field(default=0, ge=0)
    platform_fee: float = Field(default=0, ge=0)
    tax_amount: float = Field(default=0, ge=0)
    total_amount: float = Field(default=0, ge=0)
    payment_mode: str | None = None
    payment_status: str = "pending"
    service_otp: str | None = None
    service_time_block: str | None = None
    scheduled_at: datetime | None = None


class OrderUpdate(BaseModel):
    warehouse_id: UUID | None = None
    pickup_addr: str | None = Field(default=None, min_length=5)
    delivery_addr: str | None = Field(default=None, min_length=5)
    cargo_type: str | None = None
    vehicle_type: str | None = None
    labor_count: int | None = Field(default=None, ge=0)
    base_amount: float | None = Field(default=None, ge=0)
    vehicle_amount: float | None = Field(default=None, ge=0)
    labor_amount: float | None = Field(default=None, ge=0)
    materials_amount: float | None = Field(default=None, ge=0)
    packing_amount: float | None = Field(default=None, ge=0)
    platform_fee: float | None = Field(default=None, ge=0)
    tax_amount: float | None = Field(default=None, ge=0)
    total_amount: float | None = Field(default=None, ge=0)
    payment_mode: str | None = None
    payment_status: str | None = None
    service_otp: str | None = None
    service_time_block: str | None = None
    scheduled_at: datetime | None = None


class OrderAssignRequest(BaseModel):
    driver_id: UUID
    vehicle_id: UUID | None = None


class CancelOrderRequest(BaseModel):
    reason: str = Field(..., min_length=3)


class OrderItemUpsert(BaseModel):
    sku: str = Field(..., min_length=1, max_length=64)
    quantity: int = Field(..., gt=0)
    box_count: int | None = Field(default=None, ge=0)
    estimated_volume: float | None = Field(default=None, ge=0)


class OrderItemResponse(BaseModel):
    id: UUID
    sku: str
    quantity: int
    box_count: int | None
    estimated_volume: float | None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: UUID
    tracking_code: str
    order_type: str
    status: str
    customer_id: UUID
    warehouse_id: UUID | None
    assigned_driver_id: UUID | None
    assigned_vehicle_id: UUID | None
    pickup_addr: str
    delivery_addr: str
    cargo_type: str | None
    vehicle_type: str | None
    labor_count: int
    base_amount: float
    vehicle_amount: float
    labor_amount: float
    materials_amount: float
    packing_amount: float
    platform_fee: float
    tax_amount: float
    total_amount: float
    payment_mode: str | None
    payment_status: str
    service_otp: str | None
    service_time_block: str | None
    scheduled_at: datetime | None
    cancel_reason: str | None
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int

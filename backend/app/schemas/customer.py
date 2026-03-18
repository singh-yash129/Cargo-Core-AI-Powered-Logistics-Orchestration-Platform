from uuid import UUID
from datetime import datetime

from pydantic import BaseModel

from app.schemas.auth import UserProfile


class CustomerDashboardStats(BaseModel):
    total_orders: int
    active_orders: int
    pending_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_spent: float = 0


class CustomerDashboardOrder(BaseModel):
    id: UUID
    tracking_code: str
    order_type: str
    status: str
    ui_status: str
    pickup_addr: str
    delivery_addr: str
    scheduled_at: datetime | None
    created_at: datetime
    vehicle_type: str
    total_amount: float = 0


class CustomerDashboardMonthlyPoint(BaseModel):
    month: str
    count: int


class CustomerDashboardCostSummary(BaseModel):
    base: float = 0
    vehicle: float = 0
    labor: float = 0
    materials: float = 0
    packing: float = 0
    platform_fee: float = 0
    taxes: float = 0
    total: float = 0


class CustomerDashboardDriver(BaseModel):
    name: str | None = None
    phone: str | None = None
    rating: float | None = None


class CustomerDashboardActiveMove(BaseModel):
    id: UUID
    tracking_code: str
    status: str
    ui_status: str
    pickup_addr: str
    delivery_addr: str
    scheduled_at: datetime | None
    created_at: datetime
    vehicle_type: str
    cargo_type: str
    progress: int
    eta_label: str
    service_otp: str
    service_time_block: str
    labor_count: int
    driver: CustomerDashboardDriver | None = None
    cost: CustomerDashboardCostSummary


class CustomerDashboardResponse(BaseModel):
    profile: UserProfile
    stats: CustomerDashboardStats
    active_move: CustomerDashboardActiveMove | None = None
    recent_orders: list[CustomerDashboardOrder]
    monthly_activity: list[CustomerDashboardMonthlyPoint]


class CustomerTrackingOrder(BaseModel):
    id: UUID
    tracking_code: str
    status: str
    ui_status: str
    pickup_addr: str
    delivery_addr: str
    scheduled_at: datetime | None
    created_at: datetime
    progress: int
    eta_label: str
    transport_log: list[dict]


class CustomerTrackingResponse(BaseModel):
    orders: list[CustomerTrackingOrder]


class CustomerPaymentRecord(BaseModel):
    id: str
    order_id: UUID
    tracking_code: str
    amount: float
    mode: str
    status: str
    created_at: datetime


class CustomerPaymentsSummary(BaseModel):
    total_paid: float
    pending_amount: float
    records: list[CustomerPaymentRecord]


class CustomerProfileResponse(BaseModel):
    profile: UserProfile
    alt_phone: str | None = None
    date_of_birth: str | None = None
    address: str | None = None
    language: str = "en"
    currency: str = "INR"
    default_payment: str = "Full Payment"
    notification_prefs: dict[str, bool] = {}
    privacy_prefs: dict[str, bool] = {}


class CustomerQuote(BaseModel):
    id: str
    cargo_type: str
    from_location: str
    to_location: str
    labor_count: int
    packing: bool
    total: float
    date: str
    status: str


class CustomerQuotesResponse(BaseModel):
    quotes: list[CustomerQuote]


class CustomerDamageReportCreate(BaseModel):
    order_id: str
    description: str
    photos: list[str] = []


class CustomerDamageReport(BaseModel):
    id: str
    order_id: str
    description: str
    photos: list[str]
    status: str
    qr_code: str
    created_at: str


class CustomerDamageReportsResponse(BaseModel):
    reports: list[CustomerDamageReport]


class CustomerSettings(BaseModel):
    language: str = "en"
    currency: str = "INR"
    default_payment: str = "Full Payment"
    notification_prefs: dict[str, bool] = {}
    privacy_prefs: dict[str, bool] = {}


class CustomerSettingsResponse(BaseModel):
    settings: CustomerSettings

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.auth import UserProfile


class VendorStats(BaseModel):
    total_shipments: int = 0
    active_shipments: int = 0
    pending_shipments: int = 0
    delivered_shipments: int = 0
    cancelled_shipments: int = 0
    monthly_spend: float = 0
    outstanding_amount: float = 0
    paid_this_month: float = 0
    credit_balance: float = 0


class VendorShipmentCost(BaseModel):
    base: float = 0
    vehicle: float = 0
    labor: float = 0
    materials: float = 0
    packing: float = 0
    platform_fee: float = 0
    taxes: float = 0
    total: float = 0


class VendorShipmentHistoryItem(BaseModel):
    status: str
    time: str


class VendorShipmentSummary(BaseModel):
    id: UUID
    tracking_code: str
    status: str
    status_label: str
    status_key: str
    pickup_addr: str
    delivery_addr: str
    cargo_type: str | None = None
    vehicle_type: str | None = None
    payment_mode: str | None = None
    payment_status: str
    labor_count: int = 0
    amount: float = 0
    scheduled_at: datetime | None = None
    created_at: datetime
    eta_label: str
    progress: int = 0
    cost: VendorShipmentCost
    status_history: list[VendorShipmentHistoryItem] = []


class VendorMonthlyPoint(BaseModel):
    month: str
    spend: float = 0
    orders: int = 0


class VendorAnalytics(BaseModel):
    monthly: list[VendorMonthlyPoint]
    on_time: float = 0
    avg_transit_days: float = 0
    avg_order_value: float = 0
    success_rate: float = 0


class VendorInvoiceRecord(BaseModel):
    id: str
    order_id: UUID
    tracking_code: str
    date: str
    due_date: str
    amount: float
    paid: float = 0
    status: str


class VendorInvoiceSummary(BaseModel):
    invoices: list[VendorInvoiceRecord]
    total_overdue: float = 0
    total_unpaid: int = 0
    total_paid_this_month: float = 0
    credit_balance: float = 0


class VendorDashboardResponse(BaseModel):
    profile: UserProfile
    stats: VendorStats
    recent_shipments: list[VendorShipmentSummary]
    analytics: VendorAnalytics
    invoices: VendorInvoiceSummary


class VendorShipmentsResponse(BaseModel):
    shipments: list[VendorShipmentSummary]


class VendorSettings(BaseModel):
    company_name: str = ""
    tax_id: str = ""
    contact_person: str = ""
    phone: str | None = None
    email: str
    address: str | None = None
    notification_prefs: dict[str, bool] = {}


class VendorSettingsResponse(BaseModel):
    settings: VendorSettings


class VendorDamageReportCreate(BaseModel):
    order_id: str
    description: str
    photos: list[str] = []


class VendorDamageReport(BaseModel):
    id: str
    order_id: str
    description: str
    photos: list[str]
    status: str
    qr_code: str
    created_at: str


class VendorDamageReportsResponse(BaseModel):
    reports: list[VendorDamageReport]


class VendorTeamMemberCreate(BaseModel):
    name: str
    email: str
    role: str = "Viewer"


class VendorTeamMemberResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    status: str

    model_config = {"from_attributes": True}


class VendorApiKeyCreate(BaseModel):
    name: str


class VendorApiKeyResponse(BaseModel):
    id: UUID
    name: str
    key: str
    created: str
    last_used: str
    status: str


class VendorRecurringRuleCreate(BaseModel):
    name: str
    description: str = ""
    frequency: str
    route: str
    details: str
    next_run: str
    active: bool = True


class VendorRecurringRuleResponse(BaseModel):
    id: UUID
    name: str
    description: str = ""
    frequency: str
    route: str
    details: str
    next_run: str
    active: bool

    model_config = {"from_attributes": True}


class VendorBulkUploadCreate(BaseModel):
    filename: str
    file_size_kb: int = 0
    orders: int = 0
    status: str = "Processed"
    errors: int = 0
    scheduled_for: str | None = None


class VendorBulkUploadUpdate(BaseModel):
    status: str | None = None
    errors: int | None = None
    scheduled_for: str | None = None


class VendorBulkUploadResponse(BaseModel):
    id: UUID
    filename: str
    date: str
    orders: int
    status: str
    errors: int


class VendorSupportTicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "Medium"
    shipment_id: str | None = None


class VendorSupportReplyCreate(BaseModel):
    message: str


class VendorSupportReplyResponse(BaseModel):
    from_name: str
    message: str
    time: str


class VendorSupportTicketResponse(BaseModel):
    id: str
    subject: str
    description: str
    order_id: str | None = None
    created: str
    priority: str
    status: str
    replies: list[VendorSupportReplyResponse]

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LogisticsDashboardStats(BaseModel):
    orders_today: int
    active_deliveries: int
    processing: int
    delivery_success: float
    revenue_today: float
    orders_trend: float
    revenue_trend: float
    sla_week: list[int]
    revenue_week: list[float]
    orders_week: list[int]


class LogisticsHubItem(BaseModel):
    id: UUID
    hub_code: str
    name: str
    location: str
    manager: str
    manager_initials: str
    capacity: int
    efficiency: int
    staff_active: int
    staff_total: int
    vehicles_active: int
    vehicles_total: int
    process_rate: int
    status: str
    status_color: str
    bg: str


class LogisticsDriverItem(BaseModel):
    id: UUID
    hub_id: UUID | None
    name: str
    status: str
    location: str | None
    vehicle: str | None
    efficiency: int
    phone: str | None
    current_job: str | None
    avatar_color: str | None
    chat_history: list[dict] = Field(default_factory=list)


class LogisticsVehicleItem(BaseModel):
    id: UUID
    hub_id: UUID | None
    code: str
    type: str
    model: str | None
    year: int | None
    license_plate: str | None
    status: str
    driver: str
    fuel_efficiency: str | None
    mileage: int
    next_service: str | None
    maintenance_issue: str | None = None


class LogisticsMaintenanceItem(BaseModel):
    id: UUID
    hub_id: UUID | None
    issue: str
    status: str
    status_class: str


class LogisticsTransactionItem(BaseModel):
    id: UUID
    hub_id: UUID | None
    date: str
    desc: str
    type: str
    amount: float
    status: str


class LogisticsUserItem(BaseModel):
    id: UUID
    hub_id: UUID | str | None
    name: str
    email: str
    role: str
    status: str
    last_login: str
    username: str
    pending_payout: float = 0
    mobile: str | None = None
    mobile_verified: bool = False
    email_verified: bool = True
    avatar: str | None = None


class LogisticsReturnCaseItem(BaseModel):
    id: UUID
    hub_id: UUID | None
    order_id: UUID | None
    customer: str
    reason: str
    condition: str
    status: str
    original_price: float
    refund_amount: float
    images: list[str] = Field(default_factory=list)
    reference_code: str


class LogisticsZoneItem(BaseModel):
    id: UUID
    hub_id: UUID
    name: str
    type: str
    radius: float | None
    status: str
    color: str | None = None


class LogisticsChatMessageItem(BaseModel):
    id: UUID
    text: str
    sender: str
    time: str


class LogisticsChatThreadItem(BaseModel):
    id: UUID
    hub_id: UUID | None
    name: str
    time: str
    last_message: str | None
    status: str
    phone: str | None
    muted: bool = False
    messages: list[LogisticsChatMessageItem] = Field(default_factory=list)


class LogisticsEscalationItem(BaseModel):
    id: UUID
    hub_id: UUID | None
    title: str
    priority: str
    from_name: str
    role: str
    time: str
    description: str
    action_details: str | None
    status: str


class LogisticsAlertItem(BaseModel):
    id: UUID
    type: str
    title: str
    description: str
    severity: str
    icon: str | None
    timestamp: str
    location: str | None = None
    recommendation: str | None = None
    impact: dict | None = None


class LogisticsNotificationItem(BaseModel):
    id: UUID
    title: str
    message: str
    time: str
    read: bool
    type: str


class LogisticsTaskItem(BaseModel):
    id: UUID
    text: str
    status: str
    target_time: datetime | None = None
    repeat: str | None = None
    created_at: datetime
    last_alert_time: datetime | None = None
    silenced: bool = False
    remaining: str = ""


class LogisticsReportItem(BaseModel):
    id: str
    hub_id: UUID | str | None
    title: str
    date: str
    icon: str
    color: str


class LogisticsBootstrapResponse(BaseModel):
    dashboard_stats: LogisticsDashboardStats
    hubs: list[LogisticsHubItem]
    alerts: list[LogisticsAlertItem]
    drivers: list[LogisticsDriverItem]
    top_drivers: list[dict]
    vehicles: list[LogisticsVehicleItem]
    maintenance: list[LogisticsMaintenanceItem]
    transactions: list[LogisticsTransactionItem]
    reports: list[LogisticsReportItem]
    users: list[LogisticsUserItem]
    returns: list[LogisticsReturnCaseItem]
    zones: list[LogisticsZoneItem]
    chats: list[LogisticsChatThreadItem]
    escalations: list[LogisticsEscalationItem]
    inventory: list[dict]
    notifications: list[LogisticsNotificationItem]
    tasks: list[LogisticsTaskItem]
    ai_suggestion_chips: list[str] = Field(default_factory=list)
    ai_messages: list[dict] = Field(default_factory=list)
    finance_summary: dict = Field(default_factory=dict)
    finance_cod_records: list[dict] = Field(default_factory=list)
    finance_staff_records: list[dict] = Field(default_factory=list)
    finance_driver_records: list[dict] = Field(default_factory=list)
    fleet_logs: dict = Field(default_factory=dict)
    vehicle_documents: list[dict] = Field(default_factory=list)
    driver_documents: list[dict] = Field(default_factory=list)
    report_ai_insights: list[str] = Field(default_factory=list)
    report_damage_claims: list[dict] = Field(default_factory=list)
    report_security_logs: list[dict] = Field(default_factory=list)
    report_metrics: dict = Field(default_factory=dict)


class LogisticsVehicleCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    vehicle_type: str = Field(..., min_length=2, max_length=100)
    warehouse_id: UUID | None = None
    assigned_driver_id: UUID | None = None
    model: str | None = None
    year: int | None = Field(default=None, ge=1990, le=2100)
    license_plate: str | None = None
    status: str = "Active"
    fuel_efficiency: str | None = None
    mileage: int = Field(default=0, ge=0)
    next_service_date: datetime | None = None
    maintenance_issue: str | None = None


class LogisticsVehicleUpdate(BaseModel):
    warehouse_id: UUID | None = None
    assigned_driver_id: UUID | None = None
    model: str | None = None
    year: int | None = Field(default=None, ge=1990, le=2100)
    license_plate: str | None = None
    status: str | None = None
    fuel_efficiency: str | None = None
    mileage: int | None = Field(default=None, ge=0)
    next_service_date: datetime | None = None
    maintenance_issue: str | None = None


class LogisticsTransactionCreate(BaseModel):
    warehouse_id: UUID | None = None
    description: str = Field(..., min_length=2, max_length=255)
    transaction_type: str = Field(..., min_length=2, max_length=50)
    amount: float
    status: str = "Completed"
    metadata_json: dict | None = None


class LogisticsReturnCaseUpdate(BaseModel):
    status: str = Field(..., min_length=2, max_length=30)
    refund_amount: float | None = None
    condition: str | None = None


class LogisticsZoneCreate(BaseModel):
    warehouse_id: UUID
    name: str = Field(..., min_length=2, max_length=255)
    zone_type: str = Field(..., min_length=2, max_length=50)
    radius_km: float | None = None
    status: str = "Active"
    color_token: str | None = None


class LogisticsZoneUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    zone_type: str | None = Field(default=None, min_length=2, max_length=50)
    radius_km: float | None = None
    status: str | None = None
    color_token: str | None = None


class LogisticsChatMessageCreate(BaseModel):
    text: str = Field(..., min_length=1)
    sender: str = Field(default="me", min_length=2, max_length=30)


class LogisticsTaskUpdate(BaseModel):
    status: str | None = None
    silenced: bool | None = None


class LogisticsNotificationUpdate(BaseModel):
    read: bool


class LogisticsAiQueryRequest(BaseModel):
    query: str = Field(..., min_length=2)


class LogisticsAiQueryResponse(BaseModel):
    text: str
    data: dict | None = None

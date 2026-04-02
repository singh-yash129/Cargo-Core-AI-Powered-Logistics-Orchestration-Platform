from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ======================
# Warehouse Substatus
# ======================

WAREHOUSE_SUBSTATUSES = {
    "AWAITING_INBOUND",
    "AWAITING_PICK",
    "PICKING",
    "PICKED",
    "PACKING",
    "PACKED",
    "QC_PASSED",
    "READY_FOR_DISPATCH",
    "ON_DOCK",
    "DISPATCHED",
    "ON_HOLD",
}

WAREHOUSE_SUBSTATUS_TRANSITIONS = {
    "AWAITING_INBOUND": {"AWAITING_PICK", "ON_HOLD"},
    "AWAITING_PICK": {"PICKING", "ON_HOLD"},
    "PICKING": {"PICKED", "ON_HOLD", "AWAITING_PICK"},
    "PICKED": {"PACKING", "ON_HOLD", "PICKING"},
    "PACKING": {"PACKED", "ON_HOLD", "PICKED"},
    "PACKED": {"QC_PASSED", "ON_HOLD", "PACKING"},
    "QC_PASSED": {"READY_FOR_DISPATCH", "ON_DOCK", "ON_HOLD"},
    "READY_FOR_DISPATCH": {"ON_DOCK", "ON_HOLD"},
    "ON_DOCK": {"DISPATCHED", "ON_HOLD"},
    "ON_HOLD": {"AWAITING_INBOUND", "AWAITING_PICK", "PICKING", "PACKING"},
    "DISPATCHED": set(),
}


# ======================
# Picking
# ======================

class StartPickingRequest(BaseModel):
    labourer_id: UUID | None = None


class PickingResponse(BaseModel):
    order_id: UUID
    warehouse_substatus: str
    assigned_labourer_id: UUID | None
    message: str


class ConfirmPickItemRequest(BaseModel):
    sku: str = Field(..., min_length=1, max_length=64)
    quantity_picked: int = Field(..., gt=0)
    location: str | None = None
    notes: str | None = None


class PickedItemResponse(BaseModel):
    id: UUID
    order_id: UUID
    sku: str
    quantity_picked: int
    quantity_required: int
    picked_by: UUID | None
    picker_name: str | None = None
    location: str | None
    notes: str | None
    is_complete: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PickProgressResponse(BaseModel):
    order_id: UUID
    total_items: int
    picked_items: int
    is_complete: bool
    items: list[PickedItemResponse]


# ======================
# Packing Station
# ======================

class PackingStationResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    station_number: str
    status: str
    assigned_labourer_id: UUID | None
    assigned_labourer_name: str | None = None
    current_order_id: UUID | None
    current_order_tracking: str | None = None
    items_packed_today: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PackingStationCreate(BaseModel):
    station_number: str = Field(..., min_length=1, max_length=30)
    status: str = Field(default="CLOSED")


class PackingStationUpdate(BaseModel):
    status: str | None = None
    assigned_labourer_id: UUID | None = None
    current_order_id: UUID | None = None


class PackingStationListResponse(BaseModel):
    items: list[PackingStationResponse]
    total: int


class StartPackingRequest(BaseModel):
    station_id: UUID | None = None


# ======================
# Quality Check
# ======================

class QualityCheckResponse(BaseModel):
    id: UUID
    order_id: UUID
    warehouse_id: UUID
    goods_correct: bool
    count_correct: bool
    packaging_verified: bool
    labor_assigned: bool
    weight_verified: bool
    label_attached: bool
    is_passed: bool
    notes: str | None
    performed_by: UUID | None
    performer_name: str | None = None
    checked_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class QualityCheckCreate(BaseModel):
    order_id: UUID


class QualityCheckUpdate(BaseModel):
    goods_correct: bool | None = None
    count_correct: bool | None = None
    packaging_verified: bool | None = None
    labor_assigned: bool | None = None
    weight_verified: bool | None = None
    label_attached: bool | None = None
    notes: str | None = None


class QualityCheckListResponse(BaseModel):
    items: list[QualityCheckResponse]
    total: int


# ======================
# Loading Dock
# ======================

class LoadingDockResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    dock_number: str
    status: str
    assigned_vehicle_id: UUID | None = None
    assigned_vehicle_code: str | None = None  # derived from vehicle relationship
    assigned_carrier: str | None
    assigned_order_id: UUID | None
    assigned_order_tracking: str | None = None
    arrived_at: datetime | None
    loading_started_at: datetime | None
    released_at: datetime | None
    dwell_minutes: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class LoadingDockCreate(BaseModel):
    dock_number: str = Field(..., min_length=1, max_length=20)


class AssignTruckRequest(BaseModel):
    vehicle_id: UUID  # proper FK to logistics_vehicles
    carrier: str = Field(..., min_length=1, max_length=100)
    order_id: UUID | None = None


class DockVerificationData(BaseModel):
    items_scanned: bool = False
    labor_present: bool = False
    packing_loaded: bool = False
    manifest_attached: bool = False
    driver_confirmed: bool = False
    weight_verified: bool = False


class LoadingDockListResponse(BaseModel):
    items: list[LoadingDockResponse]
    total: int


# ======================
# Returns / Grading
# ======================

class ReturnGradingResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    order_id: UUID | None
    order_tracking: str | None = None
    rma_code: str
    item_condition: str
    condition_notes: str | None
    disposition: str
    damage_photo_url: str | None
    graded_by: UUID | None
    grader_name: str | None = None
    graded_at: datetime | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReturnGradingCreate(BaseModel):
    order_id: UUID | None = None
    rma_code: str = Field(..., min_length=1, max_length=50)
    item_condition: str = Field(default="Pending Inspection", min_length=1, max_length=50)
    condition_notes: str | None = None
    disposition: str = Field(default="pending", min_length=1, max_length=30)


class ReturnGradingUpdate(BaseModel):
    item_condition: str | None = None
    condition_notes: str | None = None
    disposition: str | None = None


class ReturnGradingListResponse(BaseModel):
    items: list[ReturnGradingResponse]
    total: int
    page: int
    page_size: int


# ======================
# Zone Metrics
# ======================

class ZoneMetricsResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    zone_id: str
    metric_date: date
    orders_processed: int
    picking_accuracy_pct: float
    active_pickers: int
    capacity_used_pct: float
    throughput_items_per_hour: float
    created_at: datetime

    model_config = {"from_attributes": True}


class ZoneMetricsListResponse(BaseModel):
    items: list[ZoneMetricsResponse]
    total: int


class ZoneMetricsCreate(BaseModel):
    zone_id: str = Field(..., min_length=1, max_length=100)
    orders_processed: int = Field(default=0, ge=0)
    picking_accuracy_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    active_pickers: int = Field(default=0, ge=0)
    capacity_used_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    throughput_items_per_hour: float = Field(default=0.0, ge=0.0)


# ======================
# Performance
# ======================

class PerformanceMetrics(BaseModel):
    completion_rate: float
    on_hold_count: int
    picking_active: int
    packing_active: int
    ready_for_dispatch: int
    dispatched_today: int
    total_orders: int
    status_breakdown: dict[str, int]
    labor_breakdown: dict[str, int]
    trend_vs_previous: float | None = None


class PerformanceResponse(BaseModel):
    warehouse_id: UUID
    time_range: str
    metrics: PerformanceMetrics

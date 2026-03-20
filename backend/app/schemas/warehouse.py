from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class WarehouseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    address: str = Field(..., min_length=5)
    lat: float | None = None
    lng: float | None = None
    manager_id: UUID | None = None
    capacity_limit: int | None = Field(default=None, ge=0)


class WarehouseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    address: str | None = Field(default=None, min_length=5)
    lat: float | None = None
    lng: float | None = None
    manager_id: UUID | None = None
    capacity_limit: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class FloorPlanUpdate(BaseModel):
    floor_plan_json: dict


class WarehouseResponse(BaseModel):
    id: UUID
    name: str
    address: str
    lat: float | None
    lng: float | None
    manager_id: UUID | None
    floor_plan_json: dict | None
    capacity_limit: int | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class WarehouseKPIResponse(BaseModel):
    warehouse_id: UUID
    user_count: int
    inventory_sku_count: int
    low_stock_count: int
    labour_count: int
    order_count: int


class WarehouseListResponse(BaseModel):
    items: list[WarehouseResponse]
    total: int
    page: int
    page_size: int


class CriticalSkuItem(BaseModel):
    id: str
    name: str
    current: int
    min: int
    sku: str


class PickingQueueItem(BaseModel):
    id: str
    order_id: str  # UUID as string
    items: int
    zone: str
    priority: str
    assigned: str | None
    assignedInitials: str
    progress: int
    status: str
    tracking_code: str


class RecentReturnItem(BaseModel):
    id: str
    description: str
    action: str
    created_at: datetime


class ChartDataset(BaseModel):
    label: str
    data: list[int | float]
    backgroundColor: str | list[str] | None = None
    borderColor: str | None = None
    borderWidth: int | None = None
    tension: float | None = None
    fill: bool | None = None
    borderRadius: int | None = None
    hoverOffset: int | None = None


class ChartData(BaseModel):
    labels: list[str]
    datasets: list[ChartDataset]


class WarehouseDashboardResponse(BaseModel):
    total_inventory_value: float
    inventory_value_change_percent: float
    pending_orders_count: int
    avg_pick_time_minutes: int
    ready_for_dispatch: int
    next_truck_minutes: int
    active_labor: int
    total_labor: int
    critical_skus: list[CriticalSkuItem]
    picking_queue: list[PickingQueueItem]
    recent_returns: list[RecentReturnItem]
    throughput_chart: ChartData
    orders_returns_chart: ChartData
    stock_packaging_chart: ChartData
    active_staff_chart: ChartData
    labor_distribution_chart: ChartData
    efficiency_insight: str

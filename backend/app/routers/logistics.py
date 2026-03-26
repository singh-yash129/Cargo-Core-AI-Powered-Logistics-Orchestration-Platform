from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.schemas.auth import MessageResponse
from app.schemas.logistics import (
    DriverCrewMemberItem,
    DriverDashboardContext,
    DriverHosSummary,
    DriverShiftSummary,
    DriverTelemetryResponse,
    DriverVehicleBindRequest,
    LogisticsAiQueryRequest,
    LogisticsAiQueryResponse,
    LogisticsBootstrapResponse,
    LogisticsChatMessageCreate,
    LogisticsChatThreadItem,
    LogisticsDriverCreate,
    LogisticsDriverItem,
    LogisticsDriverUpdate,
    LogisticsNotificationItem,
    LogisticsNotificationUpdate,
    LogisticsReturnCaseItem,
    LogisticsReturnCaseUpdate,
    LogisticsTaskItem,
    LogisticsTaskUpdate,
    LogisticsTransactionCreate,
    LogisticsTransactionItem,
    CapitalInvestmentCreate,
    LogisticsVehicleCreate,
    LogisticsVehicleItem,
    LogisticsVehicleUpdate,
    LogisticsZoneCreate,
    LogisticsZoneItem,
    LogisticsZoneUpdate,
    LogisticsDocumentItem,
    LogisticsDocumentCreate,
    LogisticsDocumentUpdateStatus,
)
from app.services import logistics_service

router = APIRouter(prefix="/api/v1/logistics", tags=["Logistics Manager"])


@router.get("/bootstrap", response_model=LogisticsBootstrapResponse)
async def bootstrap(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.build_bootstrap(db)


@router.post("/ai/query", response_model=LogisticsAiQueryResponse)
async def ai_query(
    data: LogisticsAiQueryRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.answer_ai_query(db, data.query)


@router.get("/vehicles", response_model=list[LogisticsVehicleItem])
async def list_vehicles(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "WAREHOUSE_MANAGER", "DISPATCHER", "DRIVER"))],
):
    warehouse_id = getattr(user, "warehouse_id", None)
    # Warehouse managers only see their own warehouse's vehicles; logistic managers and dispatchers see all
    if getattr(user, "role", None) and user.role.name == "WAREHOUSE_MANAGER" and warehouse_id:
        return await logistics_service.list_vehicles(db, warehouse_id=warehouse_id)
    if getattr(user, "role", None) and user.role.name == "DRIVER":
        return await logistics_service.list_vehicles(
            db,
            warehouse_id=warehouse_id,
            driver_id=user.id,
            driver_scoped=True,
        )
    return await logistics_service.list_vehicles(db)


@router.get("/drivers", response_model=list[LogisticsDriverItem])
async def list_drivers(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER"))],
):
    from uuid import UUID as _UUID
    warehouse_id = getattr(user, "warehouse_id", None)
    if getattr(user, "role", None) and user.role.name == "DISPATCHER" and warehouse_id:
        return await logistics_service.list_drivers(db, warehouse_id=warehouse_id)
    return await logistics_service.list_drivers(db)


@router.post("/drivers", response_model=LogisticsDriverItem, status_code=status.HTTP_201_CREATED)
async def create_driver(
    data: LogisticsDriverCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.create_driver(db, data)


@router.put("/drivers/{driver_id}", response_model=LogisticsDriverItem)
async def update_driver(
    driver_id: UUID,
    data: LogisticsDriverUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.update_driver(db, driver_id, data)


@router.post("/vehicles", response_model=LogisticsVehicleItem, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    data: LogisticsVehicleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.create_vehicle(db, data)


@router.put("/vehicles/{vehicle_id}", response_model=LogisticsVehicleItem)
async def update_vehicle(
    vehicle_id: UUID,
    data: LogisticsVehicleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.update_vehicle(db, vehicle_id, data)


@router.post("/transactions", response_model=LogisticsTransactionItem, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    data: LogisticsTransactionCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.create_transaction(db, data)


@router.post("/capital-investment", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_capital_investment(
    data: CapitalInvestmentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    from app.services import finance_service
    result = await finance_service.create_capital_investment(
        db,
        amount=data.amount,
        description=data.description,
        funding_source=data.funding_source,
        warehouse_id=data.warehouse_id,
        investment_date=data.investment_date,
    )
    await db.commit()
    return result


@router.put("/returns/{case_id}", response_model=LogisticsReturnCaseItem)
async def update_return_case(
    case_id: UUID,
    data: LogisticsReturnCaseUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.update_return_case(db, case_id, data)


@router.post("/zones", response_model=LogisticsZoneItem, status_code=status.HTTP_201_CREATED)
async def create_zone(
    data: LogisticsZoneCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.create_zone(db, data)


@router.put("/zones/{zone_id}", response_model=LogisticsZoneItem)
async def update_zone(
    zone_id: UUID,
    data: LogisticsZoneUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.update_zone(db, zone_id, data)


@router.delete("/zones/{zone_id}", response_model=MessageResponse)
async def delete_zone(
    zone_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.delete_zone(db, zone_id)


@router.post("/chats/{thread_id}/messages", response_model=LogisticsChatThreadItem)
async def add_chat_message(
    thread_id: UUID,
    data: LogisticsChatMessageCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.add_chat_message(db, thread_id, data)


@router.put("/tasks/{task_id}", response_model=LogisticsTaskItem)
async def update_task(
    task_id: UUID,
    data: LogisticsTaskUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.update_task(db, task_id, data)


@router.put("/notifications/{notification_id}", response_model=LogisticsNotificationItem)
async def update_notification(
    notification_id: UUID,
    data: LogisticsNotificationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.update_notification(db, notification_id, data)


@router.post("/notifications/mark-all-read", response_model=MessageResponse)
async def mark_all_notifications_read(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.mark_all_notifications_read(db)


@router.delete("/notifications", response_model=MessageResponse)
async def clear_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.clear_notifications(db)


@router.post("/alerts", response_model=dict)
async def create_alert(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
    payload: dict = Body(...),
):
    alert = await logistics_service.create_alert(db, payload)
    return alert.model_dump()


@router.post("/alerts/{alert_id}/resolve", response_model=MessageResponse)
async def resolve_alert(
    alert_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.resolve_alert(db, alert_id)


@router.post("/documents", response_model=LogisticsDocumentItem, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: LogisticsDocumentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.create_document(db, data)


@router.put("/documents/{doc_id}/status", response_model=LogisticsDocumentItem)
async def update_document_status(
    doc_id: UUID,
    data: LogisticsDocumentUpdateStatus,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
):
    return await logistics_service.update_document_status(db, doc_id, data)


@router.get("/drivers/me/dashboard", response_model=DriverDashboardContext)
async def get_driver_dashboard(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.get_driver_dashboard(db, user)


@router.get("/drivers/me/shift", response_model=DriverShiftSummary)
async def get_driver_shift(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.get_driver_shift(db, user)


@router.get("/drivers/me/hos", response_model=DriverHosSummary)
async def get_driver_hos(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.get_driver_hos(db, user)


@router.get("/drivers/me/crew", response_model=list[DriverCrewMemberItem])
async def get_driver_crew(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.get_driver_crew(db, user)


@router.post("/drivers/me/crew/{labourer_id}/check-in", response_model=DriverCrewMemberItem)
async def check_in_driver_crew_member(
    labourer_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.check_in_driver_crew_member(db, user, labourer_id)


@router.get("/drivers/me/telemetry", response_model=DriverTelemetryResponse)
async def get_driver_telemetry(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.get_driver_telemetry(db, user)


@router.post("/drivers/me/bind-vehicle", response_model=LogisticsVehicleItem)
async def bind_driver_vehicle(
    data: DriverVehicleBindRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.bind_driver_vehicle(db, user, data)


@router.post("/drivers/me/shift/start", response_model=dict)
async def start_shift(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.start_shift(db, user)


@router.post("/drivers/me/shift/end", response_model=dict)
async def end_shift(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.end_shift(db, user)


from pydantic import BaseModel
class LocationUpdateParams(BaseModel):
    latitude: float
    longitude: float

@router.post("/drivers/me/location", response_model=dict)
async def update_driver_location(
    data: LocationUpdateParams,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[object, Depends(require_role("DRIVER"))],
):
    return await logistics_service.update_driver_location(db, user, data.latitude, data.longitude)

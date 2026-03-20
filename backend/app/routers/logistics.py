from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.schemas.auth import MessageResponse
from app.schemas.logistics import (
    LogisticsAiQueryRequest,
    LogisticsAiQueryResponse,
    LogisticsBootstrapResponse,
    LogisticsChatMessageCreate,
    LogisticsChatThreadItem,
    LogisticsNotificationItem,
    LogisticsNotificationUpdate,
    LogisticsReturnCaseItem,
    LogisticsReturnCaseUpdate,
    LogisticsTaskItem,
    LogisticsTaskUpdate,
    LogisticsTransactionCreate,
    LogisticsTransactionItem,
    LogisticsVehicleCreate,
    LogisticsVehicleItem,
    LogisticsVehicleUpdate,
    LogisticsZoneCreate,
    LogisticsZoneItem,
    LogisticsZoneUpdate,
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

from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.labour import LabourAttendance, Labourer
from app.schemas.labour import (
    AssignLabourResponse,
    AvailabilityItem,
    LabourAttendanceResponse,
    LabourAvailabilityResponse,
    LabourerCreate,
    LabourerListResponse,
    LabourerResponse,
    LabourerUpdate,
)


async def _get_labourer(db: AsyncSession, labourer_id: UUID) -> Labourer:
    result = await db.execute(
        select(Labourer)
        .options(
            selectinload(Labourer.user),
            selectinload(Labourer.assigned_order),
        )
        .where(Labourer.id == labourer_id)
    )
    labourer = result.scalar_one_or_none()
    if not labourer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Labourer not found")
    return labourer


def _to_labourer_response(labourer: Labourer) -> LabourerResponse:
    return LabourerResponse(
        id=labourer.id,
        user_id=labourer.user_id,
        warehouse_id=labourer.warehouse_id,
        assigned_order_id=labourer.assigned_order_id,
        assigned_order_tracking=labourer.assigned_order.tracking_code if labourer.assigned_order else None,
        assigned_order_substatus=labourer.assigned_order.warehouse_substatus if labourer.assigned_order else None,
        skill_tags=labourer.skill_tags,
        is_active=labourer.is_active,
        name=labourer.user.name if labourer.user else None,
        email=labourer.user.email if labourer.user else None,
        created_at=labourer.created_at,
    )


async def list_labourers(
    db: AsyncSession,
    page: int,
    page_size: int,
    warehouse_id: UUID | None = None,
) -> LabourerListResponse:
    total_query = select(func.count(Labourer.id))
    data_query = (
        select(Labourer)
        .options(
            selectinload(Labourer.user),
            selectinload(Labourer.assigned_order),
        )
        .order_by(Labourer.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    if warehouse_id:
        total_query = total_query.where(Labourer.warehouse_id == warehouse_id)
        data_query = data_query.where(Labourer.warehouse_id == warehouse_id)

    total = (await db.execute(total_query)).scalar_one()
    rows = (
        await db.execute(data_query)
    ).scalars().all()

    return LabourerListResponse(
        items=[_to_labourer_response(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


async def create_labourer(db: AsyncSession, data: LabourerCreate) -> LabourerResponse:
    existing = await db.execute(select(Labourer).where(Labourer.user_id == data.user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Labourer profile already exists")

    labourer = Labourer(**data.model_dump(), is_active=True)
    db.add(labourer)
    await db.flush()
    labourer = await _get_labourer(db, labourer.id)
    return _to_labourer_response(labourer)


async def get_labourer_detail(db: AsyncSession, labourer_id: UUID) -> LabourerResponse:
    labourer = await _get_labourer(db, labourer_id)
    return _to_labourer_response(labourer)


async def update_labourer(
    db: AsyncSession,
    labourer_id: UUID,
    data: LabourerUpdate,
) -> LabourerResponse:
    labourer = await _get_labourer(db, labourer_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(labourer, key, value)

    db.add(labourer)
    await db.flush()
    labourer = await _get_labourer(db, labourer.id)
    return _to_labourer_response(labourer)


async def assign_labourer(db: AsyncSession, labourer_id: UUID, order_id: UUID) -> AssignLabourResponse:
    labourer = await _get_labourer(db, labourer_id)
    if labourer.assigned_order_id and labourer.assigned_order_id != order_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Labourer is already assigned to another order",
        )

    labourer.assigned_order_id = order_id
    db.add(labourer)
    await db.flush()

    return AssignLabourResponse(
        message="Labourer assigned successfully",
        labourer_id=labourer.id,
        order_id=order_id,
    )


async def check_in(db: AsyncSession, labourer_id: UUID) -> LabourAttendanceResponse:
    labourer = await _get_labourer(db, labourer_id)
    if not labourer.is_active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Labourer is inactive")

    last_event = (
        await db.execute(
            select(LabourAttendance)
            .where(LabourAttendance.labourer_id == labourer_id)
            .order_by(LabourAttendance.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    if last_event and last_event.event_type == "CHECK_IN":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Labourer already checked in")

    event = LabourAttendance(labourer_id=labourer_id, event_type="CHECK_IN")
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return LabourAttendanceResponse.model_validate(event)


async def check_out(db: AsyncSession, labourer_id: UUID) -> LabourAttendanceResponse:
    labourer = await _get_labourer(db, labourer_id)
    if not labourer.is_active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Labourer is inactive")

    last_event = (
        await db.execute(
            select(LabourAttendance)
            .where(LabourAttendance.labourer_id == labourer_id)
            .order_by(LabourAttendance.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    if not last_event or last_event.event_type != "CHECK_IN":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Labourer must check in before check out",
        )

    event = LabourAttendance(labourer_id=labourer_id, event_type="CHECK_OUT")
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return LabourAttendanceResponse.model_validate(event)


async def availability_today(db: AsyncSession) -> LabourAvailabilityResponse:
    rows = (
        await db.execute(
            select(Labourer).where(
                and_(
                    Labourer.is_active.is_(True),
                    Labourer.assigned_order_id.is_(None),
                )
            )
        )
    ).scalars().all()

    return LabourAvailabilityResponse(
        date=str(date.today()),
        items=[
            AvailabilityItem(
                labourer_id=row.id,
                user_id=row.user_id,
                warehouse_id=row.warehouse_id,
                skill_tags=row.skill_tags,
            )
            for row in rows
        ],
    )

"""Warehouse Operations Service.

Handles warehouse lifecycle operations: picking, packing, quality checks,
loading dock management, returns grading, and zone metrics.
"""
from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.labour import Labourer
from app.models.order import Order
from app.models.user import User
from app.models.warehouse import (
    LoadingDock,
    PackingStation,
    QualityCheck,
    ReturnGrading,
    Warehouse,
    WarehouseZoneMetrics,
)
from app.schemas.warehouse_operations import (
    AssignTruckRequest,
    DockVerificationData,
    LoadingDockCreate,
    LoadingDockListResponse,
    LoadingDockResponse,
    PackingStationCreate,
    PackingStationListResponse,
    PackingStationResponse,
    PackingStationUpdate,
    PerformanceMetrics,
    PerformanceResponse,
    PickingResponse,
    QualityCheckCreate,
    QualityCheckListResponse,
    QualityCheckResponse,
    QualityCheckUpdate,
    ReturnGradingCreate,
    ReturnGradingListResponse,
    ReturnGradingResponse,
    ReturnGradingUpdate,
    StartPackingRequest,
    StartPickingRequest,
    WAREHOUSE_SUBSTATUSES,
    WAREHOUSE_SUBSTATUS_TRANSITIONS,
    ZoneMetricsCreate,
    ZoneMetricsListResponse,
    ZoneMetricsResponse,
)


# ======================
# Helper Functions
# ======================

async def _get_warehouse(db: AsyncSession, warehouse_id: UUID) -> Warehouse:
    result = await db.execute(
        select(Warehouse).where(Warehouse.id == warehouse_id, Warehouse.is_active.is_(True))
    )
    warehouse = result.scalar_one_or_none()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse


async def _get_order(db: AsyncSession, order_id: UUID) -> Order:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def _validate_substatus_transition(current: str | None, target: str) -> None:
    if target not in WAREHOUSE_SUBSTATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid warehouse substatus: {target}"
        )

    if current is None:
        # Allow initial transition to AWAITING_PICK
        if target not in {"AWAITING_PICK", "ON_HOLD"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Initial substatus must be AWAITING_PICK, got {target}"
            )
        return

    allowed = WAREHOUSE_SUBSTATUS_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {current} to {target}. Allowed: {allowed}"
        )


def _to_quality_check_response(qc: QualityCheck) -> QualityCheckResponse:
    performer_name = qc.performer.name if qc.performer else None

    return QualityCheckResponse(
        id=qc.id,
        order_id=qc.order_id,
        warehouse_id=qc.warehouse_id,
        goods_correct=qc.goods_correct,
        count_correct=qc.count_correct,
        packaging_verified=qc.packaging_verified,
        labor_assigned=qc.labor_assigned,
        weight_verified=qc.weight_verified,
        label_attached=qc.label_attached,
        is_passed=qc.is_passed,
        notes=qc.notes,
        performed_by=qc.performed_by,
        performer_name=performer_name,
        checked_at=qc.checked_at,
        created_at=qc.created_at,
    )


def _format_user_name(user: User | None) -> str | None:
    return user.name if user else None


# ======================
# Picking Operations
# ======================

async def start_picking(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID,
    data: StartPickingRequest,
) -> PickingResponse:
    """Start picking process for an order."""
    await _get_warehouse(db, warehouse_id)
    order = await _get_order(db, order_id)

    if order.warehouse_id != warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order does not belong to this warehouse"
        )

    # Backfill the initial warehouse step for older confirmed orders.
    if order.warehouse_substatus is None and order.status == "CONFIRMED":
        order.warehouse_substatus = "AWAITING_PICK"

    # Validate transition
    _validate_substatus_transition(order.warehouse_substatus, "PICKING")

    assigned_labourer_id = data.labourer_id
    if data.labourer_id:
        result = await db.execute(
            select(Labourer).where(
                Labourer.id == data.labourer_id,
                Labourer.warehouse_id == warehouse_id,
                Labourer.is_active.is_(True),
            )
        )
        labourer = result.scalar_one_or_none()
        if not labourer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Labourer not found or not active in this warehouse"
            )

        if labourer.assigned_order_id and labourer.assigned_order_id != order_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Selected labourer is already assigned to another order"
            )
        existing_assignments = (
            await db.execute(
                select(Labourer).where(
                    Labourer.warehouse_id == warehouse_id,
                    Labourer.assigned_order_id == order_id,
                    Labourer.id != labourer.id,
                )
            )
        ).scalars().all()
        for assigned_labourer in existing_assignments:
            assigned_labourer.assigned_order_id = None
        labourer.assigned_order_id = order_id
    else:
        labourer = (
            await db.execute(
                select(Labourer).where(
                    Labourer.warehouse_id == warehouse_id,
                    Labourer.is_active.is_(True),
                    Labourer.assigned_order_id == order_id,
                ).limit(1)
            )
        ).scalar_one_or_none()
        if labourer:
            assigned_labourer_id = labourer.id
        else:
            labourer = (
                await db.execute(
                    select(Labourer).where(
                        Labourer.warehouse_id == warehouse_id,
                        Labourer.is_active.is_(True),
                        Labourer.assigned_order_id.is_(None),
                    ).limit(1)
                )
            ).scalar_one_or_none()
            if labourer:
                labourer.assigned_order_id = order_id
                assigned_labourer_id = labourer.id

    order.warehouse_substatus = "PICKING"
    order.picking_started_at = datetime.now(timezone.utc)

    await db.commit()

    return PickingResponse(
        order_id=order_id,
        warehouse_substatus="PICKING",
        assigned_labourer_id=assigned_labourer_id,
        message="Picking started successfully",
    )


async def complete_picking(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID,
) -> PickingResponse:
    """Complete picking process for an order and deduct inventory."""
    from app.models.inventory import InventoryItem, InventoryMovement
    from app.models.order import OrderItem, PickedItem

    await _get_warehouse(db, warehouse_id)
    order = await _get_order(db, order_id)

    if order.warehouse_id != warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order does not belong to this warehouse"
        )

    _validate_substatus_transition(order.warehouse_substatus, "PICKED")

    order_items = (await db.execute(
        select(OrderItem).where(OrderItem.order_id == order_id)
    )).scalars().all()
    picked_items = (await db.execute(
        select(PickedItem).where(PickedItem.order_id == order_id)
    )).scalars().all()
    picked_by_sku = {picked_item.sku: picked_item for picked_item in picked_items}

    if picked_items:
        incomplete_items: list[str] = []
        for order_item in order_items:
            picked_item = picked_by_sku.get(order_item.sku)
            picked_qty = picked_item.quantity_picked if picked_item else 0
            if picked_qty < order_item.quantity:
                incomplete_items.append(
                    f"{order_item.sku} ({order_item.quantity - picked_qty} remaining)"
                )

        if incomplete_items:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="All order items must be confirmed before completing picking: "
                + ", ".join(incomplete_items),
            )
    else:
        for order_item in order_items:
            inventory_result = await db.execute(
                select(InventoryItem).where(
                    InventoryItem.warehouse_id == warehouse_id,
                    InventoryItem.sku == order_item.sku,
                )
            )
            inventory_item = inventory_result.scalar_one_or_none()

            if inventory_item:
                deduct_qty = min(order_item.quantity, inventory_item.quantity_on_hand)
                if deduct_qty > 0:
                    inventory_item.quantity_on_hand -= deduct_qty

                    movement = InventoryMovement(
                        item_id=inventory_item.id,
                        movement_type="PICK",
                        quantity=deduct_qty,
                        reference_order_id=order_id,
                        performed_by=None,
                    )
                    db.add(movement)

    order.warehouse_substatus = "PICKED"
    order.picking_completed_at = datetime.now(timezone.utc)
    await db.commit()

    return PickingResponse(
        order_id=order_id,
        warehouse_substatus="PICKED",
        assigned_labourer_id=None,
        message="Picking completed successfully.",
    )


async def confirm_pick_item(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID,
    data,  # ConfirmPickItemRequest
    user_id: UUID,
):
    """Confirm picking of a specific item (supports partial picking)."""
    from app.models.inventory import InventoryItem, InventoryMovement
    from app.models.order import OrderItem, PickedItem

    await _get_warehouse(db, warehouse_id)
    order = await _get_order(db, order_id)

    if order.warehouse_id != warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order does not belong to this warehouse"
        )

    # Must be in PICKING status
    if order.warehouse_substatus != "PICKING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must be in PICKING status to confirm items"
        )

    # Verify this SKU exists in the order
    order_item_result = await db.execute(
        select(OrderItem).where(
            OrderItem.order_id == order_id,
            OrderItem.sku == data.sku,
        )
    )
    order_item = order_item_result.scalar_one_or_none()
    if not order_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKU {data.sku} not found in this order"
        )

    # Get or create PickedItem record
    picked_result = await db.execute(
        select(PickedItem).where(
            PickedItem.order_id == order_id,
            PickedItem.sku == data.sku,
        )
    )
    picked_item = picked_result.scalar_one_or_none()

    if not picked_item:
        picked_item = PickedItem(
            order_id=order_id,
            sku=data.sku,
            quantity_picked=0,
            quantity_required=order_item.quantity,
            picked_by=user_id,
            location=data.location,
            notes=data.notes,
        )
        db.add(picked_item)

    # Update picked quantity
    new_total = picked_item.quantity_picked + data.quantity_picked
    if new_total > picked_item.quantity_required:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot pick {new_total} items (only {picked_item.quantity_required} required)"
        )

    picked_item.quantity_picked = new_total
    picked_item.picked_by = user_id
    if data.location:
        picked_item.location = data.location
    if data.notes:
        picked_item.notes = data.notes

    # Deduct inventory immediately
    inventory_result = await db.execute(
        select(InventoryItem).where(
            InventoryItem.warehouse_id == warehouse_id,
            InventoryItem.sku == data.sku,
        )
    )
    inventory_item = inventory_result.scalar_one_or_none()

    if inventory_item:
        if inventory_item.quantity_on_hand < data.quantity_picked:
            # Allow negative for tracking but warn
            pass  # Could log warning here

        inventory_item.quantity_on_hand -= data.quantity_picked

        # Create movement record
        movement = InventoryMovement(
            item_id=inventory_item.id,
            movement_type="PICK",
            quantity=data.quantity_picked,
            reference_order_id=order_id,
            performed_by=user_id,
        )
        db.add(movement)

    await db.commit()
    picked_item = (
        await db.execute(
            select(PickedItem)
            .options(selectinload(PickedItem.picker))
            .where(PickedItem.id == picked_item.id)
        )
    ).scalar_one()

    from app.schemas.warehouse_operations import PickedItemResponse
    return PickedItemResponse(
        id=picked_item.id,
        order_id=picked_item.order_id,
        sku=picked_item.sku,
        quantity_picked=picked_item.quantity_picked,
        quantity_required=picked_item.quantity_required,
        picked_by=picked_item.picked_by,
        picker_name=_format_user_name(picked_item.picker),
        location=picked_item.location,
        notes=picked_item.notes,
        is_complete=picked_item.quantity_picked >= picked_item.quantity_required,
        created_at=picked_item.created_at,
        updated_at=picked_item.updated_at,
    )


async def get_pick_progress(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID,
):
    """Get picking progress for an order."""
    from app.models.order import OrderItem, PickedItem

    await _get_warehouse(db, warehouse_id)
    order = await _get_order(db, order_id)

    if order.warehouse_id != warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order does not belong to this warehouse"
        )

    # Get all order items
    order_items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order_id)
    )
    order_items = order_items_result.scalars().all()

    # Get all picked items
    picked_items_result = await db.execute(
        select(PickedItem)
        .options(selectinload(PickedItem.picker))
        .where(PickedItem.order_id == order_id)
    )
    picked_items_list = picked_items_result.scalars().all()

    # Build picked items map
    picked_map = {pi.sku: pi for pi in picked_items_list}

    # Build response items
    items_response = []
    total_items = len(order_items)
    completed_count = 0

    for order_item in order_items:
        picked_item = picked_map.get(order_item.sku)

        if picked_item:
            from app.schemas.warehouse_operations import PickedItemResponse
            items_response.append(PickedItemResponse(
                id=picked_item.id,
                order_id=picked_item.order_id,
                sku=picked_item.sku,
                quantity_picked=picked_item.quantity_picked,
                quantity_required=picked_item.quantity_required,
                picked_by=picked_item.picked_by,
                picker_name=_format_user_name(picked_item.picker),
                location=picked_item.location,
                notes=picked_item.notes,
                is_complete=picked_item.quantity_picked >= picked_item.quantity_required,
                created_at=picked_item.created_at,
                updated_at=picked_item.updated_at,
            ))

            if picked_item.quantity_picked >= picked_item.quantity_required:
                completed_count += 1

    from app.schemas.warehouse_operations import PickProgressResponse
    return PickProgressResponse(
        order_id=order_id,
        total_items=total_items,
        picked_items=completed_count,
        is_complete=completed_count >= total_items,
        items=items_response,
    )


# ======================
# Packing Station Operations
# ======================

async def get_packing_stations(
    db: AsyncSession,
    warehouse_id: UUID,
) -> PackingStationListResponse:
    """Get all packing stations for a warehouse."""
    await _get_warehouse(db, warehouse_id)

    result = await db.execute(
        select(PackingStation)
        .options(
            selectinload(PackingStation.assigned_labourer).selectinload(Labourer.user),
            selectinload(PackingStation.current_order),
        )
        .where(PackingStation.warehouse_id == warehouse_id)
        .order_by(PackingStation.station_number)
    )
    stations = result.scalars().all()

    items = []
    for station in stations:
        labourer_name = None
        if station.assigned_labourer and station.assigned_labourer.user:
            labourer_name = station.assigned_labourer.user.name

        order_tracking = None
        if station.current_order:
            order_tracking = station.current_order.tracking_code

        items.append(PackingStationResponse(
            id=station.id,
            warehouse_id=station.warehouse_id,
            station_number=station.station_number,
            status=station.status,
            assigned_labourer_id=station.assigned_labourer_id,
            assigned_labourer_name=labourer_name,
            current_order_id=station.current_order_id,
            current_order_tracking=order_tracking,
            items_packed_today=station.items_packed_today,
            created_at=station.created_at,
        ))

    return PackingStationListResponse(items=items, total=len(items))


async def create_packing_station(
    db: AsyncSession,
    warehouse_id: UUID,
    data: PackingStationCreate,
) -> PackingStationResponse:
    """Create a new packing station."""
    await _get_warehouse(db, warehouse_id)

    station = PackingStation(
        warehouse_id=warehouse_id,
        station_number=data.station_number,
        status=data.status,
    )
    db.add(station)
    await db.commit()
    await db.refresh(station)

    return PackingStationResponse(
        id=station.id,
        warehouse_id=station.warehouse_id,
        station_number=station.station_number,
        status=station.status,
        assigned_labourer_id=None,
        assigned_labourer_name=None,
        current_order_id=None,
        current_order_tracking=None,
        items_packed_today=0,
        created_at=station.created_at,
    )


async def update_packing_station(
    db: AsyncSession,
    warehouse_id: UUID,
    station_id: UUID,
    data: PackingStationUpdate,
) -> PackingStationResponse:
    """Update a packing station."""
    await _get_warehouse(db, warehouse_id)

    result = await db.execute(
        select(PackingStation)
        .options(
            selectinload(PackingStation.assigned_labourer).selectinload(Labourer.user),
            selectinload(PackingStation.current_order),
        )
        .where(PackingStation.id == station_id, PackingStation.warehouse_id == warehouse_id)
    )
    station = result.scalar_one_or_none()
    if not station:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Packing station not found")

    if data.status is not None:
        station.status = data.status
    if data.assigned_labourer_id is not None:
        station.assigned_labourer_id = data.assigned_labourer_id
    if data.current_order_id is not None:
        station.current_order_id = data.current_order_id

    await db.commit()
    await db.refresh(station)

    labourer_name = None
    if station.assigned_labourer and station.assigned_labourer.user:
        labourer_name = station.assigned_labourer.user.name

    order_tracking = None
    if station.current_order:
        order_tracking = station.current_order.tracking_code

    return PackingStationResponse(
        id=station.id,
        warehouse_id=station.warehouse_id,
        station_number=station.station_number,
        status=station.status,
        assigned_labourer_id=station.assigned_labourer_id,
        assigned_labourer_name=labourer_name,
        current_order_id=station.current_order_id,
        current_order_tracking=order_tracking,
        items_packed_today=station.items_packed_today,
        created_at=station.created_at,
    )


async def start_packing(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID,
    data: StartPackingRequest,
) -> PickingResponse:
    """Start packing process for an order."""
    await _get_warehouse(db, warehouse_id)
    order = await _get_order(db, order_id)

    if order.warehouse_id != warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order does not belong to this warehouse"
        )

    _validate_substatus_transition(order.warehouse_substatus, "PACKING")

    station = None
    if data.station_id:
        result = await db.execute(
            select(PackingStation).where(
                PackingStation.id == data.station_id,
                PackingStation.warehouse_id == warehouse_id,
            )
        )
        station = result.scalar_one_or_none()
        if not station:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Packing station not found")
    else:
        station = (
            await db.execute(
                select(PackingStation).where(PackingStation.warehouse_id == warehouse_id).order_by(PackingStation.station_number)
            )
        ).scalars().first()
        if station is None:
            station = PackingStation(
                warehouse_id=warehouse_id,
                station_number="PACK-01",
                status="ACTIVE",
            )
            db.add(station)
            await db.flush()

    station.current_order_id = order_id
    station.status = "ACTIVE"
    order.warehouse_substatus = "PACKING"
    order.packing_started_at = datetime.now(timezone.utc)

    await db.commit()

    return PickingResponse(
        order_id=order_id,
        warehouse_substatus="PACKING",
        assigned_labourer_id=station.assigned_labourer_id,
        message="Packing started successfully",
    )


async def complete_packing(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID,
) -> PickingResponse:
    """Complete packing process for an order."""
    await _get_warehouse(db, warehouse_id)
    order = await _get_order(db, order_id)

    if order.warehouse_id != warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order does not belong to this warehouse"
        )

    _validate_substatus_transition(order.warehouse_substatus, "PACKED")

    # Update station if assigned
    result = await db.execute(
        select(PackingStation).where(PackingStation.current_order_id == order_id)
    )
    station = result.scalar_one_or_none()
    if station:
        station.current_order_id = None
        station.items_packed_today += 1

    assigned_labourers = (
        await db.execute(
            select(Labourer).where(
                Labourer.warehouse_id == warehouse_id,
                Labourer.assigned_order_id == order_id,
            )
        )
    ).scalars().all()
    for labourer in assigned_labourers:
        labourer.assigned_order_id = None

    order.warehouse_substatus = "PACKED"
    order.packing_completed_at = datetime.now(timezone.utc)
    await db.commit()

    return PickingResponse(
        order_id=order_id,
        warehouse_substatus="PACKED",
        assigned_labourer_id=None,
        message="Packing completed successfully",
    )


# ======================
# Quality Check Operations
# ======================

async def create_quality_check(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID,
    performed_by: UUID | None = None,
) -> QualityCheckResponse:
    """Create a new quality check record for an order."""
    await _get_warehouse(db, warehouse_id)
    order = await _get_order(db, order_id)

    if order.warehouse_id != warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order does not belong to this warehouse"
        )

    # Check if QC already exists
    result = await db.execute(
        select(QualityCheck).where(QualityCheck.order_id == order_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Quality check already exists for this order"
        )

    qc = QualityCheck(
        order_id=order_id,
        warehouse_id=warehouse_id,
        performed_by=performed_by,
    )
    db.add(qc)
    await db.commit()
    result = await db.execute(
        select(QualityCheck)
        .options(selectinload(QualityCheck.performer))
        .where(QualityCheck.id == qc.id)
    )
    qc = result.scalar_one()
    return _to_quality_check_response(qc)


async def list_quality_checks(
    db: AsyncSession,
    warehouse_id: UUID,
    order_id: UUID | None = None,
) -> QualityCheckListResponse:
    """List quality checks for a warehouse."""
    await _get_warehouse(db, warehouse_id)

    query = (
        select(QualityCheck)
        .options(selectinload(QualityCheck.performer))
        .where(QualityCheck.warehouse_id == warehouse_id)
        .order_by(QualityCheck.created_at.desc())
    )

    if order_id:
        query = query.where(QualityCheck.order_id == order_id)

    checks = (await db.execute(query)).scalars().all()
    return QualityCheckListResponse(
        items=[_to_quality_check_response(check) for check in checks],
        total=len(checks),
    )


async def get_quality_check(
    db: AsyncSession,
    warehouse_id: UUID,
    check_id: UUID,
) -> QualityCheckResponse:
    """Get a quality check by ID."""
    result = await db.execute(
        select(QualityCheck)
        .options(selectinload(QualityCheck.performer))
        .where(QualityCheck.id == check_id, QualityCheck.warehouse_id == warehouse_id)
    )
    qc = result.scalar_one_or_none()
    if not qc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quality check not found")
    return _to_quality_check_response(qc)


async def update_quality_check(
    db: AsyncSession,
    warehouse_id: UUID,
    check_id: UUID,
    data: QualityCheckUpdate,
    performed_by: UUID | None = None,
) -> QualityCheckResponse:
    """Update a quality check."""
    result = await db.execute(
        select(QualityCheck)
        .options(selectinload(QualityCheck.performer))
        .where(QualityCheck.id == check_id, QualityCheck.warehouse_id == warehouse_id)
    )
    qc = result.scalar_one_or_none()
    if not qc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quality check not found")

    if data.goods_correct is not None:
        qc.goods_correct = data.goods_correct
    if data.count_correct is not None:
        qc.count_correct = data.count_correct
    if data.packaging_verified is not None:
        qc.packaging_verified = data.packaging_verified
    if data.labor_assigned is not None:
        qc.labor_assigned = data.labor_assigned
    if data.weight_verified is not None:
        qc.weight_verified = data.weight_verified
    if data.label_attached is not None:
        qc.label_attached = data.label_attached
    if data.notes is not None:
        qc.notes = data.notes

    if performed_by:
        qc.performed_by = performed_by

    await db.commit()
    result = await db.execute(
        select(QualityCheck)
        .options(selectinload(QualityCheck.performer))
        .where(QualityCheck.id == qc.id)
    )
    qc = result.scalar_one()
    return _to_quality_check_response(qc)


async def pass_quality_check(
    db: AsyncSession,
    warehouse_id: UUID,
    check_id: UUID,
    performed_by: UUID | None = None,
) -> QualityCheckResponse:
    """Mark a quality check as passed and advance order substatus."""
    result = await db.execute(
        select(QualityCheck)
        .options(selectinload(QualityCheck.performer), selectinload(QualityCheck.order))
        .where(QualityCheck.id == check_id, QualityCheck.warehouse_id == warehouse_id)
    )
    qc = result.scalar_one_or_none()
    if not qc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quality check not found")

    # Validate all checks are complete
    if not all([
        qc.goods_correct,
        qc.count_correct,
        qc.packaging_verified,
        qc.labor_assigned,
        qc.weight_verified,
        qc.label_attached,
    ]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All quality check items must be verified before passing"
        )

    # Validate order substatus transition
    order = qc.order
    _validate_substatus_transition(order.warehouse_substatus, "QC_PASSED")

    qc.is_passed = True
    qc.checked_at = datetime.now(timezone.utc)
    if performed_by:
        qc.performed_by = performed_by

    order.warehouse_substatus = "QC_PASSED"

    await db.commit()
    result = await db.execute(
        select(QualityCheck)
        .options(selectinload(QualityCheck.performer))
        .where(QualityCheck.id == qc.id)
    )
    qc = result.scalar_one()
    return _to_quality_check_response(qc)


# ======================
# Loading Dock Operations
# ======================

async def get_loading_docks(
    db: AsyncSession,
    warehouse_id: UUID,
) -> LoadingDockListResponse:
    """Get all loading docks for a warehouse."""
    await _get_warehouse(db, warehouse_id)

    result = await db.execute(
        select(LoadingDock)
        .options(selectinload(LoadingDock.assigned_order))
        .where(LoadingDock.warehouse_id == warehouse_id)
        .order_by(LoadingDock.dock_number)
    )
    docks = result.scalars().all()

    items = []
    now = datetime.now(timezone.utc)
    for dock in docks:
        dwell_minutes = 0
        if dock.arrived_at and dock.status == "OCCUPIED":
            dwell_minutes = int((now - dock.arrived_at).total_seconds() / 60)

        order_tracking = None
        if dock.assigned_order:
            order_tracking = dock.assigned_order.tracking_code

        items.append(LoadingDockResponse(
            id=dock.id,
            warehouse_id=dock.warehouse_id,
            dock_number=dock.dock_number,
            status=dock.status,
            assigned_truck_id=dock.assigned_truck_id,
            assigned_carrier=dock.assigned_carrier,
            assigned_order_id=dock.assigned_order_id,
            assigned_order_tracking=order_tracking,
            arrived_at=dock.arrived_at,
            loading_started_at=dock.loading_started_at,
            released_at=dock.released_at,
            dwell_minutes=dwell_minutes,
            created_at=dock.created_at,
        ))

    return LoadingDockListResponse(items=items, total=len(items))


async def create_loading_dock(
    db: AsyncSession,
    warehouse_id: UUID,
    data: LoadingDockCreate,
) -> LoadingDockResponse:
    """Create a new loading dock."""
    await _get_warehouse(db, warehouse_id)

    dock = LoadingDock(
        warehouse_id=warehouse_id,
        dock_number=data.dock_number,
        status="FREE",
    )
    db.add(dock)
    await db.commit()
    await db.refresh(dock)

    return LoadingDockResponse(
        id=dock.id,
        warehouse_id=dock.warehouse_id,
        dock_number=dock.dock_number,
        status=dock.status,
        assigned_truck_id=None,
        assigned_carrier=None,
        assigned_order_id=None,
        assigned_order_tracking=None,
        arrived_at=None,
        loading_started_at=None,
        released_at=None,
        dwell_minutes=0,
        created_at=dock.created_at,
    )


async def assign_truck_to_dock(
    db: AsyncSession,
    warehouse_id: UUID,
    dock_id: UUID,
    data: AssignTruckRequest,
) -> LoadingDockResponse:
    """Assign a truck to a loading dock."""
    await _get_warehouse(db, warehouse_id)

    result = await db.execute(
        select(LoadingDock)
        .options(selectinload(LoadingDock.assigned_order))
        .where(LoadingDock.id == dock_id, LoadingDock.warehouse_id == warehouse_id)
    )
    dock = result.scalar_one_or_none()
    if not dock:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loading dock not found")

    if dock.status != "FREE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dock is not available (current status: {dock.status})"
        )

    # If order is provided, update its substatus
    if data.order_id:
        order = await _get_order(db, data.order_id)
        if order.warehouse_id != warehouse_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order does not belong to this warehouse"
            )
        _validate_substatus_transition(order.warehouse_substatus, "ON_DOCK")
        order.warehouse_substatus = "ON_DOCK"

    dock.assigned_truck_id = data.truck_id
    dock.assigned_carrier = data.carrier
    dock.assigned_order_id = data.order_id
    dock.arrived_at = datetime.now(timezone.utc)
    dock.status = "OCCUPIED"

    await db.commit()
    await db.refresh(dock)

    order_tracking = None
    if dock.assigned_order:
        order_tracking = dock.assigned_order.tracking_code

    return LoadingDockResponse(
        id=dock.id,
        warehouse_id=dock.warehouse_id,
        dock_number=dock.dock_number,
        status=dock.status,
        assigned_truck_id=dock.assigned_truck_id,
        assigned_carrier=dock.assigned_carrier,
        assigned_order_id=dock.assigned_order_id,
        assigned_order_tracking=order_tracking,
        arrived_at=dock.arrived_at,
        loading_started_at=dock.loading_started_at,
        released_at=dock.released_at,
        dwell_minutes=0,
        created_at=dock.created_at,
    )


async def release_dock(
    db: AsyncSession,
    warehouse_id: UUID,
    dock_id: UUID,
    verification: DockVerificationData,
) -> LoadingDockResponse:
    """Release a loading dock after verification."""
    await _get_warehouse(db, warehouse_id)

    result = await db.execute(
        select(LoadingDock)
        .options(selectinload(LoadingDock.assigned_order))
        .where(LoadingDock.id == dock_id, LoadingDock.warehouse_id == warehouse_id)
    )
    dock = result.scalar_one_or_none()
    if not dock:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loading dock not found")

    if dock.status != "OCCUPIED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dock is not occupied (current status: {dock.status})"
        )

    # Verify all checks passed
    if not all([
        verification.items_scanned,
        verification.labor_present,
        verification.packing_loaded,
        verification.manifest_attached,
        verification.driver_confirmed,
        verification.weight_verified,
    ]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All verification checks must pass before releasing dock"
        )

    # Update order substatus if assigned
    if dock.assigned_order:
        order = dock.assigned_order
        _validate_substatus_transition(order.warehouse_substatus, "DISPATCHED")
        order.warehouse_substatus = "DISPATCHED"

    now = datetime.now(timezone.utc)
    dwell_minutes = 0
    if dock.arrived_at:
        dwell_minutes = int((now - dock.arrived_at).total_seconds() / 60)

    dock.released_at = now
    dock.status = "FREE"
    dock.assigned_truck_id = None
    dock.assigned_carrier = None
    dock.assigned_order_id = None
    dock.arrived_at = None
    dock.loading_started_at = None

    await db.commit()
    await db.refresh(dock)

    return LoadingDockResponse(
        id=dock.id,
        warehouse_id=dock.warehouse_id,
        dock_number=dock.dock_number,
        status=dock.status,
        assigned_truck_id=None,
        assigned_carrier=None,
        assigned_order_id=None,
        assigned_order_tracking=None,
        arrived_at=None,
        loading_started_at=None,
        released_at=dock.released_at,
        dwell_minutes=dwell_minutes,
        created_at=dock.created_at,
    )


async def set_dock_maintenance(
    db: AsyncSession,
    warehouse_id: UUID,
    dock_id: UUID,
    is_maintenance: bool,
) -> LoadingDockResponse:
    """Set dock maintenance status."""
    await _get_warehouse(db, warehouse_id)

    result = await db.execute(
        select(LoadingDock)
        .where(LoadingDock.id == dock_id, LoadingDock.warehouse_id == warehouse_id)
    )
    dock = result.scalar_one_or_none()
    if not dock:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loading dock not found")

    if dock.status == "OCCUPIED" and is_maintenance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot set maintenance while dock is occupied"
        )

    dock.status = "MAINTENANCE" if is_maintenance else "FREE"

    await db.commit()
    await db.refresh(dock)

    return LoadingDockResponse(
        id=dock.id,
        warehouse_id=dock.warehouse_id,
        dock_number=dock.dock_number,
        status=dock.status,
        assigned_truck_id=dock.assigned_truck_id,
        assigned_carrier=dock.assigned_carrier,
        assigned_order_id=dock.assigned_order_id,
        assigned_order_tracking=None,
        arrived_at=dock.arrived_at,
        loading_started_at=dock.loading_started_at,
        released_at=dock.released_at,
        dwell_minutes=0,
        created_at=dock.created_at,
    )


# ======================
# Returns / Grading Operations
# ======================

async def get_return_gradings(
    db: AsyncSession,
    warehouse_id: UUID,
    status_filter: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> ReturnGradingListResponse:
    """Get all return gradings for a warehouse."""
    await _get_warehouse(db, warehouse_id)

    query = select(ReturnGrading).where(ReturnGrading.warehouse_id == warehouse_id)

    if status_filter:
        query = query.where(ReturnGrading.status == status_filter)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = (
        query
        .options(selectinload(ReturnGrading.order), selectinload(ReturnGrading.grader))
        .order_by(ReturnGrading.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    gradings = result.scalars().all()

    items = []
    for grading in gradings:
        order_tracking = grading.order.tracking_code if grading.order else None
        grader_name = grading.grader.name if grading.grader else None

        items.append(ReturnGradingResponse(
            id=grading.id,
            warehouse_id=grading.warehouse_id,
            order_id=grading.order_id,
            order_tracking=order_tracking,
            rma_code=grading.rma_code,
            item_condition=grading.item_condition,
            condition_notes=grading.condition_notes,
            disposition=grading.disposition,
            damage_photo_url=grading.damage_photo_url,
            graded_by=grading.graded_by,
            grader_name=grader_name,
            graded_at=grading.graded_at,
            status=grading.status,
            created_at=grading.created_at,
        ))

    return ReturnGradingListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


async def create_return_grading(
    db: AsyncSession,
    warehouse_id: UUID,
    data: ReturnGradingCreate,
    graded_by: UUID | None = None,
) -> ReturnGradingResponse:
    """Create a new return grading."""
    await _get_warehouse(db, warehouse_id)

    # Check for duplicate RMA code
    result = await db.execute(
        select(ReturnGrading).where(ReturnGrading.rma_code == data.rma_code)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="RMA code already exists"
        )

    grading = ReturnGrading(
        warehouse_id=warehouse_id,
        order_id=data.order_id,
        rma_code=data.rma_code,
        item_condition=data.item_condition,
        condition_notes=data.condition_notes,
        disposition=data.disposition,
        graded_by=graded_by,
        graded_at=datetime.now(timezone.utc) if graded_by else None,
        status="pending",
    )
    db.add(grading)
    await db.commit()
    await db.refresh(grading)

    return ReturnGradingResponse(
        id=grading.id,
        warehouse_id=grading.warehouse_id,
        order_id=grading.order_id,
        order_tracking=None,
        rma_code=grading.rma_code,
        item_condition=grading.item_condition,
        condition_notes=grading.condition_notes,
        disposition=grading.disposition,
        damage_photo_url=grading.damage_photo_url,
        graded_by=grading.graded_by,
        grader_name=None,
        graded_at=grading.graded_at,
        status=grading.status,
        created_at=grading.created_at,
    )


async def update_return_grading(
    db: AsyncSession,
    warehouse_id: UUID,
    grading_id: UUID,
    data: ReturnGradingUpdate,
) -> ReturnGradingResponse:
    """Update a return grading."""
    result = await db.execute(
        select(ReturnGrading)
        .options(selectinload(ReturnGrading.order), selectinload(ReturnGrading.grader))
        .where(ReturnGrading.id == grading_id, ReturnGrading.warehouse_id == warehouse_id)
    )
    grading = result.scalar_one_or_none()
    if not grading:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return grading not found")

    if data.item_condition is not None:
        grading.item_condition = data.item_condition
    if data.condition_notes is not None:
        grading.condition_notes = data.condition_notes
    if data.disposition is not None:
        grading.disposition = data.disposition

    await db.commit()
    await db.refresh(grading)

    order_tracking = grading.order.tracking_code if grading.order else None
    grader_name = grading.grader.name if grading.grader else None

    return ReturnGradingResponse(
        id=grading.id,
        warehouse_id=grading.warehouse_id,
        order_id=grading.order_id,
        order_tracking=order_tracking,
        rma_code=grading.rma_code,
        item_condition=grading.item_condition,
        condition_notes=grading.condition_notes,
        disposition=grading.disposition,
        damage_photo_url=grading.damage_photo_url,
        graded_by=grading.graded_by,
        grader_name=grader_name,
        graded_at=grading.graded_at,
        status=grading.status,
        created_at=grading.created_at,
    )


async def upload_damage_photo(
    db: AsyncSession,
    warehouse_id: UUID,
    grading_id: UUID,
    file: UploadFile,
) -> str:
    """Upload a damage photo for a return grading."""
    result = await db.execute(
        select(ReturnGrading).where(
            ReturnGrading.id == grading_id,
            ReturnGrading.warehouse_id == warehouse_id,
        )
    )
    grading = result.scalar_one_or_none()
    if not grading:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return grading not found")

    # For now, store base64 or you could save to disk/S3
    # This is a simplified implementation - in production use S3 or similar
    import base64
    content = await file.read()
    photo_data = base64.b64encode(content).decode('utf-8')
    photo_url = f"data:{file.content_type};base64,{photo_data}"

    grading.damage_photo_url = photo_url
    await db.commit()

    return photo_url


async def complete_return_grading(
    db: AsyncSession,
    warehouse_id: UUID,
    grading_id: UUID,
    graded_by: UUID | None = None,
) -> ReturnGradingResponse:
    """Mark a return grading as completed."""
    result = await db.execute(
        select(ReturnGrading)
        .options(selectinload(ReturnGrading.order), selectinload(ReturnGrading.grader))
        .where(ReturnGrading.id == grading_id, ReturnGrading.warehouse_id == warehouse_id)
    )
    grading = result.scalar_one_or_none()
    if not grading:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return grading not found")

    grading.status = "completed"
    grading.graded_at = datetime.now(timezone.utc)
    if graded_by:
        grading.graded_by = graded_by

    await db.commit()
    await db.refresh(grading)

    order_tracking = grading.order.tracking_code if grading.order else None
    grader_name = grading.grader.name if grading.grader else None

    return ReturnGradingResponse(
        id=grading.id,
        warehouse_id=grading.warehouse_id,
        order_id=grading.order_id,
        order_tracking=order_tracking,
        rma_code=grading.rma_code,
        item_condition=grading.item_condition,
        condition_notes=grading.condition_notes,
        disposition=grading.disposition,
        damage_photo_url=grading.damage_photo_url,
        graded_by=grading.graded_by,
        grader_name=grader_name,
        graded_at=grading.graded_at,
        status=grading.status,
        created_at=grading.created_at,
    )


# ======================
# Zone Metrics Operations
# ======================

async def get_zone_metrics(
    db: AsyncSession,
    warehouse_id: UUID,
    zone_id: str,
    date_from: date | None = None,
    date_to: date | None = None,
) -> ZoneMetricsListResponse:
    """Get metrics for a specific zone."""
    await _get_warehouse(db, warehouse_id)

    query = select(WarehouseZoneMetrics).where(
        WarehouseZoneMetrics.warehouse_id == warehouse_id,
        WarehouseZoneMetrics.zone_id == zone_id,
    )

    if date_from:
        query = query.where(WarehouseZoneMetrics.metric_date >= date_from)
    if date_to:
        query = query.where(WarehouseZoneMetrics.metric_date <= date_to)

    query = query.order_by(WarehouseZoneMetrics.metric_date.desc())

    result = await db.execute(query)
    metrics = result.scalars().all()

    items = [
        ZoneMetricsResponse(
            id=m.id,
            warehouse_id=m.warehouse_id,
            zone_id=m.zone_id,
            metric_date=m.metric_date,
            orders_processed=m.orders_processed,
            picking_accuracy_pct=m.picking_accuracy_pct,
            active_pickers=m.active_pickers,
            capacity_used_pct=m.capacity_used_pct,
            throughput_items_per_hour=m.throughput_items_per_hour,
            created_at=m.created_at,
        )
        for m in metrics
    ]

    return ZoneMetricsListResponse(items=items, total=len(items))


async def record_zone_metrics(
    db: AsyncSession,
    warehouse_id: UUID,
    data: ZoneMetricsCreate,
) -> ZoneMetricsResponse:
    """Record metrics for a zone (upsert for today)."""
    await _get_warehouse(db, warehouse_id)
    today = date.today()

    # Check for existing record
    result = await db.execute(
        select(WarehouseZoneMetrics).where(
            WarehouseZoneMetrics.warehouse_id == warehouse_id,
            WarehouseZoneMetrics.zone_id == data.zone_id,
            WarehouseZoneMetrics.metric_date == today,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Update existing
        existing.orders_processed = data.orders_processed
        existing.picking_accuracy_pct = data.picking_accuracy_pct
        existing.active_pickers = data.active_pickers
        existing.capacity_used_pct = data.capacity_used_pct
        existing.throughput_items_per_hour = data.throughput_items_per_hour
        metrics = existing
    else:
        # Create new
        metrics = WarehouseZoneMetrics(
            warehouse_id=warehouse_id,
            zone_id=data.zone_id,
            metric_date=today,
            orders_processed=data.orders_processed,
            picking_accuracy_pct=data.picking_accuracy_pct,
            active_pickers=data.active_pickers,
            capacity_used_pct=data.capacity_used_pct,
            throughput_items_per_hour=data.throughput_items_per_hour,
        )
        db.add(metrics)

    await db.commit()
    await db.refresh(metrics)

    return ZoneMetricsResponse(
        id=metrics.id,
        warehouse_id=metrics.warehouse_id,
        zone_id=metrics.zone_id,
        metric_date=metrics.metric_date,
        orders_processed=metrics.orders_processed,
        picking_accuracy_pct=metrics.picking_accuracy_pct,
        active_pickers=metrics.active_pickers,
        capacity_used_pct=metrics.capacity_used_pct,
        throughput_items_per_hour=metrics.throughput_items_per_hour,
        created_at=metrics.created_at,
    )


# ======================
# Performance Metrics
# ======================

async def get_performance_metrics(
    db: AsyncSession,
    warehouse_id: UUID,
    time_range: str = "today",
) -> PerformanceResponse:
    """Get performance metrics for a warehouse."""
    await _get_warehouse(db, warehouse_id)

    # Define date range
    now = datetime.now(timezone.utc)
    if time_range == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif time_range == "week":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = start_date.replace(day=start_date.day - start_date.weekday())
    elif time_range == "month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Get orders for the period
    result = await db.execute(
        select(Order).where(
            Order.warehouse_id == warehouse_id,
            Order.created_at >= start_date,
        )
    )
    orders = result.scalars().all()

    # Get labourers
    result = await db.execute(
        select(Labourer).where(Labourer.warehouse_id == warehouse_id)
    )
    labourers = result.scalars().all()

    # Calculate metrics
    total_orders = len(orders)
    status_breakdown = {}
    for order in orders:
        substatus = order.warehouse_substatus or "NONE"
        status_breakdown[substatus] = status_breakdown.get(substatus, 0) + 1

    dispatched = status_breakdown.get("DISPATCHED", 0)
    completion_rate = (dispatched / total_orders * 100) if total_orders > 0 else 0

    labor_breakdown = {"active": 0, "idle": 0, "off": 0}
    for labourer in labourers:
        if labourer.is_active:
            if labourer.assigned_order_id:
                labor_breakdown["active"] += 1
            else:
                labor_breakdown["idle"] += 1
        else:
            labor_breakdown["off"] += 1

    metrics = PerformanceMetrics(
        completion_rate=round(completion_rate, 1),
        on_hold_count=status_breakdown.get("ON_HOLD", 0),
        picking_active=status_breakdown.get("PICKING", 0),
        packing_active=status_breakdown.get("PACKING", 0),
        ready_for_dispatch=status_breakdown.get("READY_FOR_DISPATCH", 0) + status_breakdown.get("QC_PASSED", 0),
        dispatched_today=dispatched,
        total_orders=total_orders,
        status_breakdown=status_breakdown,
        labor_breakdown=labor_breakdown,
    )

    return PerformanceResponse(
        warehouse_id=warehouse_id,
        time_range=time_range,
        metrics=metrics,
    )

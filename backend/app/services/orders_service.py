import math
import random
import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.models.inventory import InventoryItem, InventoryMovement
from app.models.labour import Labourer
from app.models.logistics import LogisticsDriverProfile, LogisticsVehicle
from app.models.order import Order, OrderItem
from app.models.user import Role, User
from app.models.warehouse import Warehouse
from app.services import geocoding_service
from app.utils.email import delivery_otp_email_html, send_email
from app.schemas.orders import (
    DeliveryOtpSendResponse,
    CancelOrderRequest,
    OrderAssignRequest,
    OrderCreate,
    OrderItemResponse,
    OrderItemUpsert,
    OrderListResponse,
    OrderResponse,
    OrderUpdate,
)

ORDER_TYPES = {"INDIVIDUAL", "VENDOR"}
ORDER_STATUSES = {
    "DRAFT",
    "CONFIRMED",
    "ASSIGNED",
    "IN_TRANSIT",
    "DELIVERED",
    "CLOSED",
    "CANCELLED",
}
TERMINAL_ORDER_STATUSES = {"CLOSED", "CANCELLED"}
AUTO_ASSIGN_READY_ROLES = {"DISPATCHER", "DRIVER", "LABOURER"}
ALLOWED_TRANSITIONS = {
    "DRAFT": {"CONFIRMED", "CANCELLED"},
    "CONFIRMED": {"ASSIGNED", "CANCELLED"},
    "ASSIGNED": {"IN_TRANSIT", "CANCELLED"},
    "IN_TRANSIT": {"DELIVERED", "CANCELLED"},
    "DELIVERED": {"CLOSED"},
    "CLOSED": set(),
    "CANCELLED": set(),
}


async def _get_order(db: AsyncSession, order_id: UUID) -> Order:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def _tracking_code() -> str:
    return f"QC-{uuid.uuid4().hex[:10].upper()}"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    if not domain:
        return email
    if len(local) <= 2:
        masked_local = f"{local[:1]}***"
    else:
        masked_local = f"{local[:2]}***"
    return f"{masked_local}@{domain}"


def _generate_delivery_otp() -> str:
    return f"{random.randint(1000, 9999)}"


def _normalize_data_url(payload: str | None, mime_type: str) -> str | None:
    if not payload:
        return None
    if payload.startswith("data:"):
        return payload
    return f"data:{mime_type};base64,{payload}"


async def _resolve_warehouse_id(
    db: AsyncSession,
    warehouse_id: UUID | None,
) -> UUID:
    if warehouse_id:
        warehouse = await _get_active_warehouse(db, warehouse_id)
        return warehouse.id

    warehouse = await _select_auto_assignment_warehouse(db)
    return warehouse.id


async def _get_active_warehouse(
    db: AsyncSession,
    warehouse_id: UUID,
) -> Warehouse:
    warehouse = (
        await db.execute(
            select(Warehouse).where(Warehouse.id == warehouse_id, Warehouse.is_active.is_(True))
        )
    ).scalar_one_or_none()
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active warehouse not found",
        )
    return warehouse


async def _select_auto_assignment_warehouse(db: AsyncSession) -> Warehouse:
    active_warehouses = (
        await db.execute(
            select(Warehouse)
            .where(Warehouse.is_active.is_(True))
            .order_by(Warehouse.created_at.asc())
        )
    ).scalars().all()

    if not active_warehouses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No active warehouses available for assignment",
        )

    open_order_counts = {
        warehouse_id: count
        for warehouse_id, count in (
            await db.execute(
                select(Order.warehouse_id, func.count(Order.id))
                .where(
                    Order.warehouse_id.is_not(None),
                    Order.status.not_in(TERMINAL_ORDER_STATUSES),
                )
                .group_by(Order.warehouse_id)
            )
        ).all()
        if warehouse_id is not None
    }
    operational_user_counts = {
        warehouse_id: count
        for warehouse_id, count in (
            await db.execute(
                select(User.warehouse_id, func.count(User.id))
                .join(Role, Role.id == User.role_id)
                .where(
                    User.warehouse_id.is_not(None),
                    User.is_active.is_(True),
                    Role.name.in_(AUTO_ASSIGN_READY_ROLES),
                )
                .group_by(User.warehouse_id)
            )
        ).all()
        if warehouse_id is not None
    }
    labour_counts = {
        warehouse_id: count
        for warehouse_id, count in (
            await db.execute(
                select(Labourer.warehouse_id, func.count(Labourer.id))
                .group_by(Labourer.warehouse_id)
            )
        ).all()
        if warehouse_id is not None
    }

    def is_operationally_ready(candidate: Warehouse) -> bool:
        return any((
            open_order_counts.get(candidate.id, 0) > 0,
            operational_user_counts.get(candidate.id, 0) > 0,
            labour_counts.get(candidate.id, 0) > 0,
        ))

    candidate_warehouses = [
        warehouse for warehouse in active_warehouses if is_operationally_ready(warehouse)
    ] or active_warehouses

    return min(
        candidate_warehouses,
        key=lambda item: (open_order_counts.get(item.id, 0), item.created_at),
    )


async def get_order_assignment_preview(
    db: AsyncSession,
    warehouse_id: UUID | None = None,
) -> dict:
    if warehouse_id:
        warehouse = await _get_active_warehouse(db, warehouse_id)
        return {
            "warehouse_id": warehouse.id,
            "warehouse_name": warehouse.name,
            "warehouse_address": warehouse.address,
            "assignment_type": "selected",
            "message": f"This order will go to {warehouse.name} because you selected it.",
        }

    warehouse = await _select_auto_assignment_warehouse(db)
    return {
        "warehouse_id": warehouse.id,
        "warehouse_name": warehouse.name,
        "warehouse_address": warehouse.address,
        "assignment_type": "auto",
        "message": f"If you book now, the order will auto-assign to {warehouse.name} based on current hub readiness and open load.",
    }


def _validate_transition(current_status: str, next_status: str) -> None:
    if next_status not in ALLOWED_TRANSITIONS.get(current_status, set()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invalid transition from {current_status} to {next_status}",
        )


def _to_order_response(
    order: Order,
    *,
    driver_name: str | None = None,
    vehicle_code: str | None = None,
    customer_name: str | None = None,
    customer_phone: str | None = None,
    cancellation_fee: float = 0.0,
    wallet_refund_amount: float = 0.0,
) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        tracking_code=order.tracking_code,
        order_type=order.order_type,
        status=order.status,
        warehouse_substatus=order.warehouse_substatus,
        picking_started_at=order.picking_started_at,
        picking_completed_at=order.picking_completed_at,
        packing_started_at=order.packing_started_at,
        packing_completed_at=order.packing_completed_at,
        customer_id=order.customer_id,
        warehouse_id=order.warehouse_id,
        assigned_driver_id=order.assigned_driver_id,
        assigned_vehicle_id=order.assigned_vehicle_id,
        assigned_driver_name=driver_name,
        assigned_vehicle_code=vehicle_code,
        pickup_addr=order.pickup_addr,
        delivery_addr=order.delivery_addr,
        cargo_type=order.cargo_type,
        vehicle_type=order.vehicle_type,
        labor_count=order.labor_count,
        base_amount=order.base_amount,
        vehicle_amount=order.vehicle_amount,
        labor_amount=order.labor_amount,
        materials_amount=order.materials_amount,
        packing_amount=order.packing_amount,
        platform_fee=order.platform_fee,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount,
        payment_mode=order.payment_mode,
        payment_status=order.payment_status,
        paid_amount=order.paid_amount,
        declared_value=order.declared_value,
        service_otp=order.service_otp,
        service_otp_sent_at=order.service_otp_sent_at,
        service_otp_verified_at=order.service_otp_verified_at,
        service_time_block=order.service_time_block,
        scheduled_at=order.scheduled_at,
        cancel_reason=order.cancel_reason,
        cancellation_fee=cancellation_fee,
        wallet_refund_amount=wallet_refund_amount,
        delivered_at=order.delivered_at,
        delivery_notes=order.delivery_notes,
        pod_photos=order.pod_photos or [],
        pod_signature=order.pod_signature,
        poc_signature=order.poc_signature,
        job_rating=order.job_rating,
        job_feedback=order.job_feedback,
        customer_name=customer_name,
        customer_phone=customer_phone,
        created_at=order.created_at,
        items=[OrderItemResponse.model_validate(item) for item in order.items],
    )


def _cancellation_terms(order: Order) -> tuple[float, str]:
    if order.status in {"DRAFT", "CONFIRMED"}:
        return 0.0, "Cancelled before dispatch - No fee"
    if order.status == "ASSIGNED":
        fee = round(float(order.total_amount or 0.0) * 0.05, 2)
        return fee, "Cancelled after driver assigned - 5% fee"
    if order.status == "IN_TRANSIT":
        fee = round(float(order.total_amount or 0.0) * 0.25, 2)
        return fee, "Cancelled mid-transit - 25% fee"
    return 0.0, "Cancelled"


async def _resolve_names(
    db: AsyncSession, orders: list[Order]
) -> tuple[dict, dict, dict, dict]:
    """Batch-resolve driver names, vehicle codes, and customer contacts for a list of orders."""
    driver_ids = {o.assigned_driver_id for o in orders if o.assigned_driver_id}
    vehicle_ids = {o.assigned_vehicle_id for o in orders if o.assigned_vehicle_id}
    customer_ids = {o.customer_id for o in orders if o.customer_id}

    driver_names: dict = {}
    if driver_ids:
        rows = (await db.execute(select(User.id, User.name).where(User.id.in_(driver_ids)))).all()
        driver_names = {row.id: row.name for row in rows}

    vehicle_codes: dict = {}
    if vehicle_ids:
        rows = (
            await db.execute(
                select(LogisticsVehicle.id, LogisticsVehicle.code, LogisticsVehicle.license_plate)
                .where(LogisticsVehicle.id.in_(vehicle_ids))
            )
        ).all()
        vehicle_codes = {row.id: f"{row.code} · {row.license_plate}" if row.license_plate else row.code for row in rows}

    customer_names: dict = {}
    customer_phones: dict = {}
    if customer_ids:
        rows = (await db.execute(select(User.id, User.name, User.phone).where(User.id.in_(customer_ids)))).all()
        customer_names = {row.id: row.name for row in rows}
        customer_phones = {row.id: row.phone for row in rows}

    return driver_names, vehicle_codes, customer_names, customer_phones


async def create_order(db: AsyncSession, data: OrderCreate, user: User) -> OrderResponse:
    order_type = data.order_type.upper()
    if order_type not in ORDER_TYPES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid order_type")

    warehouse_id = await _resolve_warehouse_id(db, data.warehouse_id)

    order = Order(
        tracking_code=_tracking_code(),
        order_type=order_type,
        status="DRAFT",
        customer_id=user.id,
        warehouse_id=warehouse_id,
        pickup_addr=data.pickup_addr,
        delivery_addr=data.delivery_addr,
        cargo_type=data.cargo_type,
        vehicle_type=data.vehicle_type,
        labor_count=data.labor_count,
        base_amount=data.base_amount,
        vehicle_amount=data.vehicle_amount,
        labor_amount=data.labor_amount,
        materials_amount=data.materials_amount,
        packing_amount=data.packing_amount,
        platform_fee=data.platform_fee,
        tax_amount=data.tax_amount,
        total_amount=data.total_amount,
        payment_mode=data.payment_mode,
        payment_status=data.payment_status,
        declared_value=data.declared_value,
        service_otp=data.service_otp,
        service_time_block=data.service_time_block,
        scheduled_at=data.scheduled_at,
    )
    db.add(order)
    await db.flush()

    initial_payment_amount = min(float(data.initial_payment_amount or 0.0), float(order.total_amount or 0.0))
    if initial_payment_amount > 0:
        from app.services import finance_service

        await finance_service.record_order_payment(
            db=db,
            order_id=order.id,
            amount=initial_payment_amount,
            payment_mode=data.initial_payment_mode or "ONLINE",
            payment_method=data.initial_payment_method,
            payment_ref=data.initial_payment_ref,
            notes="Initial payment captured during order booking",
        )

    await db.refresh(order, attribute_names=["items"])
    return _to_order_response(order)


async def list_orders(
    db: AsyncSession,
    user: User,
    page: int,
    page_size: int,
    status_filter: str | None = None,
) -> OrderListResponse:
    filters = []
    user_role = user.role.name

    if user_role in {"INDIVIDUAL", "VENDOR"}:
        filters.append(Order.customer_id == user.id)
    elif user_role in {"WAREHOUSE_MANAGER", "LABOURER"}:
        if not user.warehouse_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is not assigned to a warehouse",
            )
        filters.append(Order.warehouse_id == user.warehouse_id)
    elif user_role == "DISPATCHER" and user.warehouse_id:
        # Dispatcher sees only orders from their assigned hub
        filters.append(Order.warehouse_id == user.warehouse_id)
    elif user_role == "DRIVER":
        filters.append(Order.assigned_driver_id == user.id)
        if not status_filter:
            filters.append(~Order.status.in_(["DELIVERED", "COMPLETED", "CANCELLED", "CLOSED"]))

    if status_filter:
        upper_status = status_filter.upper()
        if upper_status in ORDER_STATUSES:
            filters.append(Order.status == upper_status)

    total_query = select(func.count(Order.id))
    data_query = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    if filters:
        total_query = total_query.where(*filters)
        data_query = data_query.where(*filters)

    total = (await db.execute(total_query)).scalar_one()
    rows = (await db.execute(data_query)).scalars().all()

    driver_names, vehicle_codes, customer_names, customer_phones = await _resolve_names(db, list(rows))

    return OrderListResponse(
        items=[
            _to_order_response(
                order,
                driver_name=driver_names.get(order.assigned_driver_id),
                vehicle_code=vehicle_codes.get(order.assigned_vehicle_id),
                customer_name=customer_names.get(order.customer_id),
                customer_phone=customer_phones.get(order.customer_id),
            )
            for order in rows
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


async def get_order_detail(db: AsyncSession, order_id: UUID, user: User) -> OrderResponse:
    order = await _get_order(db, order_id)
    if user.role.name in {"INDIVIDUAL", "VENDOR"} and order.customer_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    dn, vc, cn, cp = await _resolve_names(db, [order])
    return _to_order_response(
        order,
        driver_name=dn.get(order.assigned_driver_id),
        vehicle_code=vc.get(order.assigned_vehicle_id),
        customer_name=cn.get(order.customer_id),
        customer_phone=cp.get(order.customer_id),
    )


async def update_order(db: AsyncSession, order_id: UUID, user: User, data: OrderUpdate) -> OrderResponse:
    order = await _get_order(db, order_id)
    if order.status not in {"DRAFT", "CONFIRMED"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order cannot be edited in current status",
        )

    if user.role.name in {"INDIVIDUAL", "VENDOR"} and order.customer_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(order, key, value)
    db.add(order)
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    return _to_order_response(order)


async def confirm_order(db: AsyncSession, order_id: UUID, user: User) -> OrderResponse:
    order = await _get_order(db, order_id)

    # WAREHOUSE_MANAGER can only confirm orders assigned to their warehouse
    if user.role.name == "WAREHOUSE_MANAGER":
        if not user.warehouse_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is not assigned to a warehouse",
            )
        if order.warehouse_id != user.warehouse_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only confirm orders assigned to your warehouse",
            )

    _validate_transition(order.status, "CONFIRMED")

    # Check inventory availability for all order items (cargo + packing materials)
    # PKG-* items are only validated if the warehouse has set up those inventory records.
    if order.items and order.warehouse_id:
        insufficient: list[str] = []
        items_to_deduct: list[tuple[InventoryItem, int]] = []

        for item in order.items:
            inv = (
                await db.execute(
                    select(InventoryItem).where(
                        InventoryItem.warehouse_id == order.warehouse_id,
                        InventoryItem.sku == item.sku,
                    )
                )
            ).scalar_one_or_none()

            # If no inventory record exists for this SKU, skip (untracked item)
            if inv is None:
                continue

            available = inv.quantity_on_hand
            if available < item.quantity:
                # User-friendly name: strip PKG- prefix for packing material SKUs
                display = item.sku.replace("PKG-", "").replace("-", " ").title() if item.sku.startswith("PKG-") else item.sku
                insufficient.append(
                    f"{display} (need {item.quantity}, have {available})"
                )
            else:
                items_to_deduct.append((inv, item.quantity))

        if insufficient:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Insufficient stock for: " + ", ".join(insufficient),
            )

        # Deduct inventory and record OUTBOUND movements for each item
        for inv_item, qty in items_to_deduct:
            inv_item.quantity_on_hand -= qty
            db.add(inv_item)
            db.add(
                InventoryMovement(
                    item_id=inv_item.id,
                    movement_type="OUTBOUND",
                    quantity=qty,
                    reference_order_id=order.id,
                    performed_by=user.id,
                )
            )


    # Guard: for ONLINE payment orders, payment must be completed before confirming
    if order.payment_mode and order.payment_mode.upper() == "ONLINE" and order.payment_status != "paid":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Online payment must be completed before confirming the order",
        )

    order.status = "CONFIRMED"
    # Set initial warehouse substatus so order appears in warehouse picking queue
    order.warehouse_substatus = "AWAITING_PICK"
    db.add(order)
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    return _to_order_response(order)



async def assign_order(db: AsyncSession, order_id: UUID, data: OrderAssignRequest) -> OrderResponse:
    order = await _get_order(db, order_id)
    _validate_transition(order.status, "ASSIGNED")
    order.assigned_driver_id = data.driver_id
    order.assigned_vehicle_id = data.vehicle_id
    order.status = "ASSIGNED"
    
    # Update driver profile current_job
    if data.driver_id:
        profile = (await db.execute(select(LogisticsDriverProfile).where(LogisticsDriverProfile.user_id == data.driver_id))).scalar_one_or_none()
        if profile:
            profile.current_job = order.tracking_code
            db.add(profile)

    # Mark vehicle as In Use
    if data.vehicle_id:
        vehicle = (await db.execute(select(LogisticsVehicle).where(LogisticsVehicle.id == data.vehicle_id))).scalar_one_or_none()
        if vehicle:
            vehicle.status = "In Use"
    # Auto-assign available labourers up to labor_count
    if order.labor_count and order.labor_count > 0:
        available = (await db.execute(
            select(Labourer)
            .where(Labourer.assigned_order_id.is_(None), Labourer.is_active == True)
            .limit(order.labor_count)
        )).scalars().all()
        for labourer in available:
            labourer.assigned_order_id = order.id
    db.add(order)
    # Auto-record labour and driver shift expenses
    from app.services import finance_service as _fs
    if order.labor_count and order.labor_count > 0:
        await _fs.record_expense(
            db,
            expense_type="EXPENSE_LABOUR",
            amount=order.labor_count * _fs.LABOUR_RATE_PER_HEAD,
            description=f"Labour ({order.labor_count} helpers) for {order.tracking_code}",
            warehouse_id=order.warehouse_id,
            order_id=order.id,
            tracking_code=order.tracking_code,
        )
    await _fs.record_expense(
        db,
        expense_type="EXPENSE_DRIVER",
        amount=_fs.DRIVER_SHIFT_RATE,
        description=f"Driver shift fee for {order.tracking_code}",
        warehouse_id=order.warehouse_id,
        order_id=order.id,
        tracking_code=order.tracking_code,
    )
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    dn, vc, cn, cp = await _resolve_names(db, [order])
    return _to_order_response(
        order,
        driver_name=dn.get(order.assigned_driver_id),
        vehicle_code=vc.get(order.assigned_vehicle_id),
        customer_name=cn.get(order.customer_id),
        customer_phone=cp.get(order.customer_id),
    )


async def _release_order_resources(db: AsyncSession, order: Order) -> None:
    """Release vehicle, driver, and labourers when an order is completed or cancelled."""
    # Release vehicle
    if order.assigned_vehicle_id:
        vehicle = (await db.execute(select(LogisticsVehicle).where(LogisticsVehicle.id == order.assigned_vehicle_id))).scalar_one_or_none()
        if vehicle and vehicle.status == "In Use":
            vehicle.status = "Active"

    # Release labourers assigned to this order
    labourers = (await db.execute(
        select(Labourer).where(Labourer.assigned_order_id == order.id)
    )).scalars().all()
    for labourer in labourers:
        labourer.assigned_order_id = None

    # Update driver profile current_job to None
    if order.assigned_driver_id:
        profile = (await db.execute(select(LogisticsDriverProfile).where(LogisticsDriverProfile.user_id == order.assigned_driver_id))).scalar_one_or_none()
        if profile and profile.current_job == order.tracking_code:
            profile.current_job = None
            db.add(profile)


async def transition_order(
    db: AsyncSession, order_id: UUID, next_status: str, caller: "User | None" = None
) -> OrderResponse:
    order = await _get_order(db, order_id)
    _validate_transition(order.status, next_status)

    # --- Loophole guard #1: IN_TRANSIT requires a driver to be assigned ---
    if next_status == "IN_TRANSIT":
        if not order.assigned_driver_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A driver must be assigned to this order before it can go IN_TRANSIT",
            )

    # --- Loophole guard #2: DRIVER role can only act on their own assigned order ---
    if caller is not None and caller.role.name == "DRIVER":
        if order.assigned_driver_id != caller.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the assigned driver for this order",
            )
        # Drivers may only trigger the IN_TRANSIT transition (not skip steps)
        if next_status not in {"IN_TRANSIT", "DELIVERED"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Drivers cannot trigger the {next_status} transition",
            )

    order.status = next_status

    # Ensure vehicle is marked In Use when order goes to IN_TRANSIT
    if next_status == "IN_TRANSIT" and order.assigned_vehicle_id:
        vehicle = (await db.execute(select(LogisticsVehicle).where(LogisticsVehicle.id == order.assigned_vehicle_id))).scalar_one_or_none()
        if vehicle and vehicle.status != "In Use":
            vehicle.status = "In Use"
        # Record fuel expense (estimate based on vehicle type, 30km default)
        from app.services import finance_service as _fs
        vtype_key = (order.vehicle_type or "tempo").lower().replace(" ", "").replace("-", "")
        rate = _fs.FUEL_RATE_PER_KM.get(vtype_key, 10)
        est_km = 30
        await _fs.record_expense(
            db,
            expense_type="EXPENSE_FUEL",
            amount=rate * est_km,
            description=f"Fuel estimate ({est_km}km @ INR {rate}/km) for {order.tracking_code}",
            warehouse_id=order.warehouse_id,
            order_id=order.id,
            tracking_code=order.tracking_code,
        )

    # Release all resources when order is delivered, closed, or cancelled
    if next_status in ("DELIVERED", "CLOSED"):
        await _release_order_resources(db, order)
    
    # For COD orders: auto-record the payment on DELIVERED
    if next_status == "DELIVERED" and (order.payment_mode or "").upper() in {"COD", "CASH ON DELIVERY"}:
        if order.payment_status != "paid":
            from app.services import finance_service as _fs2
            await _fs2.record_order_payment(
                db=db,
                order_id=order.id,
                amount=order.total_amount - (order.paid_amount or 0.0),
                payment_mode="COD",
                payment_method="Cash on Delivery",
                payment_ref=None,
                collected_by_user=caller,
            )

    db.add(order)
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    dn, vc, cn, cp = await _resolve_names(db, [order])
    return _to_order_response(
        order,
        driver_name=dn.get(order.assigned_driver_id),
        vehicle_code=vc.get(order.assigned_vehicle_id),
        customer_name=cn.get(order.customer_id),
        customer_phone=cp.get(order.customer_id),
    )


async def _get_customer_for_order(db: AsyncSession, order: Order) -> User:
    customer = (await db.execute(select(User).where(User.id == order.customer_id))).scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found for order")
    return customer


def _ensure_driver_access(order: Order, user: User) -> None:
    if order.assigned_driver_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This order is not assigned to the current driver",
        )


async def send_delivery_otp(
    db: AsyncSession,
    order_id: UUID,
    user: User,
    *,
    force_resend: bool = False,
) -> DeliveryOtpSendResponse:
    order = await _get_order(db, order_id)
    _ensure_driver_access(order, user)

    if order.status not in {"ASSIGNED", "IN_TRANSIT"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Delivery OTP can only be sent for an active assigned delivery",
        )

    customer = await _get_customer_for_order(db, order)
    if not customer.email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer email is unavailable")

    recently_sent = (
        order.service_otp
        and order.service_otp_sent_at
        and not force_resend
        and (_now() - order.service_otp_sent_at).total_seconds() < 60
    )
    if recently_sent:
        return DeliveryOtpSendResponse(
            message="OTP already sent recently",
            email=_mask_email(customer.email),
            sent_at=order.service_otp_sent_at,
        )

    otp = _generate_delivery_otp()
    sent_at = _now()
    order.service_otp = otp
    order.service_otp_sent_at = sent_at
    order.service_otp_verified_at = None
    db.add(order)
    await db.flush()

    sent = await send_email(
        to=customer.email,
        subject=f"Cargo Core delivery OTP for {order.tracking_code}",
        html_body=delivery_otp_email_html(
            otp=otp,
            customer_name=customer.name or "Customer",
            tracking_code=order.tracking_code,
            delivery_address=order.delivery_addr,
        ),
    )
    if not sent:
        settings = get_settings()
        if settings.is_production:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Delivery OTP email could not be sent. Check SMTP configuration.",
            )

        # Local/dev fallback: keep OTP generation successful even without SMTP.
        return DeliveryOtpSendResponse(
            message="Delivery OTP generated (email unavailable in development)",
            email=_mask_email(customer.email),
            sent_at=sent_at,
            debug_otp=otp,
        )

    return DeliveryOtpSendResponse(
        message="Delivery OTP sent successfully",
        email=_mask_email(customer.email),
        sent_at=sent_at,
    )


async def cancel_order(
    db: AsyncSession,
    order_id: UUID,
    data: CancelOrderRequest,
    user: User,
) -> OrderResponse:
    order = await _get_order(db, order_id)
    if user.role.name in {"INDIVIDUAL", "VENDOR"} and order.customer_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    _validate_transition(order.status, "CANCELLED")
    cancellation_fee, cancellation_note = _cancellation_terms(order)
    wallet_refund_amount = 0.0

    # Determine the effective paid amount.
    # paid_amount is only set when a payment is explicitly recorded via /pay or /wallet-pay.
    # If the order was created with payment_status='paid' (e.g. Razorpay/online flow where
    # the frontend marks it paid but never calls the /pay endpoint), paid_amount stays 0.
    # In that case we treat total_amount as the effective paid amount for refund purposes.
    effective_paid = float(order.paid_amount or 0.0)
    if effective_paid <= 0 and order.payment_status in {"paid", "partial"}:
        # Infer from total_amount — the order was paid but paid_amount wasn't recorded
        effective_paid = float(order.total_amount or 0.0)
    elif effective_paid <= 0 and (order.payment_mode or "").strip().lower() == "partial":
        # Legacy booking flow: partial payments were captured in the UI but the backend order
        # stayed at payment_status='pending' with payment_mode='Partial'. Refund the expected 50%.
        effective_paid = round(float(order.total_amount or 0.0) / 2, 2)

    if effective_paid > 0:
        from app.services import wallet_service

        wallet_refund_amount = await wallet_service.credit_cancellation_refund(
            db,
            order=order,
            refund_amount=max(effective_paid - cancellation_fee, 0.0),
            fee_amount=cancellation_fee,
        )


    # Release all assigned resources
    await _release_order_resources(db, order)
    order.status = "CANCELLED"
    order.cancel_reason = f"{data.reason} ({cancellation_note})"
    # Clear driver and vehicle assignment on the order since it's cancelled
    order.assigned_driver_id = None
    order.assigned_vehicle_id = None
    db.add(order)
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    dn, vc, cn, cp = await _resolve_names(db, [order])
    return _to_order_response(
        order,
        driver_name=dn.get(order.assigned_driver_id),
        vehicle_code=vc.get(order.assigned_vehicle_id),
        customer_name=cn.get(order.customer_id),
        customer_phone=cp.get(order.customer_id),
        cancellation_fee=cancellation_fee,
        wallet_refund_amount=wallet_refund_amount,
    )


async def track_order(db: AsyncSession, tracking_code: str) -> dict:
    result = await db.execute(select(Order).where(Order.tracking_code == tracking_code))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracking code not found")

    return {
        "tracking_code": order.tracking_code,
        "status": order.status,
        "pickup_addr": order.pickup_addr,
        "delivery_addr": order.delivery_addr,
        "scheduled_at": order.scheduled_at,
    }


async def get_order_items(db: AsyncSession, order_id: UUID) -> list[OrderItemResponse]:
    order = await _get_order(db, order_id)
    return [OrderItemResponse.model_validate(item) for item in order.items]


async def upsert_order_items(
    db: AsyncSession,
    order_id: UUID,
    items: list[OrderItemUpsert],
) -> list[OrderItemResponse]:
    order = await _get_order(db, order_id)

    existing_by_sku = {item.sku: item for item in order.items}
    for item_data in items:
        existing = existing_by_sku.get(item_data.sku)
        if existing:
            existing.quantity = item_data.quantity
            existing.box_count = item_data.box_count
            existing.estimated_volume = item_data.estimated_volume
            db.add(existing)
            continue

        db.add(
            OrderItem(
                order_id=order.id,
                sku=item_data.sku,
                quantity=item_data.quantity,
                box_count=item_data.box_count,
                estimated_volume=item_data.estimated_volume,
            )
        )

    await db.flush()
    refreshed = await _get_order(db, order_id)
    return [OrderItemResponse.model_validate(item) for item in refreshed.items]


# ---------------------------------------------------------------------------
# Route Optimization
# ---------------------------------------------------------------------------

_ROUTE_COLORS = [
    "#1CE783",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
]

_HUB_LAT = 12.9716
_HUB_LNG = 77.5946


def _euclidean_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Rough Euclidean distance in km using 1 deg ≈ 111 km."""
    dlat = (lat2 - lat1) * 111.0
    dlng = (lng2 - lng1) * 111.0 * math.cos(math.radians((lat1 + lat2) / 2))
    return math.sqrt(dlat ** 2 + dlng ** 2)


async def optimize_routes(db: AsyncSession) -> list[dict]:
    """Assign CONFIRMED orders to active drivers using a nearest-neighbour heuristic."""

    # 1. Fetch CONFIRMED orders
    orders: list[Order] = (
        await db.execute(select(Order).where(Order.status == "CONFIRMED"))
    ).scalars().all()

    # 2. Fetch active drivers (LogisticsDriverProfile joined with User)
    rows = (
        await db.execute(
            select(LogisticsDriverProfile, User)
            .join(User, User.id == LogisticsDriverProfile.user_id)
            .where(User.is_active.is_(True))
        )
    ).all()
    drivers = [(profile, user) for profile, user in rows]

    if not drivers:
        return []

    # 3. Geocode orders that lack coordinates
    for order in orders:
        if order.delivery_lat is None or order.delivery_lng is None:
            if order.delivery_addr:
                try:
                    results = await geocoding_service.search_address(order.delivery_addr, limit=1)
                    if results:
                        order.delivery_lat = results[0]["lat"]
                        order.delivery_lng = results[0]["lon"]
                        db.add(order)
                except Exception:
                    pass

    await db.flush()

    # 4. Keep only orders that now have valid coordinates
    geo_orders = [o for o in orders if o.delivery_lat is not None and o.delivery_lng is not None]

    if not geo_orders:
        return []

    # 5. Sort orders by distance from hub (nearest first)
    geo_orders.sort(
        key=lambda o: _euclidean_km(_HUB_LAT, _HUB_LNG, o.delivery_lat, o.delivery_lng)
    )

    # 6. Round-robin assignment across drivers
    driver_stops: dict[int, list[Order]] = {i: [] for i in range(len(drivers))}
    for idx, order in enumerate(geo_orders):
        driver_stops[idx % len(drivers)].append(order)

    # 7. Build route dicts
    routes = []
    for driver_idx, (profile, user) in enumerate(drivers):
        stops = driver_stops[driver_idx]
        if not stops:
            continue

        # Total distance: hub → stop1 → stop2 → … → hub
        coords = [(s.delivery_lat, s.delivery_lng) for s in stops]
        total_dist = _euclidean_km(_HUB_LAT, _HUB_LNG, coords[0][0], coords[0][1])
        for i in range(len(coords) - 1):
            total_dist += _euclidean_km(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1])
        total_dist += _euclidean_km(coords[-1][0], coords[-1][1], _HUB_LAT, _HUB_LNG)

        routes.append(
            {
                "driver_id": str(user.id),
                "driver_name": user.name,
                "color": _ROUTE_COLORS[driver_idx % len(_ROUTE_COLORS)],
                "stops": [
                    {
                        "order_id": str(s.id),
                        "address": s.delivery_addr,
                        "lat": s.delivery_lat,
                        "lng": s.delivery_lng,
                        "tracking_code": s.tracking_code,
                    }
                    for s in stops
                ],
                "total_distance_km": round(total_dist, 2),
                "efficiency": random.randint(85, 98),
            }
        )

    return routes


async def upload_proof_of_delivery(
    db: AsyncSession,
    order_id: UUID,
    user: User,
    *,
    otp_code: str | None,
    image_data: str | None,
    images_data: list[str] | None,
    signature_data: str | None,
    customer_name: str | None = None,
    notes: str | None = None,
) -> OrderResponse:
    order = await _get_order(db, order_id)
    _ensure_driver_access(order, user)
    _validate_transition(order.status, "DELIVERED")

    normalized_images = []
    if image_data:
        normalized_images.append(_normalize_data_url(image_data, "image/jpeg"))
    if images_data:
        normalized_images.extend(
            normalized
            for normalized in (_normalize_data_url(item, "image/jpeg") for item in images_data)
            if normalized
        )
    if not normalized_images:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one POD image is required",
        )

    if not signature_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Customer signature is required",
        )

    if not order.service_otp:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Delivery OTP has not been generated yet",
        )
    if not otp_code or str(otp_code).strip() != str(order.service_otp).strip():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invalid delivery OTP",
        )

    delivered_at = _now()
    order.status = "DELIVERED"
    order.delivered_at = delivered_at
    order.service_otp_verified_at = delivered_at
    order.delivery_notes = notes
    order.pod_photos = normalized_images
    order.pod_signature = _normalize_data_url(signature_data, "image/png")
    if customer_name:
        order.delivery_notes = f"{notes or ''}\nDelivered to: {customer_name}".strip()

    await _release_order_resources(db, order)
    db.add(order)
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    dn, vc, cn, cp = await _resolve_names(db, [order])
    return _to_order_response(
        order,
        driver_name=dn.get(order.assigned_driver_id),
        vehicle_code=vc.get(order.assigned_vehicle_id),
        customer_name=cn.get(order.customer_id),
        customer_phone=cp.get(order.customer_id),
    )


async def house_shift_signoff(
    db: AsyncSession,
    order_id: UUID,
    user: User,
    *,
    signature_data: str | None,
    customer_name: str | None = None,
    notes: str | None = None,
):
    """Record customer sign-off for a house-shift job (no OTP required)."""
    order = await _get_order(db, order_id)
    _ensure_driver_access(order, user)
    _validate_transition(order.status, "DELIVERED")

    if not signature_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Customer signature is required for house-shift sign-off",
        )

    delivered_at = _now()
    order.status = "DELIVERED"
    order.delivered_at = delivered_at
    order.poc_signature = _normalize_data_url(signature_data, "image/png")
    if customer_name:
        order.delivery_notes = f"{notes or ''}\nSigned off by: {customer_name}".strip()
    elif notes:
        order.delivery_notes = notes

    await _release_order_resources(db, order)
    db.add(order)
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    dn, vc, cn, cp = await _resolve_names(db, [order])
    return _to_order_response(
        order,
        driver_name=dn.get(order.assigned_driver_id),
        vehicle_code=vc.get(order.assigned_vehicle_id),
        customer_name=cn.get(order.customer_id),
        customer_phone=cp.get(order.customer_id),
    )


async def submit_job_rating(
    db: AsyncSession,
    order_id: UUID,
    user: User,
    *,
    rating: int,
    feedback: str | None = None,
):
    """Store driver self-rating (1–5) and optional feedback note for a completed job."""
    order = await _get_order(db, order_id)
    _ensure_driver_access(order, user)

    if not 1 <= rating <= 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Rating must be between 1 and 5",
        )

    order.job_rating = rating
    order.job_feedback = feedback or None
    db.add(order)
    await db.flush()
    await db.refresh(order, attribute_names=["items"])
    dn, vc, cn, cp = await _resolve_names(db, [order])
    return _to_order_response(
        order,
        driver_name=dn.get(order.assigned_driver_id),
        vehicle_code=vc.get(order.assigned_vehicle_id),
        customer_name=cn.get(order.customer_id),
        customer_phone=cp.get(order.customer_id),
    )

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import InventoryItem
from app.models.logistics import (
    LogisticsAlert,
    LogisticsChatMessage,
    LogisticsChatThread,
    LogisticsDailyStats,
    LogisticsDriverProfile,
    LogisticsEscalation,
    LogisticsNotification,
    LogisticsReturnCase,
    LogisticsTask,
    LogisticsTransaction,
    LogisticsVehicle,
    LogisticsZone,
)
from app.models.order import Order
from app.models.user import Role, User
from app.models.warehouse import Warehouse
from app.schemas.auth import MessageResponse
from app.schemas.logistics import (
    LogisticsAiQueryResponse,
    LogisticsAlertItem,
    LogisticsBootstrapResponse,
    LogisticsChatMessageCreate,
    LogisticsChatMessageItem,
    LogisticsChatThreadItem,
    LogisticsDashboardStats,
    LogisticsDriverItem,
    LogisticsEscalationItem,
    LogisticsHubItem,
    LogisticsMaintenanceItem,
    LogisticsNotificationItem,
    LogisticsNotificationUpdate,
    LogisticsReportItem,
    LogisticsReturnCaseItem,
    LogisticsReturnCaseUpdate,
    LogisticsTaskItem,
    LogisticsTaskUpdate,
    LogisticsTransactionCreate,
    LogisticsTransactionItem,
    LogisticsUserItem,
    LogisticsVehicleCreate,
    LogisticsVehicleItem,
    LogisticsVehicleUpdate,
    LogisticsZoneCreate,
    LogisticsZoneItem,
    LogisticsZoneUpdate,
)
from app.utils.hashing import hash_password
from app.utils.username import generate_unique_username


def _now() -> datetime:
    return datetime.now(UTC)


def _fmt_relative(dt: datetime | None) -> str:
    if not dt:
        return "Never"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    delta = _now() - dt.astimezone(UTC)
    minutes = int(delta.total_seconds() // 60)
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    return f"{hours // 24}d ago"


def _status_badge_class(status: str) -> str:
    normalized = status.lower()
    if "shop" in normalized or "overdue" in normalized:
        return "bg-red-500/10 text-red-500"
    if "scheduled" in normalized or "pending" in normalized:
        return "bg-yellow-500/10 text-yellow-500"
    return "bg-green-500/10 text-green-500"


def _title_case_status(value: str | None) -> str:
    if not value:
        return "Unknown"
    return value.replace("_", " ").title()


async def _get_role(db: AsyncSession, name: str) -> Role:
    role = (await db.execute(select(Role).where(Role.name == name))).scalar_one_or_none()
    if not role:
        raise RuntimeError(f"Required role missing: {name}")
    return role


async def _get_or_create_user(
    db: AsyncSession,
    *,
    role_name: str,
    email: str,
    name: str,
    username: str | None = None,
    warehouse_id: UUID | None = None,
    phone: str | None = None,
) -> User:
    existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    role = await _get_role(db, role_name)
    if existing:
        existing.name = name
        if not existing.username:
            existing.username = await generate_unique_username(db, username or email.split("@")[0], exclude_user_id=existing.id)
        existing.role_id = role.id
        existing.warehouse_id = warehouse_id
        existing.phone = phone
        existing.is_active = True
        db.add(existing)
        await db.flush()
        return existing

    user = User(
        name=name,
        username=await generate_unique_username(db, username or email.split("@")[0]),
        email=email,
        phone=phone,
        address="",
        password_hash=hash_password("12345678"),
        role_id=role.id,
        warehouse_id=warehouse_id,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    return user


async def _get_vehicle(db: AsyncSession, vehicle_id: UUID) -> LogisticsVehicle:
    vehicle = (await db.execute(select(LogisticsVehicle).where(LogisticsVehicle.id == vehicle_id))).scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle


async def _get_zone(db: AsyncSession, zone_id: UUID) -> LogisticsZone:
    zone = (await db.execute(select(LogisticsZone).where(LogisticsZone.id == zone_id))).scalar_one_or_none()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    return zone


async def _get_return_case(db: AsyncSession, case_id: UUID) -> LogisticsReturnCase:
    case = (await db.execute(select(LogisticsReturnCase).where(LogisticsReturnCase.id == case_id))).scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return case not found")
    return case


async def _get_chat_thread(db: AsyncSession, thread_id: UUID) -> LogisticsChatThread:
    thread = (await db.execute(select(LogisticsChatThread).where(LogisticsChatThread.id == thread_id))).scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat thread not found")
    return thread


async def ensure_logistics_seed_data(db: AsyncSession, manager_user: User) -> None:
    warehouse_count = (await db.execute(select(func.count(Warehouse.id)))).scalar_one()
    if warehouse_count:
        return

    north = Warehouse(name="North-East Hub", address="12 Hudson Logistics Park, New York, NY", lat=40.7128, lng=-74.0060, capacity_limit=1500, is_active=True)
    south = Warehouse(name="South Hub", address="88 Austin Freight Avenue, Austin, TX", lat=30.2672, lng=-97.7431, capacity_limit=2000, is_active=True)
    west = Warehouse(name="West DC-04", address="44 Harbor Cargo Road, Los Angeles, CA", lat=34.0522, lng=-118.2437, capacity_limit=1200, is_active=True)
    db.add_all([north, south, west])
    await db.flush()

    wm_north = await _get_or_create_user(db, role_name="WAREHOUSE_MANAGER", email="ellen.r@cargocore.com", username="ellen_r", name="Ellen Ripley", warehouse_id=north.id, phone="+1 (555) 555-0101")
    wm_south = await _get_or_create_user(db, role_name="WAREHOUSE_MANAGER", email="sarah.c@cargocore.com", username="sarah_c", name="Sarah Connor", warehouse_id=south.id, phone="+1 (555) 123-4567")
    await _get_or_create_user(db, role_name="DISPATCHER", email="john.w@cargocore.com", username="john_w", name="John Wick", warehouse_id=north.id, phone="+1 (555) 987-6543")
    driver_one = await _get_or_create_user(db, role_name="DRIVER", email="david.m@cargocore.com", username="david_m", name="David Miller", warehouse_id=north.id, phone="+1 (555) 123-4567")
    driver_two = await _get_or_create_user(db, role_name="DRIVER", email="sarah.j@cargocore.com", username="sarah_j", name="Sarah Jenkins", warehouse_id=south.id, phone="+1 (555) 987-6543")

    north.manager_id = wm_north.id
    south.manager_id = wm_south.id
    west.manager_id = manager_user.id
    db.add_all([north, south, west])
    await db.flush()

    vendor_role = await _get_role(db, "VENDOR")
    customer = (await db.execute(select(User).where(User.role_id == vendor_role.id))).scalar_one_or_none() or manager_user

    db.add_all([
        LogisticsDriverProfile(user_id=driver_one.id, warehouse_id=north.id, status="breakdown", current_location="Route 4B", current_job="Delivery #9982", efficiency_score=85, avatar_color="bg-gray-700", chat_history=[{"id": 1, "text": "Dispatch, engine light just came on.", "sender": "driver", "time": "09:15 AM"}, {"id": 2, "text": "Copy that David. Sending mobile mechanic.", "sender": "dispatch", "time": "09:16 AM"}]),
        LogisticsDriverProfile(user_id=driver_two.id, warehouse_id=south.id, status="deviation", current_location="Sector 7", current_job="Delivery #9991", efficiency_score=92, avatar_color="bg-gray-700", chat_history=[{"id": 1, "text": "Traffic on Route 9 is blocked.", "sender": "driver", "time": "10:42 AM"}, {"id": 2, "text": "Reroute approved. Follow the AI map.", "sender": "dispatch", "time": "10:43 AM"}]),
    ])

    vehicle_one = LogisticsVehicle(code="TRK-992", vehicle_type="Heavy Truck", warehouse_id=north.id, assigned_driver_id=driver_one.id, model="Volvo FH16", year=2021, license_plate="NY-442-XM", status="In Shop", fuel_efficiency="8.2 MPG", mileage=124500, maintenance_issue="Engine Check Light", next_service_date=_now() + timedelta(days=3))
    vehicle_two = LogisticsVehicle(code="VAN-104", vehicle_type="Delivery Van", warehouse_id=north.id, assigned_driver_id=driver_two.id, model="Ford Transit", year=2022, license_plate="NY-991-AB", status="Scheduled", fuel_efficiency="18.5 MPG", mileage=45200, maintenance_issue="Tire Replacement", next_service_date=_now() + timedelta(days=10))
    vehicle_three = LogisticsVehicle(code="TRK-221", vehicle_type="Heavy Truck", warehouse_id=south.id, model="Peterbilt 579", year=2020, license_plate="TX-118-PQ", status="Active", fuel_efficiency="7.9 MPG", mileage=210000, next_service_date=_now() + timedelta(days=21))
    db.add_all([vehicle_one, vehicle_two, vehicle_three])
    await db.flush()

    orders = [
        Order(tracking_code="QC-LOGI001", order_type="VENDOR", status="IN_TRANSIT", customer_id=customer.id, warehouse_id=north.id, assigned_driver_id=driver_one.id, assigned_vehicle_id=vehicle_one.id, pickup_addr="Amazon FC, Newark, NJ", delivery_addr="Client DC, Boston, MA", cargo_type="Retail Goods", vehicle_type="Truck", labor_count=2, base_amount=12000, vehicle_amount=3000, labor_amount=1200, materials_amount=600, packing_amount=350, platform_fee=500, tax_amount=980, total_amount=18630, payment_mode="Credit", payment_status="paid", scheduled_at=_now() - timedelta(hours=3)),
        Order(tracking_code="QC-LOGI002", order_type="VENDOR", status="ASSIGNED", customer_id=customer.id, warehouse_id=south.id, assigned_driver_id=driver_two.id, assigned_vehicle_id=vehicle_two.id, pickup_addr="Vendor Hub, Austin, TX", delivery_addr="Retail Outlet, Dallas, TX", cargo_type="Electronics", vehicle_type="Van", labor_count=1, base_amount=8000, vehicle_amount=1800, labor_amount=600, materials_amount=220, packing_amount=180, platform_fee=350, tax_amount=700, total_amount=11850, payment_mode="COD", payment_status="pending", scheduled_at=_now() + timedelta(hours=2)),
        Order(tracking_code="QC-LOGI003", order_type="VENDOR", status="DELIVERED", customer_id=customer.id, warehouse_id=west.id, pickup_addr="Port Cargo Gate, LA", delivery_addr="Warehouse Client, San Diego, CA", cargo_type="Furniture", vehicle_type="Truck", labor_count=3, base_amount=14000, vehicle_amount=3400, labor_amount=1600, materials_amount=900, packing_amount=500, platform_fee=650, tax_amount=1220, total_amount=22270, payment_mode="Transfer", payment_status="paid", scheduled_at=_now() - timedelta(days=1)),
    ]
    db.add_all(orders)

    db.add_all([
        InventoryItem(warehouse_id=north.id, sku="INV-001", name="Packing Tape", category="Consumables", unit="Rolls", quantity_on_hand=1540, safety_stock=200, aisle="Zone A"),
        InventoryItem(warehouse_id=south.id, sku="INV-003", name="Cardboard Box (M)", category="Packaging", unit="Pcs", quantity_on_hand=850, safety_stock=1000, aisle="Zone B"),
        InventoryItem(warehouse_id=north.id, sku="INV-009", name="Cargo Straps", category="Cargo", unit="Set", quantity_on_hand=500, safety_stock=100, aisle="Loading Dock"),
        InventoryItem(warehouse_id=south.id, sku="INV-010", name="Utensils (Breakroom)", category="Utensils", unit="Set", quantity_on_hand=200, safety_stock=220, aisle="Breakroom"),
    ])

    db.add_all([
        LogisticsTransaction(warehouse_id=north.id, transaction_code="TX-99212", description="Client Payment - Amazon", transaction_type="Incoming", amount=15400, status="Completed"),
        LogisticsTransaction(warehouse_id=north.id, transaction_code="TX-99213", description="Fuel Expense - Shell", transaction_type="Expense", amount=-2400, status="Completed"),
        LogisticsTransaction(warehouse_id=south.id, transaction_code="TX-99214", description="Driver Payout - Weekly", transaction_type="Payroll", amount=-6500, status="Paid"),
        LogisticsTransaction(warehouse_id=south.id, transaction_code="TX-99215", description="COD Deposit - Zone A", transaction_type="Incoming", amount=1250, status="Pending"),
    ])

    db.add_all([
        LogisticsZone(warehouse_id=north.id, name="Downtown Delivery Zone", zone_type="Polygon", radius_km=12, status="Active", color_token="blue"),
        LogisticsZone(warehouse_id=north.id, name="North-East Hub Perimeter", zone_type="Circle", radius_km=0.5, status="Active", color_token="green"),
        LogisticsZone(warehouse_id=south.id, name="Red Zone - Construction", zone_type="Exclusion", radius_km=2.5, status="Alert", color_token="red"),
        LogisticsZone(warehouse_id=south.id, name="Airport Logistics Corridor", zone_type="Polygon", radius_km=45, status="Active", color_token="indigo"),
    ])

    db.add_all([
        LogisticsAlert(warehouse_id=north.id, alert_type="congestion", title="Hub Congestion Alert", description="North-East Hub is experiencing high dwell times (>45 mins).", severity="high", icon="error", location="North-East Hub", recommendation="Reroute incoming traffic to South Hub temporarily.", impact_json={"affectedDrivers": 12}, is_active=True),
        LogisticsAlert(warehouse_id=south.id, alert_type="delayed", title="Delayed Shipments", description="14 shipments at risk of missing SLA window in Sector 4.", severity="medium", icon="schedule", location="Sector 4", recommendation="Assign priority status to these deliveries.", impact_json={"impact": "Potential SLA breach for 14 clients"}, is_active=True),
    ])

    db.add_all([
        LogisticsNotification(title="New Hub Alert", message="North-East hub congestion > 90%", type="alert"),
        LogisticsNotification(title="Driver Update", message="David Miller reported breakdown", type="warning"),
        LogisticsNotification(title="Shipment Delivered", message="Order QC-LOGI003 delivered", type="success"),
        LogisticsTask(text="Review daily hub performance", status="Priority", target_time=_now() + timedelta(hours=1), repeat_rule="none"),
        LogisticsTask(text="Approve Fleet Maintenance", status="Done", target_time=_now() - timedelta(hours=2), repeat_rule="none"),
    ])

    thread_one = LogisticsChatThread(warehouse_id=north.id, name="Dispatcher Mike", status="Online", phone="+1 (555) 012-3456", muted=False, last_message="Two trucks are down.", last_message_at=_now() - timedelta(minutes=2))
    thread_two = LogisticsChatThread(warehouse_id=south.id, name="Warehouse Team A", status="Offline", phone="+1 (555) 012-7890", muted=False, last_message="Inventory count complete.", last_message_at=_now() - timedelta(hours=1))
    db.add_all([thread_one, thread_two])
    await db.flush()

    db.add_all([
        LogisticsChatMessage(thread_id=thread_one.id, sender="other", text="Hi Boss, we have a situation at Hub 4.", created_at=_now() - timedelta(minutes=6)),
        LogisticsChatMessage(thread_id=thread_one.id, sender="other", text="Two trucks are down.", created_at=_now() - timedelta(minutes=4)),
        LogisticsChatMessage(thread_id=thread_one.id, sender="me", text="Approved. Use the contingency budget.", created_at=_now() - timedelta(minutes=3)),
        LogisticsChatMessage(thread_id=thread_two.id, sender="other", text="Inventory count complete. Report filed.", created_at=_now() - timedelta(hours=1)),
        LogisticsEscalation(warehouse_id=south.id, title="Route Deviation Override Required", priority="High", requester_name="Sarah Connor", requester_role="Dispatcher (South Hub)", description="Driver Alex Morgan is requesting a geofence override due to road construction.", action_details="Approve Geofence Override for V-402", status="OPEN"),
        LogisticsEscalation(warehouse_id=north.id, title="Fuel Limit Exceeded Action Required", priority="Medium", requester_name="System Bot", requester_role="Automated Alert", description="Vehicle V-105 submitted a fuel receipt that exceeds the daily limit.", action_details="Review OCR Receipt vs GPS Log", status="OPEN"),
        LogisticsReturnCase(warehouse_id=north.id, order_id=orders[0].id, reference_code="RMA-9921", customer_name="Alice Cooper", reason="Damaged in transit", condition="Damaged", status="Pending", original_price=150, refund_amount=0, images=["https://placehold.co/600x400/png?text=Damaged+Box+Corner"]),
        LogisticsReturnCase(warehouse_id=south.id, order_id=orders[1].id, reference_code="RMA-9923", customer_name="Charlie Watts", reason="Changed Mind", condition="Unopened", status="Approved", original_price=1250, refund_amount=1250, images=[]),
    ])

    await db.flush()

    # Seed historical daily stats for the past 30 days
    for days_ago in range(30, 0, -1):
        stat_date = (_now() - timedelta(days=days_ago)).date()
        
        # Global stats
        daily_orders = 1000 + int((30 - days_ago) * 8.3) + (hash(str(stat_date)) % 150)
        daily_revenue = 35000 + int((30 - days_ago) * 500) + (hash(str(stat_date)) % 5000)
        
        db.add(LogisticsDailyStats(
            warehouse_id=None,
            stat_date=stat_date,
            orders_count=daily_orders,
            revenue=daily_revenue,
            deliveries_completed=int(daily_orders * 0.98),
            deliveries_failed=int(daily_orders * 0.02),
            sla_compliance=85 + (hash(str(stat_date)) % 15),
        ))
        
        # Per-warehouse stats
        for warehouse in [north, south, west]:
            ratio = 0.33 if warehouse == north else (0.45 if warehouse == south else 0.22)
            hub_orders = int(daily_orders * ratio)
            hub_revenue = daily_revenue * ratio
            
            db.add(LogisticsDailyStats(
                warehouse_id=warehouse.id,
                stat_date=stat_date,
                orders_count=hub_orders,
                revenue=hub_revenue,
                deliveries_completed=int(hub_orders * 0.98),
                deliveries_failed=int(hub_orders * 0.02),
                sla_compliance=82 + (hash(f"{warehouse.id}{stat_date}") % 18),
            ))

    await db.flush()


async def build_bootstrap(db: AsyncSession) -> LogisticsBootstrapResponse:
    warehouses = (await db.execute(select(Warehouse).order_by(Warehouse.created_at.asc()))).scalars().all()
    alerts = (await db.execute(select(LogisticsAlert).where(LogisticsAlert.is_active.is_(True)).order_by(LogisticsAlert.created_at.desc()))).scalars().all()
    notifications = (await db.execute(select(LogisticsNotification).order_by(LogisticsNotification.created_at.desc()))).scalars().all()
    tasks = (await db.execute(select(LogisticsTask).order_by(LogisticsTask.created_at.desc()))).scalars().all()
    driver_profiles = (await db.execute(select(LogisticsDriverProfile).order_by(LogisticsDriverProfile.created_at.asc()))).scalars().all()
    vehicles = (await db.execute(select(LogisticsVehicle).order_by(LogisticsVehicle.created_at.desc()))).scalars().all()
    transactions = (await db.execute(select(LogisticsTransaction).order_by(LogisticsTransaction.transaction_date.desc()))).scalars().all()
    zones = (await db.execute(select(LogisticsZone).order_by(LogisticsZone.created_at.desc()))).scalars().all()
    chat_threads = (await db.execute(select(LogisticsChatThread).order_by(LogisticsChatThread.created_at.desc()))).scalars().all()
    chat_messages = (await db.execute(select(LogisticsChatMessage).order_by(LogisticsChatMessage.created_at.asc()))).scalars().all()
    escalations = (await db.execute(select(LogisticsEscalation).order_by(LogisticsEscalation.created_at.desc()))).scalars().all()
    return_cases = (await db.execute(select(LogisticsReturnCase).order_by(LogisticsReturnCase.created_at.desc()))).scalars().all()
    inventory_items = (await db.execute(select(InventoryItem).order_by(InventoryItem.created_at.desc()))).scalars().all()
    users = (await db.execute(select(User).order_by(User.created_at.desc()))).scalars().all()
    roles = (await db.execute(select(Role))).scalars().all()
    orders = (await db.execute(select(Order))).scalars().all()

    role_by_id = {role.id: role.name for role in roles}
    user_map = {user.id: user for user in users}
    warehouse_map = {warehouse.id: warehouse for warehouse in warehouses}
    vehicle_by_driver = {vehicle.assigned_driver_id: vehicle for vehicle in vehicles if vehicle.assigned_driver_id}
    messages_by_thread: dict[UUID, list[LogisticsChatMessage]] = {}
    for message in chat_messages:
        messages_by_thread.setdefault(message.thread_id, []).append(message)

    today = _now().date()
    orders_today = sum(1 for order in orders if order.created_at.date() == today)
    active_deliveries = sum(1 for order in orders if order.status == "IN_TRANSIT")
    processing = sum(1 for order in orders if order.status in {"DRAFT", "CONFIRMED", "ASSIGNED"})
    delivered = sum(1 for order in orders if order.status in {"DELIVERED", "CLOSED"})
    delivery_success = round((delivered / len(orders)) * 100, 1) if orders else 100.0
    revenue_today = sum(order.total_amount for order in orders if order.created_at.date() == today)

    # Fetch historical stats for the past 7 days
    week_start = today - timedelta(days=6)
    historical_stats = (
        await db.execute(
            select(LogisticsDailyStats)
            .where(LogisticsDailyStats.warehouse_id.is_(None))
            .where(LogisticsDailyStats.stat_date >= week_start)
            .where(LogisticsDailyStats.stat_date <= today)
            .order_by(LogisticsDailyStats.stat_date.asc())
        )
    ).scalars().all()

    sla_week = [int(stat.sla_compliance) for stat in historical_stats[-7:]]
    revenue_week = [float(stat.revenue) for stat in historical_stats[-7:]]
    orders_week = [stat.orders_count for stat in historical_stats[-7:]]

    # Pad with zeros if fewer than 7 days of data
    while len(sla_week) < 7:
        sla_week.insert(0, 0)
    while len(revenue_week) < 7:
        revenue_week.insert(0, 0)
    while len(orders_week) < 7:
        orders_week.insert(0, 0)

    dashboard_stats = LogisticsDashboardStats(
        orders_today=orders_today,
        active_deliveries=active_deliveries,
        processing=processing,
        delivery_success=delivery_success,
        revenue_today=revenue_today,
        orders_trend=round((orders_today / max(len(orders), 1)) * 100, 1),
        revenue_trend=round((revenue_today / max(sum(order.total_amount for order in orders), 1)) * 100, 1),
        sla_week=sla_week[-7:],
        revenue_week=revenue_week[-7:],
        orders_week=orders_week[-7:],
    )

    total_revenue = sum(max(order.total_amount, 0) for order in orders if order.payment_status == "paid")
    total_expenses = abs(sum(tx.amount for tx in transactions if tx.amount < 0))
    pending_cod_orders = [order for order in orders if order.payment_mode == "COD" and order.payment_status != "paid"]
    total_pending_cod = sum(order.total_amount for order in pending_cod_orders)

    hubs = []
    for index, warehouse in enumerate(warehouses, start=1):
        hub_users = [user for user in users if user.warehouse_id == warehouse.id]
        hub_orders = [order for order in orders if order.warehouse_id == warehouse.id]
        hub_vehicles = [vehicle for vehicle in vehicles if vehicle.warehouse_id == warehouse.id]
        capacity = int((len(hub_orders) / max(warehouse.capacity_limit or 10, 10)) * 100)
        status = "Optimal" if capacity < 70 else ("High Load" if capacity < 90 else "Congested")
        efficiency = min(99, max(72, 82 + len(hub_orders) * 3))
        fallback_manager = next(
            (
                user
                for user in hub_users
                if role_by_id.get(user.role_id) == "WAREHOUSE_MANAGER" and user.is_active
            ),
            None,
        )
        manager_name = (
            user_map.get(warehouse.manager_id).name
            if warehouse.manager_id in user_map
            else (fallback_manager.name if fallback_manager else "Unassigned")
        )
        hubs.append(
            LogisticsHubItem(
                id=warehouse.id,
                hub_code=f"HUB-{index:02d}",
                name=warehouse.name,
                location=warehouse.address,
                manager=manager_name,
                manager_initials="".join(part[0] for part in manager_name.split()[:2]).upper() if manager_name else "UN",
                capacity=capacity,
                efficiency=efficiency,
                staff_active=sum(1 for user in hub_users if user.is_active),
                staff_total=len(hub_users),
                vehicles_active=sum(1 for vehicle in hub_vehicles if vehicle.status == "Active"),
                vehicles_total=len(hub_vehicles),
                process_rate=len(hub_orders) * 120,
                status=status,
                status_color="text-green-500" if status == "Optimal" else ("text-yellow-500" if status == "High Load" else "text-red-500"),
                bg="bg-green-500" if status == "Optimal" else ("bg-yellow-500" if status == "High Load" else "bg-red-500"),
            )
        )

    drivers = []
    for profile in driver_profiles:
        user = user_map.get(profile.user_id)
        if not user:
            continue
        assigned_vehicle = vehicle_by_driver.get(user.id)
        drivers.append(
            LogisticsDriverItem(
                id=user.id,
                hub_id=profile.warehouse_id,
                name=user.name,
                status=profile.status,
                location=profile.current_location,
                vehicle=assigned_vehicle.code if assigned_vehicle else None,
                efficiency=profile.efficiency_score,
                phone=user.phone,
                current_job=profile.current_job,
                avatar_color=profile.avatar_color,
                chat_history=profile.chat_history or [],
            )
        )

    vehicles_payload = [
        LogisticsVehicleItem(
            id=vehicle.id,
            hub_id=vehicle.warehouse_id,
            code=vehicle.code,
            type=vehicle.vehicle_type,
            model=vehicle.model,
            year=vehicle.year,
            license_plate=vehicle.license_plate,
            status=vehicle.status,
            driver=user_map[vehicle.assigned_driver_id].name if vehicle.assigned_driver_id in user_map else "Unassigned",
            fuel_efficiency=vehicle.fuel_efficiency,
            mileage=vehicle.mileage,
            next_service=vehicle.next_service_date.strftime("%b %d, %Y") if vehicle.next_service_date else None,
            maintenance_issue=vehicle.maintenance_issue,
        )
        for vehicle in vehicles
    ]

    ai_suggestion_chips = [
        "Predict bottleneck risks",
        "Show revenue forecast",
        "Identify underperforming hubs",
        "Check inventory status",
    ]
    busiest_hub = max(hubs, key=lambda hub: hub.process_rate, default=None)
    ai_messages = [{
        "role": "ai",
        "text": (
            f"Live review complete. {busiest_hub.name if busiest_hub else 'The network'} is currently leading throughput, "
            f"while {len(alerts)} active alert(s) need monitoring."
        ),
        "time": _now().strftime("%I:%M %p"),
        "data": {
            "active_alerts": len(alerts),
            "active_deliveries": active_deliveries,
            "pending_cod": f"${total_pending_cod:,.0f}",
            "top_hub": busiest_hub.name if busiest_hub else "N/A",
        },
    }]

    finance_cod_records = [
        {
            "id": f"COD-{order.tracking_code}",
            "date": order.scheduled_at.strftime("%b %d, %Y") if order.scheduled_at else _fmt_relative(order.created_at),
            "desc": order.tracking_code,
            "name": user_map.get(order.assigned_driver_id).name if order.assigned_driver_id in user_map else "Unassigned Driver",
            "amount": float(order.total_amount),
            "status": "Completed" if order.payment_status == "paid" else "Pending",
            "type": "COD",
        }
        for order in pending_cod_orders + [order for order in orders if order.payment_mode == "COD" and order.payment_status == "paid"][:3]
    ]

    finance_staff_records = []
    finance_driver_records = []
    for user in users:
        role_name = role_by_id.get(user.role_id, "")
        if role_name == "INDIVIDUAL":
            continue
        payout = 0.0
        if role_name in {"LOGISTIC_MANAGER", "WAREHOUSE_MANAGER", "DISPATCHER"}:
            payout = 3200 if role_name != "LOGISTIC_MANAGER" else 4800
            finance_staff_records.append({
                "id": f"PAY-{str(user.id)[:8].upper()}",
                "userId": str(user.id),
                "date": _now().strftime("%b %d, %Y"),
                "name": user.name,
                "role": _title_case_status(role_name),
                "amount": payout,
                "status": "Pending" if payout > 0 else "Paid",
                "avatar": f"https://i.pravatar.cc/150?u={user.id}",
                "hubId": str(user.warehouse_id) if user.warehouse_id else "all",
            })
        elif role_name == "DRIVER":
            payout = 1250
            finance_driver_records.append({
                "id": f"WAGE-{str(user.id)[:8].upper()}",
                "userId": str(user.id),
                "date": _now().strftime("%b %d, %Y"),
                "name": user.name,
                "role": "Driver",
                "amount": payout,
                "status": "Pending",
                "avatar": f"https://i.pravatar.cc/150?u={user.id}",
                "hubId": str(user.warehouse_id) if user.warehouse_id else "all",
            })

    fleet_logs = {
        "Fuel Logs": [
            {
                "id": f"FUEL-{index + 1:03d}",
                "date": tx.transaction_date.strftime("%b %d, %Y"),
                "vehicleId": next((vehicle.code for vehicle in vehicles if vehicle.warehouse_id == tx.warehouse_id), "NA"),
                "hubId": str(tx.warehouse_id) if tx.warehouse_id else "all",
                "station": "Network Fuel Partner",
                "gallons": max(12, round(abs(tx.amount) / 4.25, 1)),
                "cost": abs(tx.amount),
                "alert": abs(tx.amount) > 3000,
                "status": tx.status,
            }
            for index, tx in enumerate([item for item in transactions if item.transaction_type in {"Expense", "Payroll"}][:5])
        ],
        "Service Logs": [
            {
                "id": f"SRV-{index + 1:03d}",
                "date": vehicle.next_service or _now().strftime("%b %d, %Y"),
                "vehicleId": vehicle.code,
                "hubId": str(vehicle.hub_id) if vehicle.hub_id else "all",
                "service": vehicle.maintenance_issue or "Preventive service",
                "provider": "CargoCore Workshop",
                "cost": 180 + index * 60,
                "status": "Scheduled" if vehicle.status != "Active" else "Completed",
            }
            for index, vehicle in enumerate(vehicles_payload[:5])
        ],
        "Maintenance Logs": [
            {
                "id": f"MTN-{index + 1:03d}",
                "date": vehicle.next_service or _now().strftime("%b %d, %Y"),
                "vehicleId": vehicle.code,
                "hubId": str(vehicle.hub_id) if vehicle.hub_id else "all",
                "issue": vehicle.maintenance_issue or "General inspection",
                "mechanic": "Internal Team",
                "cost": 240 + index * 90,
                "status": "Pending" if vehicle.status != "Active" else "Resolved",
            }
            for index, vehicle in enumerate(vehicles_payload[:5])
        ],
        "Cleaning Logs": [
            {
                "id": f"CLN-{index + 1:03d}",
                "date": _fmt_relative(_now() - timedelta(days=index + 1)),
                "vehicleId": vehicle.code,
                "hubId": str(vehicle.hub_id) if vehicle.hub_id else "all",
                "type": "Exterior Wash" if index % 2 == 0 else "Full Detail",
                "provider": "Fleet Care",
                "cost": 40 + index * 20,
                "status": "Completed",
            }
            for index, vehicle in enumerate(vehicles_payload[:5])
        ],
    }

    vehicle_documents = []
    for index, vehicle in enumerate(vehicles_payload, start=1):
        vehicle_documents.extend([
            {
                "id": f"VDOC-{index}-A",
                "vehicleId": vehicle.code,
                "hubId": str(vehicle.hub_id) if vehicle.hub_id else "all",
                "type": "Insurance Policy",
                "status": "Expiring Soon" if vehicle.status != "Active" else "Active",
                "expiry": vehicle.next_service or (_now() + timedelta(days=180)).strftime("%b %d, %Y"),
                "lastRenewed": (_now() - timedelta(days=120)).strftime("%b %d, %Y"),
                "url": f"https://placehold.co/400x500?text={vehicle.code}+Insurance",
            },
            {
                "id": f"VDOC-{index}-B",
                "vehicleId": vehicle.code,
                "hubId": str(vehicle.hub_id) if vehicle.hub_id else "all",
                "type": "Vehicle Registration",
                "status": "Active",
                "expiry": (_now() + timedelta(days=300)).strftime("%b %d, %Y"),
                "lastRenewed": (_now() - timedelta(days=60)).strftime("%b %d, %Y"),
                "url": f"https://placehold.co/400x500?text={vehicle.code}+Registration",
            },
        ])

    driver_documents = []
    for index, driver in enumerate(drivers, start=1):
        driver_documents.extend([
            {
                "id": f"DDOC-{index}-A",
                "driver": driver.name,
                "driverId": str(driver.id),
                "hubId": str(driver.hub_id) if driver.hub_id else "all",
                "type": "Commercial License (CDL)",
                "licenseNo": f"DL-{100000 + index * 321}",
                "status": "Active",
                "expiry": (_now() + timedelta(days=240)).strftime("%b %d, %Y"),
                "joined": (_now() - timedelta(days=600 - index * 50)).strftime("%b %d, %Y"),
                "url": f"https://placehold.co/400x500?text={driver.name.replace(' ', '+')}+CDL",
            },
            {
                "id": f"DDOC-{index}-B",
                "driver": driver.name,
                "driverId": str(driver.id),
                "hubId": str(driver.hub_id) if driver.hub_id else "all",
                "type": "Medical Certificate",
                "licenseNo": f"MED-{500 + index * 7}",
                "status": "Active",
                "expiry": (_now() + timedelta(days=120)).strftime("%b %d, %Y"),
                "joined": (_now() - timedelta(days=600 - index * 50)).strftime("%b %d, %Y"),
                "url": f"https://placehold.co/400x500?text={driver.name.replace(' ', '+')}+Medical",
            },
        ])

    report_ai_insights = [
        f"{delivery_success}% delivery success is keeping the network above SLA thresholds.",
        f"{len([item for item in inventory_items if item.quantity_on_hand <= item.safety_stock])} inventory item(s) need replenishment attention.",
        f"{len([vehicle for vehicle in vehicles if vehicle.status != 'Active'])} vehicle(s) require maintenance follow-up.",
        f"{len(pending_cod_orders)} COD collection(s) remain open for finance reconciliation.",
    ]
    report_damage_claims = [
        {
            "title": case.reference_code,
            "reporter": case.customer_name,
            "time": _fmt_relative(case.created_at),
            "status": case.status,
            "image": case.images[0] if case.images else "",
            "reason": case.reason,
        }
        for case in return_cases
    ]
    report_security_logs = [
        {
            "time": _fmt_relative(notification.created_at),
            "actor": "system_bot",
            "action": "READ_NOTIFICATION" if notification.is_read else "NEW_NOTIFICATION",
            "target": notification.title,
            "details": notification.message,
            "ip": f"10.0.0.{20 + index}",
        }
        for index, notification in enumerate(notifications[:6], start=1)
    ]
    report_metrics = {
        "payment_reconciliation": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            "expected_digital": [max(total_revenue * ratio, 1000) for ratio in (0.10, 0.12, 0.15, 0.13, 0.18)],
            "actual_digital": [max(total_revenue * ratio, 900) for ratio in (0.09, 0.11, 0.145, 0.125, 0.17)],
            "expected_cod": [max(total_pending_cod * ratio, 300) for ratio in (0.20, 0.18, 0.22, 0.17, 0.23)],
            "actual_cod": [max(total_pending_cod * ratio, 250) for ratio in (0.16, 0.15, 0.20, 0.14, 0.21)],
        },
        "fuel_audit": {
            "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
            "fuel_expense": [total_expenses * ratio for ratio in (0.20, 0.24, 0.19, 0.27)],
            "gps_mileage": [max(sum(vehicle.mileage for vehicle in vehicles) * ratio / 100, 1000) for ratio in (0.18, 0.21, 0.19, 0.22)],
        },
        "workforce": {
            "labels": ["In-Warehouse", "On-Field", "Off-Duty"],
            "values": [
                len([user for user in users if role_by_id.get(user.role_id) in {"WAREHOUSE_MANAGER", "DISPATCHER"}]),
                len([user for user in users if role_by_id.get(user.role_id) == "DRIVER"]),
                max(1, len(users) // 4),
            ],
        },
        "vendor_lead_time": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "values": [5.2, 4.8, 4.4, 4.1, 3.9, 4.0],
        },
        "safety_incidents": {"labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], "values": [2, 3, 1, 2, 1, 0]},
        "shift_efficiency": {
            "labels": ["Shift A", "Shift B", "Shift C"],
            "efficiency": [92, 88, 95],
            "overtime": [12, 18, 5],
        },
        "dwell_time": {
            "labels": ["6am-9am", "9am-12pm", "12pm-3pm", "3pm-6pm", "6pm-9pm"],
            "values": [15, 45, 25, 60, 20],
        },
        "rma_vs_orders": {
            "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
            "orders": [120, 150, 140, 160],
            "rma": [max(1, len(return_cases) - 1), len(return_cases), len(return_cases), len(return_cases) + 1],
        },
        "rma_reasons": {
            "labels": ["Damaged", "Wrong Item", "Late Delivery", "Changed Mind"],
            "values": [
                len([case for case in return_cases if "dam" in case.reason.lower()]),
                len([case for case in return_cases if "wrong" in case.reason.lower()]),
                len([case for case in return_cases if "late" in case.reason.lower()]),
                len([case for case in return_cases if "changed" in case.reason.lower()]),
            ],
        },
        "attendance": {
            "present": len([user for user in users if user.is_active]),
            "late": len(alerts),
            "absent": max(0, len(users) // 5 - 1),
        },
        "pending_dues": total_pending_cod,
    }
    finance_summary = {
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "pending_cod": total_pending_cod,
        "total_payroll_due": sum(item["amount"] for item in finance_staff_records + finance_driver_records if item["status"] == "Pending"),
    }

    return LogisticsBootstrapResponse(
        dashboard_stats=dashboard_stats,
        hubs=hubs,
        alerts=[LogisticsAlertItem(id=alert.id, type=alert.alert_type, title=alert.title, description=alert.description, severity=alert.severity, icon=alert.icon, timestamp=alert.created_at.strftime("%I:%M %p"), location=alert.location, recommendation=alert.recommendation, impact=alert.impact_json) for alert in alerts],
        drivers=drivers,
        top_drivers=[{"id": str(driver.id), "hubId": driver.hub_id, "name": driver.name, "rating": round(min(5.0, max(4.1, driver.efficiency / 20)), 1), "trips": 100 + driver.efficiency, "ontime": min(99, driver.efficiency + 5), "avatar": f"https://i.pravatar.cc/150?u={driver.id}"} for driver in sorted(drivers, key=lambda item: item.efficiency, reverse=True)[:5]],
        vehicles=vehicles_payload,
        maintenance=[LogisticsMaintenanceItem(id=vehicle.id, hub_id=vehicle.warehouse_id, issue=vehicle.maintenance_issue or "Scheduled Maintenance", status=vehicle.status, status_class=_status_badge_class(vehicle.status)) for vehicle in vehicles if vehicle.status != "Active"],
        transactions=[LogisticsTransactionItem(id=tx.id, hub_id=tx.warehouse_id, date=tx.transaction_date.strftime("%b %d, %Y"), desc=tx.description, type=tx.transaction_type, amount=tx.amount, status=tx.status) for tx in transactions],
        reports=[LogisticsReportItem(id=f"report-{index}", hub_id=hub.id, title=f"{hub.name} Performance Report", date=_fmt_relative(_now() - timedelta(days=index)), icon="analytics", color=color) for index, (hub, color) in enumerate(zip(hubs, ["blue", "green", "orange"]), start=1)],
        users=[LogisticsUserItem(id=user.id, hub_id=user.warehouse_id if user.warehouse_id else "all", name=user.name, email=user.email, role=role_by_id.get(user.role_id, ""), status="Active" if user.is_active else "Inactive", last_login=_fmt_relative(user.updated_at), username=user.username, pending_payout=4200 if role_by_id.get(user.role_id) in {"WAREHOUSE_MANAGER", "DISPATCHER"} else (1250 if role_by_id.get(user.role_id) == "DRIVER" else 0), mobile=user.phone, mobile_verified=bool(user.phone), email_verified=True, avatar=f"https://i.pravatar.cc/150?u={user.id}") for user in users if role_by_id.get(user.role_id) != "INDIVIDUAL"],
        returns=[LogisticsReturnCaseItem(id=item.id, hub_id=item.warehouse_id, order_id=item.order_id, customer=item.customer_name, reason=item.reason, condition=item.condition, status=item.status, original_price=item.original_price, refund_amount=item.refund_amount, images=item.images or [], reference_code=item.reference_code) for item in return_cases],
        zones=[LogisticsZoneItem(id=zone.id, hub_id=zone.warehouse_id, name=zone.name, type=zone.zone_type, radius=zone.radius_km, status=zone.status, color=zone.color_token) for zone in zones],
        chats=[LogisticsChatThreadItem(id=thread.id, hub_id=thread.warehouse_id, name=thread.name, time=_fmt_relative(thread.last_message_at), last_message=thread.last_message, status=thread.status, phone=thread.phone, muted=thread.muted, messages=[LogisticsChatMessageItem(id=message.id, text=message.text, sender=message.sender, time=message.created_at.strftime("%I:%M %p")) for message in messages_by_thread.get(thread.id, [])]) for thread in chat_threads],
        escalations=[LogisticsEscalationItem(id=esc.id, hub_id=esc.warehouse_id, title=esc.title, priority=esc.priority, from_name=esc.requester_name, role=esc.requester_role, time=esc.created_at.strftime("%I:%M %p"), description=esc.description, action_details=esc.action_details, status=esc.status) for esc in escalations],
        inventory=[{"id": str(item.id), "name": item.name, "category": item.category or "General", "quantity": item.quantity_on_hand, "unit": item.unit, "threshold": item.safety_stock, "location": item.aisle or warehouse_map.get(item.warehouse_id).name, "status": "Low Stock" if item.quantity_on_hand <= item.safety_stock else "Good", "hubId": item.warehouse_id, "sku": item.sku} for item in inventory_items],
        notifications=[LogisticsNotificationItem(id=item.id, title=item.title, message=item.message, time=_fmt_relative(item.created_at), read=item.is_read, type=item.type) for item in notifications],
        tasks=[LogisticsTaskItem(id=item.id, text=item.text, status=item.status, target_time=item.target_time, repeat=item.repeat_rule, created_at=item.created_at, last_alert_time=item.last_alert_time, silenced=item.silenced) for item in tasks],
        ai_suggestion_chips=ai_suggestion_chips,
        ai_messages=ai_messages,
        finance_summary=finance_summary,
        finance_cod_records=finance_cod_records,
        finance_staff_records=finance_staff_records,
        finance_driver_records=finance_driver_records,
        fleet_logs=fleet_logs,
        vehicle_documents=vehicle_documents,
        driver_documents=driver_documents,
        report_ai_insights=report_ai_insights,
        report_damage_claims=report_damage_claims,
        report_security_logs=report_security_logs,
        report_metrics=report_metrics,
    )


async def answer_ai_query(db: AsyncSession, query: str) -> LogisticsAiQueryResponse:
    bootstrap = await build_bootstrap(db)
    lower_query = query.lower()

    if any(keyword in lower_query for keyword in ("risk", "bottleneck", "delay")):
        top_alert = bootstrap.alerts[0] if bootstrap.alerts else None
        return LogisticsAiQueryResponse(
            text=f"Risk scan complete. {top_alert.title if top_alert else 'No major bottlenecks detected'} is the top operational watch item right now.",
            data={
                "active_alerts": len(bootstrap.alerts),
                "highest_risk": top_alert.title if top_alert else "None",
                "affected_hub": top_alert.location if top_alert else "Network-wide stable",
                "recommendation": top_alert.recommendation if top_alert else "Continue current routing plan",
            },
        )
    if any(keyword in lower_query for keyword in ("revenue", "forecast", "financial")):
        return LogisticsAiQueryResponse(
            text="Finance forecast generated from live transaction and COD data.",
            data={
                "projected_revenue": f"${bootstrap.finance_summary.get('total_revenue', 0):,.0f}",
                "open_cod": f"${bootstrap.finance_summary.get('pending_cod', 0):,.0f}",
                "payroll_due": f"${bootstrap.finance_summary.get('total_payroll_due', 0):,.0f}",
                "net_position": f"${bootstrap.finance_summary.get('total_revenue', 0) - bootstrap.finance_summary.get('total_expenses', 0):,.0f}",
            },
        )
    if any(keyword in lower_query for keyword in ("hub", "underperform", "efficiency")):
        hub = min(bootstrap.hubs, key=lambda item: item.efficiency, default=None)
        return LogisticsAiQueryResponse(
            text=f"Hub performance scan complete. {hub.name if hub else 'No hub'} is the main improvement candidate based on live throughput.",
            data={
                "hub_name": hub.name if hub else "N/A",
                "efficiency_score": f"{hub.efficiency}%" if hub else "N/A",
                "capacity_load": f"{hub.capacity}%" if hub else "N/A",
                "process_rate": f"{hub.process_rate} pkgs/hr" if hub else "N/A",
            },
        )
    if any(keyword in lower_query for keyword in ("stock", "inventory")):
        low_items = [item for item in bootstrap.inventory if "Low" in item["status"]]
        top_item = low_items[0] if low_items else None
        return LogisticsAiQueryResponse(
            text="Inventory scan complete across the active network.",
            data={
                "low_stock_items": len(low_items),
                "top_risk_item": top_item["name"] if top_item else "None",
                "current_qty": top_item["quantity"] if top_item else "Healthy",
                "threshold": top_item["threshold"] if top_item else "N/A",
            },
        )
    return LogisticsAiQueryResponse(
        text="I can answer live questions about operational risks, revenue, hub efficiency, and inventory health using the current logistics data.",
        data={
            "active_hubs": len(bootstrap.hubs),
            "active_drivers": len(bootstrap.drivers),
            "open_returns": len([item for item in bootstrap.returns if item.status.lower() == "pending"]),
            "open_alerts": len(bootstrap.alerts),
        },
    )


async def create_vehicle(db: AsyncSession, data: LogisticsVehicleCreate) -> LogisticsVehicleItem:
    vehicle = LogisticsVehicle(**data.model_dump())
    db.add(vehicle)
    await db.flush()
    bootstrap = await build_bootstrap(db)
    return next(item for item in bootstrap.vehicles if item.id == vehicle.id)


async def update_vehicle(db: AsyncSession, vehicle_id: UUID, data: LogisticsVehicleUpdate) -> LogisticsVehicleItem:
    vehicle = await _get_vehicle(db, vehicle_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(vehicle, key, value)
    db.add(vehicle)
    await db.flush()
    bootstrap = await build_bootstrap(db)
    return next(item for item in bootstrap.vehicles if item.id == vehicle.id)


async def create_transaction(db: AsyncSession, data: LogisticsTransactionCreate) -> LogisticsTransactionItem:
    total = (await db.execute(select(func.count(LogisticsTransaction.id)))).scalar_one()
    tx = LogisticsTransaction(
        warehouse_id=data.warehouse_id,
        transaction_code=f"TX-{99212 + total + 1}",
        description=data.description,
        transaction_type=data.transaction_type,
        amount=data.amount,
        status=data.status,
        metadata_json=data.metadata_json,
    )
    db.add(tx)
    await db.flush()
    return LogisticsTransactionItem(id=tx.id, hub_id=tx.warehouse_id, date=tx.transaction_date.strftime("%b %d, %Y"), desc=tx.description, type=tx.transaction_type, amount=tx.amount, status=tx.status)


async def update_return_case(db: AsyncSession, case_id: UUID, data: LogisticsReturnCaseUpdate) -> LogisticsReturnCaseItem:
    case = await _get_return_case(db, case_id)
    case.status = data.status
    if data.refund_amount is not None:
        case.refund_amount = data.refund_amount
    if data.condition is not None:
        case.condition = data.condition
    db.add(case)
    await db.flush()
    return LogisticsReturnCaseItem(id=case.id, hub_id=case.warehouse_id, order_id=case.order_id, customer=case.customer_name, reason=case.reason, condition=case.condition, status=case.status, original_price=case.original_price, refund_amount=case.refund_amount, images=case.images or [], reference_code=case.reference_code)


async def create_zone(db: AsyncSession, data: LogisticsZoneCreate) -> LogisticsZoneItem:
    zone = LogisticsZone(**data.model_dump())
    db.add(zone)
    await db.flush()
    return LogisticsZoneItem(id=zone.id, hub_id=zone.warehouse_id, name=zone.name, type=zone.zone_type, radius=zone.radius_km, status=zone.status, color=zone.color_token)


async def update_zone(db: AsyncSession, zone_id: UUID, data: LogisticsZoneUpdate) -> LogisticsZoneItem:
    zone = await _get_zone(db, zone_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(zone, key, value)
    db.add(zone)
    await db.flush()
    return LogisticsZoneItem(id=zone.id, hub_id=zone.warehouse_id, name=zone.name, type=zone.zone_type, radius=zone.radius_km, status=zone.status, color=zone.color_token)


async def delete_zone(db: AsyncSession, zone_id: UUID) -> MessageResponse:
    zone = await _get_zone(db, zone_id)
    await db.delete(zone)
    await db.flush()
    return MessageResponse(message="Zone deleted")


async def add_chat_message(db: AsyncSession, thread_id: UUID, data: LogisticsChatMessageCreate) -> LogisticsChatThreadItem:
    thread = await _get_chat_thread(db, thread_id)
    message = LogisticsChatMessage(thread_id=thread.id, sender=data.sender, text=data.text)
    db.add(message)
    thread.last_message = data.text
    thread.last_message_at = _now()
    db.add(thread)
    await db.flush()
    bootstrap = await build_bootstrap(db)
    return next(item for item in bootstrap.chats if item.id == thread.id)


async def update_task(db: AsyncSession, task_id: UUID, data: LogisticsTaskUpdate) -> LogisticsTaskItem:
    task = (await db.execute(select(LogisticsTask).where(LogisticsTask.id == task_id))).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.add(task)
    await db.flush()
    return LogisticsTaskItem(id=task.id, text=task.text, status=task.status, target_time=task.target_time, repeat=task.repeat_rule, created_at=task.created_at, last_alert_time=task.last_alert_time, silenced=task.silenced)


async def update_notification(db: AsyncSession, notification_id: UUID, data: LogisticsNotificationUpdate) -> LogisticsNotificationItem:
    notification = (await db.execute(select(LogisticsNotification).where(LogisticsNotification.id == notification_id))).scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = data.read
    db.add(notification)
    await db.flush()
    return LogisticsNotificationItem(id=notification.id, title=notification.title, message=notification.message, time=_fmt_relative(notification.created_at), read=notification.is_read, type=notification.type)


async def mark_all_notifications_read(db: AsyncSession) -> MessageResponse:
    notifications = (await db.execute(select(LogisticsNotification))).scalars().all()
    for notification in notifications:
        notification.is_read = True
        db.add(notification)
    await db.flush()
    return MessageResponse(message="Notifications marked as read")


async def clear_notifications(db: AsyncSession) -> MessageResponse:
    notifications = (await db.execute(select(LogisticsNotification))).scalars().all()
    for notification in notifications:
        await db.delete(notification)
    await db.flush()
    return MessageResponse(message="Notifications cleared")


async def create_alert(db: AsyncSession, payload: dict) -> LogisticsAlertItem:
    alert = LogisticsAlert(
        warehouse_id=payload.get("warehouse_id"),
        alert_type=payload.get("type", "manual"),
        title=payload["title"],
        description=payload["description"],
        severity=payload.get("severity", "medium"),
        icon=payload.get("icon"),
        location=payload.get("location"),
        recommendation=payload.get("recommendation"),
        impact_json=payload.get("impact"),
        is_active=True,
    )
    db.add(alert)
    await db.flush()
    return LogisticsAlertItem(id=alert.id, type=alert.alert_type, title=alert.title, description=alert.description, severity=alert.severity, icon=alert.icon, timestamp=alert.created_at.strftime("%I:%M %p"), location=alert.location, recommendation=alert.recommendation, impact=alert.impact_json)


async def resolve_alert(db: AsyncSession, alert_id: UUID) -> MessageResponse:
    alert = (await db.execute(select(LogisticsAlert).where(LogisticsAlert.id == alert_id))).scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_active = False
    db.add(alert)
    await db.flush()
    return MessageResponse(message="Alert resolved")

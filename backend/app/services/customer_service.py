from collections import OrderedDict
from datetime import datetime
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import CustomerQuote as CustomerQuoteModel
from app.models.order import DamageReport as DamageReportModel
from app.models.order import Order
from app.models.user import User
from app.schemas.auth import UserProfile
from app.schemas.customer import (
    CustomerDashboardActiveMove,
    CustomerDashboardCostSummary,
    CustomerDashboardDriver,
    CustomerDashboardMonthlyPoint,
    CustomerDashboardOrder,
    CustomerDashboardResponse,
    CustomerDashboardStats,
    CustomerDamageReport,
    CustomerDamageReportCreate,
    CustomerDamageReportsResponse,
    CustomerPaymentRecord,
    CustomerPaymentsSummary,
    CustomerProfileResponse,
    CustomerQuote,
    CustomerQuotesResponse,
    CustomerSettings,
    CustomerSettingsResponse,
    CustomerTrackingOrder,
    CustomerTrackingResponse,
)


def _ui_status(status_value: str) -> str:
    mapping = {
        "DRAFT": "pending",
        "CONFIRMED": "pending",
        "ASSIGNED": "in-transit",
        "IN_TRANSIT": "in-transit",
        "DELIVERED": "delivered",
        "CLOSED": "delivered",
        "CANCELLED": "cancelled",
    }
    return mapping.get(status_value.upper(), status_value.lower())


def _cargo_type(order: Order) -> str:
    if order.cargo_type:
        return order.cargo_type
    return "Household Goods" if order.order_type.upper() == "INDIVIDUAL" else "Shipment"


def _service_otp(order: Order) -> str:
    if order.service_otp:
        return order.service_otp
    digits = "".join(ch for ch in order.tracking_code if ch.isdigit())
    return (digits[-4:] or "0000").zfill(4)


def _service_time_block(order: Order) -> str:
    if order.service_time_block:
        return order.service_time_block
    if order.scheduled_at:
        return order.scheduled_at.strftime("%I:%M %p")
    return "TBD"


def _progress_for_status(status_value: str) -> int:
    mapping = {
        "pending": 15,
        "in-transit": 65,
        "delivered": 100,
        "cancelled": 0,
    }
    return mapping.get(_ui_status(status_value), 0)


def _eta_label(order: Order) -> str:
    if order.status in {"DELIVERED", "CLOSED"}:
        return "Delivered"
    if order.status == "CANCELLED":
        return "Cancelled"
    if order.scheduled_at:
        return order.scheduled_at.strftime("%d %b, %I:%M %p")
    return "TBD"


def _tracking_log(order: Order) -> list[dict]:
    created = order.created_at.strftime("%d %b %Y, %I:%M %p")
    entries = [
        {"event": "Order created", "time": created, "icon": "receipt", "color": "green"},
    ]
    if order.status in {"CONFIRMED", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "CLOSED"}:
        entries.append({"event": "Order confirmed", "time": created, "icon": "check_circle", "color": "blue"})
    if order.status in {"ASSIGNED", "IN_TRANSIT", "DELIVERED", "CLOSED"}:
        entries.append({"event": "Crew assigned", "time": created, "icon": "group", "color": "purple"})
    if order.status in {"IN_TRANSIT", "DELIVERED", "CLOSED"}:
        entries.append({"event": "Shipment in transit", "time": created, "icon": "local_shipping", "color": "blue"})
    if order.status in {"DELIVERED", "CLOSED"}:
        entries.append({"event": "Shipment delivered", "time": created, "icon": "task_alt", "color": "green"})
    if order.status == "CANCELLED":
        entries.append({"event": f"Order cancelled: {order.cancel_reason or 'No reason provided'}", "time": created, "icon": "cancel", "color": "red"})
    return entries


def _to_dashboard_order(order: Order) -> CustomerDashboardOrder:
    return CustomerDashboardOrder(
        id=order.id,
        tracking_code=order.tracking_code,
        order_type=order.order_type,
        status=order.status,
        ui_status=_ui_status(order.status),
        pickup_addr=order.pickup_addr,
        delivery_addr=order.delivery_addr,
        scheduled_at=order.scheduled_at,
        created_at=order.created_at,
        vehicle_type=order.vehicle_type or order.order_type.lower(),
        total_amount=order.total_amount,
    )


def _to_active_move(order: Order) -> CustomerDashboardActiveMove:
    return CustomerDashboardActiveMove(
        id=order.id,
        tracking_code=order.tracking_code,
        status=order.status,
        ui_status=_ui_status(order.status),
        pickup_addr=order.pickup_addr,
        delivery_addr=order.delivery_addr,
        scheduled_at=order.scheduled_at,
        created_at=order.created_at,
        vehicle_type=order.vehicle_type or order.order_type.lower(),
        cargo_type=_cargo_type(order),
        progress=_progress_for_status(order.status),
        eta_label=_eta_label(order),
        service_otp=_service_otp(order),
        service_time_block=_service_time_block(order),
        labor_count=order.labor_count,
        driver=CustomerDashboardDriver(name=None, phone=None, rating=None),
        cost=CustomerDashboardCostSummary(
            base=order.base_amount,
            vehicle=order.vehicle_amount,
            labor=order.labor_amount,
            materials=order.materials_amount,
            packing=order.packing_amount,
            platform_fee=order.platform_fee,
            taxes=order.tax_amount,
            total=order.total_amount,
        ),
    )


def _to_user_profile(user: User) -> UserProfile:
    return UserProfile(
        id=user.id,
        name=user.name,
        username=user.username,
        email=user.email,
        phone=user.phone,
        address=user.address,
        role=user.role.name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


async def get_customer_dashboard(db: AsyncSession, user: User) -> CustomerDashboardResponse:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer dashboard is only available for individual users")

    orders = (
        await db.execute(
            select(Order).where(Order.customer_id == user.id).order_by(Order.created_at.desc())
        )
    ).scalars().all()

    ui_statuses = [_ui_status(order.status) for order in orders]
    stats = CustomerDashboardStats(
        total_orders=len(orders),
        active_orders=sum(1 for value in ui_statuses if value == "in-transit"),
        pending_orders=sum(1 for value in ui_statuses if value == "pending"),
        delivered_orders=sum(1 for value in ui_statuses if value == "delivered"),
        cancelled_orders=sum(1 for value in ui_statuses if value == "cancelled"),
        total_spent=sum(order.total_amount for order in orders if order.payment_status == "paid" or _ui_status(order.status) == "delivered"),
    )

    now = datetime.now()
    month_buckets: OrderedDict[str, int] = OrderedDict()
    for offset in range(5, -1, -1):
        month = ((now.month - offset - 1) % 12) + 1
        year = now.year + ((now.month - offset - 1) // 12)
        month_key = datetime(year, month, 1).strftime("%b")
        month_buckets[month_key] = 0

    for order in orders:
        month_key = order.created_at.strftime("%b")
        if month_key in month_buckets:
            month_buckets[month_key] += 1

    active_order = next((order for order in orders if _ui_status(order.status) == "in-transit"), None)
    return CustomerDashboardResponse(
        profile=_to_user_profile(user),
        stats=stats,
        active_move=_to_active_move(active_order) if active_order else None,
        recent_orders=[_to_dashboard_order(order) for order in orders[:5]],
        monthly_activity=[CustomerDashboardMonthlyPoint(month=month, count=count) for month, count in month_buckets.items()],
    )


async def get_customer_tracking(db: AsyncSession, user: User) -> CustomerTrackingResponse:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer tracking is only available for individual users")

    orders = (
        await db.execute(
            select(Order).where(Order.customer_id == user.id).order_by(Order.created_at.desc())
        )
    ).scalars().all()

    return CustomerTrackingResponse(
        orders=[
            CustomerTrackingOrder(
                id=order.id,
                tracking_code=order.tracking_code,
                status=order.status,
                ui_status=_ui_status(order.status),
                pickup_addr=order.pickup_addr,
                delivery_addr=order.delivery_addr,
                scheduled_at=order.scheduled_at,
                created_at=order.created_at,
                progress=_progress_for_status(order.status),
                eta_label=_eta_label(order),
                transport_log=_tracking_log(order),
            )
            for order in orders
        ]
    )


async def get_customer_payments(db: AsyncSession, user: User) -> CustomerPaymentsSummary:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer payments are only available for individual users")

    orders = (
        await db.execute(
            select(Order).where(Order.customer_id == user.id).order_by(Order.created_at.desc())
        )
    ).scalars().all()

    records: list[CustomerPaymentRecord] = []
    total_paid = 0.0
    pending_amount = 0.0
    for order in orders:
        payment_status = "completed" if order.payment_status == "paid" or _ui_status(order.status) == "delivered" else "pending"
        if payment_status == "completed":
            total_paid += order.total_amount
        else:
            pending_amount += order.total_amount
        records.append(
            CustomerPaymentRecord(
                id=f"PAY-{str(order.id).split('-')[0].upper()}",
                order_id=order.id,
                tracking_code=order.tracking_code,
                amount=order.total_amount,
                mode=order.payment_mode or "Order Billing",
                status=payment_status,
                created_at=order.created_at,
            )
        )
    return CustomerPaymentsSummary(total_paid=total_paid, pending_amount=pending_amount, records=records)


async def get_customer_profile(user: User) -> CustomerProfileResponse:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer profile is only available for individual users")

    return CustomerProfileResponse(
        profile=_to_user_profile(user),
        alt_phone=user.alt_phone,
        date_of_birth=user.date_of_birth.isoformat() if user.date_of_birth else None,
        address=user.address,
        language=user.preferred_language,
        currency=user.preferred_currency,
        default_payment=user.default_payment_method,
        notification_prefs={
            "push": user.notifications_push,
            "sms": user.notifications_sms,
            "email": user.notifications_email,
            "geofence": user.notifications_geofence,
            "promo": user.notifications_promo,
        },
        privacy_prefs={
            "location": user.privacy_location,
            "analytics": user.privacy_analytics,
            "marketing": user.privacy_marketing,
        },
    )


async def get_customer_quotes(db: AsyncSession, user: User) -> CustomerQuotesResponse:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer quotes are only available for individual users")

    quotes = (
        await db.execute(
            select(CustomerQuoteModel).where(CustomerQuoteModel.customer_id == user.id).order_by(CustomerQuoteModel.created_at.desc())
        )
    ).scalars().all()

    return CustomerQuotesResponse(
        quotes=[
            CustomerQuote(
                id=quote.reference_code,
                cargo_type=quote.cargo_type,
                from_location=quote.from_location,
                to_location=quote.to_location,
                labor_count=quote.labor_count,
                packing=quote.packing,
                total=quote.total_amount,
                date=quote.created_at.date().isoformat(),
                status=quote.status,
            )
            for quote in quotes
        ]
    )


async def convert_customer_quote(db: AsyncSession, user: User, quote_id: str) -> dict:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer quotes are only available for individual users")

    quote = (
        await db.execute(
            select(CustomerQuoteModel).where(CustomerQuoteModel.customer_id == user.id, CustomerQuoteModel.reference_code == quote_id)
        )
    ).scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")

    order = Order(
        tracking_code=f"QC-{uuid.uuid4().hex[:10].upper()}",
        order_type="INDIVIDUAL",
        status="CONFIRMED",
        customer_id=user.id,
        pickup_addr=quote.from_location,
        delivery_addr=quote.to_location,
        cargo_type=quote.cargo_type,
        labor_count=quote.labor_count,
        packing_amount=500 if quote.packing else 0,
        total_amount=quote.total_amount,
        payment_mode=user.default_payment_method,
        payment_status="pending",
        service_otp=str(uuid.uuid4().int)[-4:],
    )
    db.add(order)
    quote.status = "converted"
    db.add(quote)
    await db.flush()

    return {"order_id": str(order.id), "tracking_code": order.tracking_code}


async def get_customer_damage_reports(db: AsyncSession, user: User) -> CustomerDamageReportsResponse:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer damage reports are only available for individual users")

    reports = (
        await db.execute(
            select(DamageReportModel).where(DamageReportModel.customer_id == user.id).order_by(DamageReportModel.created_at.desc())
        )
    ).scalars().all()

    return CustomerDamageReportsResponse(
        reports=[
            CustomerDamageReport(
                id=report.reference_code,
                order_id=str(report.order_id) if report.order_id else "",
                description=report.description,
                photos=report.photos or [],
                status=report.status,
                qr_code=report.qr_code,
                created_at=report.created_at.isoformat(),
            )
            for report in reports
        ]
    )


async def create_customer_damage_report(db: AsyncSession, user: User, data: CustomerDamageReportCreate) -> CustomerDamageReport:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer damage reports are only available for individual users")

    report = DamageReportModel(
        reference_code=f"DMG-{uuid.uuid4().hex[:6].upper()}",
        customer_id=user.id,
        order_id=uuid.UUID(data.order_id) if data.order_id else None,
        description=data.description,
        photos=data.photos,
        status="reported",
        qr_code=f"QR-{uuid.uuid4().hex[:8].upper()}",
    )
    db.add(report)
    await db.flush()

    return CustomerDamageReport(
        id=report.reference_code,
        order_id=str(report.order_id) if report.order_id else "",
        description=report.description,
        photos=report.photos or [],
        status=report.status,
        qr_code=report.qr_code,
        created_at=report.created_at.isoformat() if report.created_at else datetime.now().isoformat(),
    )


async def get_customer_settings(user: User) -> CustomerSettingsResponse:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer settings are only available for individual users")

    return CustomerSettingsResponse(
        settings=CustomerSettings(
            language=user.preferred_language,
            currency=user.preferred_currency,
            default_payment=user.default_payment_method,
            notification_prefs={
                "push": user.notifications_push,
                "sms": user.notifications_sms,
                "email": user.notifications_email,
                "geofence": user.notifications_geofence,
                "promo": user.notifications_promo,
            },
            privacy_prefs={
                "location": user.privacy_location,
                "analytics": user.privacy_analytics,
                "marketing": user.privacy_marketing,
            },
        )
    )


async def update_customer_settings(db: AsyncSession, user: User, settings: CustomerSettings) -> CustomerSettingsResponse:
    if user.role.name != "INDIVIDUAL":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer settings are only available for individual users")

    user.preferred_language = settings.language
    user.preferred_currency = settings.currency
    user.default_payment_method = settings.default_payment
    user.notifications_push = settings.notification_prefs.get("push", True)
    user.notifications_sms = settings.notification_prefs.get("sms", bool(user.phone))
    user.notifications_email = settings.notification_prefs.get("email", True)
    user.notifications_geofence = settings.notification_prefs.get("geofence", True)
    user.notifications_promo = settings.notification_prefs.get("promo", False)
    user.privacy_location = settings.privacy_prefs.get("location", True)
    user.privacy_analytics = settings.privacy_prefs.get("analytics", True)
    user.privacy_marketing = settings.privacy_prefs.get("marketing", False)
    db.add(user)
    await db.flush()

    return CustomerSettingsResponse(settings=settings)

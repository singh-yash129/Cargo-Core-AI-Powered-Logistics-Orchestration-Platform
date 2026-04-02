from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.orders import (
    BatchConfirmRequest,
    CancelOrderRequest,
    ClusterResponse,
    DeliveryOtpSendResponse,
    OrderAssignmentPreview,
    OrderAssignRequest,
    OrderCreate,
    OrderItemResponse,
    OrderItemUpsert,
    OrderListResponse,
    OrderResponse,
    OrderUpdate,
)
from app.schemas.wallet import WalletPaymentRequest, WalletPaymentResponse
from app.services import orders_service
from app.services import clustering_service
from app.services import wallet_service

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    return await orders_service.create_order(db, data, user)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None),
):
    return await orders_service.list_orders(db, user, page, page_size, status_filter)


@router.get("/assignment-preview", response_model=OrderAssignmentPreview)
async def get_assignment_preview(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    warehouse_id: UUID | None = Query(default=None),
):
    return await orders_service.get_order_assignment_preview(db, warehouse_id)


@router.post("/cluster")
async def cluster_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER"))],
    radius_km: float = Query(default=5.0, ge=1.0, le=50.0),
):
    from app.models.order import Order
    from sqlalchemy import select
    from app.schemas.orders import ClusterOrderItem, OrderCluster

    orders = (
        await db.execute(select(Order).where(Order.status == "CONFIRMED").order_by(Order.created_at.desc()))
    ).scalars().all()

    clusters, unbatched = await clustering_service.cluster_orders(db, list(orders), radius_km=radius_km)

    def _to_item(order):
        return ClusterOrderItem(
            id=order.id, tracking_code=order.tracking_code,
            delivery_addr=order.delivery_addr, pickup_addr=order.pickup_addr,
            cargo_type=order.cargo_type, vehicle_type=order.vehicle_type,
            total_amount=order.total_amount, scheduled_at=order.scheduled_at,
            delivery_lat=order.delivery_lat, delivery_lng=order.delivery_lng,
        )

    cluster_results = []
    for c in clusters:
        cluster_results.append(OrderCluster(
            cluster_id=c.cluster_id,
            centroid_lat=c.centroid_lat, centroid_lng=c.centroid_lng,
            orders=[_to_item(g.order) for g in c.orders],
            total_distance_km=c.total_distance_km,
            efficiency_pct=c.efficiency_pct,
            total_weight=sum(g.order.total_amount for g in c.orders),
            time_window=c.time_window,
            order_count=len(c.orders),
        ))

    avg_eff = sum(c.efficiency_pct for c in clusters) / len(clusters) if clusters else 0
    total_clustered = sum(len(c.orders) for c in clusters)
    total_orders = total_clustered + len(unbatched)
    miles_saved = avg_eff * 0.35 if clusters else 0  # rough estimate

    return ClusterResponse(
        clusters=cluster_results,
        unbatched=[_to_item(o) for o in unbatched],
        total_orders=total_orders,
        estimated_miles_saved_pct=round(miles_saved, 1),
        avg_efficiency_pct=round(avg_eff, 1),
    ).model_dump(mode="json")


@router.post("/optimize-routes")
async def optimize_routes(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER"))],
    optimize_for: str = "distance",
    prioritize_urgent: bool = False,
):
    return await orders_service.optimize_routes(db, optimize_for=optimize_for, prioritize_urgent=prioritize_urgent)


@router.post("/batch-assign")
async def batch_assign_orders(
    data: BatchConfirmRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER"))],
):
    from app.schemas.orders import OrderAssignRequest

    results = []
    for a in data.assignments:
        result = await orders_service.assign_order(
            db, a.order_id, OrderAssignRequest(driver_id=a.driver_id, vehicle_id=a.vehicle_id)
        )
        results.append(result)
    return [r.model_dump(mode="json") for r in results]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    return await orders_service.get_order_detail(db, order_id, user)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: UUID,
    data: OrderUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    return await orders_service.update_order(db, order_id, user, data)


@router.post("/{order_id}/confirm", response_model=OrderResponse)
async def confirm_order(
    order_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("LOGISTIC_MANAGER", "WAREHOUSE_MANAGER"))],
):
    return await orders_service.confirm_order(db, order_id, user)


@router.post("/{order_id}/assign", response_model=OrderResponse)
async def assign_order(
    order_id: UUID,
    data: OrderAssignRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER"))],
):
    return await orders_service.assign_order(db, order_id, data)


@router.post("/{order_id}/transition", response_model=OrderResponse)
async def transition_order(
    order_id: UUID,
    data: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER", "DRIVER"))],
):
    return await orders_service.transition_order(db, order_id, data.get("next_status", ""), caller=user)


@router.post("/{order_id}/complete-return", response_model=OrderResponse)
async def complete_return_order(
    order_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("DRIVER"))],
):
    """Driver calls this to complete a reverse-logistics (PARCEL_PICKUP) job.
    Transitions order to DELIVERED, sets warehouse_substatus=RETURN_ARRIVED,
    and auto-creates a pending ReturnGrading for the Warehouse Manager queue.
    """
    return await orders_service.complete_return_order(db, order_id, caller=user)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: UUID,
    data: CancelOrderRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    result = await orders_service.cancel_order(db, order_id, data, user)
    await db.commit()
    return result


@router.post("/{order_id}/wallet-pay", response_model=WalletPaymentResponse)
async def pay_order_with_wallet(
    order_id: UUID,
    data: WalletPaymentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    from app.models.order import Order as _Order
    from sqlalchemy import select as _select

    order = (await db.execute(_select(_Order).where(_Order.id == order_id))).scalar_one_or_none()
    if order is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Order not found")

    result = await wallet_service.apply_wallet_payment(
        db,
        order=order,
        user=user,
        amount=data.amount,
    )
    await db.commit()
    return result


@router.get("/track/{tracking_code}")
async def track_order(tracking_code: str, db: Annotated[AsyncSession, Depends(get_db)]):
    return await orders_service.track_order(db, tracking_code)


@router.get("/{order_id}/items", response_model=list[OrderItemResponse])
async def get_order_items(
    order_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(get_current_user)],
):
    return await orders_service.get_order_items(db, order_id)


@router.post("/{order_id}/items", response_model=list[OrderItemResponse])
async def upsert_items(
    order_id: UUID,
    items: list[OrderItemUpsert],
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(get_current_user)],
):
    return await orders_service.upsert_order_items(db, order_id, items)


from pydantic import BaseModel, Field


class DeliveryOtpSendRequest(BaseModel):
    force_resend: bool = False


class PODRequest(BaseModel):
    otp_code: str | None = None
    image_data: str | None = None
    images_data: list[str] = []
    signature_data: str | None = None
    customer_name: str | None = None
    notes: str | None = None


@router.post("/{order_id}/delivery-otp/send", response_model=DeliveryOtpSendResponse)
async def send_delivery_otp(
    order_id: UUID,
    data: DeliveryOtpSendRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("DRIVER"))],
):
    return await orders_service.send_delivery_otp(db, order_id, user, force_resend=data.force_resend)

@router.post("/{order_id}/proof-of-delivery", response_model=OrderResponse)
async def upload_proof_of_delivery(
    order_id: UUID,
    data: PODRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("DRIVER"))],
):
    return await orders_service.upload_proof_of_delivery(
        db,
        order_id,
        user,
        otp_code=data.otp_code,
        image_data=data.image_data,
        images_data=data.images_data,
        signature_data=data.signature_data,
        customer_name=data.customer_name,
        notes=data.notes,
    )


@router.get("/{order_id}/proof-of-delivery", response_class=HTMLResponse)
async def get_proof_of_delivery_html(
    order_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Generate and return Proof of Delivery HTML document with real data."""
    from pathlib import Path
    from datetime import datetime

    # Fetch order with POD data
    order = await orders_service.get_order_detail(db, order_id, user)

    # Debug logging
    print(f"[POD HTML] Order {order.id}")
    print(f"[POD HTML] Driver: {order.assigned_driver_name}")
    print(f"[POD HTML] Customer: {order.customer_name} / {order.customer_phone}")
    print(f"[POD HTML] Signature length: {len(order.pod_signature) if order.pod_signature else 0}")
    print(f"[POD HTML] Photos count: {len(order.pod_photos)}")
    print(f"[POD HTML] Delivered at: {order.delivered_at}")

    # Read HTML template
    template_path = Path(__file__).parent.parent.parent.parent / "html-slips" / "ProofOfDelivery.html"
    with open(template_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Get driver details
    driver_name = order.assigned_driver_name or "Driver"
    driver_code = f"DRV-{str(order.assigned_driver_id)[-4:]}" if order.assigned_driver_id else ""

    # Format delivery date/time
    delivery_date = "N/A"
    delivery_time = "N/A"
    if order.delivered_at:
        dt = datetime.fromisoformat(str(order.delivered_at)) if isinstance(order.delivered_at, str) else order.delivered_at
        delivery_date = dt.strftime("%B %d, %Y")
        delivery_time = dt.strftime("%I:%M %p").upper()

    # Customer details
    customer_name = order.customer_name or "Customer"
    customer_phone = order.customer_phone or "N/A"

    # Address details - split delivery_addr
    delivery_address_parts = (order.delivery_addr or "N/A").split(",")
    delivery_address = delivery_address_parts[0].strip() if delivery_address_parts else "N/A"
    delivery_city = delivery_address_parts[1].strip() if len(delivery_address_parts) > 1 else ""
    delivery_state_zip = delivery_address_parts[2].strip() if len(delivery_address_parts) > 2 else ""

    # POD signature (base64)
    signature_html = ""
    if order.pod_signature and len(order.pod_signature.strip()) > 0:
        # If signature already has data:image prefix, use as is; otherwise add it
        sig_data = order.pod_signature if order.pod_signature.startswith('data:') else f'data:image/png;base64,{order.pod_signature}'
        signature_html = f'<img src="{sig_data}" alt="Customer Signature" class="w-full h-full object-contain"/>'
    else:
        # Empty placeholder for missing signature
        signature_html = '<div class="text-center text-gray-400 text-xs flex items-center justify-center h-full">No signature captured</div>'

    # POD photos (base64)
    photos_html = ""
    if order.pod_photos and len(order.pod_photos) > 0:
        for idx, photo in enumerate(order.pod_photos[:3]):  # Max 3 photos
            photo_data = photo if photo.startswith('data:') else f'data:image/jpeg;base64,{photo}'
            timestamp = delivery_time if idx == 0 else f"{delivery_time}"
            photos_html += f'''
            <div class="border-2 border-gray-300 rounded p-3 text-center bg-gray-50">
              <div class="w-full h-[100px] bg-gray-200 rounded flex items-center justify-center mb-2 overflow-hidden">
                <img src="{photo_data}" alt="POD Photo {idx+1}" class="w-full h-full object-cover"/>
              </div>
              <p class="text-[10px] text-gray-700 font-semibold">Proof Photo {idx+1}</p>
              <p class="text-[9px] text-gray-500">{timestamp}</p>
            </div>
            '''
    else:
        # Default placeholder
        photos_html = '''
            <div class="border-2 border-gray-300 rounded p-3 text-center bg-gray-50">
              <div class="w-full h-[100px] bg-gray-200 rounded flex items-center justify-center mb-2">
                <span class="text-[35px]">📷</span>
              </div>
              <p class="text-[10px] text-gray-700 font-semibold">No photos captured</p>
            </div>
        '''

    # Replace placeholders in HTML
    replacements = {
        "CC-12345": str(order.tracking_code) if order.tracking_code else str(order.id)[:8].upper(),
        "December 20, 2024": delivery_date,
        "01:45 PM": delivery_time,
        "Sarah Khan": customer_name,
        "+91 98765 43210": customer_phone,
        "Prakash Reddy (DRV-8765)": f"{driver_name} ({driver_code})" if driver_code else driver_name,
        "456 Maple Avenue, Indiranagar": delivery_address,
        "Bangalore, Karnataka - 560038": f"{delivery_city}, {delivery_state_zip}".strip(" ,-") if delivery_city else delivery_state_zip,

        # Replace signature box with actual signature
        '<div class="border-2 border-gray-400 rounded h-[60px] bg-white mb-2"></div>':
            f'<div class="border-2 border-gray-400 rounded h-[60px] bg-white mb-2 overflow-hidden flex items-center justify-center">{signature_html}</div>',

        # Photos section - replace entire grid
        '''<div class="grid grid-cols-3 gap-3">
            <div class="border-2 border-gray-300 rounded p-3 text-center bg-gray-50">
              <div class="w-full h-[100px] bg-gray-200 rounded flex items-center justify-center mb-2">
                <span class="text-[35px]">📷</span>
              </div>
              <p class="text-[10px] text-gray-700 font-semibold">Before Unloading</p>
              <p class="text-[9px] text-gray-500">12:05 PM</p>
            </div>
            <div class="border-2 border-gray-300 rounded p-3 text-center bg-gray-50">
              <div class="w-full h-[100px] bg-gray-200 rounded flex items-center justify-center mb-2">
                <span class="text-[35px]">📷</span>
              </div>
              <p class="text-[10px] text-gray-700 font-semibold">Items at Location</p>
              <p class="text-[9px] text-gray-500">01:20 PM</p>
            </div>
            <div class="border-2 border-gray-300 rounded p-3 text-center bg-gray-50">
              <div class="w-full h-[100px] bg-gray-200 rounded flex items-center justify-center mb-2">
                <span class="text-[35px]">📷</span>
              </div>
              <p class="text-[10px] text-gray-700 font-semibold">After Placement</p>
              <p class="text-[9px] text-gray-500">01:42 PM</p>
            </div>
          </div>''': f'<div class="grid grid-cols-3 gap-3">{photos_html}</div>',
    }

    for old, new in replacements.items():
        html_content = html_content.replace(old, new)

    return html_content



class PayOrderRequest(BaseModel):
    payment_ref: str | None = None
    payment_mode: str = "ONLINE"     # ONLINE | COD | PARTIAL
    payment_method: str | None = None
    amount: float | None = None      # defaults to order.total_amount
    notes: str | None = None


@router.post("/{order_id}/pay")
async def pay_order(
    order_id: UUID,
    data: PayOrderRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Record a payment for an order. Online (Razorpay) or COD by driver."""
    from app.services import finance_service
    from app.models.order import Order as _Order
    from sqlalchemy import select as _select

    order = (await db.execute(_select(_Order).where(_Order.id == order_id))).scalar_one_or_none()
    if order is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Order not found")

    amount = data.amount if (data.amount and data.amount > 0) else order.total_amount

    pmt = await finance_service.record_order_payment(
        db=db,
        order_id=order_id,
        amount=amount,
        payment_mode=data.payment_mode,
        payment_method=data.payment_method,
        payment_ref=data.payment_ref,
        collected_by_user=user if data.payment_mode.upper() == "COD" else None,
        notes=data.notes,
    )
    await db.commit()

    return {
        "payment_id": str(pmt.id),
        "payment_ref": pmt.payment_ref,
        "order_id": str(order_id),
        "amount": pmt.amount,
        "status": pmt.status,
        "payment_mode": pmt.payment_mode,
        "payment_method": pmt.payment_method,
    }


class HouseShiftSignoffRequest(BaseModel):
    signature_data: str
    customer_name: str | None = None
    notes: str | None = None


@router.post("/{order_id}/house-shift-signoff", response_model=OrderResponse)
async def house_shift_signoff(
    order_id: UUID,
    data: HouseShiftSignoffRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("DRIVER"))],
):
    """Complete a house-shift job with customer sign-off signature (no OTP required)."""
    return await orders_service.house_shift_signoff(
        db,
        order_id,
        user,
        signature_data=data.signature_data,
        customer_name=data.customer_name,
        notes=data.notes,
    )


class JobRatingRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback: str | None = None


@router.post("/{order_id}/job-rating", response_model=OrderResponse)
async def submit_job_rating(
    order_id: UUID,
    data: JobRatingRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("DRIVER"))],
):
    """Submit driver's self-rating (1–5 stars) and optional feedback for a completed job."""
    return await orders_service.submit_job_rating(
        db,
        order_id,
        user,
        rating=data.rating,
        feedback=data.feedback,
    )

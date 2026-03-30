import random
import string
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.payment import OrderPayment
from app.models.user import User
from app.models.wallet import WalletTransaction

WALLET_PAYMENT_MODE = "WALLET"
REFUND_PAYMENT_MODE = "REFUND"


def _wallet_ref(prefix: str) -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return f"{prefix}-{suffix}"


async def get_wallet_balance(db: AsyncSession, user_id: UUID) -> float:
    result = await db.execute(
        select(
            func.coalesce(
                func.sum(
                    case(
                        (WalletTransaction.transaction_kind == "CREDIT", WalletTransaction.amount),
                        else_=-WalletTransaction.amount,
                    )
                ),
                0.0,
            )
        ).where(WalletTransaction.user_id == user_id)
    )
    return max(float(result.scalar_one() or 0.0), 0.0)


async def get_wallet_summary(db: AsyncSession, user: User):
    balance = await get_wallet_balance(db, user.id)

    totals = await db.execute(
        select(
            func.coalesce(
                func.sum(case((WalletTransaction.transaction_kind == "CREDIT", WalletTransaction.amount), else_=0.0)),
                0.0,
            ),
            func.coalesce(
                func.sum(case((WalletTransaction.transaction_kind == "DEBIT", WalletTransaction.amount), else_=0.0)),
                0.0,
            ),
        ).where(WalletTransaction.user_id == user.id)
    )
    total_credits, total_debits = totals.one()

    rows = (
        await db.execute(
            select(WalletTransaction, Order.tracking_code)
            .outerjoin(Order, Order.id == WalletTransaction.order_id)
            .where(WalletTransaction.user_id == user.id)
            .order_by(WalletTransaction.created_at.desc())
            .limit(20)
        )
    ).all()

    from app.schemas.wallet import WalletSummary, WalletTransactionRecord

    return WalletSummary(
        balance=round(balance, 2),
        total_credits=round(float(total_credits or 0.0), 2),
        total_debits=round(float(total_debits or 0.0), 2),
        transactions=[
            WalletTransactionRecord(
                id=tx.id,
                order_id=tx.order_id,
                tracking_code=tracking_code,
                transaction_kind=tx.transaction_kind,
                reason=tx.reason,
                amount=round(float(tx.amount or 0.0), 2),
                description=tx.description,
                created_at=tx.created_at,
            )
            for tx, tracking_code in rows
        ],
    )


async def _record_wallet_transaction(
    db: AsyncSession,
    *,
    user_id: UUID,
    amount: float,
    transaction_kind: str,
    reason: str,
    description: str,
    order_id: UUID | None = None,
) -> WalletTransaction:
    tx = WalletTransaction(
        user_id=user_id,
        order_id=order_id,
        transaction_kind=transaction_kind,
        reason=reason,
        amount=round(float(amount), 2),
        description=description,
    )
    db.add(tx)
    await db.flush()
    return tx


async def apply_wallet_payment(
    db: AsyncSession,
    *,
    order: Order,
    user: User,
    amount: float | None = None,
):
    if order.customer_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    outstanding = max(float(order.total_amount or 0.0) - float(order.paid_amount or 0.0), 0.0)
    if outstanding <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already fully paid")

    available = await get_wallet_balance(db, user.id)
    requested = float(amount) if amount else outstanding
    applied = min(requested, outstanding, available)

    if applied <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient wallet balance")

    await _record_wallet_transaction(
        db,
        user_id=user.id,
        order_id=order.id,
        transaction_kind="DEBIT",
        reason="ORDER_PAYMENT",
        amount=applied,
        description=f"Wallet payment applied to {order.tracking_code}",
    )

    db.add(
        OrderPayment(
            order_id=order.id,
            payment_ref=_wallet_ref("WLT"),
            payment_mode=WALLET_PAYMENT_MODE,
            payment_method="Internal Wallet",
            amount=applied,
            status="completed",
            notes="Wallet credit applied",
        )
    )

    order.paid_amount = float(order.paid_amount or 0.0) + applied
    order.payment_status = "paid" if order.paid_amount >= order.total_amount else "partial"
    db.add(order)
    await db.flush()

    from app.schemas.wallet import WalletPaymentResponse

    return WalletPaymentResponse(
        order_id=order.id,
        tracking_code=order.tracking_code,
        applied_amount=round(applied, 2),
        remaining_wallet_balance=round(await get_wallet_balance(db, user.id), 2),
        paid_amount=round(float(order.paid_amount or 0.0), 2),
        payment_status=order.payment_status,
    )


async def credit_cancellation_refund(
    db: AsyncSession,
    *,
    order: Order,
    refund_amount: float,
    fee_amount: float,
) -> float:
    total_paid = float(order.paid_amount or 0.0)
    # Clamp refund to what was actually paid (if recorded). If paid_amount is 0 (legacy/inferred
    # payment), allow the full requested refund_amount through so the wallet is credited.
    if total_paid > 0:
        refund_amount = round(min(refund_amount, total_paid), 2)
    else:
        refund_amount = round(refund_amount, 2)

    if refund_amount <= 0:
        return 0.0

    payment_rows = (
        await db.execute(
            select(OrderPayment).where(
                OrderPayment.order_id == order.id,
                OrderPayment.status == "completed",
            )
        )
    ).scalars().all()

    wallet_paid = sum(float(row.amount or 0.0) for row in payment_rows if row.payment_mode == WALLET_PAYMENT_MODE and row.amount > 0)
    external_paid = sum(
        float(row.amount or 0.0)
        for row in payment_rows
        if row.payment_mode not in {WALLET_PAYMENT_MODE, REFUND_PAYMENT_MODE} and row.amount > 0
    )

    # Always credit the wallet with the full refund amount
    await _record_wallet_transaction(
        db,
        user_id=order.customer_id,
        order_id=order.id,
        transaction_kind="CREDIT",
        reason="CANCELLATION_REFUND",
        amount=refund_amount,
        description=f"Cancellation refund for {order.tracking_code}",
    )

    # Only create OrderPayment reversal rows when there are matching payment records
    if external_paid > 0:
        wallet_restore = min(wallet_paid, refund_amount)
        external_refund = max(refund_amount - wallet_restore, 0.0)
        if external_refund > 0:
            refund_entry_amount = round(min(external_refund, external_paid), 2)
            db.add(
                OrderPayment(
                    order_id=order.id,
                    payment_ref=_wallet_ref("RFD"),
                    payment_mode=REFUND_PAYMENT_MODE,
                    payment_method="Wallet Credit",
                    amount=-refund_entry_amount,
                    status="completed",
                    notes=f"Cancellation refund credited to wallet after fee INR {round(fee_amount, 2)}",
                )
            )

            # Create a LogisticsTransaction reversal so the Logistics Manager
            # transaction history reflects the revenue being returned to the customer.
            from app.models.logistics import LogisticsTransaction
            from app.services.finance_service import _upsert_daily_stats, _gen_ref

            db.add(
                LogisticsTransaction(
                    transaction_code=_gen_ref("RFD"),
                    description=f"Cancellation refund for {order.tracking_code} - INR {refund_entry_amount} returned to customer wallet",
                    transaction_type="REVENUE_REFUND",
                    amount=-refund_entry_amount,   # negative = revenue reversal
                    status="Completed",
                    metadata_json={
                        "order_id": str(order.id),
                        "tracking_code": order.tracking_code,
                        "cancellation_fee": round(fee_amount, 2),
                        "refund_amount": refund_entry_amount,
                    },
                )
            )

            # Decrement daily stats revenue by the refunded amount
            await _upsert_daily_stats(db, delta_revenue=-refund_entry_amount)
    else:
        # No recorded payment rows — the refund was inferred from payment_status='paid'.
        # Still record a logistics transaction reversal for accounting accuracy.
        from app.models.logistics import LogisticsTransaction
        from app.services.finance_service import _upsert_daily_stats, _gen_ref

        db.add(
            LogisticsTransaction(
                transaction_code=_gen_ref("RFD"),
                description=f"Cancellation refund for {order.tracking_code} - INR {round(refund_amount, 2)} returned to customer wallet",
                transaction_type="REVENUE_REFUND",
                amount=-round(refund_amount, 2),
                status="Completed",
                metadata_json={
                    "order_id": str(order.id),
                    "tracking_code": order.tracking_code,
                    "cancellation_fee": round(fee_amount, 2),
                    "refund_amount": round(refund_amount, 2),
                },
            )
        )
        await _upsert_daily_stats(db, delta_revenue=-round(refund_amount, 2))

    order.paid_amount = max(total_paid - refund_amount, 0.0)
    if order.paid_amount <= 0:
        order.payment_status = "refunded"
    else:
        order.payment_status = "partially_refunded"
    db.add(order)
    await db.flush()
    return refund_amount

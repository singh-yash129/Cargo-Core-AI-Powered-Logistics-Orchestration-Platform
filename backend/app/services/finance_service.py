"""
Finance Service
Live-computes revenue and expense aggregations from the database.
All numbers come from real DB rows — zero when tables are empty.
"""
import uuid
import random
import string
from datetime import datetime, timezone, date, timedelta
from uuid import UUID

from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.logistics import LogisticsTransaction, LogisticsDailyStats
from app.models.order import Order
from app.models.payment import OrderPayment
from app.models.user import User


# ── helpers ────────────────────────────────────────────────────────────────

def _today() -> date:
    return datetime.now(timezone.utc).date()


def _gen_ref(prefix: str = "PAY") -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return f"{prefix}-{suffix}"


async def _upsert_daily_stats(db: AsyncSession, delta_revenue: float = 0.0) -> None:
    """Add delta_revenue to today's LogisticsDailyStats row (upsert)."""
    today = _today()
    row = (
        await db.execute(
            select(LogisticsDailyStats).where(LogisticsDailyStats.stat_date == today)
        )
    ).scalar_one_or_none()
    if row is None:
        row = LogisticsDailyStats(
            stat_date=today,
            orders_count=0,
            revenue=0.0,
            deliveries_completed=0,
            deliveries_failed=0,
            sla_compliance=95.0,
        )
        db.add(row)
    row.revenue = (row.revenue or 0.0) + delta_revenue
    db.add(row)


# ── core payment recorder ──────────────────────────────────────────────────

async def record_order_payment(
    db: AsyncSession,
    order_id: UUID,
    amount: float,
    payment_mode: str,           # ONLINE | COD | PARTIAL
    payment_method: str | None,  # "UPI | GPay", "Card ending 4242", etc.
    payment_ref: str | None,     # Razorpay pay_XXXX or None (auto-generated)
    collected_by_user: User | None = None,
    notes: str | None = None,
) -> OrderPayment:
    """
    Record a payment event:
      1. Creates OrderPayment row
      2. Updates Order.paid_amount + payment_status
      3. Creates LogisticsTransaction (type=REVENUE_ONLINE/COD)
      4. Updates LogisticsDailyStats.revenue
    """
    from app.models.order import Order

    order = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if order is None:
        from fastapi import HTTPException, status as http_status
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Order not found")

    ref = payment_ref or _gen_ref("PAY")

    # 1. OrderPayment row
    pmt = OrderPayment(
        order_id=order_id,
        payment_ref=ref,
        payment_mode=payment_mode.upper(),
        payment_method=payment_method,
        amount=amount,
        status="completed",
        collected_by=collected_by_user.id if collected_by_user else None,
        notes=notes,
    )
    db.add(pmt)

    # 2. Update Order
    order.paid_amount = (order.paid_amount or 0.0) + amount
    if order.paid_amount >= order.total_amount:
        order.payment_status = "paid"
    elif order.paid_amount > 0:
        order.payment_status = "partial"
    db.add(order)

    # 3. LogisticsTransaction
    tx_type = "REVENUE_COD" if payment_mode.upper() == "COD" else "REVENUE_ONLINE"
    tx = LogisticsTransaction(
        transaction_code=ref,
        description=f"Order {order.tracking_code} — {payment_method or payment_mode}",
        transaction_type=tx_type,
        amount=amount,
        status="Completed",
        metadata_json={
            "order_id": str(order_id),
            "tracking_code": order.tracking_code,
            "payment_mode": payment_mode,
            "payment_method": payment_method,
            "collected_by": str(collected_by_user.id) if collected_by_user else None,
        },
    )
    db.add(tx)

    # 4. Daily stats
    await _upsert_daily_stats(db, delta_revenue=amount)

    await db.flush()
    return pmt


# ── expense recorder ────────────────────────────────────────────────────────

LABOUR_RATE_PER_HEAD = 800.0      # ₹/laborer
DRIVER_SHIFT_RATE = 1200.0        # ₹ flat per shift
FUEL_RATE_PER_KM = {
    "mini": 8, "tempo": 10, "lcv": 14, "hcv": 20,
}
WAREHOUSE_FEE_RATIO = 0.05        # 5% of total as warehouse handling fee


async def record_expense(
    db: AsyncSession,
    expense_type: str,   # EXPENSE_LABOUR | EXPENSE_DRIVER | EXPENSE_FUEL | EXPENSE_WAREHOUSE | EXPENSE_PROCUREMENT
    amount: float,
    description: str,
    order_id: UUID | None = None,
    tracking_code: str | None = None,
    extra_metadata: dict | None = None,
) -> None:
    """Write a LogisticsTransaction expense row (does NOT touch daily stats revenue)."""
    if amount <= 0:
        return
    ref = _gen_ref("EXP")
    meta = {
        "order_id": str(order_id) if order_id else None,
        "tracking_code": tracking_code,
    }
    if extra_metadata:
        meta.update(extra_metadata)
    tx = LogisticsTransaction(
        transaction_code=ref,
        description=description,
        transaction_type=expense_type,
        amount=-abs(amount),   # expenses are negative
        status="Completed",
        metadata_json=meta,
    )
    db.add(tx)


async def create_capital_investment(
    db: AsyncSession,
    amount: float,
    description: str,
    funding_source: str,
    warehouse_id: UUID | None = None,
    investment_date: str | None = None,
) -> dict:
    """Record an offline capital injection (cash, bank transfer, owner equity, etc.)."""
    ref = _gen_ref("CAP")
    tx = LogisticsTransaction(
        transaction_code=ref,
        warehouse_id=warehouse_id,
        description=description,
        transaction_type="CAPITAL_INVESTMENT",
        amount=abs(amount),   # positive — money coming in
        status="Completed",
        metadata_json={
            "funding_source": funding_source,
            "investment_date": investment_date,
        },
    )
    db.add(tx)
    await db.flush()
    return {
        "id": str(tx.id),
        "transaction_code": tx.transaction_code,
        "description": tx.description,
        "transaction_type": tx.transaction_type,
        "amount": tx.amount,
        "funding_source": funding_source,
        "status": tx.status,
    }


# ── aggregation (for the /finance/summary endpoint) ─────────────────────────

async def get_finance_summary(db: AsyncSession) -> dict:
    # Total revenue from completed order payments
    rev_result = await db.execute(
        select(func.coalesce(func.sum(OrderPayment.amount), 0.0))
        .where(OrderPayment.status == "completed", OrderPayment.payment_mode != "WALLET")
    )
    total_revenue: float = rev_result.scalar_one()

    # Total expenses (negative transactions, excluding revenue refunds which are already
    # deducted from total_revenue via the negative OrderPayment rows)
    exp_result = await db.execute(
        select(func.coalesce(func.sum(LogisticsTransaction.amount), 0.0))
        .where(
            LogisticsTransaction.amount < 0,
            LogisticsTransaction.transaction_type != "REVENUE_REFUND",
        )
    )
    total_expenses: float = abs(exp_result.scalar_one())

    # Total refunds issued (cancellation refunds credited back to customer wallet)
    refunds_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(LogisticsTransaction.amount)), 0.0))
        .where(LogisticsTransaction.transaction_type == "REVENUE_REFUND")
    )
    total_refunds_issued: float = float(refunds_result.scalar_one())

    # Expense breakdown by type (exclude REVENUE_REFUND — it's a revenue reversal)
    breakdown_result = await db.execute(
        select(
            LogisticsTransaction.transaction_type,
            func.coalesce(func.sum(func.abs(LogisticsTransaction.amount)), 0.0),
        )
        .where(
            LogisticsTransaction.amount < 0,
            LogisticsTransaction.transaction_type != "REVENUE_REFUND",
        )
        .group_by(LogisticsTransaction.transaction_type)
    )
    expense_breakdown = {row[0]: round(row[1], 2) for row in breakdown_result.all()}

    # Pending COD (orders paid=pending + mode=COD)
    cod_pending_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0.0))
        .where(Order.payment_mode.ilike("COD"), Order.payment_status == "pending")
    )
    pending_cod: float = cod_pending_result.scalar_one()

    # Revenue by day — last 30 days from LogisticsDailyStats
    thirty_ago = _today() - timedelta(days=29)
    daily_result = await db.execute(
        select(LogisticsDailyStats.stat_date, LogisticsDailyStats.revenue)
        .where(LogisticsDailyStats.stat_date >= thirty_ago)
        .order_by(LogisticsDailyStats.stat_date)
    )
    revenue_by_day = [
        {"date": str(row[0]), "revenue": round(row[1], 2)}
        for row in daily_result.all()
    ]

    # Order counts
    order_count_result = await db.execute(select(func.count(Order.id)))
    total_orders: int = order_count_result.scalar_one()

    delivered_result = await db.execute(
        select(func.count(Order.id)).where(Order.status == "DELIVERED")
    )
    delivered_orders: int = delivered_result.scalar_one()

    # Revenue by type (online vs COD)
    rev_by_type_result = await db.execute(
        select(
            OrderPayment.payment_mode,
            func.coalesce(func.sum(OrderPayment.amount), 0.0),
        )
        .where(OrderPayment.status == "completed", OrderPayment.payment_mode != "WALLET")
        .group_by(OrderPayment.payment_mode)
    )
    revenue_by_mode = {row[0]: round(row[1], 2) for row in rev_by_type_result.all()}

    # Total payroll due: sum of EXPENSE_DRIVER + EXPENSE_LABOUR transactions (these are negative)
    payroll_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(LogisticsTransaction.amount)), 0.0))
        .where(LogisticsTransaction.transaction_type.in_(["EXPENSE_DRIVER", "EXPENSE_LABOUR"]))
    )
    total_payroll_due: float = float(payroll_result.scalar_one())

    # Procurement expenses (auto-created on restock approval)
    procurement_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(LogisticsTransaction.amount)), 0.0))
        .where(LogisticsTransaction.transaction_type == "EXPENSE_PROCUREMENT")
    )
    procurement_expenses: float = float(procurement_result.scalar_one())

    # Capital investments (offline money injected)
    capital_result = await db.execute(
        select(func.coalesce(func.sum(LogisticsTransaction.amount), 0.0))
        .where(LogisticsTransaction.transaction_type == "CAPITAL_INVESTMENT")
    )
    capital_invested: float = float(capital_result.scalar_one())

    return {
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(total_revenue - total_expenses, 2),
        "pending_cod": round(pending_cod, 2),
        "total_payroll_due": round(total_payroll_due, 2),
        "procurement_expenses": round(procurement_expenses, 2),
        "capital_invested": round(capital_invested, 2),
        "total_refunds_issued": round(total_refunds_issued, 2),
        "total_orders": total_orders,
        "delivered_orders": delivered_orders,
        "revenue_by_day": revenue_by_day,
        "expense_breakdown": expense_breakdown,
        "revenue_by_mode": revenue_by_mode,
    }

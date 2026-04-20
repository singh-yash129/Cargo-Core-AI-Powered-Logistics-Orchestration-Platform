"""
Finance Router — live revenue & expense aggregations.
Accessible to LOGISTIC_MANAGER (and optionally DISPATCHER for read-only).
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.services import finance_service

router = APIRouter(prefix="/api/v1/finance", tags=["Finance"])


class PayrollUserPayout(BaseModel):
    user_id: str
    amount: float
    record_type: str = "staff"  # 'staff' | 'driver'
    name: str = ""


class PayrollRunRequest(BaseModel):
    user_payouts: list[PayrollUserPayout]


@router.get("/summary")
async def get_finance_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER"))],
    warehouse_id: UUID | None = Query(default=None),
) -> dict:
    """
    Live-computed financial summary.
    Returns ₹0 for all values when the database is empty.
    """
    return await finance_service.get_finance_summary(db, warehouse_id=warehouse_id)


@router.post("/payroll/run")
async def run_payroll(
    data: PayrollRunRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER"))],
) -> dict:
    """
    Record a payroll batch run. Creates one PAYROLL_RUN transaction per user so
    the bootstrap can mark those users as paid for the current month.
    """
    result = await finance_service.run_payroll(
        db,
        [p.model_dump() for p in data.user_payouts],
    )
    await db.commit()
    return result

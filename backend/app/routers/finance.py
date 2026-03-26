"""
Finance Router — live revenue & expense aggregations.
Accessible to LOGISTIC_MANAGER (and optionally DISPATCHER for read-only).
"""
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.services import finance_service

router = APIRouter(prefix="/api/v1/finance", tags=["Finance"])


@router.get("/summary")
async def get_finance_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[object, Depends(require_role("LOGISTIC_MANAGER", "DISPATCHER"))],
) -> dict:
    """
    Live-computed financial summary.
    Returns ₹0 for all values when the database is empty.
    """
    return await finance_service.get_finance_summary(db)

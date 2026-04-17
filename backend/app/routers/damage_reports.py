from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.customer import DamageReviewQueueItem, DamageReviewUpdate
from app.services import customer_service

router = APIRouter(prefix="/api/v1/damage-reports", tags=["Damage Reports"])


@router.get("", response_model=list[DamageReviewQueueItem])
async def list_damage_reports(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    status: str | None = Query(default=None),
    flow_type: str | None = Query(default=None),
):
    return await customer_service.get_damage_review_queue(db, current_user, status, flow_type)


@router.post("/{reference_code}/review", response_model=DamageReviewQueueItem)
async def review_damage_report(
    reference_code: str,
    data: DamageReviewUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await customer_service.submit_damage_review(db, current_user, reference_code, data)

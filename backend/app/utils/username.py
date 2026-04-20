import re
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

_USERNAME_RE = re.compile(r"[^a-z0-9]+")
_MAX_USERNAME_LENGTH = 64


def normalize_username(value: str | None, fallback: str = "user") -> str:
    base_value = (value or "").strip().lower()
    base_value = _USERNAME_RE.sub("_", base_value).strip("_")
    if not base_value:
        base_value = fallback
    return base_value[:_MAX_USERNAME_LENGTH].strip("_") or fallback


async def generate_unique_username(
    db: AsyncSession,
    raw_value: str | None,
    *,
    fallback: str = "user",
    exclude_user_id: UUID | None = None,
) -> str:
    base = normalize_username(raw_value, fallback=fallback)
    candidate = base
    counter = 1

    while True:
        query = select(User.id).where(User.username == candidate)
        if exclude_user_id is not None:
            query = query.where(User.id != exclude_user_id)

        existing = (await db.execute(query)).scalar_one_or_none()
        if not existing:
            return candidate

        suffix = f"_{counter}"
        candidate = f"{base[: max(1, _MAX_USERNAME_LENGTH - len(suffix))]}{suffix}"
        counter += 1

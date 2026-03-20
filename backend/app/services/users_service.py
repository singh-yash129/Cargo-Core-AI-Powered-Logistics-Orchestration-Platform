from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import Role, User
from app.models.warehouse import Warehouse
from app.schemas.users import (
    AssignRoleRequest,
    AssignWarehouseRequest,
    UserAdminCreate,
    UserAdminResponse,
    UserAdminUpdate,
    UserListResponse,
)
from app.utils.hashing import hash_password
from app.utils.username import generate_unique_username, normalize_username


async def _get_user(db: AsyncSession, user_id: UUID) -> User:
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def _get_role(db: AsyncSession, role_name: str) -> Role:
    result = await db.execute(select(Role).where(Role.name == role_name.upper()))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return role


def _to_response(user: User) -> UserAdminResponse:
    return UserAdminResponse(
        id=user.id,
        name=user.name,
        username=user.username,
        email=user.email,
        phone=user.phone,
        role=user.role.name,
        warehouse_id=user.warehouse_id,
        is_active=user.is_active,
        created_at=user.created_at,
    )


async def _sync_warehouse_manager_assignment(
    db: AsyncSession,
    user: User,
    role_name: str,
    warehouse_id: UUID | None,
) -> None:
    if role_name != "WAREHOUSE_MANAGER":
        return

    managed_warehouses = (
        await db.execute(select(Warehouse).where(Warehouse.manager_id == user.id))
    ).scalars().all()

    for warehouse in managed_warehouses:
        if warehouse.id != warehouse_id:
            warehouse.manager_id = None
            db.add(warehouse)

    if warehouse_id is None:
        return

    warehouse = (
        await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
    ).scalar_one_or_none()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")

    warehouse.manager_id = user.id
    db.add(warehouse)


async def list_users(
    db: AsyncSession,
    page: int,
    page_size: int,
    role: str | None = None,
    warehouse_id: UUID | None = None,
    is_active: bool | None = None,
    search: str | None = None,
) -> UserListResponse:
    filters = []
    if role:
        filters.append(Role.name == role.upper())
    if warehouse_id:
        filters.append(User.warehouse_id == warehouse_id)
    if is_active is not None:
        filters.append(User.is_active == is_active)
    if search:
        like_pattern = f"%{search.strip()}%"
        filters.append((User.name.ilike(like_pattern)) | (User.email.ilike(like_pattern)) | (User.username.ilike(like_pattern)))

    total_query = select(func.count(User.id)).join(Role)
    data_query = (
        select(User)
        .join(Role)
        .options(selectinload(User.role))
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    if filters:
        total_query = total_query.where(*filters)
        data_query = data_query.where(*filters)

    total = (await db.execute(total_query)).scalar_one()
    users = (await db.execute(data_query)).scalars().all()

    return UserListResponse(
        items=[_to_response(user) for user in users],
        total=total,
        page=page,
        page_size=page_size,
    )


async def create_user(db: AsyncSession, data: UserAdminCreate) -> UserAdminResponse:
    existing = await db.execute(select(User).where(User.email == data.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    normalized_username = normalize_username(data.username or data.email.split("@")[0])
    if data.username:
        existing_username = await db.execute(select(User).where(User.username == normalized_username))
        if existing_username.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already in use")
    else:
        normalized_username = await generate_unique_username(db, normalized_username)

    role = await _get_role(db, data.role)
    user = User(
        name=data.name,
        username=normalized_username,
        email=data.email.lower(),
        phone=data.phone,
        password_hash=hash_password(data.password),
        role_id=role.id,
        warehouse_id=data.warehouse_id,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await _sync_warehouse_manager_assignment(db, user, role.name, data.warehouse_id)
    await db.refresh(user, attribute_names=["role"])
    return _to_response(user)


async def get_user_detail(db: AsyncSession, user_id: UUID) -> UserAdminResponse:
    user = await _get_user(db, user_id)
    return _to_response(user)


async def update_user(db: AsyncSession, user_id: UUID, data: UserAdminUpdate) -> UserAdminResponse:
    user = await _get_user(db, user_id)
    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    if data.is_active is not None:
        user.is_active = data.is_active

    db.add(user)
    await db.flush()
    await db.refresh(user, attribute_names=["role"])
    return _to_response(user)


async def soft_delete_user(db: AsyncSession, user_id: UUID) -> None:
    user = await _get_user(db, user_id)
    user.is_active = False
    db.add(user)
    await db.flush()


async def assign_role(db: AsyncSession, user_id: UUID, data: AssignRoleRequest) -> UserAdminResponse:
    user = await _get_user(db, user_id)
    role = await _get_role(db, data.role)
    user.role_id = role.id
    db.add(user)
    await db.flush()
    await _sync_warehouse_manager_assignment(db, user, role.name, user.warehouse_id)
    await db.refresh(user, attribute_names=["role"])
    return _to_response(user)


async def assign_warehouse(
    db: AsyncSession,
    user_id: UUID,
    data: AssignWarehouseRequest,
) -> UserAdminResponse:
    user = await _get_user(db, user_id)
    user.warehouse_id = data.warehouse_id
    db.add(user)
    await db.flush()
    await _sync_warehouse_manager_assignment(db, user, user.role.name, data.warehouse_id)
    await db.refresh(user, attribute_names=["role"])
    return _to_response(user)

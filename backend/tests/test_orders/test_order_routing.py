import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.user import User
from app.models.warehouse import Warehouse
from tests.conftest import REGISTER_PAYLOAD

pytestmark = pytest.mark.asyncio


async def _get_registered_user(db_session: AsyncSession) -> User:
    result = await db_session.execute(
        select(User).where(User.email == REGISTER_PAYLOAD["email"])
    )
    return result.scalar_one()


async def test_create_order_auto_assigns_single_active_warehouse(
    client: AsyncClient,
    db_session: AsyncSession,
    registered_user_tokens: dict,
):
    warehouse = Warehouse(name="North Hub", address="123 North Road, Delhi", is_active=True)
    db_session.add(warehouse)
    await db_session.flush()

    response = await client.post(
        "/api/v1/orders",
        headers={"Authorization": f"Bearer {registered_user_tokens['access_token']}"},
        json={
            "order_type": "INDIVIDUAL",
            "pickup_addr": "12 Pickup Street, Delhi",
            "delivery_addr": "45 Delivery Street, Noida",
            "total_amount": 2500,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["warehouse_id"] == str(warehouse.id)


async def test_create_order_prefers_less_loaded_warehouse_when_multiple_exist(
    client: AsyncClient,
    db_session: AsyncSession,
    registered_user_tokens: dict,
):
    user = await _get_registered_user(db_session)

    busy_warehouse = Warehouse(name="Busy Hub", address="1 Busy Road, Delhi", is_active=True)
    available_warehouse = Warehouse(name="Available Hub", address="2 Free Road, Noida", is_active=True)
    db_session.add_all([busy_warehouse, available_warehouse])
    await db_session.flush()

    db_session.add(
        Order(
            tracking_code="QC-EXISTLOAD",
            order_type="INDIVIDUAL",
            status="DRAFT",
            customer_id=user.id,
            warehouse_id=busy_warehouse.id,
            pickup_addr="Existing Pickup Address",
            delivery_addr="Existing Delivery Address",
        )
    )
    await db_session.flush()

    response = await client.post(
        "/api/v1/orders",
        headers={"Authorization": f"Bearer {registered_user_tokens['access_token']}"},
        json={
            "order_type": "INDIVIDUAL",
            "pickup_addr": "89 New Pickup Street, Delhi",
            "delivery_addr": "90 New Delivery Street, Gurgaon",
            "total_amount": 3200,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["warehouse_id"] == str(available_warehouse.id)

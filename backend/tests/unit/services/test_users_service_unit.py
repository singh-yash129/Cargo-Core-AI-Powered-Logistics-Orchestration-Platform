from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.services import users_service


class _FakeScalarResult:
    def __init__(self, items):
        self._items = items

    def all(self):
        return self._items


class _FakeExecuteResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return _FakeScalarResult(self._items)


class _FakeDbSession:
    def __init__(self, responses):
        self._responses = list(responses)
        self.added = []
        self.flushed = False

    async def execute(self, _statement):
        return _FakeExecuteResult(self._responses.pop(0))

    def add(self, obj):
        self.added.append(obj)

    async def flush(self):
        self.flushed = True


@pytest.mark.asyncio
async def test_soft_delete_vendor_cleans_up_recurring_inbound_state(monkeypatch) -> None:
    user = SimpleNamespace(
        id=uuid4(),
        role=SimpleNamespace(name="VENDOR"),
        is_active=True,
        approval_note=None,
    )
    recurring_rule = SimpleNamespace(active=True)
    inbound_order = SimpleNamespace(status="CONFIRMED", cancel_reason=None)
    db = _FakeDbSession([[recurring_rule], [inbound_order]])

    async def _fake_get_user(_db, _user_id):
        return user

    async def _fake_sync_assignment(_db, _user, _role_name, _warehouse_id):
        return None

    monkeypatch.setattr(users_service, "_get_user", _fake_get_user)
    monkeypatch.setattr(users_service, "_sync_warehouse_manager_assignment", _fake_sync_assignment)

    await users_service.soft_delete_user(db, uuid4())

    assert user.is_active is False
    assert user.approval_note == users_service.SOFT_DELETED_APPROVAL_NOTE
    assert recurring_rule.active is False
    assert inbound_order.status == "CANCELLED"
    assert inbound_order.cancel_reason == "Vendor account deleted"
    assert db.flushed is True

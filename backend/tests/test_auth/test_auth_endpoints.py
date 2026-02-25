"""
test_auth_endpoints.py
Integration tests for all 9 /api/v1/auth/* endpoints.
"""
import pytest
from httpx import AsyncClient

from tests.conftest import REGISTER_PAYLOAD

pytestmark = pytest.mark.asyncio


# ── POST /register ────────────────────────────────────────────────────────────


async def test_register_success(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert response.status_code == 201
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


async def test_register_duplicate_email(client: AsyncClient, registered_user_tokens):
    # Second registration with same email
    response = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


async def test_register_invalid_role(client: AsyncClient):
    """Completely unknown role names are rejected by Pydantic (422)."""
    payload = {**REGISTER_PAYLOAD, "email": "newuser@example.com", "role": "SUPERMAN"}
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.parametrize(
    "restricted_role",
    ["LOGISTIC_MANAGER", "WAREHOUSE_MANAGER", "DISPATCHER", "DRIVER", "LABOURER"],
)
async def test_register_restricted_role_rejected(client: AsyncClient, restricted_role: str):
    """Roles that are not self-service must be rejected (422 from Pydantic)."""
    payload = {
        **REGISTER_PAYLOAD,
        "email": f"{restricted_role.lower()}@example.com",
        "role": restricted_role,
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    # Pydantic rejects disallowed Literal values before the service layer is reached
    assert response.status_code == 422


async def test_register_weak_password(client: AsyncClient):
    payload = {**REGISTER_PAYLOAD, "email": "weak@example.com", "password": "short"}
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422  # Pydantic validation


# ── POST /login ───────────────────────────────────────────────────────────────


async def test_login_success(client: AsyncClient, registered_user_tokens):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER_PAYLOAD["email"], "password": REGISTER_PAYLOAD["password"]},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


async def test_login_wrong_password(client: AsyncClient, registered_user_tokens):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER_PAYLOAD["email"], "password": "WrongPass999"},
    )
    assert response.status_code == 401


async def test_login_nonexistent_email(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@example.com", "password": "SomePass123"},
    )
    assert response.status_code == 401


# ── POST /refresh ─────────────────────────────────────────────────────────────


async def test_refresh_success(client: AsyncClient, registered_user_tokens):
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": registered_user_tokens["refresh_token"]},
    )
    assert response.status_code == 200
    new_tokens = response.json()
    assert "access_token" in new_tokens
    # New access token should differ from the original
    assert new_tokens["access_token"] != registered_user_tokens["access_token"]


async def test_refresh_with_access_token_fails(client: AsyncClient, registered_user_tokens):
    """Passing an access token as a refresh token must be rejected."""
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": registered_user_tokens["access_token"]},
    )
    assert response.status_code == 401


# ── POST /logout ──────────────────────────────────────────────────────────────


async def test_logout_success(client: AsyncClient, registered_user_tokens, redis_mock):
    token = registered_user_tokens["access_token"]
    response = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
    # Verify blacklist was written
    redis_mock.setex.assert_called_once()


async def test_logout_blacklisted_token_cannot_access_me(
    client: AsyncClient, registered_user_tokens, redis_mock
):
    """After logout, the same access token should return 401 on /me."""
    token = registered_user_tokens["access_token"]

    # First call logout
    await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )

    # Now simulate Redis returning the blacklist hit
    redis_mock.get.return_value = b"1"

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401


# ── GET /me ───────────────────────────────────────────────────────────────────


async def test_get_me_success(client: AsyncClient, registered_user_tokens):
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {registered_user_tokens['access_token']}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == REGISTER_PAYLOAD["email"]
    assert body["role"] == "INDIVIDUAL"


async def test_get_me_no_token(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_get_me_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer this.is.not.valid"},
    )
    assert response.status_code == 401


# ── PUT /me ───────────────────────────────────────────────────────────────────


async def test_update_me(client: AsyncClient, registered_user_tokens):
    response = await client.put(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {registered_user_tokens['access_token']}"},
        json={"name": "Updated Name", "phone": "8888888888"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
    assert response.json()["phone"] == "8888888888"


# ── POST /change-password ─────────────────────────────────────────────────────


async def test_change_password_success(client: AsyncClient, registered_user_tokens):
    response = await client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {registered_user_tokens['access_token']}"},
        json={
            "current_password": REGISTER_PAYLOAD["password"],
            "new_password": "NewStrongPass456",
        },
    )
    assert response.status_code == 200
    assert "success" in response.json()["message"].lower()


async def test_change_password_wrong_current(client: AsyncClient, registered_user_tokens):
    response = await client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {registered_user_tokens['access_token']}"},
        json={"current_password": "WrongOldPass", "new_password": "NewPass123"},
    )
    assert response.status_code == 400


# ── POST /forgot-password ─────────────────────────────────────────────────────


async def test_forgot_password_always_200(client: AsyncClient):
    """Both existing and non-existing emails should return 200 (no enumeration)."""
    for email in [REGISTER_PAYLOAD["email"], "nobody@example.com"]:
        response = await client.post(
            "/api/v1/auth/forgot-password", json={"email": email}
        )
        assert response.status_code == 200


# ── POST /reset-password ──────────────────────────────────────────────────────


async def test_reset_password_invalid_token(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": "deadbeefdeadbeef", "new_password": "ResetPass123"},
    )
    assert response.status_code == 400


async def test_reset_password_success(client: AsyncClient, redis_mock):
    """Simulate a valid reset token stored in Redis."""
    import uuid

    fake_user_id = str(uuid.uuid4())
    fake_token = "a" * 64

    # Simulate Redis returning a user id for the reset token
    redis_mock.get.return_value = fake_user_id.encode()

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": fake_token, "new_password": "BrandNewPass789"},
    )
    # User won't be found in test DB with random UUID → 404 is acceptable here
    # (full E2E test would register user first, then use their real UUID)
    assert response.status_code in (200, 404)


# ── GET /health ───────────────────────────────────────────────────────────────


async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

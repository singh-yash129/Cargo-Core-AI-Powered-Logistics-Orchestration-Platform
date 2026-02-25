# Phase 1 — Foundation: Project Setup & Core Auth
### Implementation Plan
**Project:** Logistics & Personal Move Management System  
**Stack:** FastAPI · PostgreSQL 16 · SQLAlchemy 2.0 (async) · Alembic · Redis · Docker  
**Created:** 24 February 2026  
**Estimated Effort:** 1 week  
**Priority:** 🔴 Critical

---

## Table of Contents
1. [Goal](#goal)
2. [Directory Structure](#directory-structure)
3. [Milestone 1.1 — Project Scaffolding](#milestone-11--project-scaffolding)
4. [Milestone 1.2 — Database Connection](#milestone-12--database-connection)
5. [Milestone 1.3 — Authentication System](#milestone-13--authentication-system)
6. [API Endpoints](#api-endpoints)
7. [Key Design Decisions](#key-design-decisions)
8. [Verification Checklist](#verification-checklist)
9. [Dependencies Reference](#dependencies-reference)

---

## Goal

Produce a running FastAPI server containerised with Docker Compose, connected to a PostgreSQL 16 database via async SQLAlchemy, with a complete JWT-based authentication and RBAC system backed by Redis for token blacklisting. At the end of this phase, all 9 auth endpoints must be functional and tested.

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py                        # FastAPI app factory + CORS + router includes
│   ├── config.py                      # pydantic-settings BaseSettings (reads .env)
│   ├── database.py                    # Async engine, AsyncSession, Base, get_db()
│   ├── dependencies.py                # get_current_user, require_role() factory
│   │
│   ├── models/
│   │   └── user.py                    # User + UserRole ORM models
│   │
│   ├── schemas/
│   │   └── auth.py                    # Pydantic v2 request/response schemas
│   │
│   ├── routers/
│   │   └── auth.py                    # All 9 /api/v1/auth/* endpoints
│   │
│   ├── services/
│   │   └── auth_service.py            # Business logic (no DB calls in router)
│   │
│   ├── utils/
│   │   ├── hashing.py                 # bcrypt hash/verify helpers
│   │   └── jwt.py                     # create / decode access + refresh tokens
│   │
│   └── middleware/
│       └── logging_middleware.py      # Structured JSON request logging (loguru)
│
├── alembic/
│   ├── env.py                         # Points target_metadata at Base.metadata (async)
│   └── versions/
│       └── 001_create_users_roles.py  # Initial migration
│
├── tests/
│   ├── conftest.py                    # Fixtures: test DB session, AsyncClient, test user
│   └── test_auth/
│       └── test_auth_endpoints.py     # Integration tests for all auth flows
│
├── .env.example                       # All required environment variables documented
├── docker-compose.yml                 # app + db (postgres:16) + redis services
├── Dockerfile                         # Multi-stage Python 3.12 build
├── pyproject.toml                     # ruff + black configuration
├── requirements.txt                   # Pinned production + dev dependencies
└── README.md                          # Local dev quickstart
```

---

## Milestone 1.1 — Project Scaffolding

### Tasks

- [ ] Create `backend/` directory with the full tree above
- [ ] Write `requirements.txt` with pinned versions
- [ ] Write `pyproject.toml` with `ruff` (lint) and `black` (format) config
- [ ] Write multi-stage `Dockerfile` (Python 3.12-slim, builder + runtime stages)
- [ ] Write `docker-compose.yml` with three services: `app`, `db`, `redis`
- [ ] Write `backend/README.md` with local dev quickstart

### `docker-compose.yml` Services

| Service | Image | Port | Notes |
|---|---|---|---|
| `app` | Local Dockerfile | `8000:8000` | Mounts `.env`, depends on `db` + `redis` |
| `db` | `postgres:16-alpine` | `5432:5432` | Named volume `pgdata`, env from `.env` |
| `redis` | `redis:7-alpine` | `6379:6379` | No persistence needed for dev |

All three share the `logistics_net` bridge network.

### `Dockerfile` Strategy

```
Stage 1 (builder): python:3.12-slim
  → COPY requirements.txt
  → pip install --no-cache-dir to /install

Stage 2 (runtime): python:3.12-slim
  → COPY --from=builder /install to sys packages
  → COPY app source
  → Run as non-root user
  → EXPOSE 8000
  → CMD: uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Milestone 1.2 — Database Connection

### Tasks

- [ ] Create `app/database.py` with async SQLAlchemy engine and `get_db()` dependency
- [ ] Create `app/models/user.py` with `UserRole` enum, `Role` table, and `User` table
- [ ] Initialise Alembic (`alembic init alembic`)
- [ ] Update `alembic/env.py` for async migrations
- [ ] Generate and verify first migration: `001_create_users_roles`

### `users` Table Schema

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, default `uuid4()` |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, indexed |
| `phone` | VARCHAR(20) | nullable |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `role_id` | INTEGER | FK → `roles.id`, NOT NULL |
| `warehouse_id` | UUID | nullable FK placeholder (Phase 2) |
| `is_active` | BOOLEAN | default `True` |
| `created_at` | TIMESTAMPTZ | server default `now()` |
| `updated_at` | TIMESTAMPTZ | onupdate `now()` |

### `roles` Table Schema

| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PK |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL |

**Role values:** `LOGISTIC_MANAGER`, `WAREHOUSE_MANAGER`, `DISPATCHER`, `DRIVER`, `LABOURER`, `INDIVIDUAL`, `VENDOR`, `AI_AGENT`

> **Note:** Roles are seeded into the `roles` table inside the Alembic migration's `upgrade()` function so they are available immediately after `alembic upgrade head`.

### Alembic Async Setup

`alembic/env.py` must use `AsyncEngine` with `run_sync` to support async models:

```python
async def run_async_migrations():
    async with engine.connect() as conn:
        await conn.run_sync(do_migrations)
```

---

## Milestone 1.3 — Authentication System

### Tasks

- [ ] Create `app/utils/hashing.py` — bcrypt helpers
- [ ] Create `app/utils/jwt.py` — token creation and decoding
- [ ] Create `app/schemas/auth.py` — all Pydantic v2 request/response models
- [ ] Create `app/services/auth_service.py` — all business logic
- [ ] Create `app/dependencies.py` — `get_current_user`, `require_role()`
- [ ] Create `app/routers/auth.py` — wire all 9 endpoints to service functions
- [ ] Create `app/middleware/logging_middleware.py` — `BaseHTTPMiddleware` JSON logging
- [ ] Create `tests/conftest.py` + `tests/test_auth/test_auth_endpoints.py`

### Token Strategy

| Token | Algorithm | Expiry | Storage |
|---|---|---|---|
| Access JWT | HS256 | 15 minutes | Client memory / Authorization header |
| Refresh JWT | HS256 | 7 days | HttpOnly cookie or client secure storage |
| Password Reset | Random 32-byte hex | 1 hour | Redis key `pwd_reset:{token}` → user_id |

### Redis Blacklist

On `POST /api/v1/auth/logout`:
1. Decode the access token to extract `exp` claim.
2. Compute remaining TTL: `ttl = exp - now()`.
3. Store `SETEX blacklist:{jti} {ttl} 1` in Redis.
4. `get_current_user` dependency checks Redis before returning the user.

> `jti` (JWT ID) is a UUID embedded in every token's payload at creation time.

### `app/schemas/auth.py` Models

| Schema | Direction | Fields |
|---|---|---|
| `UserRegister` | Request | name, email, phone, password, role |
| `UserLogin` | Request | email, password |
| `TokenResponse` | Response | access_token, refresh_token, token_type="bearer" |
| `UserProfile` | Response | id, name, email, phone, role, is_active, created_at |
| `UserProfileUpdate` | Request | name?, phone? |
| `ChangePasswordRequest` | Request | current_password, new_password |
| `ForgotPasswordRequest` | Request | email |
| `ResetPasswordRequest` | Request | token, new_password |
| `MessageResponse` | Response | message (generic success wrapper) |

### `app/services/auth_service.py` Functions

```python
async def register_user(db, data: UserRegister) -> TokenResponse
async def login_user(db, data: UserLogin) -> TokenResponse
async def refresh_tokens(db, refresh_token: str) -> TokenResponse
async def logout_user(redis, access_token: str) -> None
async def get_current_user(db, redis, token: str) -> User
async def update_profile(db, user: User, data: UserProfileUpdate) -> UserProfile
async def change_password(db, user: User, data: ChangePasswordRequest) -> None
async def forgot_password(redis, data: ForgotPasswordRequest) -> None
async def reset_password(db, redis, data: ResetPasswordRequest) -> None
```

### `app/dependencies.py` Pattern

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> User:
    ...

def require_role(*roles: str):
    async def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role.name not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dependency
```

---

## API Endpoints

All routes under `APIRouter(prefix="/api/v1/auth", tags=["Authentication"])`.

| Method | Path | Auth | Body Schema | Response Schema | Notes |
|---|---|---|---|---|---|
| `POST` | `/register` | None | `UserRegister` | `TokenResponse` | Creates user, returns tokens |
| `POST` | `/login` | None | `UserLogin` | `TokenResponse` | Issues JWT pair |
| `POST` | `/refresh` | Refresh token | — | `TokenResponse` | New access + refresh tokens |
| `POST` | `/logout` | Bearer access | — | `MessageResponse` | Blacklists token in Redis |
| `GET` | `/me` | Bearer access | — | `UserProfile` | Returns current user |
| `PUT` | `/me` | Bearer access | `UserProfileUpdate` | `UserProfile` | Updates name/phone |
| `POST` | `/change-password` | Bearer access | `ChangePasswordRequest` | `MessageResponse` | Validates old, sets new |
| `POST` | `/forgot-password` | None | `ForgotPasswordRequest` | `MessageResponse` | Stores reset token in Redis, logs link |
| `POST` | `/reset-password` | None | `ResetPasswordRequest` | `MessageResponse` | Consumes Redis token, updates hash |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **PK type** | UUID (uuid4) | Avoids enumerable integer IDs in public URLs (tracking links, PoD in later phases) |
| **Password reset storage** | Redis (not DB) | Self-expiring via TTL, no cron job needed, no extra table |
| **Redis blacklist TTL** | Remaining JWT lifetime | Key expires naturally; no background cleanup |
| **JTI claim** | UUID per token | Enables per-token revocation without touching the DB |
| **SMTP in Phase 1** | Log reset link to console | SMTP config optional; real email delivery added in Phase 7 |
| **Roles seeding** | Inside Alembic migration | Roles are available immediately after `alembic upgrade head`, no manual seed step |
| **`warehouse_id` on User** | Nullable FK placeholder | Column defined now to avoid future migration friction; FK enforced in Phase 2 |
| **Role storage** | Separate `roles` table | Supports RBAC metadata per role in future (permissions, display names) |
| **Async migrations** | `run_sync` in `env.py` | Required for SQLAlchemy 2.0 async engine compatibility with Alembic |

---

## Verification Checklist

### Infrastructure
- [ ] `docker compose up --build` starts all three services cleanly
- [ ] `docker compose exec app alembic upgrade head` runs without errors
- [ ] `users` and `roles` tables visible in `psql`
- [ ] `roles` table contains all 8 role values after migration

### API
- [ ] `GET http://localhost:8000/health` → `{"status": "ok"}`
- [ ] `GET http://localhost:8000/docs` shows all 9 auth endpoints in Swagger UI
- [ ] `POST /api/v1/auth/register` creates user and returns `access_token` + `refresh_token`
- [ ] `POST /api/v1/auth/login` with invalid credentials → `401 Unauthorized`
- [ ] Duplicate email on register → `409 Conflict`
- [ ] `GET /api/v1/auth/me` with valid token → user profile JSON
- [ ] `GET /api/v1/auth/me` with expired token → `401 Unauthorized`
- [ ] `POST /api/v1/auth/logout` then `GET /api/v1/auth/me` with same token → `401 Unauthorized`
- [ ] Role-protected endpoint with wrong role → `403 Forbidden`

### Code Quality
- [ ] `ruff check backend/` passes with zero errors
- [ ] `black --check backend/` passes
- [ ] `pytest tests/ -v --cov=app --cov-report=term-missing` ≥ 80% coverage on `routers/auth.py` and `services/auth_service.py`

---

## Dependencies Reference

```text
# Core
fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic-settings==2.2.1

# Database
sqlalchemy[asyncio]==2.0.29
asyncpg==0.29.0
alembic==1.13.1

# Auth
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Redis
redis==5.0.3

# Background tasks (stub for Phase 6+)
celery==5.3.6

# Logging
loguru==0.7.2

# Testing
pytest==8.1.1
pytest-asyncio==0.23.6
httpx==0.27.0

# Dev / Linting
ruff==0.4.2
black==24.4.2
```

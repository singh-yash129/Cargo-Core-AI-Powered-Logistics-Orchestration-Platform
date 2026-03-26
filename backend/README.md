# Backend — Logistics & Move Management System

FastAPI · PostgreSQL 16 · SQLAlchemy 2.0 (async) · Alembic · Redis · Docker

---

## Quickstart (Docker Compose)

```bash
# 1. Copy environment variables
cp .env.example .env
# Edit .env — at minimum set a strong SECRET_KEY

# 2. Build and start all services (app + db + redis)
docker compose up --build

# 3. API is available at:
#    http://localhost:8000
#    http://localhost:8000/docs   ← Swagger UI
#    http://localhost:8000/redoc  ← ReDoc
```

Alembic migrations run automatically on container start.

---

## Local Dev (without Docker)

```bash
# Requires: Python 3.12+, PostgreSQL 16, Redis 7

# 1. Create virtual environment
cd backend
python -m venv venv && source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and configure environment variables
cp .env.example .env
# Open .env and update:
#   DATABASE_URL=postgresql+asyncpg://<your_mac_username>@localhost:5432/logistics_db
#   REDIS_URL=redis://localhost:6379/0
#   SECRET_KEY=<any long random string>

# 4. Create the database
createdb logistics_db

# 5. Run migrations
alembic upgrade head

# 6. Start dev server (with auto-reload)
uvicorn app.main:app --reload --port 8000
```

---

## Running Tests

```bash
pytest tests/ -v 
```

---

## API Docs Export

Swagger is already available at:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

To export the current OpenAPI schema and a readable Markdown endpoint catalog:

```bash
cd backend
python export_api_docs.py
```

Generated files:

- `docs/openapi.json`
- `docs/API_ENDPOINT_CATALOG.md`
- `docs/SWAGGER_TESTING_GUIDE.md`

---

## Project Structure

```
app/
├── main.py           # FastAPI app factory
├── config.py         # pydantic-settings (reads .env)
├── database.py       # Async engine, get_db() dependency
├── dependencies.py   # get_current_user, require_role()
├── models/           # SQLAlchemy ORM models
├── schemas/          # Pydantic v2 request/response schemas
├── routers/          # Route handlers (grouped by domain)
├── services/         # Business logic layer
├── utils/            # JWT, hashing, Redis, file upload helpers
└── middleware/       # Logging, auth middleware
alembic/              # DB migrations
tests/                # pytest integration tests
```

---

## Auth Endpoints (Phase 1)

| Method | Path | Auth |
|---|---|---|
| POST | `/api/v1/auth/register` | None |
| POST | `/api/v1/auth/login` | None |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Bearer |
| GET | `/api/v1/auth/me` | Bearer |
| PUT | `/api/v1/auth/me` | Bearer |
| POST | `/api/v1/auth/change-password` | Bearer |
| POST | `/api/v1/auth/forgot-password` | None |
| POST | `/api/v1/auth/reset-password` | None |
| GET | `/health` | None |

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.middleware.logging_middleware import LoggingMiddleware
from app.routers import auth as auth_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: nothing needed — Alembic handles schema creation
    yield
    # Shutdown: dispose async engine
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Logistics & Move Management API",
        description="Backend API for the Logistics & Personal Move Management System",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────────────────────────
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(auth_router.router)

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "ok"}

    return app


app = create_app()

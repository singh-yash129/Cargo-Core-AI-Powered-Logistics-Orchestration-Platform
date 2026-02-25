from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # ignore docker-compose-only vars (POSTGRES_USER, etc.)
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_env: str = "development"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ── Database ─────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://logistics_user:logistics_pass@localhost:5432/logistics_db"

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── Google APIs ───────────────────────────────────────────────────────────
    google_maps_api_key: str = ""
    gemini_api_key: str = ""

    # ── File Storage ──────────────────────────────────────────────────────────
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 10

    # ── Email / SMS ───────────────────────────────────────────────────────────
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""

    # ── CORS ──────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()

from typing import AsyncGenerator

from redis.asyncio import Redis, from_url

from app.config import get_settings

settings = get_settings()

_redis_pool: Redis | None = None


async def get_redis_pool() -> Redis:
    """Return (or create) the shared async Redis connection pool."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = from_url(settings.redis_url, decode_responses=False)
    return _redis_pool


async def get_redis() -> AsyncGenerator[Redis, None]:
    """FastAPI dependency that yields the Redis client."""
    redis = await get_redis_pool()
    try:
        yield redis
    finally:
        pass  # Connection pool manages lifecycle; no explicit close per-request

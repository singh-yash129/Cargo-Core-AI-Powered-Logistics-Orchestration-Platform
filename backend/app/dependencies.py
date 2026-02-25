"""
dependencies.py
Shared FastAPI Depends() used across multiple routers.
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.services import auth_service
from app.utils.redis import get_redis

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> User:
    """
    Decode Bearer token, check Redis blacklist, and return the active User.
    Raises HTTP 401 if the token is invalid, revoked, or the user is inactive.
    """
    return await auth_service.get_current_user_from_token(db, redis, token)


def require_role(*roles: str):
    """
    Dependency factory that restricts access to users with any of the given roles.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_role("LOGISTIC_MANAGER"))])
    Or as a parameter:
        async def endpoint(user: User = Depends(require_role("DISPATCHER", "LOGISTIC_MANAGER"))):
    """

    async def dependency(
        user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if user.role.name not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted. Required roles: {', '.join(roles)}",
            )
        return user

    return dependency

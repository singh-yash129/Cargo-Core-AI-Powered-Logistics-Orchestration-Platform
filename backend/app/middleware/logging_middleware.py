import time

from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Structured JSON request / response logging using loguru.
    Logs: method, path, status_code, duration_ms for every request.
    Sensitive paths (login, register) skip body logging.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        logger.info(
            {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client": request.client.host if request.client else "unknown",
            }
        )
        return response

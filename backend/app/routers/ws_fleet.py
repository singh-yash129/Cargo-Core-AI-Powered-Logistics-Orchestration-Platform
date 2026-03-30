"""
WebSocket endpoint for real-time fleet location broadcasting.

Flow:
  1. Dashboard connects to ws://<host>/ws/fleet?token=<jwt>
  2. Backend validates JWT and adds connection to the pool
  3. When a driver POSTs a location update (REST), logistics_service calls
     fleet_manager.broadcast() which pushes the update to every connected dashboard.
  4. Dashboard updates map markers without waiting for the next 30-second poll.
"""
import json
import asyncio
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from jose import JWTError

router = APIRouter(tags=["Fleet WebSocket"])


class FleetConnectionManager:
    """Thread-safe WebSocket connection pool for fleet location broadcasts."""

    def __init__(self):
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self._connections.add(ws)

    async def disconnect(self, ws: WebSocket):
        async with self._lock:
            self._connections.discard(ws)

    async def broadcast(self, payload: dict[str, Any]):
        """Send a JSON payload to every connected dashboard client."""
        if not self._connections:
            return
        message = json.dumps(payload)
        dead: list[WebSocket] = []
        async with self._lock:
            targets = list(self._connections)
        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        # Clean up dead connections
        if dead:
            async with self._lock:
                for ws in dead:
                    self._connections.discard(ws)

    @property
    def connection_count(self) -> int:
        return len(self._connections)


# Singleton used across the whole app
fleet_manager = FleetConnectionManager()


async def _authenticate_ws_token(token: str | None) -> bool:
    """Return True if the JWT token is valid (any authenticated user)."""
    if not token:
        return False
    try:
        from app.config import get_settings
        from jose import jwt as jose_jwt
        settings = get_settings()
        jose_jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return True
    except (JWTError, Exception):
        return False


@router.websocket("/ws/fleet")
async def fleet_websocket(
    ws: WebSocket,
    token: str | None = Query(default=None),
):
    """
    WebSocket endpoint for live fleet tracking.

    Connect with:
        ws://<host>/ws/fleet?token=<access_token>

    Messages from server (JSON):
        { "type": "location_update", "driver_id": "...", "driver_name": "...",
          "latitude": 0.0, "longitude": 0.0, "status": "...",
          "vehicle_code": "...", "vehicle_id": "...", "last_updated": "..." }
        { "type": "ping" }

    Messages from client:
        { "type": "pong" }  (keepalive response, ignored)
    """
    if not await _authenticate_ws_token(token):
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await fleet_manager.connect(ws)
    # Send a welcome message so the client knows the connection is live
    await ws.send_text(json.dumps({"type": "connected", "message": "Fleet WebSocket connected"}))

    try:
        while True:
            # Keep connection open; client may send pong frames
            try:
                await asyncio.wait_for(ws.receive_text(), timeout=30.0)
            except asyncio.TimeoutError:
                # Send a ping every 30 s to keep the connection alive through proxies
                try:
                    await ws.send_text(json.dumps({"type": "ping"}))
                except Exception:
                    break
    except WebSocketDisconnect:
        pass
    finally:
        await fleet_manager.disconnect(ws)

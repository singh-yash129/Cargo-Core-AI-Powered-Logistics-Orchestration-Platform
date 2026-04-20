"""
dispatch_ai_service.py
AI-powered dispatcher intelligence: driver suggestions and return-trip matching.

Uses Gemini 2.5 Pro (with automatic Flash fallback) to rank drivers and
generate natural-language dispatch explanations grounded in live DB data.
"""
from __future__ import annotations

import json
import math
from datetime import datetime, timedelta, timezone

from loguru import logger
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.logistics import LogisticsDriverProfile
from app.models.order import Order
from app.models.user import User
from app.utils.gemini import GeminiConfigError, generate_with_fallback, get_gemini_client

try:
    from google.genai import types as _gtypes
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False


# ── Helpers ───────────────────────────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(max(0.0, a)))


def _parse_location(loc_str: str | None) -> tuple[float, float] | None:
    """Parse a 'lat,lng' string into a (lat, lng) float tuple, or None."""
    if not loc_str or "," not in loc_str:
        return None
    try:
        lat_s, lng_s = loc_str.split(",", 1)
        return float(lat_s.strip()), float(lng_s.strip())
    except (ValueError, TypeError):
        return None


def _priority_rank(priority: str | None) -> int:
    return {"URGENT": 0, "HIGH": 1, "NORMAL": 2, "LOW": 3}.get(
        (priority or "NORMAL").upper(), 2
    )


# ── DB fetch helpers ──────────────────────────────────────────────────────────

async def _fetch_available_drivers(db: AsyncSession) -> list[dict]:
    """Return active drivers who do NOT have an active assigned order.

    A driver is excluded if they have any order with assigned_driver_id == their user_id
    and that order is in an active state (CONFIRMED, IN_TRANSIT, PICKING, PACKING, etc.).
    This prevents the AI from suggesting a driver who is already on a job.
    """
    # Find all driver user_ids that are currently assigned to an active order
    active_order_statuses = {"ASSIGNED", "CONFIRMED", "IN_TRANSIT", "PICKING", "PACKING", "PICKED", "PACKED"}
    busy_driver_rows = (
        await db.execute(
            select(Order.assigned_driver_id)
            .where(
                Order.assigned_driver_id.isnot(None),
                Order.status.in_(active_order_statuses),
            )
            .distinct()
        )
    ).scalars().all()
    busy_driver_ids = {str(uid) for uid in busy_driver_rows}

    rows = (
        await db.execute(
            select(LogisticsDriverProfile, User)
            .join(User, User.id == LogisticsDriverProfile.user_id)
            .where(
                User.is_active.is_(True),
                func.lower(LogisticsDriverProfile.status).in_(
                    ["active", "idle", "on_break", "on-duty"]
                ),
            )
        )
    ).all()

    drivers = []
    for profile, user in rows:
        if str(user.id) in busy_driver_ids:
            continue  # already assigned to an active order — skip
        coords = _parse_location(profile.current_location)
        drivers.append(
            {
                "id": str(user.id),
                "name": user.name,
                "status": profile.status,
                "current_job": profile.current_job or "None",
                "coords": coords,
                "location_str": profile.current_location or "Unknown",
            }
        )
    return drivers


async def _fetch_unassigned_orders(db: AsyncSession, limit: int = 15) -> list[Order]:
    """Return CONFIRMED orders eligible for dispatcher direct-driver assignment.

    Only orders with no packing requirement AND no vehicle already assigned by the
    Warehouse Manager are returned.  If the WM has already assigned a vehicle the
    order is travelling the normal warehouse flow and should not appear in the
    dispatcher's AI clustering panel.

    Orders that include packing services (packing_amount > 0) are also excluded
    because drivers completing a previous move will have used up their packing
    materials and cannot fulfil a new packing job without restocking.
    """
    orders = (
        await db.execute(
            select(Order)
            .where(
                Order.status == "CONFIRMED",
                Order.assigned_driver_id.is_(None),
                Order.assigned_vehicle_id.is_(None),   # WM already owns it → skip
                Order.packing_amount == 0,
            )
            .order_by(Order.created_at.asc())
            .limit(limit)
        )
    ).scalars().all()
    return list(orders)


# ── Fallback (no AI) ──────────────────────────────────────────────────────────

def _haversine_suggestions(
    orders: list[Order], drivers: list[dict]
) -> list[dict]:
    """Simple nearest-driver fallback when Gemini is unavailable.

    Each driver is only suggested for ONE order (the closest one they can serve).
    Once a driver is assigned to an order they are removed from the available pool.
    """
    suggestions = []
    remaining_drivers = [d for d in drivers]  # mutable copy so we can pop assigned ones
    # Sort orders by priority so urgent orders get first pick of drivers
    sorted_orders = sorted(
        orders, key=lambda o: _priority_rank(getattr(o, "priority", "NORMAL") or "NORMAL")
    )
    for order in sorted_orders:
        if order.pickup_lat is None or order.pickup_lng is None:
            continue
        if not remaining_drivers:
            break  # no more drivers to assign
        best_driver, best_dist, best_idx = None, float("inf"), -1
        for idx, d in enumerate(remaining_drivers):
            if not d["coords"]:
                continue
            dist = _haversine_km(
                d["coords"][0], d["coords"][1], order.pickup_lat, order.pickup_lng
            )
            if dist < best_dist:
                best_dist, best_driver, best_idx = dist, d, idx
        if best_driver:
            conf = max(20, min(95, 95 - int(best_dist * 4)))
            suggestions.append(
                {
                    "order_tracking_code": order.tracking_code or "",
                    "order_id": str(order.id),
                    "pickup_addr": order.pickup_addr or "",
                    "delivery_addr": order.delivery_addr or "",
                    "priority": getattr(order, "priority", "NORMAL") or "NORMAL",
                    "suggested_driver_id": best_driver["id"],
                    "suggested_driver_name": best_driver["name"],
                    "distance_km": round(best_dist, 1),
                    "confidence": conf,
                    "reason": (
                        f"Closest available driver at {best_dist:.1f} km from pickup."
                        " (Gemini unavailable — distance-only match)"
                    ),
                    "ai_powered": False,
                }
            )
            remaining_drivers.pop(best_idx)  # driver is now assigned — remove from pool
    suggestions.sort(key=lambda s: (_priority_rank(s["priority"]), s["distance_km"]))
    return suggestions


# ── AI driver suggestions ─────────────────────────────────────────────────────

async def suggest_drivers_for_orders(db: AsyncSession) -> list[dict]:
    """
    Return AI-ranked driver suggestions for all unassigned CONFIRMED orders.

    Gemini 2.5 Pro analyses driver proximity, workload, and order priority to
    produce a ranked list with a plain-English reason for each match.
    Falls back to Haversine nearest-driver if Gemini is unavailable.
    """
    orders = await _fetch_unassigned_orders(db)
    drivers = await _fetch_available_drivers(db)

    if not orders:
        return []
    if not drivers:
        return []

    # ── Build prompt context ───────────────────────────────────────────────────
    orders_lines = []
    for o in orders:
        coord_str = (
            f"({o.pickup_lat:.4f}, {o.pickup_lng:.4f})"
            if o.pickup_lat and o.pickup_lng
            else "coords unknown"
        )
        orders_lines.append(
            f'- id="{o.id}" code="{o.tracking_code}" priority={getattr(o, "priority", "NORMAL") or "NORMAL"}'
            f' pickup="{o.pickup_addr}" {coord_str} → delivery="{o.delivery_addr}"'
        )

    drivers_lines = []
    for d in drivers:
        coord_str = (
            f"({d['coords'][0]:.4f}, {d['coords'][1]:.4f})"
            if d["coords"]
            else "location unknown"
        )
        drivers_lines.append(
            f'- id="{d["id"]}" name="{d["name"]}" status={d["status"]}'
            f' location={coord_str} current_job={d["current_job"]}'
        )

    # Pre-compute distances so Gemini doesn't have to (improves accuracy)
    distance_matrix_lines = []
    for o in orders:
        if o.pickup_lat is None or o.pickup_lng is None:
            continue
        for d in drivers:
            if not d["coords"]:
                continue
            dist = _haversine_km(
                d["coords"][0], d["coords"][1], o.pickup_lat, o.pickup_lng
            )
            distance_matrix_lines.append(
                f'  order={o.tracking_code} driver={d["name"]}: {dist:.1f} km'
            )

    prompt = f"""You are an expert logistics dispatch AI for a last-mile delivery platform.

CONTEXT: All orders listed below have already been pre-filtered to exclude any that require packing materials (packing_amount > 0). Drivers returning from a completed move will have used their packing supplies, so only no-packing orders are eligible for reassignment.

UNASSIGNED ORDERS (need a driver, no packing required):
{chr(10).join(orders_lines)}

AVAILABLE DRIVERS (with live GPS):
{chr(10).join(drivers_lines)}

PRE-COMPUTED DISTANCES (driver → order pickup):
{chr(10).join(distance_matrix_lines) if distance_matrix_lines else "  (no GPS data available — use best judgement)"}

TASK:
For EACH order above, choose the SINGLE best available driver. Rank by:
  1. Shortest distance to pickup (weight 50%)
  2. Driver has no active job (weight 30%)
  3. Order priority: URGENT > HIGH > NORMAL > LOW (weight 20%)

IMPORTANT: Each driver can only be assigned to ONE order. Do NOT suggest the same driver for multiple orders. If a driver is the best fit for order A, they must NOT appear again for order B — use the next best available driver for order B.

Return ONLY a JSON array — no markdown, no explanation outside the JSON.
Each element MUST have exactly these keys:
{{
  "order_id": "<UUID string>",
  "order_tracking_code": "<string>",
  "pickup_addr": "<string>",
  "delivery_addr": "<string>",
  "priority": "<URGENT|HIGH|NORMAL|LOW>",
  "suggested_driver_id": "<UUID string>",
  "suggested_driver_name": "<string>",
  "distance_km": <float or null>,
  "confidence": <integer 0-100>,
  "reason": "<1-2 concise dispatch sentences explaining this match>",
  "ai_powered": true
}}
"""

    try:
        get_gemini_client()  # raises GeminiConfigError if key missing
    except GeminiConfigError:
        logger.warning("Gemini not configured — using distance-only driver suggestions")
        return _haversine_suggestions(orders, drivers)

    if not _GENAI_AVAILABLE:
        return _haversine_suggestions(orders, drivers)

    try:
        config = _gtypes.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        )
        response = await generate_with_fallback(
            contents=[
                _gtypes.Content(
                    role="user",
                    parts=[_gtypes.Part.from_text(text=prompt)],
                )
            ],
            config=config,
        )
        raw = (response.text or "").strip()
        suggestions: list[dict] = json.loads(raw)

        # Validate and fill any missing fields defensively
        tracking_to_order = {o.tracking_code: o for o in orders}
        cleaned = []
        for s in suggestions:
            if not isinstance(s, dict):
                continue
            # Ensure order_id is populated
            if not s.get("order_id") and s.get("order_tracking_code"):
                matched = tracking_to_order.get(s["order_tracking_code"])
                if matched:
                    s["order_id"] = str(matched.id)
            if not s.get("order_id"):
                continue
            s.setdefault("ai_powered", True)
            s.setdefault("confidence", 70)
            cleaned.append(s)

        logger.info(f"AI driver suggestions: {len(cleaned)} matches for {len(orders)} orders")
        return cleaned

    except json.JSONDecodeError as exc:
        logger.warning(f"Gemini returned non-JSON for driver suggestions: {exc}")
        return _haversine_suggestions(orders, drivers)
    except Exception as exc:
        logger.warning(f"AI driver suggestion failed ({type(exc).__name__}): {exc}")
        return _haversine_suggestions(orders, drivers)


# ── Return-trip suggestions ───────────────────────────────────────────────────

async def get_return_trip_suggestions(db: AsyncSession) -> list[dict]:
    """
    Find drivers who recently completed deliveries and are now near a pending
    pickup — perfect candidates for a return-trip assignment.

    Logic:
      1. Query orders DELIVERED in the last 2 hours (get driver + delivery coords).
      2. Query CONFIRMED unassigned orders that have pickup coords.
      3. For each (driver, recent-delivery-point) pair, find pending pickups
         within 8 km — these are return-trip opportunities.
      4. Gemini 2.5 Pro writes a plain-English dispatch reason and ranks results.
    """
    two_hours_ago = datetime.now(timezone.utc) - timedelta(hours=2)

    # Recent deliveries — need driver user + delivery coordinates
    recent_rows = (
        await db.execute(
            select(Order, User)
            .join(User, User.id == Order.assigned_driver_id)
            .where(
                Order.status == "DELIVERED",
                Order.delivered_at >= two_hours_ago,
                Order.delivery_lat.isnot(None),
                Order.delivery_lng.isnot(None),
            )
            .order_by(Order.delivered_at.desc())
            .limit(25)
        )
    ).all()

    if not recent_rows:
        return []

    pending_orders = await _fetch_unassigned_orders(db, limit=40)
    pending_with_coords = [
        o for o in pending_orders if o.pickup_lat is not None and o.pickup_lng is not None
    ]

    if not pending_with_coords:
        return []

    # ── Proximity matching (pure Python — no AI yet) ──────────────────────────
    RETURN_TRIP_RADIUS_KM = 8.0
    raw_matches: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for delivery_order, driver_user in recent_rows:
        for pending in pending_with_coords:
            key = (str(driver_user.id), str(pending.id))
            if key in seen:
                continue

            dist = _haversine_km(
                delivery_order.delivery_lat,
                delivery_order.delivery_lng,
                pending.pickup_lat,
                pending.pickup_lng,
            )
            if dist > RETURN_TRIP_RADIUS_KM:
                continue

            seen.add(key)
            minutes_ago = int(
                (
                    datetime.now(timezone.utc) - delivery_order.delivered_at
                ).total_seconds()
                / 60
            )
            raw_matches.append(
                {
                    "driver_id": str(driver_user.id),
                    "driver_name": driver_user.name,
                    "last_delivery_addr": delivery_order.delivery_addr or "",
                    "last_delivery_lat": delivery_order.delivery_lat,
                    "last_delivery_lng": delivery_order.delivery_lng,
                    "delivered_minutes_ago": minutes_ago,
                    "pending_order_id": str(pending.id),
                    "pending_tracking_code": pending.tracking_code or "",
                    "pickup_addr": pending.pickup_addr or "",
                    "delivery_addr": pending.delivery_addr or "",
                    "distance_km": round(dist, 1),
                    "priority": getattr(pending, "priority", "NORMAL") or "NORMAL",
                }
            )

    if not raw_matches:
        return []

    # Sort by priority then distance before passing to Gemini
    raw_matches.sort(
        key=lambda m: (_priority_rank(m["priority"]), m["distance_km"])
    )
    top_matches = raw_matches[:12]  # keep prompt manageable

    # ── Ask Gemini to write reasons and re-rank ───────────────────────────────
    try:
        get_gemini_client()
    except GeminiConfigError:
        logger.warning("Gemini not configured — returning raw return-trip matches")
        for m in top_matches:
            m["reason"] = (
                f"{m['driver_name']} completed a delivery {m['delivered_minutes_ago']} min ago "
                f"and is {m['distance_km']} km from the pickup at {m['pickup_addr']}."
            )
            m["ai_powered"] = False
        return top_matches

    if not _GENAI_AVAILABLE:
        for m in top_matches:
            m["reason"] = (
                f"Driver is {m['distance_km']} km away — efficient return trip opportunity."
            )
            m["ai_powered"] = False
        return top_matches

    prompt = f"""You are a logistics dispatch AI. The following drivers recently completed deliveries and are near pending pickup locations — ideal for return-trip assignments.

RETURN-TRIP OPPORTUNITIES:
{json.dumps(top_matches, indent=2)}

For each opportunity write a concise, professional dispatch suggestion (1-2 sentences) explaining:
- Why this driver is a good return-trip match
- Approximate time/distance savings
- Any urgency based on priority

Return ONLY a JSON array. Each element MUST contain exactly:
{{
  "driver_id": "<UUID>",
  "driver_name": "<string>",
  "pending_order_id": "<UUID>",
  "pending_tracking_code": "<string>",
  "pickup_addr": "<string>",
  "delivery_addr": "<string>",
  "distance_km": <float>,
  "priority": "<string>",
  "delivered_minutes_ago": <integer>,
  "last_delivery_addr": "<string>",
  "reason": "<dispatch explanation>",
  "ai_powered": true
}}

Rank by: URGENT/HIGH priority first, then shortest distance.
"""
    try:
        config = _gtypes.GenerateContentConfig(
            temperature=0.15,
            response_mime_type="application/json",
        )
        response = await generate_with_fallback(
            contents=[
                _gtypes.Content(
                    role="user",
                    parts=[_gtypes.Part.from_text(text=prompt)],
                )
            ],
            config=config,
        )
        result: list[dict] = json.loads((response.text or "").strip())
        logger.info(f"AI return-trip suggestions: {len(result)} matches")
        return result

    except json.JSONDecodeError as exc:
        logger.warning(f"Gemini returned non-JSON for return trips: {exc}")
    except Exception as exc:
        logger.warning(f"AI return trip failed ({type(exc).__name__}): {exc}")

    # Fallback — return raw matches with simple text
    for m in top_matches:
        m["reason"] = (
            f"{m['driver_name']} finished a delivery {m['delivered_minutes_ago']} min ago, "
            f"just {m['distance_km']} km from the next pickup."
        )
        m["ai_powered"] = False
    return top_matches

"""Geographic order clustering using Haversine distance."""

import asyncio
import math
from dataclasses import dataclass, field

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.services.geocoding_service import search_address


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(a))


@dataclass
class GeoOrder:
    order: Order
    lat: float
    lng: float


@dataclass
class ClusterResult:
    cluster_id: int
    centroid_lat: float
    centroid_lng: float
    orders: list[GeoOrder] = field(default_factory=list)
    total_distance_km: float = 0.0
    efficiency_pct: float = 0.0
    time_window: str = ""


async def _geocode_order(order: Order) -> GeoOrder | None:
    """Geocode a single order's delivery address, caching result on the row."""
    if order.delivery_lat is not None and order.delivery_lng is not None:
        return GeoOrder(order=order, lat=order.delivery_lat, lng=order.delivery_lng)

    results = await search_address(order.delivery_addr, limit=1)
    if not results:
        return None

    lat = results[0]["lat"]
    lng = results[0]["lon"]
    order.delivery_lat = lat
    order.delivery_lng = lng
    return GeoOrder(order=order, lat=lat, lng=lng)


async def _geocode_all(db: AsyncSession, orders: list[Order]) -> tuple[list[GeoOrder], list[Order]]:
    """Geocode all orders. Returns (geocoded, failed)."""
    geocoded: list[GeoOrder] = []
    failed: list[Order] = []

    # Process orders - use cached coords first, then geocode the rest with rate limiting
    needs_geocoding: list[Order] = []
    for order in orders:
        if order.delivery_lat is not None and order.delivery_lng is not None:
            geocoded.append(GeoOrder(order=order, lat=order.delivery_lat, lng=order.delivery_lng))
        else:
            needs_geocoding.append(order)

    for order in needs_geocoding:
        geo = await _geocode_order(order)
        if geo:
            geocoded.append(geo)
        else:
            failed.append(order)
        # Rate limit: Nominatim allows 1 req/sec
        if needs_geocoding.index(order) < len(needs_geocoding) - 1:
            await asyncio.sleep(1.1)

    await db.flush()
    return geocoded, failed


def _compute_cluster_distance(geo_orders: list[GeoOrder]) -> float:
    """Sum of distances between consecutive orders (simple route estimate)."""
    if len(geo_orders) < 2:
        return 0.0
    total = 0.0
    for i in range(len(geo_orders) - 1):
        total += haversine_km(geo_orders[i].lat, geo_orders[i].lng, geo_orders[i + 1].lat, geo_orders[i + 1].lng)
    return round(total, 1)


def _compute_naive_distance(geo_orders: list[GeoOrder], centroid_lat: float, centroid_lng: float) -> float:
    """Sum of individual round-trips from centroid to each order (baseline for efficiency)."""
    return sum(haversine_km(centroid_lat, centroid_lng, g.lat, g.lng) * 2 for g in geo_orders)


def _time_window(geo_orders: list[GeoOrder]) -> str:
    dates = [g.order.scheduled_at for g in geo_orders if g.order.scheduled_at]
    if not dates:
        return "Flexible"
    earliest = min(dates)
    latest = max(dates)
    if earliest.date() == latest.date():
        return earliest.strftime("%d %b, %I:%M %p")
    return f"{earliest.strftime('%d %b')} - {latest.strftime('%d %b')}"


async def cluster_orders(
    db: AsyncSession,
    orders: list[Order],
    radius_km: float = 5.0,
    max_clusters: int = 8,
) -> tuple[list[ClusterResult], list[Order]]:
    """
    Cluster orders by geographic proximity using simple agglomerative approach.
    Returns (clusters, unbatched_orders).
    """
    geocoded, failed = await _geocode_all(db, orders)

    if not geocoded:
        return [], failed

    # Sort by lat for deterministic results
    geocoded.sort(key=lambda g: (g.lat, g.lng))

    assigned = set()
    clusters: list[ClusterResult] = []

    for seed in geocoded:
        if id(seed) in assigned or len(clusters) >= max_clusters:
            continue

        # Start a new cluster with this seed
        cluster_members = [seed]
        assigned.add(id(seed))

        # Find all unassigned orders within radius
        for candidate in geocoded:
            if id(candidate) in assigned:
                continue
            dist = haversine_km(seed.lat, seed.lng, candidate.lat, candidate.lng)
            if dist <= radius_km:
                cluster_members.append(candidate)
                assigned.add(id(candidate))

        # Compute centroid
        centroid_lat = sum(g.lat for g in cluster_members) / len(cluster_members)
        centroid_lng = sum(g.lng for g in cluster_members) / len(cluster_members)

        # Compute metrics
        cluster_dist = _compute_cluster_distance(cluster_members)
        naive_dist = _compute_naive_distance(cluster_members, centroid_lat, centroid_lng)
        efficiency = round((1 - cluster_dist / naive_dist) * 100, 1) if naive_dist > 0 else 95.0
        efficiency = max(0.0, min(100.0, efficiency))

        clusters.append(
            ClusterResult(
                cluster_id=len(clusters) + 1,
                centroid_lat=centroid_lat,
                centroid_lng=centroid_lng,
                orders=cluster_members,
                total_distance_km=cluster_dist,
                efficiency_pct=efficiency,
                time_window=_time_window(cluster_members),
            )
        )

    # Any remaining unassigned go to unbatched
    for g in geocoded:
        if id(g) not in assigned:
            failed.append(g.order)

    return clusters, failed

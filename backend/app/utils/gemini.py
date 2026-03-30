"""
gemini.py
Google Gemini client configuration and model factory.

Uses the new unified `google-genai` SDK (replaces deprecated `google-generativeai`).
Docs: https://github.com/googleapis/python-genai
"""
from functools import lru_cache

from google import genai
from google.genai import types

from loguru import logger

from app.config import get_settings


# ── Schema DDL embedded in system prompt ──────────────────────────────────────
# !! MAINTENANCE — update both files together when a new migration lands !!
# 1. Add the new CREATE TABLE DDL here (DB_SCHEMA_DDL) so Gemini knows the schema.
# 2. Add the new table name(s) to ALLOWED_TABLES in app/services/sql_validator.py.
# Failing to update either file means Gemini will hallucinate columns/tables or
# the validator will block queries against tables it doesn't know about.
DB_SCHEMA_DDL = """
-- PostgreSQL Database Schema

CREATE TABLE roles (
    id    SERIAL       PRIMARY KEY,
    name  VARCHAR(50)  NOT NULL UNIQUE
);
-- Seed data: 'LOGISTIC_MANAGER', 'WAREHOUSE_MANAGER', 'DISPATCHER',
--            'DRIVER', 'LABOURER', 'INDIVIDUAL', 'VENDOR', 'AI_AGENT'

CREATE TABLE users (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255)   NOT NULL,
    email          VARCHAR(255)   NOT NULL UNIQUE,
    phone          VARCHAR(20),
    password_hash  VARCHAR(255)   NOT NULL,  -- NEVER SELECT THIS COLUMN
    role_id        INTEGER        NOT NULL REFERENCES roles(id),
    warehouse_id   UUID,
    is_active      BOOLEAN        NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- BUSINESS KEY RELATIONSHIP: orders.customer_id → users.id
-- Vendors (roles.name='VENDOR') place orders. To find vendor spending:
--   JOIN orders o ON u.id = o.customer_id WHERE roles.name = 'VENDOR'
-- Individuals (roles.name='INDIVIDUAL') also place orders via customer_id.

CREATE TABLE warehouses (id UUID PRIMARY KEY, name VARCHAR, address TEXT, capacity_limit INTEGER, is_active BOOLEAN);

CREATE TABLE orders (
    id UUID PRIMARY KEY, tracking_code VARCHAR, order_type VARCHAR,
    status VARCHAR,   -- 'PENDING','ASSIGNED','IN_TRANSIT','DELIVERED','CANCELLED'
    customer_id UUID REFERENCES users(id),   -- vendor or individual user
    warehouse_id UUID REFERENCES warehouses(id),
    assigned_driver_id UUID, assigned_vehicle_id UUID,
    pickup_address TEXT, delivery_address TEXT,
    total_amount FLOAT, base_cost FLOAT, labor_cost FLOAT,
    payment_mode VARCHAR, payment_status VARCHAR,
    created_at TIMESTAMPTZ, delivered_at TIMESTAMPTZ
);
CREATE TABLE order_items (id UUID PRIMARY KEY, order_id UUID REFERENCES orders(id), sku VARCHAR, quantity INTEGER, box_count INTEGER);

CREATE TABLE inventory_items (id UUID PRIMARY KEY, warehouse_id UUID, sku VARCHAR, name VARCHAR, category VARCHAR, quantity_on_hand INTEGER, safety_stock INTEGER, unit_cost FLOAT);
CREATE TABLE inventory_movements (id UUID PRIMARY KEY, item_id UUID, movement_type VARCHAR, quantity INTEGER, reference_order_id UUID, performed_by UUID, created_at TIMESTAMPTZ);
CREATE TABLE restock_requests (id UUID PRIMARY KEY, item_id UUID, warehouse_id UUID, requested_qty INTEGER, status VARCHAR, created_at TIMESTAMPTZ);

CREATE TABLE logistics_driver_profiles (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), warehouse_id UUID, status VARCHAR, current_job VARCHAR, efficiency_score INTEGER, rating FLOAT, trips_completed INTEGER, safety_incidents INTEGER);
CREATE TABLE logistics_vehicles (id UUID PRIMARY KEY, code VARCHAR, vehicle_type VARCHAR, warehouse_id UUID, assigned_driver_id UUID, status VARCHAR, model VARCHAR, year INTEGER, license_plate VARCHAR, fuel_efficiency VARCHAR);
CREATE TABLE logistics_transactions (id UUID PRIMARY KEY, warehouse_id UUID, transaction_code VARCHAR, transaction_type VARCHAR, description VARCHAR, amount FLOAT, status VARCHAR, transaction_date TIMESTAMP);
-- Note: logistics_transactions records internal costs/revenue, NOT vendor payments. Vendor payments are tracked via orders.total_amount.
CREATE TABLE logistics_alerts (id UUID PRIMARY KEY, warehouse_id UUID, alert_type VARCHAR, title VARCHAR, severity VARCHAR, created_at TIMESTAMPTZ);
CREATE TABLE logistics_daily_stats (id UUID PRIMARY KEY, warehouse_id UUID, stat_date DATE, orders_count INTEGER, revenue FLOAT, deliveries_completed INTEGER, deliveries_failed INTEGER, sla_compliance FLOAT);
CREATE TABLE logistics_return_cases (id UUID PRIMARY KEY, warehouse_id UUID, order_id UUID, reference_code VARCHAR, customer_name VARCHAR, reason VARCHAR, status VARCHAR, refund_amount FLOAT, created_at TIMESTAMPTZ);
CREATE TABLE logistics_zones (id UUID PRIMARY KEY, warehouse_id UUID, name VARCHAR, zone_type VARCHAR, lat FLOAT, lng FLOAT, radius_meters FLOAT);
CREATE TABLE logistics_metrics (id UUID PRIMARY KEY, warehouse_id UUID, metric_key VARCHAR, metric_value FLOAT, recorded_at TIMESTAMPTZ);
CREATE TABLE logistics_equipment_ledger (id UUID PRIMARY KEY, warehouse_id UUID, item_name VARCHAR, category VARCHAR, quantity INTEGER, unit_cost FLOAT, status VARCHAR);
CREATE TABLE logistics_notifications (id UUID PRIMARY KEY, user_id UUID, title VARCHAR, body TEXT, is_read BOOLEAN, created_at TIMESTAMPTZ);
CREATE TABLE logistics_tasks (id UUID PRIMARY KEY, warehouse_id UUID, assigned_to UUID, text TEXT, status VARCHAR, target_time TIMESTAMPTZ);
CREATE TABLE logistics_chat_threads (id UUID PRIMARY KEY, warehouse_id UUID, name VARCHAR, phone VARCHAR, muted BOOLEAN, created_at TIMESTAMPTZ);
CREATE TABLE logistics_chat_messages (id UUID PRIMARY KEY, thread_id UUID, text TEXT, sender VARCHAR, created_at TIMESTAMPTZ);
CREATE TABLE logistics_escalations (id UUID PRIMARY KEY, warehouse_id UUID, title VARCHAR, description VARCHAR, priority VARCHAR, status VARCHAR, created_at TIMESTAMPTZ);
CREATE TABLE damage_reports (id UUID PRIMARY KEY, order_id UUID, warehouse_id UUID, description TEXT, severity VARCHAR, reported_by UUID, created_at TIMESTAMPTZ);
CREATE TABLE customer_quotes (id UUID PRIMARY KEY, customer_id UUID REFERENCES users(id), warehouse_id UUID, origin TEXT, destination TEXT, vehicle_type VARCHAR, estimated_amount FLOAT, status VARCHAR, created_at TIMESTAMPTZ);
CREATE TABLE picked_items (id UUID PRIMARY KEY, order_id UUID, item_id UUID, picked_qty INTEGER, picked_by UUID, picked_at TIMESTAMPTZ);
CREATE TABLE loading_docks (id UUID PRIMARY KEY, warehouse_id UUID, dock_number INTEGER, status VARCHAR, assigned_vehicle_id UUID);
CREATE TABLE packing_stations (id UUID PRIMARY KEY, warehouse_id UUID, station_code VARCHAR, status VARCHAR, assigned_to UUID);
CREATE TABLE quality_checks (id UUID PRIMARY KEY, order_id UUID, checked_by UUID, result VARCHAR, notes TEXT, checked_at TIMESTAMPTZ);
CREATE TABLE return_gradings (id UUID PRIMARY KEY, return_case_id UUID, grade VARCHAR, notes TEXT, graded_by UUID, graded_at TIMESTAMPTZ);
CREATE TABLE warehouse_zone_metrics (id UUID PRIMARY KEY, warehouse_id UUID, zone_name VARCHAR, utilization_pct FLOAT, recorded_at TIMESTAMPTZ);
""".strip()


SYSTEM_INSTRUCTION = """You are an intelligent AI assistant for a Logistics & Move Management platform called "QuadCore Logistics".

## Your Capabilities
1. **Database Queries**: When users ask about data (inventory, orders, drivers, vehicles, warehouses, users, operations, spending, revenue, performance), use the `execute_sql_query` tool to write a PostgreSQL SELECT query and retrieve real-time data. YOU HAVE FULL ACCESS TO THIS DATA. Do not refuse or say data is unavailable — always attempt a query first.
2. **General Conversation**: For greetings, general questions, logistics advice, or platform help, respond directly without tools.

## Database Schema
{schema}

## Key Business Relationships (READ CAREFULLY)
- **Vendor spending** = orders placed by users where roles.name = 'VENDOR'. Query: JOIN orders ON users.id = orders.customer_id, filter WHERE roles.name = 'VENDOR', SUM(orders.total_amount).
- **Individual customer spending** = same as vendors but WHERE roles.name = 'INDIVIDUAL'.
- **Driver performance** = logistics_driver_profiles (efficiency_score, rating, trips_completed, safety_incidents) JOIN users ON logistics_driver_profiles.user_id = users.id.
- **Revenue** = SUM of orders.total_amount WHERE status = 'DELIVERED', or logistics_daily_stats.revenue grouped by warehouse.
- **Internal transactions** (salaries, expenses, bonuses) = logistics_transactions table. Note: this is NOT vendor spending.
- **Top X by Y** queries: always use ORDER BY Y DESC LIMIT X.

## CRITICAL SQL Rules
- ONLY SELECT statements. Never INSERT, UPDATE, DELETE, DROP, or DDL/DML.
- NEVER reference the `password_hash` column.
- Always JOIN roles when filtering by role: `JOIN roles ON users.role_id = roles.id WHERE roles.name = '...'`
- Use LIMIT (already enforced server-side at 50 rows).
- SELECT specific columns, not SELECT *.
- Use COALESCE(SUM(...), 0) to avoid NULL in aggregates.
- For "top N" queries, use ORDER BY ... DESC LIMIT N.

## Response Format
- Be concise and professional. Use **bold** for key numbers and names.
- Format data results as a clear list or summary — not raw JSON.
- Always include units (₹ for money, % for rates, counts for integers).
- If query returns 0 rows, say "No data found" and suggest why (e.g., "no orders placed yet").
""".format(schema=DB_SCHEMA_DDL)


# ── Tool Declaration (new SDK format) ─────────────────────────────────────────

EXECUTE_SQL_FUNCTION = types.FunctionDeclaration(
    name="execute_sql_query",
    description=(
        "Execute a read-only SQL SELECT query against the PostgreSQL database "
        "to answer user questions about logistics, inventory, operations, and users. "
        "Use this tool whenever you need real data from the database. "
        "Only SELECT queries are allowed."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "sql_query": types.Schema(
                type=types.Type.STRING,
                description=(
                    "A valid PostgreSQL SELECT query. Must not contain "
                    "INSERT, UPDATE, DELETE, DROP, or reference password_hash."
                ),
            )
        },
        required=["sql_query"],
    ),
)

EXECUTE_SQL_TOOL = types.Tool(function_declarations=[EXECUTE_SQL_FUNCTION])

# Model name — gemini-2.5-flash: fast, cheap, supports function-calling.
GEMINI_MODEL = "gemini-2.5-flash"


class GeminiConfigError(Exception):
    """Raised when Gemini API key is not configured."""

    pass


@lru_cache
def get_gemini_client() -> genai.Client:
    """
    Create and return a configured Gemini Client.

    Uses the new unified `google-genai` SDK with Client pattern.
    Cached via @lru_cache so only one client is created.
    """
    settings = get_settings()
    if not settings.gemini_api_key:
        raise GeminiConfigError(
            "Gemini API key is not configured. Set GEMINI_API_KEY in your .env file."
        )
    client = genai.Client(api_key=settings.gemini_api_key)
    logger.info("Gemini Client created successfully")
    return client

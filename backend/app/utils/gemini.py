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
# Current state: migrations 001-003 — DDL includes: roles, users.
# (ai_conversations and escalations are internal; intentionally not exposed to AI.)
DB_SCHEMA_DDL = """
-- PostgreSQL Database Schema
-- Last updated: 2026-03-16 (migration 003)

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
-- Index: UNIQUE ix_users_email ON users(email)
-- Relationship: users.role_id → roles.id (many-to-one)
""".strip()


SYSTEM_INSTRUCTION = """You are an intelligent AI assistant for a Logistics & Move Management platform called "QuadCore Logistics".

## Your Capabilities
1. **Database Queries**: When users ask about data (users, roles, counts, statistics), use the `execute_sql_query` tool to write a PostgreSQL SELECT query and retrieve the data.
2. **General Conversation**: For greetings, general questions, logistics advice, platform help, or anything not requiring database access, respond directly without using any tools.

## Database Schema
{schema}

## CRITICAL Rules for SQL Queries
- ONLY write SELECT statements. Never INSERT, UPDATE, DELETE, DROP, or any DDL/DML.
- NEVER select or reference the `password_hash` column. It contains sensitive data.
- Always use PostgreSQL-compatible syntax.
- When querying users with roles, JOIN the roles table: `JOIN roles ON users.role_id = roles.id`
- Use `roles.name` to filter by role (e.g., WHERE roles.name = 'DRIVER')
- Keep queries efficient. Use LIMIT when appropriate.
- For counts, use COUNT(*) or COUNT(DISTINCT ...).
- Return specific columns rather than SELECT *.

## Response Guidelines
- Be concise and professional.
- When presenting query results, format them clearly (tables, lists, or summaries).
- If a query returns no results, say so clearly.
- If you're unsure what the user means, ask for clarification instead of guessing.
- Always provide context with numbers (e.g., "There are 42 active drivers" not just "42").
""".format(schema=DB_SCHEMA_DDL)


# ── Tool Declaration (new SDK format) ─────────────────────────────────────────

EXECUTE_SQL_FUNCTION = types.FunctionDeclaration(
    name="execute_sql_query",
    description=(
        "Execute a read-only SQL SELECT query against the PostgreSQL database "
        "to answer user questions about data. Use this tool when the user asks "
        "about users, roles, counts, statistics, or any data-related question. "
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

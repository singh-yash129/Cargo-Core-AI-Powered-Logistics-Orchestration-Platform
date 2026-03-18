"""
ai_service.py
Core orchestration layer for the AI chatbot.

Handles: Gemini interaction, SQL validation & execution, conversation persistence.

Uses the new unified `google-genai` SDK with async client (`client.aio`).
"""
import json
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from google.genai import types
from loguru import logger
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_conversation import AIConversation
from app.models.escalation import Escalation
from app.models.user import User
from app.schemas.ai import (
    ChatResponse,
    ConversationHistory,
    ConversationMessage,
    EscalationListResponse,
    EscalationResponse,
    SessionListItem,
    SessionListResponse,
)
from app.services.sql_validator import SQLValidationError, validate_sql
from app.utils.gemini import (
    EXECUTE_SQL_TOOL,
    GEMINI_MODEL,
    SYSTEM_INSTRUCTION,
    GeminiConfigError,
    get_gemini_client,
)

# Maximum conversation messages to include in context window.
MAX_CONTEXT_MESSAGES = 20


# ── Main Chat Endpoint ────────────────────────────────────────────────────────


async def chat(
    db: AsyncSession,
    ro_db: AsyncSession,
    user: User,
    session_id: uuid.UUID | None,
    user_message: str,
) -> ChatResponse:
    """
    Process a user message through the AI chatbot pipeline.

    1. Load conversation history for context
    2. Send to Gemini with tools
    3. If Gemini calls execute_sql_query → validate → execute on ro_db → feed back
    4. Persist messages to ai_conversations
    5. Return response
    """
    # Generate new session ID if starting a new conversation
    if session_id is None:
        session_id = uuid.uuid4()

    # ── Step 1: Load conversation history ─────────────────────────────────
    history = await _load_conversation_history(db, session_id, user.id)
    gemini_history = _build_gemini_history(history)

    # ── Step 2: Call Gemini ───────────────────────────────────────────────
    try:
        client = get_gemini_client()
    except GeminiConfigError as e:
        logger.error(f"Gemini not configured: {e}")
        # Persist user message even on error
        await _persist_message(db, session_id, user.id, "user", user_message, "error")
        error_msg = "AI service is not configured. Please contact your administrator."
        await _persist_message(db, session_id, user.id, "assistant", error_msg, "error")
        return ChatResponse(
            session_id=session_id,
            message=error_msg,
            intent="error",
            sql_generated=None,
        )

    try:
        # Build contents: history + new user message
        contents = gemini_history + [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_message)],
            )
        ]

        # Call Gemini async with function-calling disabled (we handle it manually)
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                tools=[EXECUTE_SQL_TOOL],
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=True,
                ),
            ),
        )
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        await _persist_message(db, session_id, user.id, "user", user_message, "error")
        error_msg = "Sorry, I encountered an error processing your request. Please try again."
        await _persist_message(db, session_id, user.id, "assistant", error_msg, "error")
        return ChatResponse(
            session_id=session_id,
            message=error_msg,
            intent="error",
            sql_generated=None,
        )

    # ── Step 3: Check if Gemini wants to call a function ──────────────────
    if response.function_calls:
        function_call = response.function_calls[0]
        return await _handle_function_call(
            db=db,
            ro_db=ro_db,
            user_id=user.id,
            session_id=session_id,
            user_message=user_message,
            client=client,
            contents=contents,
            response=response,
            function_call=function_call,
        )

    # ── Step 4: Plain text response (general query) ──────────────────────
    assistant_message = response.text
    intent = _classify_intent(user_message, assistant_message)

    # Persist both messages
    await _persist_message(db, session_id, user.id, "user", user_message, intent)
    await _persist_message(db, session_id, user.id, "assistant", assistant_message, intent)

    return ChatResponse(
        session_id=session_id,
        message=assistant_message,
        intent=intent,
        sql_generated=None,
    )


# ── Function Call Handler ─────────────────────────────────────────────────────


async def _handle_function_call(
    db: AsyncSession,
    ro_db: AsyncSession,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    user_message: str,
    client,
    contents: list,
    response,
    function_call,
) -> ChatResponse:
    """
    Handle a Gemini function call (execute_sql_query).

    Validates the SQL, executes on read-only session, feeds results back to Gemini.
    Uses the new google-genai SDK pattern for multi-turn function calling.
    """
    fn_name = function_call.name
    fn_args = dict(function_call.args) if function_call.args else {}

    logger.info(f"Gemini function call: {fn_name}({fn_args})")

    if fn_name != "execute_sql_query":
        logger.warning(f"Unknown function call: {fn_name}")
        error_msg = "I tried to use an unknown tool. Let me try answering directly."
        await _persist_message(db, session_id, user_id, "user", user_message, "error")
        await _persist_message(db, session_id, user_id, "assistant", error_msg, "error")
        return ChatResponse(
            session_id=session_id,
            message=error_msg,
            intent="error",
            sql_generated=None,
        )

    raw_sql = fn_args.get("sql_query", "")

    # ── Validate SQL ──────────────────────────────────────────────────────
    try:
        validated_sql = validate_sql(raw_sql)
    except SQLValidationError as e:
        logger.warning(f"SQL validation failed: {e} | SQL: {raw_sql}")
        # Build the function response with error and send back to Gemini
        error_result = {"error": f"Query rejected: {str(e)}"}
        try:
            # Append the model's function call + our error response, then re-call
            follow_up_contents = contents + [
                response.candidates[0].content,
                types.Content(
                    role="tool",
                    parts=[
                        types.Part.from_function_response(
                            name="execute_sql_query",
                            response=error_result,
                        )
                    ],
                ),
            ]
            follow_up = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=follow_up_contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    tools=[EXECUTE_SQL_TOOL],
                ),
            )
            assistant_message = follow_up.text
        except Exception:
            assistant_message = (
                f"I tried to query the database but the query was rejected: {str(e)}. "
                "Could you rephrase your question?"
            )

        await _persist_message(
            db, session_id, user_id, "user", user_message, "error",
            sql_generated=raw_sql,
        )
        await _persist_message(
            db, session_id, user_id, "assistant", assistant_message, "error",
            sql_generated=raw_sql,
        )
        return ChatResponse(
            session_id=session_id,
            message=assistant_message,
            intent="error",
            sql_generated=raw_sql,
        )

    # ── Execute SQL on read-only session ──────────────────────────────────
    try:
        result = await ro_db.execute(text(validated_sql))
        rows = result.fetchall()
        columns = list(result.keys())

        # Serialize results to JSON-friendly format
        query_result = [dict(zip(columns, row)) for row in rows]

        # Convert non-serializable types (UUID, datetime, etc.)
        query_result = _make_json_serializable(query_result)

        logger.info(f"SQL executed successfully: {len(query_result)} rows returned")

    except Exception as e:
        logger.error(f"SQL execution error: {e} | SQL: {validated_sql}")
        error_result = {"error": f"Query execution failed: {str(e)}"}
        try:
            follow_up_contents = contents + [
                response.candidates[0].content,
                types.Content(
                    role="tool",
                    parts=[
                        types.Part.from_function_response(
                            name="execute_sql_query",
                            response=error_result,
                        )
                    ],
                ),
            ]
            follow_up = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=follow_up_contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    tools=[EXECUTE_SQL_TOOL],
                ),
            )
            assistant_message = follow_up.text
        except Exception:
            assistant_message = (
                "I tried to query the database but encountered an execution error. "
                "Could you rephrase your question?"
            )

        await _persist_message(
            db, session_id, user_id, "user", user_message, "error",
            sql_generated=validated_sql,
        )
        await _persist_message(
            db, session_id, user_id, "assistant", assistant_message, "error",
            sql_generated=validated_sql,
        )
        return ChatResponse(
            session_id=session_id,
            message=assistant_message,
            intent="error",
            sql_generated=validated_sql,
        )

    # ── Feed results back to Gemini ───────────────────────────────────────
    function_response_data = {
        "columns": columns,
        "row_count": len(query_result),
        "data": query_result,
    }

    try:
        # Build multi-turn: original contents + model's function call + our result
        follow_up_contents = contents + [
            response.candidates[0].content,
            types.Content(
                role="tool",
                parts=[
                    types.Part.from_function_response(
                        name="execute_sql_query",
                        response=function_response_data,
                    )
                ],
            ),
        ]
        follow_up = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=follow_up_contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                tools=[EXECUTE_SQL_TOOL],
            ),
        )
        assistant_message = follow_up.text
    except Exception as e:
        logger.error(f"Gemini response error after function call: {e}")
        # Fallback: format results directly
        assistant_message = _format_results_fallback(query_result, columns)

    # ── Persist messages ──────────────────────────────────────────────────
    await _persist_message(
        db, session_id, user_id, "user", user_message, "db_query",
        sql_generated=validated_sql, query_result=query_result,
    )
    await _persist_message(
        db, session_id, user_id, "assistant", assistant_message, "db_query",
        sql_generated=validated_sql,
    )

    return ChatResponse(
        session_id=session_id,
        message=assistant_message,
        intent="db_query",
        sql_generated=validated_sql,
    )


# ── Conversation History ──────────────────────────────────────────────────────


async def get_conversation_history(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
) -> ConversationHistory:
    """Get all messages for a conversation session."""
    result = await db.execute(
        select(AIConversation)
        .where(
            AIConversation.session_id == session_id,
            AIConversation.user_id == user_id,
        )
        .order_by(AIConversation.created_at.asc())
    )
    messages = result.scalars().all()

    return ConversationHistory(
        session_id=session_id,
        messages=[
            ConversationMessage(
                role=msg.role,
                message=msg.message,
                intent=msg.intent,
                sql_generated=msg.sql_generated,
                created_at=msg.created_at,
            )
            for msg in messages
        ],
    )


async def get_user_sessions(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> SessionListResponse:
    """List all conversation sessions for a user, most recent first."""
    # Subquery: get last message and count per session
    result = await db.execute(
        select(
            AIConversation.session_id,
            func.max(AIConversation.message).label("last_message"),
            func.count(AIConversation.id).label("message_count"),
            func.min(AIConversation.created_at).label("created_at"),
        )
        .where(AIConversation.user_id == user_id)
        .group_by(AIConversation.session_id)
        .order_by(func.max(AIConversation.created_at).desc())
    )
    rows = result.all()

    return SessionListResponse(
        sessions=[
            SessionListItem(
                session_id=row.session_id,
                last_message=row.last_message[:100] if row.last_message else "",
                message_count=row.message_count,
                created_at=row.created_at,
            )
            for row in rows
        ]
    )


# ── Private Helpers ───────────────────────────────────────────────────────────


async def _load_conversation_history(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
) -> list[AIConversation]:
    """Load recent conversation messages for context."""
    result = await db.execute(
        select(AIConversation)
        .where(
            AIConversation.session_id == session_id,
            AIConversation.user_id == user_id,
        )
        .order_by(AIConversation.created_at.desc())
        .limit(MAX_CONTEXT_MESSAGES)
    )
    messages = list(result.scalars().all())
    messages.reverse()  # Oldest first for context
    return messages


def _build_gemini_history(messages: list[AIConversation]) -> list[types.Content]:
    """Convert stored messages to Gemini history format."""
    history: list[types.Content] = []
    for msg in messages:
        gemini_role = "user" if msg.role == "user" else "model"
        history.append(
            types.Content(
                role=gemini_role,
                parts=[types.Part.from_text(text=msg.message)],
            )
        )
    return history


async def _persist_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
    role: str,
    message: str,
    intent: str | None = None,
    sql_generated: str | None = None,
    query_result: list | dict | None = None,
) -> None:
    """Save a message to the ai_conversations table."""
    conversation = AIConversation(
        session_id=session_id,
        user_id=user_id,
        role=role,
        message=message,
        intent=intent,
        sql_generated=sql_generated,
        query_result=query_result,
    )
    db.add(conversation)
    await db.flush()


def _classify_intent(user_message: str, assistant_message: str) -> str:
    """Simple heuristic intent classification for non-DB responses."""
    msg_lower = user_message.lower().strip()

    greetings = {"hi", "hello", "hey", "good morning", "good afternoon", "good evening"}
    if any(msg_lower.startswith(g) for g in greetings):
        return "greeting"

    return "general"


def _make_json_serializable(data: list[dict]) -> list[dict]:
    """Convert non-JSON-serializable types to strings."""
    serialized = []
    for row in data:
        clean_row = {}
        for key, value in row.items():
            if isinstance(value, (datetime,)):
                clean_row[key] = value.isoformat()
            elif isinstance(value, uuid.UUID):
                clean_row[key] = str(value)
            elif isinstance(value, Decimal):
                # Convert Decimal to float (or int if it's a whole number)
                clean_row[key] = int(value) if value == value.to_integral_value() else float(value)
            elif isinstance(value, bytes):
                clean_row[key] = value.decode("utf-8", errors="replace")
            else:
                clean_row[key] = value
        serialized.append(clean_row)
    return serialized


def _format_results_fallback(results: list[dict], columns: list[str]) -> str:
    """Format query results as a readable string when Gemini fails to respond."""
    if not results:
        return "The query returned no results."

    if len(results) == 1 and len(columns) == 1:
        # Single value (e.g., COUNT)
        val = list(results[0].values())[0]
        return f"Result: {val}"

    # Simple table format
    lines = [f"Query returned {len(results)} row(s):"]
    lines.append(" | ".join(columns))
    lines.append("-" * (len(" | ".join(columns))))
    for row in results[:20]:  # Cap display at 20 rows
        lines.append(" | ".join(str(row.get(c, "")) for c in columns))

    if len(results) > 20:
        lines.append(f"... and {len(results) - 20} more rows")

    return "\n".join(lines)


# ── Escalation Functions ───────────────────────────────────────────────────────


async def escalate_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
    reason: str,
) -> Escalation:
    """
    Escalate an AI conversation to a human agent.

    Verifies the conversation belongs to the requesting user before creating
    the escalation record.
    """
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conversation_id,
            AIConversation.user_id == user_id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise ValueError("Conversation not found or you don't have access to it.")

    escalation = Escalation(
        conversation_id=conversation_id,
        reason=reason,
        status="OPEN",
    )
    db.add(escalation)
    await db.flush()
    return escalation


async def list_escalations(
    db: AsyncSession,
    status_filter: str | None = None,
) -> list[Escalation]:
    """List escalations, optionally filtered by status (OPEN / RESOLVED)."""
    query = select(Escalation).order_by(Escalation.escalated_at.desc())
    if status_filter:
        query = query.where(Escalation.status == status_filter.upper())
    result = await db.execute(query)
    return list(result.scalars().all())


async def resolve_escalation(
    db: AsyncSession,
    escalation_id: uuid.UUID,
) -> Escalation:
    """Mark an escalation as RESOLVED and set resolved_at to now."""
    from datetime import timezone

    result = await db.execute(
        select(Escalation).where(Escalation.id == escalation_id)
    )
    escalation = result.scalar_one_or_none()
    if escalation is None:
        raise ValueError("Escalation not found.")

    escalation.status = "RESOLVED"
    escalation.resolved_at = datetime.now(timezone.utc)
    await db.flush()
    return escalation

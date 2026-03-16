"""
test_ai_endpoints.py
Integration tests for the AI chatbot API endpoints.

All Gemini API calls are mocked — no real LLM calls in tests.
Uses the new google-genai SDK patterns (client.aio.models.generate_content).
"""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import AsyncClient


# ── Helpers ───────────────────────────────────────────────────────────────────


def _mock_gemini_text_response(text: str):
    """Create a mock Gemini response that returns plain text (no function call)."""
    response = MagicMock()
    response.function_calls = None  # No function calls
    response.text = text

    # Provide candidate content for multi-turn follow-up
    content = MagicMock()
    content.role = "model"
    content.parts = [MagicMock(text=text)]
    candidate = MagicMock()
    candidate.content = content
    response.candidates = [candidate]
    return response


def _mock_gemini_function_call_response(fn_name: str, args: dict):
    """Create a mock Gemini response that wants to call a function."""
    fc = MagicMock()
    fc.name = fn_name
    fc.args = args

    response = MagicMock()
    response.function_calls = [fc]

    # Candidate content needed for building follow-up contents
    content = MagicMock()
    content.role = "model"
    content.parts = [MagicMock()]
    candidate = MagicMock()
    candidate.content = content
    response.candidates = [candidate]
    return response


def _mock_gemini_client(responses: list):
    """Create a mock Gemini client whose aio.models.generate_content returns
    responses sequentially (async)."""
    client = MagicMock()
    client.aio.models.generate_content = AsyncMock(side_effect=responses)
    return client


# ── Test: General (non-DB) queries ────────────────────────────────────────────


@pytest.mark.asyncio
class TestChatGeneral:
    async def test_greeting_returns_text(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """A greeting should get a direct text response, no SQL."""
        token = registered_user_tokens["access_token"]

        text_response = _mock_gemini_text_response("Hello! How can I help you today?")
        mock_client = _mock_gemini_client([text_response])

        with patch("app.services.ai_service.get_gemini_client", return_value=mock_client):
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": "Hello!"},
                headers={"Authorization": f"Bearer {token}"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["message"] == "Hello! How can I help you today?"
        assert data["intent"] == "greeting"
        assert data["sql_generated"] is None
        assert "session_id" in data

    async def test_general_question(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """A general question should get a direct text response."""
        token = registered_user_tokens["access_token"]

        text_response = _mock_gemini_text_response(
            "Logistics management involves planning, implementing, and controlling the flow of goods."
        )
        mock_client = _mock_gemini_client([text_response])

        with patch("app.services.ai_service.get_gemini_client", return_value=mock_client):
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": "What is logistics management?"},
                headers={"Authorization": f"Bearer {token}"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert "logistics" in data["message"].lower()
        assert data["intent"] == "general"
        assert data["sql_generated"] is None


# ── Test: Database queries ────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestChatDatabaseQuery:
    async def test_count_query(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """A data question should trigger function call → SQL → response."""
        token = registered_user_tokens["access_token"]

        # First response: Gemini wants to call execute_sql_query
        fn_call_response = _mock_gemini_function_call_response(
            "execute_sql_query",
            {"sql_query": "SELECT COUNT(*) as total FROM users"},
        )
        # Second response: After receiving query results, Gemini answers
        final_response = _mock_gemini_text_response(
            "There is currently 1 registered user in the system."
        )
        mock_client = _mock_gemini_client([fn_call_response, final_response])

        with patch("app.services.ai_service.get_gemini_client", return_value=mock_client):
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": "How many users are registered?"},
                headers={"Authorization": f"Bearer {token}"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "db_query"
        assert data["sql_generated"] is not None
        assert "SELECT COUNT" in data["sql_generated"]


# ── Test: SQL validation errors ───────────────────────────────────────────────


@pytest.mark.asyncio
class TestChatSQLValidation:
    async def test_malicious_sql_rejected(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """If Gemini generates a malicious query, it should be rejected."""
        token = registered_user_tokens["access_token"]

        # Gemini tries to DROP TABLE
        fn_call_response = _mock_gemini_function_call_response(
            "execute_sql_query",
            {"sql_query": "DROP TABLE users"},
        )
        # After rejection, Gemini should explain
        error_response = _mock_gemini_text_response(
            "I'm sorry, I was unable to run that query. Could you rephrase?"
        )
        mock_client = _mock_gemini_client([fn_call_response, error_response])

        with patch("app.services.ai_service.get_gemini_client", return_value=mock_client):
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": "Drop the users table"},
                headers={"Authorization": f"Bearer {token}"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "error"

    async def test_password_hash_query_rejected(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """Queries referencing password_hash should be rejected."""
        token = registered_user_tokens["access_token"]

        fn_call_response = _mock_gemini_function_call_response(
            "execute_sql_query",
            {"sql_query": "SELECT name, password_hash FROM users"},
        )
        error_response = _mock_gemini_text_response(
            "I cannot access password data for security reasons."
        )
        mock_client = _mock_gemini_client([fn_call_response, error_response])

        with patch("app.services.ai_service.get_gemini_client", return_value=mock_client):
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": "Show me user passwords"},
                headers={"Authorization": f"Bearer {token}"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "error"


# ── Test: Authentication ──────────────────────────────────────────────────────


@pytest.mark.asyncio
class TestChatAuth:
    async def test_unauthenticated_returns_401(self, client: AsyncClient):
        """Chat endpoint requires authentication."""
        resp = await client.post(
            "/api/v1/ai/chat",
            json={"message": "Hello"},
        )
        assert resp.status_code == 401

    async def test_sessions_unauthenticated_returns_401(self, client: AsyncClient):
        resp = await client.get("/api/v1/ai/sessions")
        assert resp.status_code == 401

    async def test_conversation_unauthenticated_returns_401(self, client: AsyncClient):
        session_id = uuid.uuid4()
        resp = await client.get(f"/api/v1/ai/conversations/{session_id}")
        assert resp.status_code == 401


# ── Test: Conversation persistence & retrieval ────────────────────────────────


@pytest.mark.asyncio
class TestConversationPersistence:
    async def test_session_id_returned(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """A new chat should return a session_id."""
        token = registered_user_tokens["access_token"]

        text_response = _mock_gemini_text_response("Hi there!")
        mock_client = _mock_gemini_client([text_response])

        with patch("app.services.ai_service.get_gemini_client", return_value=mock_client):
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": "Hi"},
                headers={"Authorization": f"Bearer {token}"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["session_id"] is not None

    async def test_conversation_not_found(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """Requesting a non-existent conversation returns 404."""
        token = registered_user_tokens["access_token"]
        fake_session = uuid.uuid4()
        resp = await client.get(
            f"/api/v1/ai/conversations/{fake_session}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404

    async def test_sessions_empty(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """New user should have no sessions."""
        token = registered_user_tokens["access_token"]
        resp = await client.get(
            "/api/v1/ai/sessions",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["sessions"] == []


# ── Test: Gemini unconfigured ─────────────────────────────────────────────────


@pytest.mark.asyncio
class TestGeminiUnconfigured:
    async def test_returns_error_when_no_api_key(
        self, client: AsyncClient, registered_user_tokens: dict
    ):
        """If Gemini API key is missing, chat should return a helpful error."""
        token = registered_user_tokens["access_token"]

        from app.utils.gemini import GeminiConfigError

        with patch(
            "app.services.ai_service.get_gemini_client",
            side_effect=GeminiConfigError("Gemini API key is not configured."),
        ):
            resp = await client.post(
                "/api/v1/ai/chat",
                json={"message": "Hello"},
                headers={"Authorization": f"Bearer {token}"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["intent"] == "error"
        assert "not configured" in data["message"].lower()

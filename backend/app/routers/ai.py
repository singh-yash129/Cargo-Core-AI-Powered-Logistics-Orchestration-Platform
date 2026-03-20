"""
ai.py
AI chatbot endpoints — thin router, all logic in ai_service.
"""
import base64
import json
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, get_ro_db
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    ConversationHistory,
    EscalateRequest,
    EscalationListResponse,
    EscalationResponse,
    SessionListResponse,
)
from app.services import ai_service
from app.utils.gemini import GeminiConfigError, get_gemini_client, GEMINI_MODEL
from google.genai import types as genai_types

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


# ── Vision Estimator ──────────────────────────────────────────────────────────

_VISION_PROMPT = """
You are a logistics AI that analyzes room/space images for moving estimates.

Analyze the image and return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "detected_space": "e.g. Master Bedroom / Living Room",
  "confidence": 92,
  "items": [
    {"name": "Item name", "qty": 1, "fragile": false},
    {"name": "Another item", "qty": 2, "fragile": true}
  ],
  "metrics": {
    "boxes_needed": 12,
    "laborers": 2,
    "bubble_wrap_rolls": 3,
    "heavy_items": 2,
    "estimated_volume_cubic_feet": 95
  },
  "vehicle_recommendation": {
    "type": "tempo",
    "display_name": "Tata Ace / 1.5 Ton Tempo",
    "reason": "Brief reason for vehicle choice"
  },
  "estimated_base_cost_inr": 4500
}

Rules:
- List actual visible furniture/items (beds, wardrobes, TVs, sofas, etc.)
- Mark item as fragile:true if it's glass, electronics, mirrors, crockery etc.
- boxes_needed = estimate based on item volume
- vehicle type must be one of: mini-truck, tempo, lcv, hcv
- estimated_base_cost_inr = rough cost in Indian Rupees (without distance)
- If image is not of a room/space, still return valid JSON but with detected_space: "Unknown / Not a room"
"""


@router.post(
    "/estimate-image",
    summary="Analyze a room photo for moving estimate",
    description="Upload an image. Gemini Vision detects items and returns a moving estimate.",
)
async def estimate_image(
    file: UploadFile = File(..., description="Room photo — JPG or PNG, max 15 MB"),
):
    """Analyze a room photo with Gemini Vision and return a moving estimate."""
    # Validate
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, or WebP images are accepted.",
        )

    raw = await file.read()
    if len(raw) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 15 MB.",
        )

    try:
        client = get_gemini_client()
    except GeminiConfigError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

    # Build inline image part using the new SDK
    image_part = genai_types.Part.from_bytes(data=raw, mime_type=file.content_type)
    text_part  = genai_types.Part.from_text(text=_VISION_PROMPT)

    try:
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=[genai_types.Content(role="user", parts=[image_part, text_part])],
            config=genai_types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
        result_text = response.text.strip()
        # Strip markdown fences if model wraps despite mime type setting
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        return json.loads(result_text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unexpected response. Please try again.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini Vision error: {str(e)}",
        )




@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to the AI chatbot",
    description=(
        "Send a natural language message. The AI decides whether to query the "
        "database or respond directly. Pass `session_id` to continue an existing "
        "conversation, or omit it to start a new one."
    ),
)
async def chat(
    data: ChatRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    ro_db: Annotated[AsyncSession, Depends(get_ro_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    try:
        return await ai_service.chat(
            db=db,
            ro_db=ro_db,
            user=user,
            session_id=data.session_id,
            user_message=data.message,
        )
    except Exception as e:
        # Safety net — never let an unhandled exception reach the client as 500
        import traceback
        traceback.print_exc()
        return ChatResponse(
            session_id=data.session_id or __import__("uuid").uuid4(),
            message="Sorry, an unexpected error occurred. Please try again.",
            intent="error",
            sql_generated=None,
        )


@router.get(
    "/conversations/{session_id}",
    response_model=ConversationHistory,
    summary="Get conversation history",
    description="Retrieve all messages for a specific conversation session.",
)
async def get_conversation(
    session_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    history = await ai_service.get_conversation_history(
        db=db, session_id=session_id, user_id=user.id
    )
    if not history.messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or you don't have access to it.",
        )
    return history


@router.get(
    "/sessions",
    response_model=SessionListResponse,
    summary="List chat sessions",
    description="List all conversation sessions for the current user, most recent first.",
)
async def list_sessions(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    return await ai_service.get_user_sessions(db=db, user_id=user.id)


@router.post(
    "/escalate/{conversation_id}",
    response_model=EscalationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Escalate conversation to human agent",
    description="Flag a conversation for human review. The conversation must belong to the requesting user.",
)
async def escalate_conversation(
    conversation_id: UUID,
    data: EscalateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    try:
        return await ai_service.escalate_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=user.id,
            reason=data.reason,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/escalations",
    response_model=EscalationListResponse,
    summary="List escalations",
    description="Human agent view: list all escalations. Use ?status=OPEN or ?status=RESOLVED to filter.",
)
async def list_escalations(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("LOGISTIC_MANAGER", "AI_AGENT"))],
    status: str | None = Query(default=None, description="Filter by status: OPEN or RESOLVED"),
):
    escalations = await ai_service.list_escalations(db=db, status_filter=status)
    return EscalationListResponse(escalations=escalations)


@router.put(
    "/escalations/{escalation_id}/resolve",
    response_model=EscalationResponse,
    summary="Resolve an escalation",
    description="Mark an escalation as resolved. Restricted to LOGISTIC_MANAGER and AI_AGENT roles.",
)
async def resolve_escalation(
    escalation_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(require_role("LOGISTIC_MANAGER", "AI_AGENT"))],
):
    try:
        return await ai_service.resolve_escalation(db=db, escalation_id=escalation_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

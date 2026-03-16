import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="'user' or 'assistant'",
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="db_query, general, greeting, error",
    )
    sql_generated: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="SQL written by Gemini (audit trail)",
    )
    query_result: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
        comment="Raw DB query result for debugging",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User")  # noqa: F821

    __table_args__ = (
        Index("ix_ai_conversations_session_id", "session_id"),
        Index("ix_ai_conversations_user_id", "user_id"),
    )

    def __repr__(self) -> str:
        return f"<AIConversation id={self.id} session={self.session_id} role={self.role}>"

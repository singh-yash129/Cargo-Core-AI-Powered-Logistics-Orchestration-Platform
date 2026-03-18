import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Escalation(Base):
    __tablename__ = "escalations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ai_conversations.id"),
        nullable=False,
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    escalated_to_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )
    escalated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="OPEN",
        comment="OPEN or RESOLVED",
    )

    # Relationships
    conversation: Mapped["AIConversation"] = relationship("AIConversation")  # noqa: F821
    assigned_agent: Mapped["User"] = relationship(  # noqa: F821
        "User", foreign_keys=[escalated_to_user_id]
    )

    __table_args__ = (
        Index("ix_escalations_conversation_id", "conversation_id"),
        Index("ix_escalations_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Escalation id={self.id} status={self.status}>"

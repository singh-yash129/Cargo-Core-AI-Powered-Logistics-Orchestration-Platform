import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

TICKET_STATUSES = ("new", "in_progress", "resolved")
TICKET_PRIORITIES = ("low", "medium", "high", "urgent")
TICKET_CATEGORIES = (
    "technical",
    "billing",
    "logistics",
    "damage",
    "account",
    "refund",
    "general",
    "vendor_support",
)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    reference_code: Mapped[str] = mapped_column(String(24), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="medium"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="new"
    )
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, server_default="general"
    )
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    assigned_to_user: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[assigned_to_user_id]
    )

    __table_args__ = (
        Index("ix_support_tickets_status", "status"),
        Index("ix_support_tickets_priority", "priority"),
        Index("ix_support_tickets_reference_code", "reference_code", unique=True),
    )

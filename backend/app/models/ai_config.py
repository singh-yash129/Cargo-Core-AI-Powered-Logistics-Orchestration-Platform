"""
ai_config.py
DB-backed knowledge articles for the RAG retrieval layer.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AIKnowledgeArticle(Base):
    """
    Knowledge articles stored in the DB and retrieved by the RAG layer.
    Replaces the hardcoded KNOWLEDGE_BASE tuple in ai_knowledge.py.
    """

    __tablename__ = "ai_knowledge_articles"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    audience: Mapped[str] = mapped_column(String(20), nullable=False, default="ALL")  # ALL | VENDOR | INDIVIDUAL
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    keywords: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # UI display metadata
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    article_type: Mapped[str] = mapped_column(String(50), nullable=False, default="SOP")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    likes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    author_initials: Mapped[str] = mapped_column(String(5), nullable=False, default="PT")

    # Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

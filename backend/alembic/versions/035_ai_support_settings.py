"""create ai support settings table

Revision ID: 035_ai_support_settings
Revises: 034_dr_support_msgs
Create Date: 2026-04-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "035_ai_support_settings"
down_revision: Union[str, Sequence[str], None] = "034_dr_support_msgs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


DEFAULT_SYSTEM_PROMPT = "You are the primary autonomous support agent for Cargo-Core Logistics."


def upgrade() -> None:
    op.create_table(
        "ai_support_settings",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("tone", sa.String(length=60), nullable=False, server_default="Friendly & Empathetic"),
        sa.Column("language_mode", sa.String(length=60), nullable=False, server_default="Auto-Detect (Multilingual)"),
        sa.Column("sentiment_threshold", sa.Integer(), nullable=False, server_default="80"),
        sa.Column("refund_limit_inr", sa.Integer(), nullable=False, server_default="5000"),
        sa.Column("system_prompt", sa.Text(), nullable=False, server_default=sa.text(f"'{DEFAULT_SYSTEM_PROMPT}'")),
        sa.Column("autonomous_replies", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("legal_threat_detection", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("real_time_sentiment_analysis", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("proactive_human_handover", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("updated_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("ai_support_settings")

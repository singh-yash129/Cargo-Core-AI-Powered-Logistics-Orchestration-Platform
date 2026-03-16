"""create ai_conversations table

Revision ID: 002
Revises: 001
Create Date: 2026-02-25

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_conversations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False, comment="'user' or 'assistant'"),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "intent",
            sa.String(length=50),
            nullable=True,
            comment="db_query, general, greeting, error",
        ),
        sa.Column(
            "sql_generated",
            sa.Text(),
            nullable=True,
            comment="SQL written by Gemini (audit trail)",
        ),
        sa.Column(
            "query_result",
            postgresql.JSON(astext_type=sa.Text()),
            nullable=True,
            comment="Raw DB query result for debugging",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_conversations_session_id", "ai_conversations", ["session_id"])
    op.create_index("ix_ai_conversations_user_id", "ai_conversations", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_ai_conversations_user_id", table_name="ai_conversations")
    op.drop_index("ix_ai_conversations_session_id", table_name="ai_conversations")
    op.drop_table("ai_conversations")

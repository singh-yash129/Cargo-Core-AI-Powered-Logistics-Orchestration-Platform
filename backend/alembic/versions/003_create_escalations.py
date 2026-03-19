"""create escalations table

Revision ID: 003
Revises: 002
Create Date: 2026-03-16

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "escalations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("escalated_to_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "escalated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="OPEN",
            comment="OPEN or RESOLVED",
        ),
        sa.ForeignKeyConstraint(["conversation_id"], ["ai_conversations.id"]),
        sa.ForeignKeyConstraint(["escalated_to_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_escalations_conversation_id", "escalations", ["conversation_id"])
    op.create_index("ix_escalations_status", "escalations", ["status"])


def downgrade() -> None:
    op.drop_index("ix_escalations_status", table_name="escalations")
    op.drop_index("ix_escalations_conversation_id", table_name="escalations")
    op.drop_table("escalations")

"""add support_messages column to damage_reports

Revision ID: 034_dr_support_msgs
Revises: 033_ai_support_columns
Create Date: 2026-04-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "034_dr_support_msgs"
down_revision: Union[str, Sequence[str], None] = "033_ai_support_columns"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "damage_reports",
        sa.Column(
            "support_messages",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )


def downgrade() -> None:
    op.drop_column("damage_reports", "support_messages")

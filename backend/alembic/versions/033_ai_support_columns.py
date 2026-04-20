"""add support columns to damage_reports and logistics_return_cases

Revision ID: 033_ai_support_columns
Revises: 032_support_tickets
Create Date: 2026-04-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "033_ai_support_columns"
down_revision: Union[str, Sequence[str], None] = "032_support_tickets"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add support_notes to damage_reports
    op.add_column(
        "damage_reports",
        sa.Column("support_notes", sa.Text(), nullable=True),
    )

    # Add is_urgent, urgent_reason, support_notes to logistics_return_cases
    op.add_column(
        "logistics_return_cases",
        sa.Column("is_urgent", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "logistics_return_cases",
        sa.Column("urgent_reason", sa.Text(), nullable=True),
    )
    op.add_column(
        "logistics_return_cases",
        sa.Column("support_notes", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("logistics_return_cases", "support_notes")
    op.drop_column("logistics_return_cases", "urgent_reason")
    op.drop_column("logistics_return_cases", "is_urgent")
    op.drop_column("damage_reports", "support_notes")

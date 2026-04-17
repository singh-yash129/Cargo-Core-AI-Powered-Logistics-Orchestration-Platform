"""support tickets table

Revision ID: 032_support_tickets
Revises: 031_support_dashboard
Create Date: 2026-04-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "032_support_tickets"
down_revision: Union[str, Sequence[str], None] = "031_support_dashboard"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "support_tickets",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("reference_code", sa.String(length=24), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="medium"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="new"),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="general"),
        sa.Column("customer_name", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("assigned_to_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["assigned_to_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code"),
    )
    op.create_index("ix_support_tickets_status", "support_tickets", ["status"])
    op.create_index("ix_support_tickets_priority", "support_tickets", ["priority"])
    op.create_index(
        "ix_support_tickets_reference_code", "support_tickets", ["reference_code"], unique=True
    )


def downgrade() -> None:
    op.drop_index("ix_support_tickets_reference_code", table_name="support_tickets")
    op.drop_index("ix_support_tickets_priority", table_name="support_tickets")
    op.drop_index("ix_support_tickets_status", table_name="support_tickets")
    op.drop_table("support_tickets")

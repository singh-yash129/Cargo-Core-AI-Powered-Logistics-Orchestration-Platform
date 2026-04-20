"""Add picked_items table for partial picking support

Revision ID: 012
Revises: 011
Create Date: 2026-03-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "012"
down_revision: Union[str, None] = "011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create picked_items table for tracking individual item picking progress."""
    op.create_table(
        "picked_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sku", sa.String(64), nullable=False),
        sa.Column("quantity_picked", sa.Integer(), nullable=False, default=0),
        sa.Column("quantity_required", sa.Integer(), nullable=False),
        sa.Column("picked_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["picked_by"], ["users.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("order_id", "sku", name="uq_picked_items_order_id_sku"),
    )
    op.create_index("ix_picked_items_order_id", "picked_items", ["order_id"])


def downgrade() -> None:
    """Drop picked_items table."""
    op.drop_index("ix_picked_items_order_id", "picked_items")
    op.drop_table("picked_items")

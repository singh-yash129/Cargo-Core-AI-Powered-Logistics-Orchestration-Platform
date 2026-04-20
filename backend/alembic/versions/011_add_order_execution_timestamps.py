"""add order execution timestamps

Revision ID: 011
Revises: 010
Create Date: 2026-03-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers
revision: str = "011"
down_revision: Union[str, None] = "010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("picking_started_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("picking_completed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("packing_started_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("packing_completed_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "packing_completed_at")
    op.drop_column("orders", "packing_started_at")
    op.drop_column("orders", "picking_completed_at")
    op.drop_column("orders", "picking_started_at")

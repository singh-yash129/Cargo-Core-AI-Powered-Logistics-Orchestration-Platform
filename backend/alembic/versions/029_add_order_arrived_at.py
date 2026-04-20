"""Add arrived_at to orders for manual inbound arrival overrides

Revision ID: 029_add_order_arrived_at
Revises: e0001
Create Date: 2026-04-09

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "029_add_order_arrived_at"
down_revision: Union[str, Sequence[str], None] = "e0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("arrived_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "arrived_at")

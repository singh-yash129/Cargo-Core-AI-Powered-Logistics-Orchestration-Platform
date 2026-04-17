"""Add pickup coordinates to orders

Revision ID: 030_add_order_pickup_coordinates
Revises: 029_add_order_arrived_at
Create Date: 2026-04-13

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "030_add_order_pickup_coordinates"
down_revision: Union[str, Sequence[str], None] = "029_add_order_arrived_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("pickup_lat", sa.Float(), nullable=True))
    op.add_column("orders", sa.Column("pickup_lng", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "pickup_lng")
    op.drop_column("orders", "pickup_lat")

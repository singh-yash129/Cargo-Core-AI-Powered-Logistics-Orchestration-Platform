"""Add cargo weight and volume fields to orders

Revision ID: e0002
Revises: e0001
Create Date: 2026-04-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0002'
down_revision: Union[str, None] = 'e0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('cargo_weight_kg', sa.Float(), nullable=True))
    op.add_column('orders', sa.Column('cargo_volume_m3', sa.Float(), nullable=True))

    op.execute(
        """
        UPDATE orders
        SET cargo_volume_m3 = volume_totals.total_volume
        FROM (
            SELECT order_id, ROUND(CAST(SUM(COALESCE(estimated_volume, 0)) AS numeric), 2) AS total_volume
            FROM order_items
            GROUP BY order_id
        ) AS volume_totals
        WHERE orders.id = volume_totals.order_id
          AND orders.cargo_volume_m3 IS NULL
        """
    )


def downgrade() -> None:
    op.drop_column('orders', 'cargo_volume_m3')
    op.drop_column('orders', 'cargo_weight_kg')

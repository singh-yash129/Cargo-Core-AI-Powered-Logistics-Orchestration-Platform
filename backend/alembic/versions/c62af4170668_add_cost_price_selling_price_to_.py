"""add_cost_price_selling_price_to_inventory_items

Revision ID: c62af4170668
Revises: ad526e02021a
Create Date: 2026-04-17 01:31:12.838853

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c62af4170668'
down_revision: Union[str, None] = 'ad526e02021a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('inventory_items', sa.Column('cost_price', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('inventory_items', sa.Column('selling_price', sa.Float(), nullable=False, server_default='0.0'))


def downgrade() -> None:
    op.drop_column('inventory_items', 'selling_price')
    op.drop_column('inventory_items', 'cost_price')

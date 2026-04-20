"""Add pickup_type to orders

Revision ID: e0001
Revises: dd75ce91aed1
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0001'
down_revision: Union[str, None] = '027_material_requests'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add pickup_type column to orders table
    # 'hub' = vendor drops goods at warehouse (shows in Inbound)
    # 'doorstep' = driver picks from vendor's location (goes to Picking directly)
    op.add_column('orders', sa.Column('pickup_type', sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column('orders', 'pickup_type')

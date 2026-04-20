"""Add soft delete fields to orders

Revision ID: e0005
Revises: e0004
Create Date: 2026-04-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e0005'
down_revision: Union[str, None] = 'e0004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('orders', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.create_index('ix_orders_is_deleted', 'orders', ['is_deleted'])


def downgrade() -> None:
    op.drop_index('ix_orders_is_deleted', table_name='orders')
    op.drop_column('orders', 'deleted_at')
    op.drop_column('orders', 'is_deleted')

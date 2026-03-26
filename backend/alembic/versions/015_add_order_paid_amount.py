"""Add paid_amount column to orders table for partial payment tracking

Revision ID: 015_add_order_paid_amount
Revises: 014_loading_dock_vehicle_fk
Create Date: 2026-03-24
"""
from alembic import op
import sqlalchemy as sa

revision = '015_add_order_paid_amount'
down_revision = '014_loading_dock_vehicle_fk'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('paid_amount', sa.Float(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('orders', 'paid_amount')

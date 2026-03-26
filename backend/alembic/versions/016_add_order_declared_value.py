"""Add declared_value column to orders table

Revision ID: 016_add_order_declared_value
Revises: 015_add_order_paid_amount
Create Date: 2026-03-24
"""
from alembic import op
import sqlalchemy as sa

revision = '016_add_order_declared_value'
down_revision = '015_add_order_paid_amount'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('declared_value', sa.Float(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('orders', 'declared_value')

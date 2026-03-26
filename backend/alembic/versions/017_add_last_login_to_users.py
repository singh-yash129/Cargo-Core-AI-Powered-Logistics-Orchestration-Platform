"""Add last_login column to users table

Revision ID: 017_add_last_login_to_users
Revises: 016_add_order_declared_value
Create Date: 2026-03-24
"""
from alembic import op
import sqlalchemy as sa

revision = '017_add_last_login_to_users'
down_revision = '016_add_order_declared_value'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('last_login', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'last_login')

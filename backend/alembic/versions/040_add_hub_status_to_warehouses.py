"""add hub_status to warehouses

Revision ID: 040_add_hub_status_to_warehouses
Revises: cb230e4d9fbf
Create Date: 2026-04-18
"""
from alembic import op
import sqlalchemy as sa

revision = "040_add_hub_status_to_warehouses"
down_revision = "cb230e4d9fbf"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("warehouses", sa.Column("hub_status", sa.String(50), nullable=True))


def downgrade():
    op.drop_column("warehouses", "hub_status")

"""add wm review fields to logistics_return_cases

Revision ID: 041_wm_review_return_cases
Revises: 040_add_hub_status_to_warehouses
Create Date: 2026-04-20
"""
from alembic import op
import sqlalchemy as sa

revision = "041_wm_review_return_cases"
down_revision = "040_add_hub_status_to_warehouses"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("logistics_return_cases", sa.Column("wm_is_genuine", sa.Boolean(), nullable=True))
    op.add_column("logistics_return_cases", sa.Column("wm_recommended_outcome", sa.String(100), nullable=True))
    op.add_column("logistics_return_cases", sa.Column("wm_inspection_remarks", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("logistics_return_cases", "wm_inspection_remarks")
    op.drop_column("logistics_return_cases", "wm_recommended_outcome")
    op.drop_column("logistics_return_cases", "wm_is_genuine")

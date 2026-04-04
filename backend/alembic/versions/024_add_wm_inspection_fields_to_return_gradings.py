"""add wm inspection fields to return gradings

Revision ID: 024_wm_return_grading
Revises: 023_add_return_flow_types
Create Date: 2026-04-04 17:05:00
"""

from alembic import op
import sqlalchemy as sa


revision = "024_wm_return_grading"
down_revision = "023_add_return_flow_types"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("return_gradings", sa.Column("is_genuine", sa.Boolean(), nullable=True))
    op.add_column("return_gradings", sa.Column("recommended_outcome", sa.String(length=100), nullable=True))
    op.add_column("return_gradings", sa.Column("inspection_remarks", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("return_gradings", "inspection_remarks")
    op.drop_column("return_gradings", "recommended_outcome")
    op.drop_column("return_gradings", "is_genuine")

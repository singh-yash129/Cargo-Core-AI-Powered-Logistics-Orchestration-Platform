"""add lat lng to logistics zones

Revision ID: 019
Revises: 664a53119a1b
Create Date: 2026-03-28 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "019"
down_revision = "664a53119a1b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("logistics_zones", sa.Column("lat", sa.Float(), nullable=True))
    op.add_column("logistics_zones", sa.Column("lng", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("logistics_zones", "lat")
    op.drop_column("logistics_zones", "lng")

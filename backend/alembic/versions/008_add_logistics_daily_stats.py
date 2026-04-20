"""add logistics daily stats table

Revision ID: 008
Revises: 007
Create Date: 2026-03-19 06:16:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "logistics_daily_stats",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("warehouse_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("warehouses.id"), nullable=True),
        sa.Column("stat_date", sa.Date(), nullable=False),
        sa.Column("orders_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("revenue", sa.Float(), nullable=False, server_default="0"),
        sa.Column("deliveries_completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("deliveries_failed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sla_compliance", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_logistics_daily_stats_stat_date", "logistics_daily_stats", ["stat_date"])


def downgrade() -> None:
    op.drop_index("ix_logistics_daily_stats_stat_date", table_name="logistics_daily_stats")
    op.drop_table("logistics_daily_stats")

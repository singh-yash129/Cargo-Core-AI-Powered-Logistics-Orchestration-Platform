"""add dispatcher manifests table

Revision ID: 026_dispatcher_manifests
Revises: 025_return_transport_charge
Create Date: 2026-04-04 20:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "026_dispatcher_manifests"
down_revision: Union[str, Sequence[str], None] = "025_return_transport_charge"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "logistics_manifests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("route_id", sa.String(100), nullable=False, unique=True),
        sa.Column("driver_name", sa.String(255), nullable=False),
        sa.Column("driver_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("vehicle_code", sa.String(100), nullable=True),
        sa.Column("hub_name", sa.String(255), nullable=True),
        sa.Column("crew_config", sa.String(100), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="Draft"),
        sa.Column("orders_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total_weight", sa.Float, nullable=False, server_default="0"),
        sa.Column("total_distance", sa.Float, nullable=False, server_default="0"),
        sa.Column("stop_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total_volume", sa.Float, nullable=False, server_default="0"),
        sa.Column("est_duration", sa.String(50), nullable=True),
        sa.Column("fragile_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("cod_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("crew_list", postgresql.JSONB, nullable=True),
        sa.Column("pushed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("pushed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_logistics_manifests_route_id", "logistics_manifests", ["route_id"])
    op.create_index("ix_logistics_manifests_created_at", "logistics_manifests", ["created_at"])


def downgrade() -> None:
    op.drop_table("logistics_manifests")

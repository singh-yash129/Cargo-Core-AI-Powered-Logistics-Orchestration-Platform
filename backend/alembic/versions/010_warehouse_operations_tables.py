"""create warehouse operations tables

Revision ID: 010
Revises: 009
Create Date: 2026-03-19

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = "010"
down_revision: Union[str, None] = "009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add warehouse_substatus to orders table
    op.add_column(
        "orders",
        sa.Column("warehouse_substatus", sa.String(length=30), nullable=True),
    )
    op.create_index("ix_orders_warehouse_substatus", "orders", ["warehouse_substatus"], unique=False)

    # 2. Create loading_docks table
    op.create_table(
        "loading_docks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("warehouse_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dock_number", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="FREE"),
        sa.Column("assigned_truck_id", sa.String(length=50), nullable=True),
        sa.Column("assigned_carrier", sa.String(length=100), nullable=True),
        sa.Column("assigned_order_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("arrived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("loading_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("released_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.ForeignKeyConstraint(["assigned_order_id"], ["orders.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("warehouse_id", "dock_number", name="uq_loading_docks_warehouse_dock_number"),
    )
    op.create_index("ix_loading_docks_warehouse_id", "loading_docks", ["warehouse_id"], unique=False)
    op.create_index("ix_loading_docks_status", "loading_docks", ["status"], unique=False)

    # 3. Create packing_stations table
    op.create_table(
        "packing_stations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("warehouse_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("station_number", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="CLOSED"),
        sa.Column("assigned_labourer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("current_order_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("items_packed_today", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.ForeignKeyConstraint(["assigned_labourer_id"], ["labourers.id"]),
        sa.ForeignKeyConstraint(["current_order_id"], ["orders.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("warehouse_id", "station_number", name="uq_packing_stations_warehouse_station"),
    )
    op.create_index("ix_packing_stations_warehouse_id", "packing_stations", ["warehouse_id"], unique=False)

    # 4. Create quality_checks table
    op.create_table(
        "quality_checks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("warehouse_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("performed_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("goods_correct", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("count_correct", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("packaging_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("labor_assigned", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("weight_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("label_attached", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_passed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("checked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.ForeignKeyConstraint(["performed_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quality_checks_order_id", "quality_checks", ["order_id"], unique=True)
    op.create_index("ix_quality_checks_warehouse_id", "quality_checks", ["warehouse_id"], unique=False)

    # 5. Create return_gradings table
    op.create_table(
        "return_gradings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("warehouse_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("rma_code", sa.String(length=50), nullable=False),
        sa.Column("item_condition", sa.String(length=50), nullable=False),
        sa.Column("condition_notes", sa.Text(), nullable=True),
        sa.Column("disposition", sa.String(length=30), nullable=False),
        sa.Column("damage_photo_url", sa.String(length=500), nullable=True),
        sa.Column("graded_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("graded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.ForeignKeyConstraint(["graded_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_return_gradings_rma_code", "return_gradings", ["rma_code"], unique=True)
    op.create_index("ix_return_gradings_warehouse_id", "return_gradings", ["warehouse_id"], unique=False)
    op.create_index("ix_return_gradings_status", "return_gradings", ["status"], unique=False)

    # 6. Create warehouse_zone_metrics table
    op.create_table(
        "warehouse_zone_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("warehouse_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("zone_id", sa.String(length=100), nullable=False),
        sa.Column("metric_date", sa.Date(), nullable=False),
        sa.Column("orders_processed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("picking_accuracy_pct", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("active_pickers", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("capacity_used_pct", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("throughput_items_per_hour", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("warehouse_id", "zone_id", "metric_date", name="uq_zone_metrics_warehouse_zone_date"),
    )
    op.create_index("ix_warehouse_zone_metrics_warehouse_id", "warehouse_zone_metrics", ["warehouse_id"], unique=False)
    op.create_index("ix_warehouse_zone_metrics_metric_date", "warehouse_zone_metrics", ["metric_date"], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index("ix_warehouse_zone_metrics_metric_date", table_name="warehouse_zone_metrics")
    op.drop_index("ix_warehouse_zone_metrics_warehouse_id", table_name="warehouse_zone_metrics")
    op.drop_table("warehouse_zone_metrics")

    op.drop_index("ix_return_gradings_status", table_name="return_gradings")
    op.drop_index("ix_return_gradings_warehouse_id", table_name="return_gradings")
    op.drop_index("ix_return_gradings_rma_code", table_name="return_gradings")
    op.drop_table("return_gradings")

    op.drop_index("ix_quality_checks_warehouse_id", table_name="quality_checks")
    op.drop_index("ix_quality_checks_order_id", table_name="quality_checks")
    op.drop_table("quality_checks")

    op.drop_index("ix_packing_stations_warehouse_id", table_name="packing_stations")
    op.drop_table("packing_stations")

    op.drop_index("ix_loading_docks_status", table_name="loading_docks")
    op.drop_index("ix_loading_docks_warehouse_id", table_name="loading_docks")
    op.drop_table("loading_docks")

    op.drop_index("ix_orders_warehouse_substatus", table_name="orders")
    op.drop_column("orders", "warehouse_substatus")

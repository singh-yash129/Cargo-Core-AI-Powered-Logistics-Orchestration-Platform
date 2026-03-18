"""add customer dynamic fields

Revision ID: 005
Revises: 004
Create Date: 2026-03-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("alt_phone", sa.String(length=20), nullable=True))
    op.add_column("users", sa.Column("date_of_birth", sa.Date(), nullable=True))
    op.add_column("users", sa.Column("address", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("preferred_language", sa.String(length=10), nullable=False, server_default="en"))
    op.add_column("users", sa.Column("preferred_currency", sa.String(length=10), nullable=False, server_default="INR"))
    op.add_column("users", sa.Column("default_payment_method", sa.String(length=30), nullable=False, server_default="Full Payment"))
    op.add_column("users", sa.Column("notifications_push", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("notifications_sms", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("notifications_email", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("notifications_geofence", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("notifications_promo", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("users", sa.Column("privacy_location", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("privacy_analytics", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("privacy_marketing", sa.Boolean(), nullable=False, server_default=sa.text("false")))

    op.add_column("orders", sa.Column("cargo_type", sa.String(length=100), nullable=True))
    op.add_column("orders", sa.Column("vehicle_type", sa.String(length=50), nullable=True))
    op.add_column("orders", sa.Column("labor_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("base_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("vehicle_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("labor_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("materials_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("packing_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("platform_fee", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("tax_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("total_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("payment_mode", sa.String(length=30), nullable=True))
    op.add_column("orders", sa.Column("payment_status", sa.String(length=20), nullable=False, server_default="pending"))
    op.add_column("orders", sa.Column("service_otp", sa.String(length=10), nullable=True))
    op.add_column("orders", sa.Column("service_time_block", sa.String(length=50), nullable=True))

    op.create_table(
        "customer_quotes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cargo_type", sa.String(length=100), nullable=False),
        sa.Column("from_location", sa.Text(), nullable=False),
        sa.Column("to_location", sa.Text(), nullable=False),
        sa.Column("labor_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("packing", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("total_amount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code"),
    )
    op.create_index("ix_customer_quotes_reference_code", "customer_quotes", ["reference_code"], unique=False)
    op.create_index("ix_customer_quotes_customer_id", "customer_quotes", ["customer_id"], unique=False)

    op.create_table(
        "damage_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("photos", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="reported"),
        sa.Column("qr_code", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code"),
        sa.UniqueConstraint("qr_code"),
    )
    op.create_index("ix_damage_reports_reference_code", "damage_reports", ["reference_code"], unique=False)
    op.create_index("ix_damage_reports_customer_id", "damage_reports", ["customer_id"], unique=False)
    op.create_index("ix_damage_reports_order_id", "damage_reports", ["order_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_damage_reports_order_id", table_name="damage_reports")
    op.drop_index("ix_damage_reports_customer_id", table_name="damage_reports")
    op.drop_index("ix_damage_reports_reference_code", table_name="damage_reports")
    op.drop_table("damage_reports")

    op.drop_index("ix_customer_quotes_customer_id", table_name="customer_quotes")
    op.drop_index("ix_customer_quotes_reference_code", table_name="customer_quotes")
    op.drop_table("customer_quotes")

    for column in [
        "service_time_block",
        "service_otp",
        "payment_status",
        "payment_mode",
        "total_amount",
        "tax_amount",
        "platform_fee",
        "packing_amount",
        "materials_amount",
        "labor_amount",
        "vehicle_amount",
        "base_amount",
        "labor_count",
        "vehicle_type",
        "cargo_type",
    ]:
        op.drop_column("orders", column)

    for column in [
        "privacy_marketing",
        "privacy_analytics",
        "privacy_location",
        "notifications_promo",
        "notifications_geofence",
        "notifications_email",
        "notifications_sms",
        "notifications_push",
        "default_payment_method",
        "preferred_currency",
        "preferred_language",
        "address",
        "date_of_birth",
        "alt_phone",
    ]:
        op.drop_column("users", column)

"""create vendor supporting tables

Revision ID: 006
Revises: 005
Create Date: 2026-03-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "vendor_team_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("vendor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="Viewer"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Invited"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["vendor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vendor_team_members_vendor_id", "vendor_team_members", ["vendor_id"])

    op.create_table(
        "vendor_api_keys",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("vendor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("key_value", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Active"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["vendor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vendor_api_keys_vendor_id", "vendor_api_keys", ["vendor_id"])

    op.create_table(
        "vendor_recurring_rules",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("vendor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("frequency", sa.String(length=100), nullable=False),
        sa.Column("route", sa.String(length=255), nullable=False),
        sa.Column("details", sa.String(length=255), nullable=False),
        sa.Column("next_run", sa.String(length=100), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["vendor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vendor_recurring_rules_vendor_id", "vendor_recurring_rules", ["vendor_id"])

    op.create_table(
        "vendor_bulk_uploads",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("vendor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("file_size_kb", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("orders", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Processed"),
        sa.Column("errors", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("scheduled_for", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["vendor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vendor_bulk_uploads_vendor_id", "vendor_bulk_uploads", ["vendor_id"])

    op.create_table(
        "vendor_support_tickets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("vendor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", sa.String(length=30), nullable=False, server_default="Medium"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="Open"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["vendor_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vendor_support_tickets_vendor_id", "vendor_support_tickets", ["vendor_id"])

    op.create_table(
        "vendor_support_replies",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("ticket_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_name", sa.String(length=100), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["ticket_id"], ["vendor_support_tickets.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vendor_support_replies_ticket_id", "vendor_support_replies", ["ticket_id"])


def downgrade() -> None:
    op.drop_index("ix_vendor_support_replies_ticket_id", table_name="vendor_support_replies")
    op.drop_table("vendor_support_replies")

    op.drop_index("ix_vendor_support_tickets_vendor_id", table_name="vendor_support_tickets")
    op.drop_table("vendor_support_tickets")

    op.drop_index("ix_vendor_bulk_uploads_vendor_id", table_name="vendor_bulk_uploads")
    op.drop_table("vendor_bulk_uploads")

    op.drop_index("ix_vendor_recurring_rules_vendor_id", table_name="vendor_recurring_rules")
    op.drop_table("vendor_recurring_rules")

    op.drop_index("ix_vendor_api_keys_vendor_id", table_name="vendor_api_keys")
    op.drop_table("vendor_api_keys")

    op.drop_index("ix_vendor_team_members_vendor_id", table_name="vendor_team_members")
    op.drop_table("vendor_team_members")

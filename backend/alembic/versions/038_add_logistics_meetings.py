"""add logistics meetings table

Revision ID: 038_add_logistics_meetings
Revises: 037_notification_target_user
Create Date: 2026-04-16
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID


revision = "038_add_logistics_meetings"
down_revision = "037_notification_target_user"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "logistics_meetings",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("topic", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("meeting_type", sa.String(length=30), nullable=False, server_default="other"),
        sa.Column("meeting_link", sa.Text(), nullable=False),
        sa.Column("meeting_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.String(length=5), nullable=False),
        sa.Column("end_time", sa.String(length=5), nullable=False),
        sa.Column("participant_ids", JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("created_by_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("warehouse_id", UUID(as_uuid=True), sa.ForeignKey("warehouses.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_logistics_meetings_created_by_id", "logistics_meetings", ["created_by_id"])
    op.create_index("ix_logistics_meetings_warehouse_id", "logistics_meetings", ["warehouse_id"])
    op.create_index("ix_logistics_meetings_meeting_date", "logistics_meetings", ["meeting_date"])


def downgrade() -> None:
    op.drop_index("ix_logistics_meetings_meeting_date", table_name="logistics_meetings")
    op.drop_index("ix_logistics_meetings_warehouse_id", table_name="logistics_meetings")
    op.drop_index("ix_logistics_meetings_created_by_id", table_name="logistics_meetings")
    op.drop_table("logistics_meetings")

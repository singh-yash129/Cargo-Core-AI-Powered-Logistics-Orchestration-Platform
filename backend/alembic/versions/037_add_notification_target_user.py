"""add target_user_id to logistics_notifications for per-user notifications

Revision ID: 037_notification_target_user
Revises: c733f4f71b4c
Create Date: 2026-04-16
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = "037_notification_target_user"
down_revision = "c733f4f71b4c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "logistics_notifications",
        sa.Column("target_user_id", UUID(as_uuid=True), nullable=True),
    )
    op.create_index(
        "ix_logistics_notifications_target_user_id",
        "logistics_notifications",
        ["target_user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_logistics_notifications_target_user_id", table_name="logistics_notifications")
    op.drop_column("logistics_notifications", "target_user_id")

"""add audience roles to logistics notifications

Revision ID: 022_notification_audience
Revises: 021_add_vendor_approval_fields
Create Date: 2026-03-30
"""

from alembic import op
import sqlalchemy as sa


revision = "022_notification_audience"
down_revision = "021_add_vendor_approval_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("logistics_notifications", sa.Column("audience_roles", sa.Text(), nullable=True))

    op.execute(
        """
        UPDATE logistics_notifications
        SET audience_roles = 'LOGISTIC_MANAGER'
        WHERE title = 'New vendor registration'
           OR title LIKE '[Broadcast Sent]%'
        """
    )


def downgrade() -> None:
    op.drop_column("logistics_notifications", "audience_roles")

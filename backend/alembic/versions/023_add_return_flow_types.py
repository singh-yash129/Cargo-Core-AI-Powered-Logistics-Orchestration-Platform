"""add flow_type to damage reports and return cases

Revision ID: 023_add_return_flow_types
Revises: 022_notification_audience
Create Date: 2026-04-04
"""

from alembic import op
import sqlalchemy as sa


revision = "023_add_return_flow_types"
down_revision = "022_notification_audience"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "damage_reports",
        sa.Column("flow_type", sa.String(length=30), nullable=False, server_default="photo_review"),
    )
    op.add_column(
        "logistics_return_cases",
        sa.Column("flow_type", sa.String(length=30), nullable=False, server_default="photo_review"),
    )

    op.execute(
        """
        UPDATE logistics_return_cases rc
        SET flow_type = dr.flow_type
        FROM damage_reports dr
        WHERE rc.reference_code = dr.reference_code
        """
    )

    op.execute(
        """
        UPDATE logistics_return_cases
        SET flow_type = 'pickup_inspection'
        WHERE reference_code LIKE 'RMA-%'
        """
    )

    op.alter_column("damage_reports", "flow_type", server_default=None)
    op.alter_column("logistics_return_cases", "flow_type", server_default=None)


def downgrade() -> None:
    op.drop_column("logistics_return_cases", "flow_type")
    op.drop_column("damage_reports", "flow_type")

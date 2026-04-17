"""Widen recurring rule details for destination payloads

Revision ID: 028_vendor_rec_details
Revises: 027_material_requests
Create Date: 2026-04-09

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "028_vendor_rec_details"
down_revision: Union[str, Sequence[str], None] = "027_material_requests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "vendor_recurring_rules",
        "details",
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "vendor_recurring_rules",
        "details",
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
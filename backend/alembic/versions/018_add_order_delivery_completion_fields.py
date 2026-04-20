"""add order delivery completion fields

Revision ID: 018
Revises: 43f975619b54
Create Date: 2026-03-25

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers
revision: str = "018"
down_revision: Union[str, None] = "43f975619b54"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("service_otp_sent_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("service_otp_verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("delivery_notes", sa.Text(), nullable=True))
    op.add_column("orders", sa.Column("pod_photos", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")))
    op.add_column("orders", sa.Column("pod_signature", sa.Text(), nullable=True))
    op.alter_column("orders", "pod_photos", server_default=None)


def downgrade() -> None:
    op.drop_column("orders", "pod_signature")
    op.drop_column("orders", "pod_photos")
    op.drop_column("orders", "delivery_notes")
    op.drop_column("orders", "delivered_at")
    op.drop_column("orders", "service_otp_verified_at")
    op.drop_column("orders", "service_otp_sent_at")

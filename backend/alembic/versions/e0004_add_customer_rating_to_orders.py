"""Add customer_rating and customer_feedback to orders

Revision ID: e0004
Revises: e0003
Create Date: 2026-04-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e0004'
down_revision: Union[str, None] = 'e0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("customer_rating", sa.Integer(), nullable=True))
    op.add_column("orders", sa.Column("customer_feedback", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "customer_feedback")
    op.drop_column("orders", "customer_rating")

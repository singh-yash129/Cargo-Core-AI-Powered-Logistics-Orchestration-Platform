"""Add packing_return_data to orders

Revision ID: e0003
Revises: e0002
Create Date: 2026-04-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'e0003'
down_revision: Union[str, None] = 'e0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("packing_return_data", JSONB, nullable=True),
    )


def downgrade() -> None:
    op.drop_column("orders", "packing_return_data")

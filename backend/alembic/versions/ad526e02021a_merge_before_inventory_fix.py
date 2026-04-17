"""merge_before_inventory_fix

Revision ID: ad526e02021a
Revises: 038_add_logistics_meetings, e0002
Create Date: 2026-04-17 01:31:04.392188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad526e02021a'
down_revision: Union[str, None] = ('038_add_logistics_meetings', 'e0002')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

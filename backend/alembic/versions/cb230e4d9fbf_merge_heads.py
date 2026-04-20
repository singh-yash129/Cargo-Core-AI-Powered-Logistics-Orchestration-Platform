"""merge_heads

Revision ID: cb230e4d9fbf
Revises: 039_enable_proactive_handover, c62af4170668, e0004
Create Date: 2026-04-18 01:42:59.487732

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb230e4d9fbf'
down_revision: Union[str, None] = ('039_enable_proactive_handover', 'c62af4170668', 'e0004')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

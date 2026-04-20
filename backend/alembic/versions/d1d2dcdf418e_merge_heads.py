"""merge_heads

Revision ID: d1d2dcdf418e
Revises: 017_add_last_login_to_users, 018
Create Date: 2026-03-26 01:07:39.453763

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1d2dcdf418e'
down_revision: Union[str, None] = ('017_add_last_login_to_users', '018')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

"""merge_heads

Revision ID: 4ddc144d6766
Revises: 041_wm_review_return_cases, e0005
Create Date: 2026-04-20 15:56:00.964360

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ddc144d6766'
down_revision: Union[str, None] = ('041_wm_review_return_cases', 'e0005')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

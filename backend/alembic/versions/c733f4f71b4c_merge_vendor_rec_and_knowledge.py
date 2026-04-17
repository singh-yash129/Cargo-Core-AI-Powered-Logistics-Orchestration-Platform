"""merge_vendor_rec_and_knowledge

Revision ID: c733f4f71b4c
Revises: 028_vendor_rec_details, 036_ai_knowledge_articles
Create Date: 2026-04-14 09:13:29.728463

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c733f4f71b4c'
down_revision: Union[str, None] = ('028_vendor_rec_details', '036_ai_knowledge_articles')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

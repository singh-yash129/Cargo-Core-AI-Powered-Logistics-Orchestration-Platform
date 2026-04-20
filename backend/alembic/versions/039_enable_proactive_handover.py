"""enable proactive human handover by default

Revision ID: 039_enable_proactive_handover
Revises: 038_add_logistics_meetings
Create Date: 2026-04-18
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "039_enable_proactive_handover"
down_revision: Union[str, Sequence[str], None] = "038_add_logistics_meetings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "ai_support_settings",
        "proactive_human_handover",
        server_default=sa.true(),
    )
    op.execute(
        "UPDATE ai_support_settings SET proactive_human_handover = TRUE"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE ai_support_settings SET proactive_human_handover = FALSE"
    )
    op.alter_column(
        "ai_support_settings",
        "proactive_human_handover",
        server_default=sa.false(),
    )

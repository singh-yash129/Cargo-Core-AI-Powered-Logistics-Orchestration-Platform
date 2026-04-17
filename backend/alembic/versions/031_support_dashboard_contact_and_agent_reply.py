"""support dashboard contact submissions and agent reply metadata

Revision ID: 031_support_dashboard
Revises: 030_add_order_pickup_coordinates
Create Date: 2026-04-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision: str = "031_support_dashboard"
down_revision: Union[str, Sequence[str], None] = "030_add_order_pickup_coordinates"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ai_conversations",
        sa.Column("author_user_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_ai_conversations_author_user_id_users",
        "ai_conversations",
        "users",
        ["author_user_id"],
        ["id"],
    )
    op.create_index(
        "ix_ai_conversations_author_user_id",
        "ai_conversations",
        ["author_user_id"],
        unique=False,
    )

    op.create_table(
        "support_contact_submissions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("reference_code", sa.String(length=24), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="medium"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="new"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("assigned_to_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["assigned_to_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code"),
    )
    op.create_index(
        "ix_support_contact_submissions_assigned_to_user_id",
        "support_contact_submissions",
        ["assigned_to_user_id"],
        unique=False,
    )
    op.create_index(
        "ix_support_contact_submissions_email",
        "support_contact_submissions",
        ["email"],
        unique=False,
    )
    op.create_index(
        "ix_support_contact_submissions_priority",
        "support_contact_submissions",
        ["priority"],
        unique=False,
    )
    op.create_index(
        "ix_support_contact_submissions_reference_code",
        "support_contact_submissions",
        ["reference_code"],
        unique=True,
    )
    op.create_index(
        "ix_support_contact_submissions_status",
        "support_contact_submissions",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_support_contact_submissions_status", table_name="support_contact_submissions")
    op.drop_index("ix_support_contact_submissions_reference_code", table_name="support_contact_submissions")
    op.drop_index("ix_support_contact_submissions_priority", table_name="support_contact_submissions")
    op.drop_index("ix_support_contact_submissions_email", table_name="support_contact_submissions")
    op.drop_index("ix_support_contact_submissions_assigned_to_user_id", table_name="support_contact_submissions")
    op.drop_table("support_contact_submissions")

    op.drop_index("ix_ai_conversations_author_user_id", table_name="ai_conversations")
    op.drop_constraint("fk_ai_conversations_author_user_id_users", "ai_conversations", type_="foreignkey")
    op.drop_column("ai_conversations", "author_user_id")

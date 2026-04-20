"""add username to users

Revision ID: 009
Revises: 008
Create Date: 2026-03-19 17:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def _normalize_username(value: str | None, fallback: str = "user") -> str:
    base = (value or "").strip().lower()
    normalized = []
    last_was_sep = False

    for char in base:
        if char.isalnum():
            normalized.append(char)
            last_was_sep = False
        elif not last_was_sep:
            normalized.append("_")
            last_was_sep = True

    result = "".join(normalized).strip("_")
    return (result or fallback)[:64].strip("_") or fallback


def upgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(length=64), nullable=True))

    connection = op.get_bind()
    rows = connection.execute(sa.text("SELECT id, email, name FROM users ORDER BY created_at ASC")).mappings().all()
    used_usernames: set[str] = set()

    for row in rows:
        email_prefix = (row["email"] or "").split("@")[0]
        base = _normalize_username(email_prefix or row["name"] or "user")
        candidate = base
        counter = 1

        while candidate in used_usernames:
            suffix = f"_{counter}"
            candidate = f"{base[: max(1, 64 - len(suffix))]}{suffix}"
            counter += 1

        used_usernames.add(candidate)
        connection.execute(
            sa.text("UPDATE users SET username = :username WHERE id = :user_id"),
            {"username": candidate, "user_id": row["id"]},
        )

    op.alter_column("users", "username", existing_type=sa.String(length=64), nullable=False)
    op.create_index("ix_users_username", "users", ["username"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_column("users", "username")

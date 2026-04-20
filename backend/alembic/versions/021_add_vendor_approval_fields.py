"""add vendor approval and application fields to users

Revision ID: 021_add_vendor_approval_fields
Revises: 020_add_poc_signature_job_rating
Create Date: 2026-03-30
"""

from alembic import op
import sqlalchemy as sa


revision = "021_add_vendor_approval_fields"
down_revision = "020_add_poc_signature_job_rating"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("approval_status", sa.String(length=20), nullable=False, server_default="APPROVED"))
    op.add_column("users", sa.Column("approval_note", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("approval_reviewed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("company_name", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("tax_id", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("contact_person", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("business_email", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("business_phone", sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "business_phone")
    op.drop_column("users", "business_email")
    op.drop_column("users", "contact_person")
    op.drop_column("users", "tax_id")
    op.drop_column("users", "company_name")
    op.drop_column("users", "approval_reviewed_at")
    op.drop_column("users", "approval_note")
    op.drop_column("users", "approval_status")

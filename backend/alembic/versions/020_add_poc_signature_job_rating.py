"""add poc_signature, job_rating, job_feedback to orders

Revision ID: 020_add_poc_signature_job_rating
Revises: 019_add_zone_lat_lng
Create Date: 2026-03-28

"""
from alembic import op
import sqlalchemy as sa

revision = '020_add_poc_signature_job_rating'
down_revision = '019'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('poc_signature', sa.Text(), nullable=True))
    op.add_column('orders', sa.Column('job_rating', sa.Integer(), nullable=True))
    op.add_column('orders', sa.Column('job_feedback', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('orders', 'job_feedback')
    op.drop_column('orders', 'job_rating')
    op.drop_column('orders', 'poc_signature')

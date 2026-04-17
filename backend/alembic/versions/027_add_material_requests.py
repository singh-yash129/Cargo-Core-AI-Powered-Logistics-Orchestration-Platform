"""Add material_requests table for WM to request new packing materials

Revision ID: 027_material_requests
Revises: 026_dispatcher_manifests
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '027_material_requests'
down_revision: Union[str, Sequence[str], None] = '026_dispatcher_manifests'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'material_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('material_name', sa.String(100), nullable=False),
        sa.Column('category', sa.String(100), nullable=False, server_default='Packing Materials'),
        sa.Column('unit', sa.String(30), nullable=False, server_default='pcs'),
        sa.Column('suggested_rate', sa.Float(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='PENDING'),
        sa.Column('requested_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('approved_rate', sa.Float(), nullable=True),
        sa.Column('manager_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    
    op.create_index('ix_material_requests_status', 'material_requests', ['status'])
    op.create_index('ix_material_requests_requested_by', 'material_requests', ['requested_by'])


def downgrade() -> None:
    op.drop_index('ix_material_requests_requested_by', table_name='material_requests')
    op.drop_index('ix_material_requests_status', table_name='material_requests')
    op.drop_table('material_requests')

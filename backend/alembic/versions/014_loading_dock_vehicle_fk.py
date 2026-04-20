"""Replace loading_docks.assigned_truck_id (str) with assigned_vehicle_id (UUID FK to logistics_vehicles)

Revision ID: 014_loading_dock_vehicle_fk
Revises: 013_add_order_geocode_cache
Create Date: 2026-03-23
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '014_loading_dock_vehicle_fk'
down_revision = '013_geocode'
branch_labels = None
depends_on = None


def upgrade():
    # Add the new proper FK column
    op.add_column(
        'loading_docks',
        sa.Column(
            'assigned_vehicle_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('logistics_vehicles.id', ondelete='SET NULL'),
            nullable=True,
        )
    )
    # Drop the old free-text column
    op.drop_column('loading_docks', 'assigned_truck_id')


def downgrade():
    op.add_column(
        'loading_docks',
        sa.Column('assigned_truck_id', sa.String(50), nullable=True)
    )
    op.drop_column('loading_docks', 'assigned_vehicle_id')

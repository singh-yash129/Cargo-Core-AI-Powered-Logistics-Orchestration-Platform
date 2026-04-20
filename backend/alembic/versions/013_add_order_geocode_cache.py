"""Add delivery_lat and delivery_lng to orders for geocode caching."""

from alembic import op
import sqlalchemy as sa

revision = "013_geocode"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("delivery_lat", sa.Float(), nullable=True))
    op.add_column("orders", sa.Column("delivery_lng", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "delivery_lng")
    op.drop_column("orders", "delivery_lat")

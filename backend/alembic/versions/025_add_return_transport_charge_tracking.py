"""add return transport charge tracking

Revision ID: 025_return_transport_charge
Revises: c7a9c989abe7, 024_wm_return_grading
Create Date: 2026-04-04 19:15:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "025_return_transport_charge"
down_revision: Union[str, Sequence[str], None] = ("c7a9c989abe7", "024_wm_return_grading")
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("logistics_return_cases", sa.Column("transport_charge_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("logistics_return_cases", sa.Column("transport_charge_wallet_collected", sa.Float(), nullable=False, server_default="0"))
    op.add_column("logistics_return_cases", sa.Column("transport_charge_pending_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("logistics_return_cases", sa.Column("transport_charge_status", sa.String(length=50), nullable=True))
    op.add_column("logistics_return_cases", sa.Column("transport_charge_order_id", sa.UUID(), nullable=True))
    op.add_column("logistics_return_cases", sa.Column("transport_charge_applied_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(
        "fk_logistics_return_cases_transport_charge_order_id_orders",
        "logistics_return_cases",
        "orders",
        ["transport_charge_order_id"],
        ["id"],
    )
    op.alter_column("logistics_return_cases", "transport_charge_amount", server_default=None)
    op.alter_column("logistics_return_cases", "transport_charge_wallet_collected", server_default=None)
    op.alter_column("logistics_return_cases", "transport_charge_pending_amount", server_default=None)

    op.add_column("orders", sa.Column("carry_forward_charge_amount", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("carry_forward_charge_paid_amount", sa.Float(), nullable=False, server_default="0"))
    op.alter_column("orders", "carry_forward_charge_amount", server_default=None)
    op.alter_column("orders", "carry_forward_charge_paid_amount", server_default=None)


def downgrade() -> None:
    op.drop_column("orders", "carry_forward_charge_paid_amount")
    op.drop_column("orders", "carry_forward_charge_amount")

    op.drop_constraint("fk_logistics_return_cases_transport_charge_order_id_orders", "logistics_return_cases", type_="foreignkey")
    op.drop_column("logistics_return_cases", "transport_charge_applied_at")
    op.drop_column("logistics_return_cases", "transport_charge_order_id")
    op.drop_column("logistics_return_cases", "transport_charge_status")
    op.drop_column("logistics_return_cases", "transport_charge_pending_amount")
    op.drop_column("logistics_return_cases", "transport_charge_wallet_collected")
    op.drop_column("logistics_return_cases", "transport_charge_amount")

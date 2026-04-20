"""create ai_knowledge_articles table and seed from hardcoded entries

Revision ID: 036_ai_knowledge_articles
Revises: 035_ai_support_settings
Create Date: 2026-04-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "036_ai_knowledge_articles"
down_revision: Union[str, Sequence[str], None] = "035_ai_support_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_knowledge_articles",
        sa.Column("id", sa.String(100), nullable=False),
        sa.Column("audience", sa.String(20), nullable=False, server_default="ALL"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column(
            "keywords",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("article_type", sa.String(50), nullable=False, server_default="SOP"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("author_initials", sa.String(5), nullable=False, server_default="PT"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["updated_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Seed all 11 hardcoded knowledge entries into the DB
    op.execute(
        sa.text("""
        INSERT INTO ai_knowledge_articles
            (id, audience, title, keywords, content, category, article_type, likes, author_initials)
        VALUES
        ('vendor_analytics','VENDOR','Vendor Analytics',
         '["analytics","analytics section","shipment analytics","performance","success rate"]',
         'The Vendor Analytics section summarizes shipment trends and business performance. It focuses on monthly spend, shipment volume, success rate, active versus delivered shipments, and average order value for the vendor account.',
         'Vendor','SOP',12,'VT'),

        ('vendor_recurring','VENDOR','Recurring Orders',
         '["recurring","recurring orders","recurring shipments","schedule","auto debit"]',
         'Recurring Orders let vendors template repeat shipment routes on a schedule such as weekly or monthly. Each recurring rule stores the route, frequency, details, next run date, and whether it is active. Recurring auto-debit works through wallet balance, so sufficient wallet funds are needed before the scheduled run.',
         'Vendor','SOP',8,'VT'),

        ('vendor_wallet','VENDOR','Vendor Wallet',
         '["wallet","wallet balance","credit balance","top up","wallet top up"]',
         'The Vendor Wallet stores usable credit for shipment payments and refunds. The wallet screen shows current balance, total credits, total debits, and recent transaction history. Refunds from eligible cancelled paid shipments are credited back to the wallet after applicable fees.',
         'Vendor','Policy',15,'VT'),

        ('vendor_support','VENDOR','Vendor Support',
         '["support","support section","ticket","help","contact support"]',
         'The Vendor Support area is for raising tickets about shipments, invoices, API usage, or platform issues. Tickets carry subject, description, priority, replies, and status so vendors can track follow-up from the support team.',
         'Vendor','Guide',5,'VT'),

        ('vendor_bulk_upload','VENDOR','Bulk Upload',
         '["bulk upload","csv","excel","many shipments","multiple shipments"]',
         'Bulk Upload lets vendors create many shipments in one step by uploading a CSV or spreadsheet-like file. Each row represents one shipment and is reviewed before final submission.',
         'Vendor','Guide',9,'VT'),

        ('individual_damage_report','INDIVIDUAL','Damage Reports',
         '["damage report","damage","claims","refund for damage","damage refund"]',
         'The Damage Report flow is used when items are damaged during packing, transit, or delivery. A report captures description, photos, linked order, and claim-review status. If a refund is approved, the customer sees the refund reflected through wallet credits or the related claim outcome.',
         'Customer','Policy',20,'PT'),

        ('individual_wallet','INDIVIDUAL','Customer Wallet',
         '["wallet","wallet balance","refund","cancellation refund","wallet transactions"]',
         'The customer wallet shows current balance, credits, debits, and transaction history. Refunds from eligible cancelled orders are credited back to the wallet after applicable cancellation fees.',
         'Customer','Policy',18,'PT'),

        ('individual_quotes','INDIVIDUAL','Quotes',
         '["quote","quotes","quotation","estimate","price estimate"]',
         'Quotes are estimated move costs shown before booking. They are based on route, labor, packing, materials, and vehicle requirements, and can later be converted into orders.',
         'Customer','Guide',11,'PT'),

        ('individual_estimator','INDIVIDUAL','AI Spatial Estimator',
         '["spatial estimator","estimator","ai estimator","room photo","image estimate"]',
         'The AI Spatial Estimator analyzes room or goods photos to estimate visible items, packing needs, labor, vehicle recommendation, and a rough base cost.',
         'Customer','Guide',14,'PT'),

        ('tracking_general','ALL','Tracking',
         '["tracking","track order","track shipment","where to track","live status"]',
         'Tracking shows order or shipment progress, warehouse stage, route, and status updates. Users can open their order or shipment list and drill into a specific tracking code for detailed status.',
         'General','SOP',25,'PT'),

        ('refund_policy_general','ALL','Refund Policy',
         '["refund policy","refund","refunds","cancel refund","refund rules"]',
         'Refund outcomes depend on the order event and applicable charges. For cancellations, eligible paid amounts can be credited back to wallet after cancellation fees. For damage claims, refund handling depends on claim review and the recorded claim outcome.',
         'General','Policy',30,'PT')
        ON CONFLICT (id) DO NOTHING;
        """)
    )


def downgrade() -> None:
    op.drop_table("ai_knowledge_articles")

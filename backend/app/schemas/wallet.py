from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class WalletTransactionRecord(BaseModel):
    id: UUID
    order_id: UUID | None = None
    tracking_code: str | None = None
    transaction_kind: str
    reason: str
    amount: float
    description: str
    created_at: datetime


class WalletSummary(BaseModel):
    balance: float = 0
    total_credits: float = 0
    total_debits: float = 0
    pending_transport_charge: float = 0
    transactions: list[WalletTransactionRecord] = []


class WalletPaymentRequest(BaseModel):
    amount: float | None = Field(default=None, gt=0)


class WalletPaymentResponse(BaseModel):
    order_id: UUID
    tracking_code: str
    applied_amount: float
    remaining_wallet_balance: float
    paid_amount: float
    payment_status: str


class WalletTopUpRequest(BaseModel):
    amount: float = Field(gt=0)


class WalletTopUpResponse(BaseModel):
    added_amount: float
    balance: float

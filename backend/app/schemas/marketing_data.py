from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MarketingDataBase(BaseModel):
    source: str
    date: date
    channel: str
    campaign_name: Optional[str] = None
    spend: Optional[Decimal] = None
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    revenue: Optional[Decimal] = None


class MarketingDataCreate(MarketingDataBase):
    pass


class MarketingDataUpdate(MarketingDataBase):
    source: Optional[str] = None
    date: Optional[date] = None
    channel: Optional[str] = None


class MarketingDataInDBBase(MarketingDataBase):
    id: Optional[UUID] = None
    user_id: UUID
    data_quality_score: Optional[Decimal] = None

    class Config:
        from_attributes = True


class MarketingData(MarketingDataInDBBase):
    pass


class MarketingDataInDB(MarketingDataInDBBase):
    pass

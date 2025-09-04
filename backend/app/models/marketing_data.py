from datetime import datetime, date
from typing import TYPE_CHECKING

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User


class MarketingData(Base):
    __tablename__ = "marketing_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source = Column(String(100), nullable=False)  # 'meta', 'google', 'tiktok', 'manual'
    date = Column(Date, nullable=False)
    channel = Column(String(100), nullable=False)
    campaign_name = Column(String(255))
    spend = Column(Numeric(12, 2))
    impressions = Column(BigInteger)
    clicks = Column(BigInteger)
    conversions = Column(Integer)
    revenue = Column(Numeric(12, 2))
    data_quality_score = Column(Numeric(3, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="marketing_data")

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user_preferences import UserPreferences
    from .marketing_data import MarketingData


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    preferences = relationship("UserPreferences", back_populates="user", uselist=False)
    marketing_data = relationship("MarketingData", back_populates="user")
    mmm_models = relationship("MMMModel", back_populates="user")
    model_comparisons = relationship("ModelComparison", back_populates="user")
    ensemble_models = relationship("EnsembleModel", back_populates="user")
    external_factors = relationship("ExternalFactor", back_populates="user")

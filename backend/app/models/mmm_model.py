from datetime import datetime
from typing import TYPE_CHECKING
import uuid
import enum

from sqlalchemy import Column, DateTime, String, Text, JSON, ForeignKey, Enum, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User


class ModelType(enum.Enum):
    LIGHTWEIGHT_MMM = "lightweight_mmm"
    ROBYN = "robyn"
    PYMC_MARKETING = "pymc_marketing"
    RIDGE_REGRESSION = "ridge_regression"


class ModelStatus(enum.Enum):
    TRAINING = "training"
    COMPLETED = "completed"
    FAILED = "failed"


class MMMModel(Base):
    __tablename__ = "mmm_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    model_type = Column(Enum(ModelType), nullable=False)
    status = Column(Enum(ModelStatus), default=ModelStatus.TRAINING)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    config = Column(JSON)
    training_data_id = Column(UUID(as_uuid=True))
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    training_duration = Column(Integer)
    error_message = Column(Text)
    
    user = relationship("User", back_populates="mmm_models")
    results = relationship("ModelResult", back_populates="model", cascade="all, delete-orphan")
    comparisons = relationship("ModelComparison", back_populates="models")


class ModelResult(Base):
    __tablename__ = "model_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    model_id = Column(UUID(as_uuid=True), ForeignKey("mmm_models.id"), nullable=False)
    attribution = Column(JSON)
    metrics = Column(JSON)
    predictions = Column(JSON)
    feature_importance = Column(JSON)
    residuals = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    model = relationship("MMMModel", back_populates="results")


class ModelComparison(Base):
    __tablename__ = "model_comparisons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    model_ids = Column(JSON)
    comparison_results = Column(JSON)
    statistical_significance = Column(JSON)
    agreement_analysis = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="model_comparisons")
    models = relationship("MMMModel", secondary="model_comparison_models")


class ModelComparisonModels(Base):
    __tablename__ = "model_comparison_models"
    
    comparison_id = Column(UUID(as_uuid=True), ForeignKey("model_comparisons.id"), primary_key=True)
    model_id = Column(UUID(as_uuid=True), ForeignKey("mmm_models.id"), primary_key=True)


class EnsembleModel(Base):
    __tablename__ = "ensemble_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    base_model_ids = Column(JSON)
    weights = Column(JSON)
    ensemble_config = Column(JSON)
    performance_metrics = Column(JSON)
    attribution_results = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="ensemble_models")


class ExternalFactor(Base):
    __tablename__ = "external_factors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    factor_type = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    data = Column(JSON)
    date_range_start = Column(DateTime)
    date_range_end = Column(DateTime)
    impact_coefficient = Column(Numeric(10, 6))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="external_factors")

from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.models.mmm_model import ModelType, ModelStatus


class MMMModelBase(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: ModelType
    config: Optional[Dict[str, Any]] = {}


class MMMModelCreate(MMMModelBase):
    pass


class MMMModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class MMMModel(MMMModelBase):
    id: str
    user_id: str
    status: ModelStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    training_duration: Optional[int] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class ModelResultBase(BaseModel):
    attribution: Dict[str, float]
    metrics: Dict[str, float]
    predictions: Optional[Dict[str, Any]] = {}
    feature_importance: Optional[Dict[str, float]] = {}


class ModelResult(ModelResultBase):
    id: str
    model_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ModelTrainingRequest(BaseModel):
    model_types: List[str]
    config: Optional[Dict[str, Any]] = {}
    training_name: Optional[str] = "MMM Training"


class ModelTrainingResponse(BaseModel):
    task_id: str
    status: str
    message: str


class ModelComparisonRequest(BaseModel):
    model_ids: List[str]
    comparison_name: str


class ModelComparisonResponse(BaseModel):
    comparison_id: str
    models: List[Dict[str, Any]]
    agreement_analysis: Dict[str, Any]
    attribution_comparison: Dict[str, Any]


class EnsembleRequest(BaseModel):
    model_ids: List[str]
    weights: Dict[str, float]
    ensemble_name: str


class EnsembleResponse(BaseModel):
    ensemble_id: str
    attribution: Dict[str, float]
    weights: Dict[str, float]
    status: str


class ScenarioPredictionRequest(BaseModel):
    model_id: str
    scenarios: List[Dict[str, Any]]


class ScenarioPredictionResponse(BaseModel):
    predictions: Dict[str, Any]
    model_id: str


class ModelResultCreate(ModelResultBase):
    model_id: str


class ModelComparisonBase(BaseModel):
    name: str
    model_ids: List[str]


class ModelComparisonCreate(ModelComparisonBase):
    pass


class ModelComparison(ModelComparisonBase):
    id: str
    user_id: str
    comparison_results: Optional[Dict[str, Any]] = None
    statistical_significance: Optional[Dict[str, Any]] = None
    agreement_analysis: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EnsembleModelBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_model_ids: List[str]
    weights: Optional[Dict[str, float]] = None
    ensemble_config: Optional[Dict[str, Any]] = None


class EnsembleModelCreate(EnsembleModelBase):
    pass


class EnsembleModel(EnsembleModelBase):
    id: str
    user_id: str
    performance_metrics: Optional[Dict[str, Any]] = None
    attribution_results: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ExternalFactorBase(BaseModel):
    factor_type: str
    name: str
    description: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    date_range_start: Optional[datetime] = None
    date_range_end: Optional[datetime] = None
    impact_coefficient: Optional[float] = None


class ExternalFactorCreate(ExternalFactorBase):
    pass


class ExternalFactor(ExternalFactorBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

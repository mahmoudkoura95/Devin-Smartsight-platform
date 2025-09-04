from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
from pydantic import BaseModel


class MMMConfig(BaseModel):
    model_type: str
    hyperparameters: Dict[str, Any] = {}
    training_config: Dict[str, Any] = {}
    validation_config: Dict[str, Any] = {}


class MMMBaseModel(ABC):
    """Abstract base class for all MMM models"""
    
    def __init__(self, config: MMMConfig):
        self.config = config
        self.is_trained = False
        self.model = None
        self.training_results = {}
        
    @abstractmethod
    def prepare_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Prepare data for model training"""
        pass
        
    @abstractmethod
    def train(self, prepared_data: Dict[str, Any]) -> Dict[str, Any]:
        """Train the MMM model"""
        pass
        
    @abstractmethod
    def get_attribution(self) -> Dict[str, float]:
        """Get channel attribution results"""
        pass
        
    @abstractmethod
    def predict_scenarios(self, scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict outcomes for different budget scenarios"""
        pass
        
    @abstractmethod
    def get_model_metrics(self) -> Dict[str, float]:
        """Get model performance metrics"""
        pass
        
    @abstractmethod
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        pass
        
    def validate_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Validate input data quality"""
        validation_results = {
            "is_valid": True,
            "warnings": [],
            "errors": []
        }
        
        required_columns = ['date', 'revenue']
        missing_columns = [col for col in required_columns if col not in data.columns]
        if missing_columns:
            validation_results["is_valid"] = False
            validation_results["errors"].append(f"Missing required columns: {missing_columns}")
            
        if data.empty:
            validation_results["is_valid"] = False
            validation_results["errors"].append("Dataset is empty")
            
        if len(data) < 52:
            validation_results["warnings"].append("Dataset has less than 52 weeks of data")
            
        return validation_results
        
    def get_convergence_diagnostics(self) -> Dict[str, Any]:
        """Get model convergence diagnostics"""
        return {
            "converged": True,
            "diagnostics": {}
        }

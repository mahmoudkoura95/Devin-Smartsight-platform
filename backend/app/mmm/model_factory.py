from typing import Dict, Any
from .base_model import MMMBaseModel, MMMConfig
from .lightweight_mmm_model import LightweightMMMModel
from .meridian_model import MeridianModel
from .ridge_regression_model import RidgeRegressionModel
from app.models.mmm_model import ModelType


class ModelFactory:
    """Factory for creating MMM model instances"""
    
    @staticmethod
    def create_model(model_type: ModelType, config: Dict[str, Any]) -> MMMBaseModel:
        """Create a model instance based on type"""
        
        mmm_config = MMMConfig(
            model_type=model_type.value,
            hyperparameters=config.get('hyperparameters', {}),
            training_config=config.get('training_config', {}),
            validation_config=config.get('validation_config', {})
        )
        
        if model_type == ModelType.LIGHTWEIGHT_MMM:
            return LightweightMMMModel(mmm_config)
        elif model_type == ModelType.MERIDIAN:
            return MeridianModel(mmm_config)
        elif model_type == ModelType.RIDGE_REGRESSION:
            return RidgeRegressionModel(mmm_config)
        elif model_type == ModelType.ROBYN:
            raise NotImplementedError("Robyn model not yet implemented")
        elif model_type == ModelType.PYMC_MARKETING:
            raise NotImplementedError("PyMC-Marketing model not yet implemented")
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    @staticmethod
    def get_available_models() -> Dict[str, Dict[str, Any]]:
        """Get information about available models"""
        return {
            ModelType.LIGHTWEIGHT_MMM.value: {
                "name": "Google LightweightMMM",
                "description": "Bayesian MMM using JAX and Numpyro",
                "complexity": "medium",
                "training_time": "medium",
                "requirements": ["jax", "numpyro", "lightweight-mmm"]
            },
            ModelType.MERIDIAN.value: {
                "name": "Google Meridian",
                "description": "Google's official Bayesian MMM using TensorFlow",
                "complexity": "high",
                "training_time": "medium",
                "requirements": ["tensorflow", "tensorflow-probability", "google-meridian"],
                "note": "Replaces LightweightMMM as Google's official MMM framework"
            },
            ModelType.RIDGE_REGRESSION.value: {
                "name": "Ridge Regression",
                "description": "Simple linear regression with L2 regularization",
                "complexity": "low",
                "training_time": "fast",
                "requirements": ["scikit-learn"]
            },
            ModelType.ROBYN.value: {
                "name": "Meta Robyn",
                "description": "Meta's open-source MMM using R",
                "complexity": "high",
                "training_time": "slow",
                "requirements": ["rpy2", "R", "Robyn"],
                "status": "not_implemented"
            },
            ModelType.PYMC_MARKETING.value: {
                "name": "PyMC-Marketing",
                "description": "Probabilistic MMM using PyMC",
                "complexity": "high",
                "training_time": "slow",
                "requirements": ["pymc", "pymc-marketing"],
                "status": "not_implemented"
            }
        }

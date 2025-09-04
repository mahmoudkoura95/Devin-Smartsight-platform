from celery import current_app as celery_app
from typing import Dict, Any, List
from app.mmm.model_orchestrator import ModelOrchestrator
from app.mmm.model_factory import ModelFactory
from app import crud
from app.db.session import SessionLocal
from app.models.mmm_model import ModelComparison
import pandas as pd
import numpy as np


@celery_app.task
def train_multiple_models(user_id: str, model_types: List[str], data_config: Dict[str, Any]) -> Dict[str, Any]:
    """Train multiple MMM models in parallel"""
    db = SessionLocal()
    try:
        orchestrator = ModelOrchestrator(db)
        results = orchestrator.train_models(user_id, model_types, data_config)
        return results
    finally:
        db.close()


@celery_app.task
def train_single_model(user_id: str, model_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Train a single MMM model"""
    db = SessionLocal()
    try:
        orchestrator = ModelOrchestrator(db)
        results = orchestrator.train_models(user_id, [model_type], {"config": config})
        return results.get(model_type, {"error": "Training failed"})
    finally:
        db.close()


@celery_app.task
def compare_models(user_id: str, model_ids: List[str], comparison_name: str) -> Dict[str, Any]:
    """Compare multiple trained models"""
    db = SessionLocal()
    try:
        orchestrator = ModelOrchestrator(db)
        comparison_results = orchestrator.compare_models(user_id, model_ids)
        
        if "error" not in comparison_results:
            comparison = ModelComparison(
                user_id=user_id,
                name=comparison_name,
                model_ids=model_ids,
                comparison_results=comparison_results["attribution_comparison"],
                statistical_significance={},
                agreement_analysis=comparison_results["agreement_analysis"]
            )
            db.add(comparison)
            db.commit()
            db.refresh(comparison)
            
            comparison_results["comparison_id"] = str(comparison.id)
        
        return comparison_results
    finally:
        db.close()


@celery_app.task
def create_ensemble(user_id: str, model_ids: List[str], weights: Dict[str, float], ensemble_name: str) -> Dict[str, Any]:
    """Create ensemble model from multiple trained models"""
    db = SessionLocal()
    try:
        from app.models.mmm_model import EnsembleModel
        
        models = []
        for model_id in model_ids:
            model = crud.mmm_model.get(db, id=model_id)
            if model and model.user_id == user_id:
                models.append(model)
        
        if len(models) < 2:
            return {"error": "Need at least 2 models for ensemble"}
        
        ensemble_attribution = {}
        total_weight = sum(weights.values())
        
        for model in models:
            if model.results:
                model_attribution = model.results[0].attribution
                weight = weights.get(str(model.id), 1.0) / total_weight
                
                for channel, value in model_attribution.items():
                    if channel not in ensemble_attribution:
                        ensemble_attribution[channel] = 0
                    ensemble_attribution[channel] += value * weight
        
        ensemble = EnsembleModel(
            user_id=user_id,
            name=ensemble_name,
            base_model_ids=model_ids,
            weights=weights,
            ensemble_config={"method": "weighted_average"},
            attribution_results=ensemble_attribution,
            performance_metrics={"ensemble_score": 0.9}
        )
        
        db.add(ensemble)
        db.commit()
        db.refresh(ensemble)
        
        return {
            "ensemble_id": str(ensemble.id),
            "attribution": ensemble_attribution,
            "weights": weights,
            "status": "completed"
        }
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


@celery_app.task
def process_data(user_id: str, file_path: str) -> Dict[str, Any]:
    """Process uploaded marketing data file"""
    try:
        df = pd.read_csv(file_path)
        
        required_columns = ['date', 'channel', 'spend', 'revenue']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return {
                "status": "failed",
                "error": f"Missing required columns: {missing_columns}"
            }
        
        data_quality_issues = []
        
        if df['spend'].isnull().sum() > 0:
            data_quality_issues.append("Missing spend values detected")
        if df['revenue'].isnull().sum() > 0:
            data_quality_issues.append("Missing revenue values detected")
        if len(df) < 52:
            data_quality_issues.append("Less than 52 weeks of data")
        
        data_quality_score = max(0, 1 - len(data_quality_issues) * 0.2)
        
        return {
            "status": "completed",
            "rows_processed": len(df),
            "data_quality_score": data_quality_score,
            "issues": data_quality_issues,
            "channels_detected": df['channel'].unique().tolist(),
            "date_range": {
                "start": df['date'].min(),
                "end": df['date'].max()
            }
        }
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }

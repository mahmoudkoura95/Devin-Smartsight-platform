from typing import Dict, Any, List
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

from app import crud
from app.models.mmm_model import MMMModel, ModelType, ModelStatus, ModelResult
from app.schemas.mmm import ModelTrainingRequest
from .model_factory import ModelFactory
import pandas as pd


class ModelOrchestrator:
    """Orchestrates training of multiple MMM models"""
    
    def __init__(self, db: Session):
        self.db = db
        
    def train_models(self, user_id: str, model_types: List[str], data_config: Dict[str, Any]) -> Dict[str, Any]:
        """Train multiple models and store results"""
        results = {}
        
        marketing_data = crud.marketing_data.get_multi_by_user(self.db, user_id=user_id)
        if not marketing_data:
            return {"error": "No marketing data found for user"}
        
        df = pd.DataFrame([{
            'date': item.date,
            'revenue': float(item.revenue or 0),
            'facebook_spend': float(item.spend or 0) if item.channel == 'facebook' else 0,
            'google_spend': float(item.spend or 0) if item.channel == 'google' else 0,
            'tiktok_spend': float(item.spend or 0) if item.channel == 'tiktok' else 0,
        } for item in marketing_data])
        
        df = df.groupby('date').agg({
            'revenue': 'sum',
            'facebook_spend': 'sum',
            'google_spend': 'sum',
            'tiktok_spend': 'sum'
        }).reset_index()
        
        for model_type_str in model_types:
            try:
                model_type = ModelType(model_type_str)
                
                mmm_model_db = MMMModel(
                    user_id=user_id,
                    model_type=model_type,
                    name=f"{model_type.value}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    config=data_config.get('config', {}),
                    status=ModelStatus.TRAINING
                )
                self.db.add(mmm_model_db)
                self.db.commit()
                self.db.refresh(mmm_model_db)
                
                model_instance = ModelFactory.create_model(model_type, data_config.get('config', {}))
                
                validation_result = model_instance.validate_data(df)
                if not validation_result['is_valid']:
                    mmm_model_db.status = ModelStatus.FAILED
                    mmm_model_db.error_message = '; '.join(validation_result['errors'])
                    self.db.commit()
                    results[model_type_str] = {"error": validation_result['errors']}
                    continue
                
                prepared_data = model_instance.prepare_data(df)
                training_result = model_instance.train(prepared_data)
                
                if training_result.get('status') == 'completed':
                    mmm_model_db.status = ModelStatus.COMPLETED
                    mmm_model_db.completed_at = datetime.utcnow()
                    
                    model_result = ModelResult(
                        model_id=mmm_model_db.id,
                        attribution=training_result.get('attribution', {}),
                        metrics=training_result.get('model_metrics', {}),
                        feature_importance=model_instance.get_feature_importance(),
                        predictions={}
                    )
                    self.db.add(model_result)
                    
                    results[model_type_str] = {
                        "model_id": str(mmm_model_db.id),
                        "status": "completed",
                        "attribution": training_result.get('attribution', {}),
                        "metrics": training_result.get('model_metrics', {})
                    }
                else:
                    mmm_model_db.status = ModelStatus.FAILED
                    mmm_model_db.error_message = training_result.get('error', 'Unknown error')
                    results[model_type_str] = {"error": training_result.get('error', 'Training failed')}
                
                self.db.commit()
                
            except Exception as e:
                results[model_type_str] = {"error": str(e)}
                
        return results
    
    def compare_models(self, user_id: str, model_ids: List[str]) -> Dict[str, Any]:
        """Compare multiple trained models"""
        models = []
        for model_id in model_ids:
            model = crud.mmm_model.get(self.db, id=model_id)
            if model and model.user_id == user_id and model.status == ModelStatus.COMPLETED:
                models.append(model)
        
        if len(models) < 2:
            return {"error": "Need at least 2 completed models for comparison"}
        
        comparison_results = {
            "models": [],
            "attribution_comparison": {},
            "metrics_comparison": {},
            "agreement_analysis": {}
        }
        
        for model in models:
            result = model.results[0] if model.results else None
            if result:
                comparison_results["models"].append({
                    "model_id": str(model.id),
                    "model_type": model.model_type.value,
                    "attribution": result.attribution,
                    "metrics": result.metrics
                })
        
        if len(comparison_results["models"]) >= 2:
            comparison_results["agreement_analysis"] = self._calculate_agreement(comparison_results["models"])
        
        return comparison_results
    
    def _calculate_agreement(self, models: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate agreement between models"""
        if len(models) < 2:
            return {}
        
        attributions = [model["attribution"] for model in models]
        channels = set()
        for attr in attributions:
            channels.update(attr.keys())
        
        channel_agreements = {}
        for channel in channels:
            values = [attr.get(channel, 0) for attr in attributions]
            if len(values) > 1:
                mean_val = sum(values) / len(values)
                variance = sum((v - mean_val) ** 2 for v in values) / len(values)
                channel_agreements[channel] = {
                    "mean_attribution": mean_val,
                    "variance": variance,
                    "coefficient_of_variation": variance / mean_val if mean_val > 0 else 0
                }
        
        overall_agreement = sum(1 - min(1, ca["coefficient_of_variation"]) for ca in channel_agreements.values()) / len(channel_agreements) if channel_agreements else 0
        
        return {
            "overall_agreement_score": overall_agreement,
            "channel_agreements": channel_agreements,
            "interpretation": "high" if overall_agreement > 0.8 else "medium" if overall_agreement > 0.6 else "low"
        }

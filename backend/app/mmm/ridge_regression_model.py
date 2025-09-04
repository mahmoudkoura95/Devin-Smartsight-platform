from typing import Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_percentage_error
from sklearn.model_selection import cross_val_score

from .base_model import MMMBaseModel, MMMConfig


class RidgeRegressionModel(MMMBaseModel):
    """Custom Ridge Regression MMM implementation"""
    
    def __init__(self, config: MMMConfig):
        super().__init__(config)
        self.scaler = StandardScaler()
        self.target_scaler = StandardScaler()
        self.feature_names = []
        
    def prepare_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Prepare data for Ridge regression training"""
        
        media_columns = [col for col in data.columns if 'spend' in col.lower() or col in ['facebook', 'google', 'tiktok', 'instagram']]
        
        if not media_columns:
            media_columns = ['facebook_spend', 'google_spend', 'tiktok_spend']
            for col in media_columns:
                if col not in data.columns:
                    data[col] = 0
        
        feature_columns = media_columns.copy()
        
        if 'seasonality' in data.columns:
            feature_columns.append('seasonality')
        if 'trend' in data.columns:
            feature_columns.append('trend')
            
        self.feature_names = feature_columns
        
        X = data[feature_columns].values.astype(float)
        y = data['revenue'].values.astype(float)
        
        prepared_data = {
            'X': X,
            'y': y,
            'feature_names': self.feature_names,
            'media_columns': media_columns
        }
        
        return prepared_data
        
    def train(self, prepared_data: Dict[str, Any]) -> Dict[str, Any]:
        """Train Ridge regression model"""
        try:
            X = prepared_data['X']
            y = prepared_data['y']
            
            X_scaled = self.scaler.fit_transform(X)
            y_scaled = self.target_scaler.fit_transform(y.reshape(-1, 1)).flatten()
            
            alpha = self.config.hyperparameters.get('alpha', 1.0)
            self.model = Ridge(alpha=alpha, random_state=42)
            
            self.model.fit(X_scaled, y_scaled)
            self.is_trained = True
            
            y_pred = self.model.predict(X_scaled)
            y_pred_original = self.target_scaler.inverse_transform(y_pred.reshape(-1, 1)).flatten()
            
            cv_scores = cross_val_score(self.model, X_scaled, y_scaled, cv=5, scoring='r2')
            
            self.training_results = {
                'coefficients': self.model.coef_,
                'intercept': self.model.intercept_,
                'cv_scores': cv_scores,
                'predictions': y_pred_original,
                'actual': y
            }
            
            return {
                'status': 'completed',
                'model_metrics': self.get_model_metrics(),
                'attribution': self.get_attribution()
            }
            
        except Exception as e:
            return {
                'status': 'failed',
                'error': str(e)
            }
            
    def get_attribution(self) -> Dict[str, float]:
        """Get channel attribution results"""
        if not self.is_trained:
            return {}
            
        coefficients = self.training_results['coefficients']
        media_columns = [name for name in self.feature_names if 'spend' in name.lower() or name in ['facebook', 'google', 'tiktok', 'instagram']]
        
        media_coeffs = []
        for i, feature in enumerate(self.feature_names):
            if feature in media_columns:
                media_coeffs.append(abs(coefficients[i]))
        
        total_coeff = sum(media_coeffs)
        
        attribution = {}
        media_idx = 0
        for feature in self.feature_names:
            if feature in media_columns:
                channel_name = feature.replace('_spend', '')
                attribution[channel_name] = float(media_coeffs[media_idx] / total_coeff) if total_coeff > 0 else 0.0
                media_idx += 1
                
        return attribution
        
    def predict_scenarios(self, scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict outcomes for different budget scenarios"""
        if not self.is_trained:
            return {'error': 'Model not trained'}
            
        predictions = {}
        for i, scenario in enumerate(scenarios):
            scenario_features = []
            for feature in self.feature_names:
                if 'spend' in feature.lower():
                    channel_name = feature.replace('_spend', '')
                    scenario_features.append(scenario.get(channel_name, 0))
                else:
                    scenario_features.append(0)
            
            scenario_array = np.array(scenario_features).reshape(1, -1)
            scenario_scaled = self.scaler.transform(scenario_array)
            
            try:
                prediction_scaled = self.model.predict(scenario_scaled)
                prediction = self.target_scaler.inverse_transform(prediction_scaled.reshape(-1, 1))[0, 0]
                
                predictions[f'scenario_{i}'] = {
                    'predicted_revenue': float(prediction),
                    'media_spend': scenario
                }
            except Exception as e:
                predictions[f'scenario_{i}'] = {'error': str(e)}
                
        return predictions
        
    def get_model_metrics(self) -> Dict[str, float]:
        """Get model performance metrics"""
        if not self.is_trained:
            return {}
            
        try:
            actual = self.training_results['actual']
            predicted = self.training_results['predictions']
            cv_scores = self.training_results['cv_scores']
            
            r2 = r2_score(actual, predicted)
            mape = mean_absolute_percentage_error(actual, predicted) * 100
            rmse = np.sqrt(np.mean((actual - predicted) ** 2))
            nrmse = rmse / np.mean(actual)
            
            return {
                'r_squared': float(r2),
                'mape': float(mape),
                'nrmse': float(nrmse),
                'cv_r2_mean': float(np.mean(cv_scores)),
                'cv_r2_std': float(np.std(cv_scores))
            }
        except Exception:
            return {
                'r_squared': 0.0,
                'mape': 0.0,
                'nrmse': 0.0
            }
            
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        if not self.is_trained:
            return {}
            
        coefficients = self.training_results['coefficients']
        importance = {}
        
        for i, feature in enumerate(self.feature_names):
            importance[feature] = float(abs(coefficients[i]))
            
        return importance

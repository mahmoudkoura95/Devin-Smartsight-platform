# SmartSight MMM Models Documentation

## Overview

SmartSight supports 5 industry-standard Marketing Mix Modeling approaches, each with unique strengths and use cases. This document provides detailed information about each model's implementation, capabilities, and best practices.

## Model Implementations

### 1. Google LightweightMMM

**File**: `backend/app/mmm/lightweight_mmm_model.py`

**Description**: Google's Bayesian MMM framework using JAX and Numpyro for fast, scalable modeling.

**Key Features**:
- Bayesian inference with MCMC sampling
- Built-in adstock and saturation transformations
- Hierarchical modeling for multiple geos/markets
- Uncertainty quantification

**Dependencies**:
```python
jax >= 0.4.35
numpyro >= 0.13.2
lightweight-mmm >= 0.1.7
```

**Use Cases**:
- Medium to large datasets (100+ observations)
- Need for uncertainty quantification
- Multi-market analysis
- Fast iteration and experimentation

**Configuration Example**:
```python
{
  "hyperparameters": {
    "adstock_max_lag": 8,
    "convolve_func": "adstock_geometric",
    "number_warmup": 1000,
    "number_samples": 1000
  }
}
```

### 2. Google Meridian

**File**: `backend/app/mmm/meridian_model.py`

**Description**: Google's official successor to LightweightMMM, built on TensorFlow with enhanced capabilities.

**Key Features**:
- Advanced Bayesian modeling with TensorFlow Probability
- Improved handling of large-scale data
- Enhanced visualization and diagnostics
- Better convergence properties

**Dependencies**:
```python
tensorflow >= 2.18
tensorflow-probability >= 0.25
google-meridian >= 1.1.6
```

**Use Cases**:
- Large-scale enterprise datasets
- Complex media mix scenarios
- Need for advanced diagnostics
- Production-grade modeling

**Configuration Example**:
```python
{
  "hyperparameters": {
    "max_lag": 13,
    "convolve_func": "geometric_adstock",
    "n_media_channels": 5,
    "n_time_periods": 104
  }
}
```

### 3. Ridge Regression

**File**: `backend/app/mmm/ridge_regression_model.py`

**Description**: Simple linear regression with L2 regularization, providing a fast baseline for comparison.

**Key Features**:
- Fast training and prediction
- Interpretable coefficients
- Built-in regularization
- Robust to multicollinearity

**Dependencies**:
```python
scikit-learn >= 1.3.2
pandas >= 2.2.2
numpy >= 2.0.2
```

**Use Cases**:
- Quick baseline modeling
- Small datasets (< 100 observations)
- Linear relationships
- Interpretability requirements

**Configuration Example**:
```python
{
  "hyperparameters": {
    "alpha": 1.0,
    "fit_intercept": true,
    "normalize": false
  }
}
```

### 4. Meta Robyn

**File**: `backend/app/mmm/robyn_model.py`

**Description**: Meta's open-source MMM framework with R integration via rpy2.

**Key Features**:
- Advanced adstock and saturation modeling
- Multi-objective optimization
- Automated hyperparameter tuning
- Rich visualization capabilities

**Dependencies**:
```python
rpy2 >= 3.5.16
# R packages: Robyn, reticulate
```

**Use Cases**:
- Complex media mix optimization
- Need for automated tuning
- Rich visualization requirements
- R ecosystem integration

**Configuration Example**:
```python
{
  "hyperparameters": {
    "adstock_max_lag": 8,
    "cores": 1,
    "iterations": 500,
    "trials": 1
  }
}
```

**Fallback Implementation**: When R/rpy2 is unavailable, uses spend-proportional attribution.

### 5. PyMC-Marketing

**File**: `backend/app/mmm/pymc_marketing_model.py`

**Description**: Probabilistic MMM using PyMC for full Bayesian inference.

**Key Features**:
- Full Bayesian workflow
- Flexible model specification
- Advanced MCMC diagnostics
- Hierarchical modeling support

**Dependencies**:
```python
pymc >= 5.10.0
pymc-marketing >= 0.7.0
```

**Use Cases**:
- Custom model architectures
- Advanced Bayesian analysis
- Research and experimentation
- Flexible modeling requirements

**Configuration Example**:
```python
{
  "hyperparameters": {
    "adstock_max_lag": 8,
    "yearly_seasonality": 10
  },
  "training_config": {
    "draws": 1000,
    "tune": 1000,
    "chains": 2,
    "target_accept": 0.85
  }
}
```

**Fallback Implementation**: When PyMC is unavailable, uses spend-proportional attribution.

## Model Comparison Framework

### Agreement Analysis

The `ModelOrchestrator` class provides sophisticated model comparison:

```python
def _calculate_agreement(self, models: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates:
    - Mean attribution per channel
    - Variance across models  
    - Coefficient of variation
    - Overall agreement score (0-1)
    - Interpretation: "high"/"medium"/"low"
    """
```

### Ensemble Creation

Combine multiple models with custom weights:

```python
{
  "model_ids": ["model1_id", "model2_id", "model3_id"],
  "weights": [0.5, 0.3, 0.2],
  "ensemble_name": "Conservative_Ensemble"
}
```

## Best Practices

### Model Selection Guidelines

1. **Start with Ridge Regression**: Fast baseline for data validation
2. **Use LightweightMMM**: For most standard use cases
3. **Choose Meridian**: For large-scale, production environments
4. **Consider Robyn**: When optimization is key priority
5. **Try PyMC-Marketing**: For custom modeling needs

### Data Requirements

**Minimum Requirements**:
- 52+ weekly observations (1 year)
- Revenue/KPI data
- Media spend data for 2+ channels
- Date column

**Recommended**:
- 104+ weekly observations (2 years)
- 3-8 media channels
- External factors (seasonality, promotions)
- Consistent data quality

### Training Strategy

1. **Single Model Training**: Start with one model to validate data
2. **Multi-Model Comparison**: Train 2-3 models for robustness
3. **Ensemble Creation**: Combine models with high agreement
4. **Scenario Testing**: Validate with known business events

## Error Handling

### Dependency Management

All models include fallback implementations:

```python
try:
    import specialized_library
    LIBRARY_AVAILABLE = True
except ImportError:
    LIBRARY_AVAILABLE = False
    logger.warning("Using fallback implementation")
```

### Common Issues

1. **R Integration (Robyn)**: Install R and Robyn package
2. **JAX/GPU (LightweightMMM)**: May need CPU-only version
3. **Memory (Large datasets)**: Consider data sampling
4. **Convergence**: Adjust MCMC parameters

## Performance Characteristics

| Model | Training Time | Memory Usage | Scalability | Accuracy |
|-------|---------------|--------------|-------------|----------|
| Ridge Regression | Fast | Low | High | Baseline |
| LightweightMMM | Medium | Medium | High | High |
| Meridian | Medium | High | Very High | Very High |
| Robyn | Slow | Medium | Medium | High |
| PyMC-Marketing | Slow | High | Medium | Very High |

## API Integration

### Training Endpoint

```bash
POST /api/v1/models/train
{
  "model_types": ["lightweight_mmm", "meridian"],
  "config": {
    "hyperparameters": {...},
    "training_config": {...}
  }
}
```

### Results Endpoint

```bash
GET /api/v1/models/{model_id}/results
{
  "attribution": {"facebook": 0.35, "google": 0.45},
  "metrics": {"r_squared": 0.82, "mape": 0.15},
  "feature_importance": {...},
  "predictions": {...}
}
```

## Future Enhancements

1. **Auto-ML Integration**: Automated model selection
2. **Real-time Training**: Streaming data support
3. **Custom Models**: User-defined model architectures
4. **Advanced Diagnostics**: Enhanced model validation
5. **GPU Acceleration**: Faster training for large datasets

---

For implementation details, see the individual model files in `backend/app/mmm/`.

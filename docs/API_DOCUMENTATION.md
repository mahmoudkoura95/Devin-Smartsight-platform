# SmartSight API Documentation

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: TBD

## Authentication

All API endpoints (except public ones) require JWT authentication.

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=yourpassword
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### Using Authentication
Include the token in the Authorization header:
```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## MMM Models API

### Get Available Models
```bash
GET /api/v1/models/available-models/info
```

**Response**:
```json
{
  "lightweight_mmm": {
    "name": "Google LightweightMMM",
    "description": "Bayesian MMM using JAX and Numpyro",
    "complexity": "medium",
    "training_time": "medium",
    "requirements": ["jax", "numpyro", "lightweight-mmm"]
  },
  "meridian": {
    "name": "Google Meridian",
    "description": "Google's official Bayesian MMM using TensorFlow",
    "complexity": "high",
    "training_time": "medium",
    "requirements": ["tensorflow", "tensorflow-probability", "google-meridian"]
  },
  "ridge_regression": {
    "name": "Ridge Regression",
    "description": "Simple linear regression with L2 regularization",
    "complexity": "low",
    "training_time": "fast",
    "requirements": ["scikit-learn"]
  },
  "robyn": {
    "name": "Meta Robyn",
    "description": "Meta's open-source MMM using R",
    "complexity": "high",
    "training_time": "slow",
    "requirements": ["rpy2", "R", "Robyn"],
    "status": "implemented"
  },
  "pymc_marketing": {
    "name": "PyMC-Marketing",
    "description": "Probabilistic MMM using PyMC",
    "complexity": "high",
    "training_time": "slow",
    "requirements": ["pymc", "pymc-marketing"],
    "status": "implemented"
  }
}
```

### Train Multiple Models
```bash
POST /api/v1/models/train
Authorization: Bearer <token>
Content-Type: application/json

{
  "model_types": ["lightweight_mmm", "meridian", "ridge_regression"],
  "config": {
    "hyperparameters": {
      "adstock_max_lag": 8,
      "number_warmup": 1000,
      "number_samples": 1000
    },
    "training_config": {
      "chains": 2,
      "cores": 1
    }
  }
}
```

**Response**:
```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "started",
  "message": "Training started for models: lightweight_mmm, meridian, ridge_regression"
}
```

### Train Single Model
```bash
POST /api/v1/models/train-single?model_type=lightweight_mmm
Authorization: Bearer <token>
Content-Type: application/json

{
  "hyperparameters": {
    "adstock_max_lag": 8,
    "number_warmup": 1000
  }
}
```

### Get User Models
```bash
GET /api/v1/models/?skip=0&limit=100
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": "model-uuid-123",
    "user_id": "user-uuid-456",
    "name": "lightweight_mmm_20241204_143022",
    "description": null,
    "model_type": "lightweight_mmm",
    "status": "completed",
    "config": {...},
    "created_at": "2024-12-04T14:30:22Z",
    "completed_at": "2024-12-04T14:35:18Z",
    "training_duration": 296,
    "error_message": null
  }
]
```

### Get Model Details
```bash
GET /api/v1/models/{model_id}
Authorization: Bearer <token>
```

### Get Model Results
```bash
GET /api/v1/models/{model_id}/results
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "result-uuid-789",
  "model_id": "model-uuid-123",
  "attribution": {
    "facebook": 0.35,
    "google": 0.45,
    "tiktok": 0.20
  },
  "metrics": {
    "r_squared": 0.82,
    "mape": 0.15,
    "nrmse": 0.18,
    "converged": true
  },
  "predictions": {...},
  "feature_importance": {
    "facebook": 0.35,
    "google": 0.45,
    "tiktok": 0.20
  },
  "created_at": "2024-12-04T14:35:18Z"
}
```

### Compare Models
```bash
POST /api/v1/models/compare
Authorization: Bearer <token>
Content-Type: application/json

{
  "model_ids": ["model-uuid-123", "model-uuid-456", "model-uuid-789"],
  "comparison_name": "Q4_2024_Model_Comparison"
}
```

**Response**:
```json
{
  "task_id": "comparison-task-123",
  "status": "started",
  "message": "Comparison started for 3 models"
}
```

### Create Ensemble
```bash
POST /api/v1/models/ensemble
Authorization: Bearer <token>
Content-Type: application/json

{
  "model_ids": ["model-uuid-123", "model-uuid-456"],
  "weights": [0.6, 0.4],
  "ensemble_name": "Conservative_Ensemble_v1"
}
```

**Response**:
```json
{
  "task_id": "ensemble-task-456",
  "status": "started",
  "message": "Ensemble creation started with 2 models"
}
```

### Predict Scenarios
```bash
POST /api/v1/models/{model_id}/predict
Authorization: Bearer <token>
Content-Type: application/json

{
  "scenarios": [
    {
      "facebook_spend": 50000,
      "google_spend": 30000,
      "tiktok_spend": 20000
    },
    {
      "facebook_spend": 40000,
      "google_spend": 40000,
      "tiktok_spend": 20000
    }
  ]
}
```

**Response**:
```json
{
  "predictions": {
    "scenario_0": {
      "predicted_revenue": 1250000,
      "media_spend": {
        "facebook_spend": 50000,
        "google_spend": 30000,
        "tiktok_spend": 20000
      },
      "total_spend": 100000
    },
    "scenario_1": {
      "predicted_revenue": 1230000,
      "media_spend": {
        "facebook_spend": 40000,
        "google_spend": 40000,
        "tiktok_spend": 20000
      },
      "total_spend": 100000
    }
  },
  "model_id": "model-uuid-123"
}
```

### Get Task Status
```bash
GET /api/v1/models/task/{task_id}
```

**Response**:
```json
{
  "task_id": "abc123-def456-ghi789",
  "status": "SUCCESS",
  "result": {
    "lightweight_mmm": {
      "model_id": "model-uuid-123",
      "status": "completed",
      "attribution": {...},
      "metrics": {...}
    },
    "meridian": {
      "model_id": "model-uuid-456", 
      "status": "completed",
      "attribution": {...},
      "metrics": {...}
    }
  }
}
```

## Marketing Data API

### Upload Marketing Data
```bash
POST /api/v1/marketing-data/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=@marketing_data.csv
```

**CSV Format**:
```csv
date,channel,spend,revenue
2024-01-01,facebook,5000,50000
2024-01-01,google,3000,50000
2024-01-01,tiktok,2000,50000
```

### Get Marketing Data
```bash
GET /api/v1/marketing-data/?skip=0&limit=100
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": "data-uuid-123",
    "user_id": "user-uuid-456",
    "date": "2024-01-01",
    "channel": "facebook",
    "spend": 5000.0,
    "revenue": 50000.0,
    "impressions": null,
    "clicks": null,
    "conversions": null,
    "created_at": "2024-12-04T14:30:22Z"
  }
]
```

## User Management API

### Get Current User
```bash
GET /api/v1/users/me
Authorization: Bearer <token>
```

**Response**:
```json
{
  "id": "user-uuid-456",
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-12-01T10:00:00Z"
}
```

### Register User
```bash
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "full_name": "Jane Smith"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Model not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "model_types"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- **Default**: 100 requests per minute per user
- **Training endpoints**: 10 requests per hour per user
- **Upload endpoints**: 50 requests per hour per user

## Pagination

List endpoints support pagination:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100, max: 1000)

## WebSocket Support (Future)

Real-time updates for training progress:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/training/{task_id}');
ws.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  console.log(`Training progress: ${progress.percentage}%`);
};
```

## SDK Examples

### Python SDK (Future)
```python
from smartsight import SmartSightClient

client = SmartSightClient(api_key="your-api-key")

# Train models
task = client.models.train(
    model_types=["lightweight_mmm", "meridian"],
    config={"hyperparameters": {...}}
)

# Get results
results = client.models.get_results(task.model_ids[0])
print(results.attribution)
```

### JavaScript SDK (Future)
```javascript
import { SmartSightClient } from '@smartsight/sdk';

const client = new SmartSightClient({ apiKey: 'your-api-key' });

// Train models
const task = await client.models.train({
  modelTypes: ['lightweight_mmm', 'meridian'],
  config: { hyperparameters: {...} }
});

// Get results
const results = await client.models.getResults(task.modelIds[0]);
console.log(results.attribution);
```

---

For more examples and detailed guides, see the [GitHub Wiki](https://github.com/mahmoudkoura95/Devin-Smartsight-platform/wiki).

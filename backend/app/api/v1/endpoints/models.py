from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from celery.result import AsyncResult

from app import crud, models, schemas
from app.api import deps
from app.tasks.mmm_tasks import train_multiple_models, train_single_model, compare_models, create_ensemble
from app.mmm.model_factory import ModelFactory

router = APIRouter()


@router.post("/train", response_model=schemas.ModelTrainingResponse)
def train_models(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    training_request: schemas.ModelTrainingRequest
):
    """Start training multiple MMM models"""
    try:
        task = train_multiple_models.delay(
            user_id=str(current_user.id),
            model_types=training_request.model_types,
            data_config={"config": training_request.config}
        )
        
        return schemas.ModelTrainingResponse(
            task_id=task.id,
            status="started",
            message=f"Training started for models: {', '.join(training_request.model_types)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train-single", response_model=schemas.ModelTrainingResponse)
def train_single_model_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    model_type: str,
    config: dict = {}
):
    """Start training a single MMM model"""
    try:
        task = train_single_model.delay(
            user_id=str(current_user.id),
            model_type=model_type,
            config=config
        )
        
        return schemas.ModelTrainingResponse(
            task_id=task.id,
            status="started",
            message=f"Training started for {model_type} model"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[schemas.MMMModel])
def get_user_models(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all models for current user"""
    models_list = crud.mmm_model.get_multi_by_user(
        db, user_id=str(current_user.id), skip=skip, limit=limit
    )
    return [
        schemas.MMMModel(
            id=str(model.id),
            user_id=str(model.user_id),
            name=model.name,
            description=model.description,
            model_type=model.model_type,
            status=model.status,
            config=model.config,
            created_at=model.created_at,
            completed_at=model.completed_at,
            training_duration=model.training_duration,
            error_message=model.error_message
        )
        for model in models_list
    ]


@router.get("/{model_id}", response_model=schemas.MMMModel)
def get_model(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    model_id: str
):
    """Get a specific model"""
    model = crud.mmm_model.get(db, id=model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    if model.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return schemas.MMMModel(
        id=str(model.id),
        user_id=str(model.user_id),
        name=model.name,
        description=model.description,
        model_type=model.model_type,
        status=model.status,
        config=model.config,
        created_at=model.created_at,
        completed_at=model.completed_at,
        training_duration=model.training_duration,
        error_message=model.error_message
    )


@router.get("/{model_id}/results", response_model=schemas.ModelResult)
def get_model_results(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    model_id: str
):
    """Get results for a specific model"""
    model = crud.mmm_model.get(db, id=model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    if model.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = crud.model_result.get_by_model_id(db, model_id=model_id)
    if not result:
        raise HTTPException(status_code=404, detail="Model results not found")
    
    return schemas.ModelResult(
        id=str(result.id),
        model_id=str(result.model_id),
        attribution=result.attribution,
        metrics=result.metrics,
        predictions=result.predictions,
        feature_importance=result.feature_importance,
        created_at=result.created_at
    )


@router.post("/compare", response_model=dict)
def compare_models_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    comparison_request: schemas.ModelComparisonRequest
):
    """Compare multiple trained models"""
    try:
        task = compare_models.delay(
            user_id=str(current_user.id),
            model_ids=comparison_request.model_ids,
            comparison_name=comparison_request.comparison_name
        )
        
        return {
            "task_id": task.id,
            "status": "started",
            "message": f"Comparison started for {len(comparison_request.model_ids)} models"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ensemble", response_model=dict)
def create_ensemble_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    ensemble_request: schemas.EnsembleRequest
):
    """Create ensemble model from multiple trained models"""
    try:
        task = create_ensemble.delay(
            user_id=str(current_user.id),
            model_ids=ensemble_request.model_ids,
            weights=ensemble_request.weights,
            ensemble_name=ensemble_request.ensemble_name
        )
        
        return {
            "task_id": task.id,
            "status": "started",
            "message": f"Ensemble creation started with {len(ensemble_request.model_ids)} models"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/task/{task_id}")
def get_task_status(task_id: str):
    """Get status of a background task"""
    try:
        result = AsyncResult(task_id)
        return {
            "task_id": task_id,
            "status": result.status,
            "result": result.result if result.ready() else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available-models/info")
def get_available_models():
    """Get information about available MMM models"""
    return ModelFactory.get_available_models()


@router.post("/{model_id}/predict", response_model=schemas.ScenarioPredictionResponse)
def predict_scenarios(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    model_id: str,
    prediction_request: schemas.ScenarioPredictionRequest
):
    """Predict outcomes for different budget scenarios"""
    model = crud.mmm_model.get(db, id=model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    if model.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if model.status != models.ModelStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Model is not trained yet")
    
    try:
        model_instance = ModelFactory.create_model(model.model_type, model.config or {})
        predictions = model_instance.predict_scenarios(prediction_request.scenarios)
        
        return schemas.ScenarioPredictionResponse(
            predictions=predictions,
            model_id=model_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

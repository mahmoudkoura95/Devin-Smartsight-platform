from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.utils.synthetic_data import generate_demo_data

router = APIRouter()


@router.get("/", response_model=List[schemas.MarketingData])
def read_marketing_data(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    marketing_data = crud.marketing_data.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return marketing_data


@router.post("/", response_model=schemas.MarketingData)
def create_marketing_data(
    *,
    db: Session = Depends(deps.get_db),
    marketing_data_in: schemas.MarketingDataCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    marketing_data = crud.marketing_data.create_with_user(
        db=db, obj_in=marketing_data_in, user_id=current_user.id
    )
    return marketing_data


@router.post("/upload")
async def upload_marketing_data(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(
            status_code=400,
            detail="File must be CSV or Excel format"
        )
    
    return {"message": "File uploaded successfully", "filename": file.filename}


@router.get("/{data_id}", response_model=schemas.MarketingData)
def read_marketing_data_by_id(
    *,
    db: Session = Depends(deps.get_db),
    data_id: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    marketing_data = crud.marketing_data.get(db=db, id=data_id)
    if not marketing_data:
        raise HTTPException(status_code=404, detail="Marketing data not found")
    if marketing_data.user_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return marketing_data


@router.put("/{data_id}", response_model=schemas.MarketingData)
def update_marketing_data(
    *,
    db: Session = Depends(deps.get_db),
    data_id: str,
    marketing_data_in: schemas.MarketingDataUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    marketing_data = crud.marketing_data.get(db=db, id=data_id)
    if not marketing_data:
        raise HTTPException(status_code=404, detail="Marketing data not found")
    if marketing_data.user_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    marketing_data = crud.marketing_data.update(db=db, db_obj=marketing_data, obj_in=marketing_data_in)
    return marketing_data


@router.delete("/{data_id}")
def delete_marketing_data(
    *,
    db: Session = Depends(deps.get_db),
    data_id: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    marketing_data = crud.marketing_data.get(db=db, id=data_id)
    if not marketing_data:
        raise HTTPException(status_code=404, detail="Marketing data not found")
    if marketing_data.user_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    marketing_data = crud.marketing_data.remove(db=db, id=data_id)
    return {"message": "Marketing data deleted successfully"}


@router.post("/generate-demo-data")
def generate_demo_marketing_data(
    *,
    db: Session = Depends(deps.get_db),
    days: int = 90,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Generate synthetic marketing data for demo purposes."""
    
    synthetic_data = generate_demo_data(days=days)
    
    created_records = []
    for data_item in synthetic_data:
        db_record = crud.marketing_data.create_with_user(
            db=db, obj_in=data_item, user_id=current_user.id
        )
        created_records.append(db_record)
    
    return {
        "message": f"Successfully generated {len(created_records)} marketing data records",
        "records_created": len(created_records),
        "date_range": {
            "start_date": synthetic_data[0].date.isoformat() if synthetic_data else None,
            "end_date": synthetic_data[-1].date.isoformat() if synthetic_data else None,
        },
        "channels": list(set([record.channel for record in synthetic_data])),
    }

from typing import Any, List, Optional
from datetime import date
import io
import csv
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import crud, models, schemas
from app.api import deps
from app.utils.synthetic_data import generate_demo_data, get_channel_info, get_budget_presets, apply_preset_budget

router = APIRouter()


class CustomDataGenerationRequest(BaseModel):
    channels: List[str]
    spend_ranges: dict
    start_date: date
    end_date: date
    business_size: str = "medium"


class FileExportRequest(BaseModel):
    format: str = "csv"
    data_ids: Optional[List[str]] = None


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


@router.get("/channel-info")
def get_available_channels() -> Any:
    """Get information about available marketing channels."""
    return {"channels": get_channel_info()}


@router.get("/presets")
def get_budget_presets_endpoint() -> Any:
    """Get predefined budget presets and recommendations."""
    return {
        "presets": get_budget_presets(),
        "date_presets": {
            "last_30_days": {"days": 30, "name": "Last 30 Days"},
            "last_90_days": {"days": 90, "name": "Last 90 Days"},
            "last_6_months": {"days": 180, "name": "Last 6 Months"},
            "last_year": {"days": 365, "name": "Last Year"}
        }
    }


@router.post("/apply-preset")
def apply_budget_preset(
    *,
    preset_name: str,
    channels: List[str]
) -> Any:
    """Apply a budget preset to selected channels."""
    try:
        spend_ranges = apply_preset_budget(preset_name, channels)
        return {"spend_ranges": spend_ranges}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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


@router.post("/generate-custom-data")
def generate_custom_marketing_data(
    *,
    db: Session = Depends(deps.get_db),
    request: CustomDataGenerationRequest,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Generate synthetic marketing data with custom parameters."""
    
    size_multipliers = {
        "small": 0.3,
        "medium": 1.0,
        "large": 3.0
    }
    multiplier = size_multipliers.get(request.business_size, 1.0)
    
    custom_spend_ranges = {}
    for channel, spend_range in request.spend_ranges.items():
        min_spend, max_spend = spend_range
        custom_spend_ranges[channel] = (
            int(min_spend * multiplier),
            int(max_spend * multiplier)
        )
    
    synthetic_data = generate_demo_data(
        channels=request.channels,
        custom_spend_ranges=custom_spend_ranges,
        start_date=request.start_date,
        end_date=request.end_date
    )
    
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
            "start_date": request.start_date.isoformat(),
            "end_date": request.end_date.isoformat(),
        },
        "channels": request.channels,
        "business_size": request.business_size,
    }


@router.post("/export")
def export_marketing_data(
    *,
    db: Session = Depends(deps.get_db),
    request: FileExportRequest,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> StreamingResponse:
    """Export marketing data in various formats."""
    
    marketing_data = crud.marketing_data.get_multi_by_user(
        db=db, user_id=current_user.id, skip=0, limit=10000
    )
    
    if not marketing_data:
        raise HTTPException(status_code=404, detail="No marketing data found")
    
    data_dicts = []
    channels = set()
    dates = []
    
    for record in marketing_data:
        data_dicts.append({
            'date': record.date.isoformat(),
            'channel': record.channel,
            'campaign_name': record.campaign_name,
            'spend': float(record.spend) if record.spend else 0,
            'impressions': record.impressions or 0,
            'clicks': record.clicks or 0,
            'conversions': record.conversions or 0,
            'revenue': float(record.revenue) if record.revenue else 0,
        })
        channels.add(record.channel)
        dates.append(record.date)
    
    df = pd.DataFrame(data_dicts)
    
    if dates:
        start_date = min(dates).strftime('%Y%m%d')
        end_date = max(dates).strftime('%Y%m%d')
        date_range = f"{start_date}_{end_date}"
    else:
        date_range = "no_data"
    
    channels_str = "_".join(sorted(list(channels))[:3])  # Limit to first 3 channels for filename
    if len(channels) > 3:
        channels_str += f"_plus{len(channels)-3}more"
    
    base_filename = f"smartsight_synthetic_data_{date_range}_{channels_str}"
    
    if request.format == "csv":
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={base_filename}.csv"}
        )
    
    elif request.format == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Daily Data', index=False)
            
            summary_data = {
                'Metric': ['Total Records', 'Channels', 'Date Range', 'Total Spend', 'Total Revenue'],
                'Value': [
                    len(df),
                    len(channels),
                    f"{min(dates)} to {max(dates)}" if dates else "No data",
                    f"${df['spend'].sum():,.2f}",
                    f"${df['revenue'].sum():,.2f}"
                ]
            }
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            platform_summary = df.groupby('channel').agg({
                'spend': 'sum',
                'impressions': 'sum',
                'clicks': 'sum',
                'conversions': 'sum',
                'revenue': 'sum'
            }).reset_index()
            platform_summary.to_excel(writer, sheet_name='Platform Breakdown', index=False)
        
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={base_filename}.xlsx"}
        )
    
    else:
        export_data = {
            "metadata": {
                "generated_at": pd.Timestamp.now().isoformat(),
                "total_records": len(df),
                "channels": sorted(list(channels)),
                "date_range": {
                    "start": min(dates).isoformat() if dates else None,
                    "end": max(dates).isoformat() if dates else None
                },
                "data_dictionary": {
                    "date": "Date of the marketing activity (YYYY-MM-DD)",
                    "channel": "Marketing channel/platform",
                    "campaign_name": "Name of the marketing campaign",
                    "spend": "Amount spent on the channel (USD)",
                    "impressions": "Number of ad impressions",
                    "clicks": "Number of clicks received",
                    "conversions": "Number of conversions/purchases",
                    "revenue": "Revenue generated (USD)"
                }
            },
            "data": data_dicts
        }
        
        output = io.StringIO()
        pd.Series([export_data]).to_json(output, orient='records', date_format='iso')
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={base_filename}.json"}
        )

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, marketing_data, models

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(marketing_data.router, prefix="/data", tags=["marketing-data"])
api_router.include_router(models.router, prefix="/models", tags=["mmm-models"])

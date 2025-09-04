from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="SmartSight MMM API",
    description="Marketing Mix Modeling Platform API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return JSONResponse(
        content={
            "message": "SmartSight MMM Platform API",
            "version": "1.0.0",
            "status": "running"
        }
    )


@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "healthy"})

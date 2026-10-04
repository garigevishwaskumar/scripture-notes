"""
System Health and Diagnostics Router
"""
from fastapi import APIRouter
from app.config import settings
from app.schemas import HealthResponse
from app.services.bible_service import bible_service

router = APIRouter(tags=["Health"])

@router.get("/healthz", response_model=HealthResponse, summary="Kubernetes / Cloud Health Check")
@router.get("/api/health", response_model=HealthResponse, summary="API Health Check")
def health_check():
    """
    Returns API operational status, loaded dataset stats, and version information.
    """
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        app_name=settings.APP_NAME,
        bible_indexed=bible_service.is_loaded,
        total_verses=bible_service.total_verses
    )

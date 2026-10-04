"""
Bible Scripture Full-Text Search Router
"""
from typing import Optional
from fastapi import APIRouter, Query
from app.schemas import SearchResponse
from app.services.bible_service import bible_service

router = APIRouter(prefix="/api/bible", tags=["Scripture Search"])

@router.get("/search", response_model=SearchResponse, summary="Full-text search across scripture")
def search_verses(
    q: str = Query(..., min_length=2, description="Search term, keyword, or phrase"),
    testament: Optional[str] = Query(None, description="Optional testament filter ('OT' or 'NT')"),
    book: Optional[str] = Query(None, description="Optional book ID filter (e.g. 'JHN', 'ROM')"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=100, description="Results per page")
):
    """
    Lightning-fast full-text search across all 31,102 verses with pagination.
    """
    offset = (page - 1) * page_size
    total_results, results = bible_service.search_verses(
        query=q,
        testament=testament,
        book_id=book,
        limit=page_size,
        offset=offset
    )
    return SearchResponse(
        query=q,
        total_results=total_results,
        page=page,
        page_size=page_size,
        results=results
    )

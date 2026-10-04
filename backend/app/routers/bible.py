"""
Bible Scripture Router
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas import BooksListResponse, BookMeta, ChapterVersesResponse
from app.services.bible_service import bible_service

router = APIRouter(prefix="/api/bible", tags=["Bible Scripture"])

@router.get("/books", response_model=BooksListResponse, summary="List all Bible books")
def get_books(
    testament: Optional[str] = Query(None, description="Filter by testament: 'OT' or 'NT'")
):
    """
    Returns the complete list of 66 Bible books with chapter counts and testament metadata.
    """
    books = bible_service.get_all_books(testament=testament)
    return BooksListResponse(total_books=len(books), books=books)

@router.get("/books/{book_id}", response_model=BookMeta, summary="Get metadata for a single book")
def get_book_details(book_id: str):
    """
    Returns metadata for a specific book ID (e.g. 'GEN', 'MAT', 'PSA').
    """
    book = bible_service.get_book_meta(book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{book_id}' not found."
        )
    return book

@router.get(
    "/books/{book_id}/chapters/{chapter_number}",
    response_model=ChapterVersesResponse,
    summary="Get all verses for a chapter"
)
def get_chapter(book_id: str, chapter_number: int):
    """
    Returns the verses and book information for a specific chapter number.
    """
    chapter_data = bible_service.get_chapter_verses(book_id, chapter_number)
    if not chapter_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter {chapter_number} of book '{book_id}' not found."
        )
    return chapter_data

"""
Pydantic v2 Schemas for API Request Validation and Response Serialization
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# --- Bible Schemas ---
class BookMeta(BaseModel):
    id: str = Field(..., description="Unique book identifier (e.g. 'genesis', 'matthew')")
    name: str = Field(..., description="Full book name (e.g. 'Genesis', 'Matthew')")
    testament: str = Field(..., description="Testament ('OT' or 'NT')")
    bookNumber: int = Field(..., description="Order of book in the Bible (1-66)")
    chapterCount: int = Field(..., description="Total chapters in this book")

class BooksListResponse(BaseModel):
    total_books: int
    books: List[BookMeta]

class ChapterVersesResponse(BaseModel):
    book: BookMeta
    chapter_number: int
    verse_count: int
    verses: List[str]

class VerseSearchResult(BaseModel):
    book_id: str
    book_name: str
    chapter_number: int
    verse_number: int
    text: str
    citation: str

class SearchResponse(BaseModel):
    query: str
    total_results: int
    page: int
    page_size: int
    results: List[VerseSearchResult]

# --- Notes Schemas ---
class NoteCreateRequest(BaseModel):
    content: str = Field(..., description="Markdown note text")
    tags: Optional[str] = Field(None, description="Comma-separated tags")
    user_id: Optional[str] = Field(None, description="Optional override, defaults to authenticated user")


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[str]
    book_id: str
    chapter_number: int
    content: str
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime

class NotesListResponse(BaseModel):
    total: int
    notes: List[NoteResponse]

# --- Health Schema ---
class HealthResponse(BaseModel):
    status: str
    version: str
    app_name: str
    bible_indexed: bool
    total_verses: int

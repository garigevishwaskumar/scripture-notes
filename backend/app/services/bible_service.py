"""
High-performance In-Memory Bible Service & Scripture Index
"""
import json
import logging
from typing import Optional, List, Dict, Any
from pathlib import Path
from app.config import settings
from app.schemas import BookMeta, ChapterVersesResponse, VerseSearchResult

logger = logging.getLogger(__name__)

class BibleService:
    def __init__(self):
        self._books_meta: List[Dict[str, Any]] = []
        self._books_by_key: Dict[str, Dict[str, Any]] = {}
        self._bible_books: List[Dict[str, Any]] = []
        self._bible_by_key: Dict[str, Dict[str, Any]] = {}
        self._indexed_verses: List[Dict[str, Any]] = []
        self._is_loaded: bool = False

    def load_data(self) -> None:
        """
        Loads scripture and metadata JSON into memory and builds search indexes.
        """
        if self._is_loaded:
            return

        # 1. Load metadata
        if settings.BIBLE_META_PATH.exists():
            with open(settings.BIBLE_META_PATH, "r", encoding="utf-8") as f:
                self._books_meta = json.load(f)
                for b in self._books_meta:
                    book_id = b["id"].lower()
                    book_name = b["name"].lower()
                    self._books_by_key[book_id] = b
                    self._books_by_key[book_name] = b
                    # Also register first 3 chars if >= 3
                    if len(book_id) >= 3:
                        self._books_by_key[book_id[:3]] = b
        else:
            logger.warning(f"Bible metadata not found at {settings.BIBLE_META_PATH}")

        # 2. Load full KJV bible
        if settings.BIBLE_KJV_PATH.exists():
            with open(settings.BIBLE_KJV_PATH, "r", encoding="utf-8") as f:
                self._bible_books = json.load(f)
                
            # Build search index
            self._indexed_verses = []
            for b in self._bible_books:
                b_id = b["id"].lower()
                b_name = b.get("name", b_id)
                testament = b.get("testament", "OT")
                
                self._bible_by_key[b_id] = b
                self._bible_by_key[b_name.lower()] = b
                if len(b_id) >= 3:
                    self._bible_by_key[b_id[:3]] = b
                
                chapters = b.get("chapters", [])
                for ch_idx, chapter_verses in enumerate(chapters):
                    ch_num = ch_idx + 1
                    for v_idx, verse_text in enumerate(chapter_verses):
                        v_num = v_idx + 1
                        self._indexed_verses.append({
                            "book_id": b_id,
                            "book_name": b_name,
                            "testament": testament,
                            "chapter_number": ch_num,
                            "verse_number": v_num,
                            "text": verse_text,
                            "citation": f"{b_name} {ch_num}:{v_num}"
                        })
            
            logger.info(f"Loaded and indexed {len(self._indexed_verses)} Bible verses across {len(self._bible_books)} books.")
            self._is_loaded = True
        else:
            logger.warning(f"Bible text not found at {settings.BIBLE_KJV_PATH}")

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    @property
    def total_verses(self) -> int:
        return len(self._indexed_verses)

    def get_all_books(self, testament: Optional[str] = None) -> List[BookMeta]:
        """
        Returns all Bible books, optionally filtered by testament ('OT' or 'NT').
        """
        results = []
        for b in self._books_meta:
            if testament and b.get("testament", "").upper() != testament.upper():
                continue
            results.append(BookMeta(**b))
        return results

    def get_book_meta(self, book_id: str) -> Optional[BookMeta]:
        """
        Returns metadata for a specific book ID, name, or abbreviation.
        """
        key = book_id.strip().lower()
        b = self._books_by_key.get(key)
        if not b:
            # Fallback search by prefix
            for k, val in self._books_by_key.items():
                if k.startswith(key):
                    b = val
                    break
        return BookMeta(**b) if b else None

    def get_chapter_verses(self, book_id: str, chapter_number: int) -> Optional[ChapterVersesResponse]:
        """
        Retrieves verses for a given book and chapter.
        """
        meta = self.get_book_meta(book_id)
        if not meta:
            return None

        if chapter_number < 1 or chapter_number > meta.chapterCount:
            return None

        key = meta.id.lower()
        book_data = self._bible_by_key.get(key)
        if not book_data or "chapters" not in book_data:
            return None

        chapters = book_data["chapters"]
        if chapter_number - 1 >= len(chapters):
            return None

        verses = chapters[chapter_number - 1]
        return ChapterVersesResponse(
            book=meta,
            chapter_number=chapter_number,
            verse_count=len(verses),
            verses=verses
        )

    def search_verses(
        self,
        query: str,
        testament: Optional[str] = None,
        book_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[int, List[VerseSearchResult]]:
        """
        Fast full-text search across all 31,102 verses.
        """
        if not query or not query.strip():
            return 0, []

        query_lower = query.strip().lower()
        testament_upper = testament.upper() if testament else None
        
        target_meta = self.get_book_meta(book_id) if book_id else None
        target_id = target_meta.id.lower() if target_meta else None

        matches = []
        for v in self._indexed_verses:
            if testament_upper and v["testament"] != testament_upper:
                continue
            if target_id and v["book_id"] != target_id:
                continue
            if query_lower in v["text"].lower() or query_lower in v["citation"].lower():
                matches.append(VerseSearchResult(
                    book_id=v["book_id"],
                    book_name=v["book_name"],
                    chapter_number=v["chapter_number"],
                    verse_number=v["verse_number"],
                    text=v["text"],
                    citation=v["citation"]
                ))

        total_results = len(matches)
        paginated_results = matches[offset : offset + limit]
        return total_results, paginated_results

# Global singleton instance
bible_service = BibleService()

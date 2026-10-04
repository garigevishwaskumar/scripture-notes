"""
Bible Study Notes CRUD & Journal Router
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Note
from app.schemas import NoteResponse, NoteCreateRequest, NotesListResponse
from app.services.bible_service import bible_service

router = APIRouter(prefix="/api/notes", tags=["Study Notes"])

@router.get("", response_model=NotesListResponse, summary="List all study notes")
def list_notes(
    user_id: Optional[str] = Query("guest", description="User ID"),
    book_id: Optional[str] = Query(None, description="Optional book ID filter"),
    db: Session = Depends(get_db)
):
    """
    Returns all notes saved by the user, ordered by most recently updated.
    """
    query = db.query(Note).filter(Note.user_id == user_id)
    if book_id:
        meta = bible_service.get_book_meta(book_id)
        target = meta.id.lower() if meta else book_id.lower()
        query = query.filter(Note.book_id == target)
    
    notes = query.order_by(Note.updated_at.desc()).all()
    return NotesListResponse(total=len(notes), notes=notes)

@router.get("/export/markdown", summary="Export all notes as Markdown study journal")
def export_markdown_journal(
    user_id: Optional[str] = Query("guest", description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Generates a consolidated Markdown file with all reflections, prayers, and study notes.
    """
    notes = db.query(Note).filter(
        Note.user_id == user_id,
        Note.content != ""
    ).order_by(Note.book_id, Note.chapter_number).all()

    lines = ["# 📖 My Scripture Journal & Study Notes\n\n"]
    if not notes:
        lines.append("*No journal entries found yet.*\n")
    else:
        for n in notes:
            meta = bible_service.get_book_meta(n.book_id)
            book_name = meta.name if meta else n.book_id.capitalize()
            lines.append(f"## {book_name} Chapter {n.chapter_number}\n\n")
            if n.tags:
                lines.append(f"**Tags:** `{n.tags}`\n\n")
            lines.append(f"{n.content}\n\n---\n\n")

    markdown_doc = "".join(lines)
    return Response(
        content=markdown_doc,
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=scripture_journal_export.md"}
    )

@router.get("/{book_id}/{chapter_number}", response_model=NoteResponse, summary="Get chapter note")
def get_note(
    book_id: str,
    chapter_number: int,
    user_id: Optional[str] = Query("guest", description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieves note content for a specific Bible book and chapter.
    """
    meta = bible_service.get_book_meta(book_id)
    target_book = meta.id.lower() if meta else book_id.lower()

    note = db.query(Note).filter(
        Note.user_id == user_id,
        Note.book_id == target_book,
        Note.chapter_number == chapter_number
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No note found for {book_id} {chapter_number}"
        )
    return note

@router.post("/{book_id}/{chapter_number}", response_model=NoteResponse, summary="Save or update chapter note")
def save_or_update_note(
    book_id: str,
    chapter_number: int,
    payload: NoteCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Upserts a chapter note for the specified user and passage.
    """
    meta = bible_service.get_book_meta(book_id)
    target_book = meta.id.lower() if meta else book_id.lower()
    user_id = payload.user_id or "guest"

    note = db.query(Note).filter(
        Note.user_id == user_id,
        Note.book_id == target_book,
        Note.chapter_number == chapter_number
    ).first()

    if note:
        note.content = payload.content
        note.tags = payload.tags
    else:
        note = Note(
            user_id=user_id,
            book_id=target_book,
            chapter_number=chapter_number,
            content=payload.content,
            tags=payload.tags
        )
        db.add(note)

    db.commit()
    db.refresh(note)
    return note

@router.delete("/{book_id}/{chapter_number}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete chapter note")
def delete_note(
    book_id: str,
    chapter_number: int,
    user_id: Optional[str] = Query("guest", description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Deletes the study note for the specified chapter.
    """
    meta = bible_service.get_book_meta(book_id)
    target_book = meta.id.lower() if meta else book_id.lower()

    note = db.query(Note).filter(
        Note.user_id == user_id,
        Note.book_id == target_book,
        Note.chapter_number == chapter_number
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

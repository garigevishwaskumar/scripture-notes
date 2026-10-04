"""
SQLAlchemy ORM Models
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, UniqueConstraint
from app.database import Base

class Note(Base):
    """
    Bible Chapter Study Note
    """
    __tablename__ = "bible_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(128), index=True, nullable=True, default="guest")
    book_id = Column(String(32), index=True, nullable=False)
    chapter_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False, default="")
    tags = Column(String(256), nullable=True)  # Comma-separated tags (e.g. prayer, promise, sermon)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'book_id', 'chapter_number', name='uix_user_book_chapter'),
    )

    def __repr__(self) -> str:
        return f"<Note book={self.book_id} chapter={self.chapter_number} user={self.user_id}>"

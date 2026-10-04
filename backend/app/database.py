"""
Database connection and session handling using SQLAlchemy (Enterprise Standards)
"""
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.config import settings

db_url = settings.normalized_database_url

# Configure connection arguments and connection pool
if db_url == "sqlite:///:memory:":
    # Preserves in-memory schema across FastAPI thread worker connections
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG
    )
elif db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    # PostgreSQL / Supabase enterprise pool configuration
    engine = create_engine(
        db_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,      # Checks liveness of connection before borrowing
        pool_recycle=300,        # Prevents stale broken connections
        echo=settings.DEBUG
    )


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session and safely closes it upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """
    Initializes database tables according to declared SQLAlchemy models.
    """
    Base.metadata.create_all(bind=engine)


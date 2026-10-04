"""
Application Configuration - Enterprise Standards
"""
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from backend/.env if present
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()

DATA_DIR = BASE_DIR / "data"
logger = logging.getLogger("scripture_notes_api.config")

class Settings(BaseModel):
    APP_NAME: str = "ScriptureNotes API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database (Supabase PostgreSQL / Cloud DB)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Supabase Auth Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://wsmvrxnmyfrggkunihro.supabase.co")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://biblenotetaker.vercel.app",
        "*"
    ]
    
    # Data paths
    BIBLE_KJV_PATH: Path = DATA_DIR / "bible-kjv.json"
    BIBLE_META_PATH: Path = DATA_DIR / "bible-meta.json"

    @property
    def normalized_database_url(self) -> str:
        """
        Normalizes postgres:// scheme to postgresql+psycopg2:// for SQLAlchemy 2.0.
        Enterprise safety: If no URL is provided, falls back only to an isolated in-memory DB
        and alerts the operator.
        """
        raw_url = self.DATABASE_URL.strip()
        if not raw_url or "[YOUR_DATABASE_PASSWORD]" in raw_url or "YOUR_PASSWORD" in raw_url:
            logger.warning(
                "⚠️ [CONFIG WARNING] DATABASE_URL is not configured with your actual database password. "
                "Defaulting to in-memory SQLite (sqlite:///:memory:) so the API service boots cleanly. "
                "To connect to Supabase PostgreSQL, replace [YOUR_DATABASE_PASSWORD] in backend/.env with your real password."
            )
            return "sqlite:///:memory:"
        
        if raw_url.startswith("postgres://"):
            return raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
        if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
            return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return raw_url

settings = Settings()


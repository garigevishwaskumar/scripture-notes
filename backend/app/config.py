"""
Application Configuration
"""
import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

class Settings(BaseModel):
    APP_NAME: str = "ScriptureNotes API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR.parent}/scripture_notes.db")
    
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

settings = Settings()

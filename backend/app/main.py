"""
Main FastAPI Application Entrypoint
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.services.bible_service import bible_service
from app.routers import health, bible, search, notes

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("scripture_notes_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events: Runs startup logic (DB migrations, loading scripture index)
    and graceful shutdown.
    """
    logger.info("Initializing ScriptureNotes Backend Services...")
    # Initialize SQLite tables
    init_db()
    # Pre-load Bible and build search index in memory
    bible_service.load_data()
    logger.info("ScriptureNotes API ready for requests.")
    yield
    logger.info("Shutting down ScriptureNotes Backend Services...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Enterprise-grade Bible Study & Scripture Journal Backend API.\n\n"
        "Features:\n"
        "- 📖 Instant access to 66 Books and 31,102 verses\n"
        "- ⚡ Sub-millisecond full-text scripture search\n"
        "- 📝 Chapter note journaling, tagging, and persistence\n"
        "- 📥 Consolidated Markdown study journal export"
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(bible.router)
app.include_router(search.router)
app.include_router(notes.router)

@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "Welcome to ScriptureNotes API",
        "docs": "/docs",
        "health": "/healthz",
        "version": settings.APP_VERSION
    }

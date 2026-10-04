# ScriptureNotes - Python FastAPI Backend Service

Production-grade, asynchronous REST API for Bible study, full-text scripture search, chapter reflections, and journaling notes.

---

## 🏗️ Architecture Overview

* **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with asynchronous request processing
* **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/latest/) with strict schema typing
* **Database ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) with SQLite / PostgreSQL support
* **In-Memory Scripture Engine**: Pre-indexed Bible dataset with 66 books and 31,102 verses
* **Interactive Docs**: Swagger UI (`/docs`) and ReDoc (`/redoc`)
* **Test Suite**: Automated test suite with `pytest` and `TestClient`

```
backend/
├── app/
│   ├── config.py           # Environment and app configuration
│   ├── database.py         # SQLAlchemy engine and session dependency
│   ├── models.py           # Database entities (Notes, etc.)
│   ├── schemas.py          # Pydantic v2 request/response schemas
│   ├── main.py             # FastAPI factory, lifespan, CORS, and routers
│   ├── routers/
│   │   ├── bible.py        # /api/bible/books and /api/bible/books/{id}/chapters/{num}
│   │   ├── search.py       # /api/bible/search (full-text search)
│   │   ├── notes.py        # /api/notes (CRUD & Markdown export)
│   │   └── health.py       # /healthz and /api/health
│   ├── services/
│   │   └── bible_service.py # In-memory indexed scripture engine
│   └── data/
│       ├── bible-kjv.json  # Complete KJV Bible dataset
│       └── bible-meta.json # Book metadata and chapter counts
├── tests/
│   └── test_api.py         # Automated test cases
├── requirements.txt        # Python package dependencies
├── run.py                  # Server runner script
└── README.md
```

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Run the Server
```bash
python run.py
```
Or with Uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

* **API Server**: `http://localhost:8000`
* **Swagger UI (Interactive API Docs)**: `http://localhost:8000/docs`
* **ReDoc Documentation**: `http://localhost:8000/redoc`
* **Health Check**: `http://localhost:8000/healthz`

---

## 🧪 Run Automated Tests

```bash
python -m pytest tests/test_api.py -v
```

All 6 test cases verify:
1. Health and index integrity
2. Complete listing of all 66 books
3. Book metadata retrieval
4. Verse retrieval (supporting both full names and standard 3-letter abbreviations)
5. Full-text scripture search
6. Full CRUD lifecycle of user notes and Markdown journal export

---

## 📡 Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/healthz` | System health and indexed verse count |
| `GET` | `/api/bible/books` | List all 66 Bible books with metadata |
| `GET` | `/api/bible/books/{id}` | Get book details (e.g. `genesis` or `GEN`) |
| `GET` | `/api/bible/books/{id}/chapters/{number}` | Get chapter verses (e.g. `/api/bible/books/GEN/chapters/1`) |
| `GET` | `/api/bible/search?q={query}` | Search across all 31,102 verses |
| `GET` | `/api/notes` | List saved notes for a user |
| `GET` | `/api/notes/{book_id}/{chapter}` | Get chapter study note |
| `POST` | `/api/notes/{book_id}/{chapter}` | Upsert chapter study note |
| `DELETE` | `/api/notes/{book_id}/{chapter}` | Delete chapter study note |
| `GET` | `/api/notes/export/markdown` | Download all notes as consolidated Markdown |

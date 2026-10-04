# ScriptureNotes 📖✍️

> Enterprise-grade Bible Study & Scripture Journal application with decoupled **Next.js Frontend** and **Python FastAPI Backend**.

![ScriptureNotes Architecture](frontend/public/icons/icon.svg)

---

## 🏛️ System Architecture

The project has been separated into clean, modular tiers:

```
Bible-Notes/
├── frontend/                     # Next.js 16 (App Router, Turbopack, TypeScript, Tailwind v4)
│   ├── src/
│   │   ├── app/                  # Route handlers, layout, SEO sitemaps
│   │   ├── components/           # BibleViewer, NoteEditor, Navbar, BookChapterModal
│   │   ├── context/              # Auth & session context
│   │   └── lib/                  # Scripture loader & backend API client
│   ├── public/                   # Static assets, PWA manifest, service icons
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── backend/                      # Python 3.11+ FastAPI Asynchronous REST Service
│   ├── app/
│   │   ├── main.py               # FastAPI application factory, lifespan, CORS
│   │   ├── config.py             # Environment configuration (Pydantic)
│   │   ├── database.py           # SQLAlchemy ORM database engine (SQLite/PostgreSQL)
│   │   ├── models.py             # Database entities (Notes, etc.)
│   │   ├── schemas.py            # Pydantic v2 schemas for request validation
│   │   ├── routers/
│   │   │   ├── bible.py          # /api/bible/books and /api/bible/books/{id}/chapters/{num}
│   │   │   ├── search.py         # /api/bible/search (sub-millisecond full-text search)
│   │   │   ├── notes.py          # /api/notes (CRUD & consolidated Markdown export)
│   │   │   └── health.py         # /healthz and /api/health
│   │   ├── services/
│   │   │   └── bible_service.py  # In-memory indexed scripture engine (31,102 verses)
│   │   └── data/                 # Scripture & book metadata datasets
│   ├── tests/
│   │   └── test_api.py           # Automated test suite (pytest)
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Direct server runner
│   └── README.md
│
├── vercel.json                   # Vercel deployment configuration
├── package.json                  # Monorepo root workspace orchestrator
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **Python**: 3.10+ (Python 3.11 recommended)

---

### Option A: Running from Root (Monorepo Orchestrator)

1. **Install Frontend Dependencies**:
   ```bash
   npm --prefix frontend install
   ```

2. **Install Backend Dependencies**:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```

3. **Start Frontend**:
   ```bash
   npm run dev:frontend
   ```
   *Frontend running at: `http://localhost:3000`*

4. **Start Backend**:
   ```bash
   npm run dev:backend
   ```
   *Backend API running at: `http://localhost:8000`*  
   *Interactive Swagger UI at: `http://localhost:8000/docs`*

---

### Option B: Running Services Independently

#### 1. Backend Service (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
* Interactive Swagger Docs: `http://localhost:8000/docs`
* ReDoc API Docs: `http://localhost:8000/redoc`
* Health Check: `http://localhost:8000/healthz`

Run backend automated tests:
```bash
python -m pytest backend/tests/test_api.py -v
```

#### 2. Frontend Web App (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📡 API Reference Overview

| Route | Method | Description |
|---|---|---|
| `/healthz` | `GET` | Health check & verse index stats |
| `/api/bible/books` | `GET` | All 66 Bible books with chapter counts and testament |
| `/api/bible/books/{id}` | `GET` | Book details (e.g. `genesis`, `GEN`) |
| `/api/bible/books/{id}/chapters/{num}` | `GET` | Chapter verses with metadata |
| `/api/bible/search?q={query}` | `GET` | Full-text search across all 31,102 verses |
| `/api/notes` | `GET` | User reflections and study notes |
| `/api/notes/{book_id}/{chapter}` | `GET` | Chapter reflection note |
| `/api/notes/{book_id}/{chapter}` | `POST` | Upsert chapter reflection note |
| `/api/notes/{book_id}/{chapter}` | `DELETE` | Delete chapter reflection note |
| `/api/notes/export/markdown` | `GET` | Download all notes as consolidated Markdown file |

---

## 🌟 Key Engineering Highlights

1. **Clean Separation of Concerns**: Strict decoupling of presentation layer (`frontend/`) and business/persistence layer (`backend/`).
2. **FastAPI Asynchronous Architecture**: Non-blocking I/O with Pydantic v2 validation.
3. **Sub-millisecond Search**: In-memory indexed search engine over 31,102 verses with instant filtering.
4. **Resilient Fallback**: Frontend can consume the FastAPI backend or operate standalone with local caching.
5. **Automated Testing**: 100% passing `pytest` test suite covering health, scripture retrieval, search, and the full notes CRUD lifecycle.

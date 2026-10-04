# ScriptureNotes 📖✍️

> Enterprise-grade Bible Study & Scripture Journal application with decoupled **Next.js Frontend** and **Python FastAPI Backend**.

---

## 🏛️ System Architecture

```
Bible-Notes/
├── frontend/                     # Next.js 16 UI (App Router, Turbopack, TypeScript, Tailwind v4)
│   ├── src/
│   │   ├── app/                  # Route handlers, layout, SEO metadata & sitemaps
│   │   ├── components/           # BibleViewer, NoteEditor, Navbar, BookChapterModal
│   │   ├── context/              # Auth & session context
│   │   └── lib/                  # Scripture loader & backend API client
│   ├── public/                   # Static assets, PWA manifest, service icons
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   └── next.config.ts
│
├── backend/                      # Python 3.11+ FastAPI REST Service
│   ├── app/
│   │   ├── main.py               # FastAPI application factory, lifespan, CORS
│   │   ├── config.py             # App & environment configuration (Pydantic)
│   │   ├── database.py           # SQLAlchemy ORM database engine (SQLite/PostgreSQL)
│   │   ├── models.py             # Database entities (Notes, etc.)
│   │   ├── schemas.py            # Pydantic v2 schemas for request validation
│   │   ├── routers/
│   │   │   ├── bible.py          # /api/bible/books & /api/bible/books/{id}/chapters/{num}
│   │   │   ├── search.py         # /api/bible/search (sub-millisecond full-text search)
│   │   │   ├── notes.py          # /api/notes (CRUD & consolidated Markdown export)
│   │   └── services/
│   │       └── bible_service.py  # In-memory indexed scripture engine (31,102 verses)
│   │   └── data/                 # Scripture & book metadata datasets
│   ├── requirements.txt          # Python runtime dependencies
│   ├── run.py                    # Server runner
│   └── README.md
│
├── package.json                  # Root monorepo workspace orchestrator
└── README.md                     # Monorepo architecture & setup guide
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **Python**: 3.10+ (Python 3.11 recommended)

---

### Running from Root

1. **Install Frontend Dependencies**:
   ```bash
   npm --prefix frontend install
   ```

2. **Install Backend Dependencies**:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```

3. **Start Frontend Web App**:
   ```bash
   npm run dev:frontend
   ```
   *Frontend UI running at: `http://localhost:3000`*

4. **Start Backend Service**:
   ```bash
   npm run dev:backend
   ```
   *Backend API running at: `http://localhost:8000`*  
   *Interactive Swagger Docs at: `http://localhost:8000/docs`*

---

## 📡 API Reference

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

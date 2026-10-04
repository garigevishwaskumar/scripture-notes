# ScriptureNotes 📖✍️

> A high-performance Bible note-taking Progressive Web App (PWA) where every user has private, persistent notes synchronized to specific chapters.

![ScriptureNotes Banner](/icons/icon.svg)

---

## ⚡ Tech Stack & Architecture

- **Framework**: [Next.js 14+ / 16](https://nextjs.org/) (App Router, Turbopack, TypeScript).
- **Styling**: Tailwind CSS (Dark Mode default, Bible study typography, responsive split-screen reader).
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security + Supabase Auth with Google OAuth & Magic Link).
- **State Management & Persistence**: React Hooks + 1000ms Debounced sync with immediate local fail-safe storage.
- **Bible Data**: King James Version (KJV) local JSON with 66 books, cached in-memory for **0ms latency** chapter switching.
- **PWA Ready**: Manifest v2, mobile-optimized viewport (prevents iOS/Android input zoom), offline local storage backup.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*(Note: If you run without Supabase credentials, the app will automatically run in local guest mode, saving all your notes securely to browser localStorage).*

### 3. Setup Supabase Database
In your Supabase project dashboard, navigate to the **SQL Editor** and run the following script (also available in `supabase/schema.sql`):

```sql
-- 1. Create bible_notes table
CREATE TABLE IF NOT EXISTS bible_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id TEXT NOT NULL,
  chapter_number INT NOT NULL,
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id, chapter_number)
);

-- 2. Security: Row Level Security (RLS)
ALTER TABLE bible_notes ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can only access their own notes
CREATE POLICY "Users can only access their own notes" 
ON bible_notes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_bible_notes_user_book_chapter 
ON bible_notes (user_id, book_id, chapter_number);
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌟 Key Features

1. **Dual-Pane Desktop & Responsive Mobile Layout**:
   - Left side: Full KJV Scripture reader with custom font sizing (`sm`, `md`, `lg`, `xl`).
   - Right side: Markdown-compatible note editor with quick formatting toolbar.
   - Mobile: Fast one-tap toggle between Scripture and Notes view.

2. **Zero-Latency Navigation**:
   - Quick-jump modal with instant search across all 66 books, Old & New Testament filters, and chapter grid.
   - Previous / Next navigation buttons with keyboard arrows (`←` / `→`).
   - Dynamic deep-linking URLs: `/bible/[book]/[chapter]` (e.g., `/bible/john/3` or `/bible/psalms/23`).

3. **1-Click Scripture Quoting**:
   - Tap or hover any verse and click **"Quote in Notes"** to instantly paste a formatted citation directly into your current notes.

4. **1000ms Debounced Persistence**:
   - Typing auto-saves with a 1000ms debounce to Supabase PostgreSQL.
   - Immediate localStorage mirror protects against abrupt tab closing.

5. **Personal Notes Index**:
   - Open **"My Notes"** to see all chapters where you have recorded notes, with previews and quick-jump navigation.

6. **PWA Mobile-Optimized**:
   - Prevent mobile zoom on input focus.
   - Standalone home screen launch support on iOS & Android.

---

## 🚢 Deployment to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initialize ScriptureNotes PWA"
   git remote add origin https://github.com/<your-username>/scripture-notes.git
   git push -u origin main
   ```
2. **Deploy on Vercel**:
   - Import your GitHub repository into [Vercel](https://vercel.com).
   - In Environment Variables, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click **Deploy**.
3. **Whitelist Vercel URL in Supabase**:
   - In Supabase Dashboard -> **Authentication** -> **URL Configuration**.
   - Add your Vercel deployment URL (e.g. `https://scripture-notes.vercel.app/**`) to **Redirect URLs**.

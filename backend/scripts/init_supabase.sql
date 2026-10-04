-- =========================================================================
-- ScriptureNotes - Supabase PostgreSQL Schema & Security Policies
-- Enterprise Standards: Explicit schema, indexes, RLS, and automated updated_at
-- =========================================================================

-- 1. Create table for Bible Chapter Notes
CREATE TABLE IF NOT EXISTS public.bible_notes (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    book_id VARCHAR(32) NOT NULL,
    chapter_number INTEGER NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    tags VARCHAR(256),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uix_user_book_chapter UNIQUE (user_id, book_id, chapter_number)
);

-- 2. Performance indexes for sub-millisecond retrieval
CREATE INDEX IF NOT EXISTS idx_bible_notes_user_book 
    ON public.bible_notes (user_id, book_id);

CREATE INDEX IF NOT EXISTS idx_bible_notes_user_updated 
    ON public.bible_notes (user_id, updated_at DESC);

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bible_notes_updated_at ON public.bible_notes;
CREATE TRIGGER trg_bible_notes_updated_at
    BEFORE UPDATE ON public.bible_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.bible_notes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Allows authenticated users full access to their own rows)
DROP POLICY IF EXISTS "Users can read own notes" ON public.bible_notes;
CREATE POLICY "Users can read own notes" 
    ON public.bible_notes 
    FOR SELECT 
    USING (auth.uid()::text = user_id OR user_id = 'guest');

DROP POLICY IF EXISTS "Users can insert own notes" ON public.bible_notes;
CREATE POLICY "Users can insert own notes" 
    ON public.bible_notes 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest');

DROP POLICY IF EXISTS "Users can update own notes" ON public.bible_notes;
CREATE POLICY "Users can update own notes" 
    ON public.bible_notes 
    FOR UPDATE 
    USING (auth.uid()::text = user_id OR user_id = 'guest')
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'guest');

DROP POLICY IF EXISTS "Users can delete own notes" ON public.bible_notes;
CREATE POLICY "Users can delete own notes" 
    ON public.bible_notes 
    FOR DELETE 
    USING (auth.uid()::text = user_id OR user_id = 'guest');

-- Grant permissions to standard Supabase roles
GRANT ALL ON TABLE public.bible_notes TO authenticated;
GRANT ALL ON TABLE public.bible_notes TO service_role;
GRANT ALL ON TABLE public.bible_notes TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, anon;

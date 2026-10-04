-- ==========================================
-- ScriptureNotes Supabase PostgreSQL Schema
-- ==========================================

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

-- Optional index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bible_notes_user_book_chapter 
ON bible_notes (user_id, book_id, chapter_number);

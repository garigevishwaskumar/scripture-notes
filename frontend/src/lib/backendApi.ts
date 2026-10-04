/**
 * Client for Python FastAPI Backend Service
 */

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BackendHealth {
  status: string;
  version: string;
  app_name: string;
  bible_indexed: boolean;
  total_verses: number;
}

export interface BackendVerseResult {
  book_id: string;
  book_name: string;
  chapter_number: number;
  verse_number: number;
  text: string;
  citation: string;
}

export interface BackendSearchResponse {
  query: string;
  total_results: number;
  page: number;
  page_size: number;
  results: BackendVerseResult[];
}

/**
 * Checks if the Python FastAPI backend is online and healthy.
 */
export async function checkBackendHealth(): Promise<BackendHealth | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/healthz`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Full-text search via FastAPI backend.
 */
export async function searchScriptureBackend(
  query: string,
  page: number = 1,
  pageSize: number = 25
): Promise<BackendSearchResponse | null> {
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    const res = await fetch(`${BACKEND_BASE_URL}/api/bible/search?${params}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Save note to Python FastAPI backend SQLite database.
 */
export async function saveNoteBackend(
  bookId: string,
  chapterNumber: number,
  content: string,
  tags?: string,
  userId: string = 'guest'
): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/notes/${bookId}/${chapterNumber}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tags, user_id: userId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch chapter note from Python FastAPI backend.
 */
export async function fetchNoteBackend(
  bookId: string,
  chapterNumber: number,
  userId: string = 'guest'
): Promise<string | null> {
  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/api/notes/${bookId}/${chapterNumber}?user_id=${encodeURIComponent(userId)}`,
      { method: 'GET', headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.content || '';
  } catch {
    return null;
  }
}

/**
 * Enterprise Client for Python FastAPI Backend Service
 * Centralized REST API client for Scripture search, chapters, and Notes persistence.
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

export interface BackendNoteRecord {
  id: number;
  user_id?: string;
  book_id: string;
  chapter_number: number;
  content: string;
  tags?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendNotesListResponse {
  total: number;
  notes: BackendNoteRecord[];
}

/**
 * Builds request headers including Bearer JWT token when provided.
 */
function buildHeaders(token?: string | null, additionalHeaders: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...additionalHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Checks if the Python FastAPI backend is online and healthy.
 */
export async function checkBackendHealth(): Promise<BackendHealth | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/healthz`, {
      method: 'GET',
      headers: buildHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Full-text search across all 31,102 verses via FastAPI backend.
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
      headers: buildHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch chapter note from FastAPI backend.
 * Enforces authenticated Bearer token with optional guest fallback.
 */
export async function fetchNoteBackend(
  bookId: string,
  chapterNumber: number,
  token?: string | null,
  userId?: string
): Promise<BackendNoteRecord | null> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(
      `${BACKEND_BASE_URL}/api/notes/${encodeURIComponent(bookId)}/${chapterNumber}${qs}`,
      {
        method: 'GET',
        headers: buildHeaders(token),
        cache: 'no-store',
      }
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`Backend fetch note failed with status: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching note from backend API:', err);
    return null;
  }
}

/**
 * Upsert note to FastAPI backend (persisted into Supabase PostgreSQL).
 */
export async function saveNoteBackend(
  bookId: string,
  chapterNumber: number,
  content: string,
  tags?: string,
  token?: string | null,
  userId?: string
): Promise<{ success: boolean; data?: BackendNoteRecord; error?: string }> {
  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}/api/notes/${encodeURIComponent(bookId)}/${chapterNumber}`,
      {
        method: 'POST',
        headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ content, tags, user_id: userId }),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: errText || `Failed with status ${res.status}` };
    }
    const data: BackendNoteRecord = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Network error saving note' };
  }
}

/**
 * Fetch all notes for the authenticated user from FastAPI backend.
 */
export async function fetchAllNotesBackend(
  token?: string | null,
  bookId?: string,
  userId?: string
): Promise<BackendNoteRecord[]> {
  try {
    const params = new URLSearchParams();
    if (bookId) params.set('book_id', bookId);
    if (userId) params.set('user_id', userId);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BACKEND_BASE_URL}/api/notes${qs}`, {
      method: 'GET',
      headers: buildHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data: BackendNotesListResponse = await res.json();
    return data.notes || [];
  } catch (err) {
    console.error('Error fetching all notes from backend:', err);
    return [];
  }
}

/**
 * Delete a chapter note via FastAPI backend.
 */
export async function deleteNoteBackend(
  bookId: string,
  chapterNumber: number,
  token?: string | null,
  userId?: string
): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(
      `${BACKEND_BASE_URL}/api/notes/${encodeURIComponent(bookId)}/${chapterNumber}${qs}`,
      {
        method: 'DELETE',
        headers: buildHeaders(token),
      }
    );
    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}

/**
 * Export consolidated Markdown journal from FastAPI backend.
 */
export async function exportJournalMarkdownBackend(
  token?: string | null,
  userId?: string
): Promise<string | null> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BACKEND_BASE_URL}/api/notes/export/markdown${qs}`, {
      method: 'GET',
      headers: buildHeaders(token, { 'Accept': 'text/markdown' }),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

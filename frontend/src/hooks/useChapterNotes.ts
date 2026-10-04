'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { useAuth } from '@/context/AuthContext';
import { fetchNoteBackend, saveNoteBackend } from '@/lib/backendApi';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'local';

export function useChapterNotes(bookId: string, chapterNumber: number) {
  const { user, session } = useAuth();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep refs for debounced handler to always access latest values
  const userRef = useRef(user);
  const sessionRef = useRef(session);
  const bookIdRef = useRef(bookId);
  const chapterNumberRef = useRef(chapterNumber);

  useEffect(() => {
    userRef.current = user;
    sessionRef.current = session;
    bookIdRef.current = bookId;
    chapterNumberRef.current = chapterNumber;
  }, [user, session, bookId, chapterNumber]);

  const getStorageKey = (bId: string, chNum: number, uId?: string) => {
    return uId ? `scripture_note_${uId}_${bId}_${chNum}` : `scripture_note_guest_${bId}_${chNum}`;
  };

  // Persist note via authoritative FastAPI backend
  const persistNoteToBackend = async (
    targetContent: string,
    targetBookId: string,
    targetChapter: number,
    currentUser: typeof user,
    currentSession: typeof session
  ) => {
    setSyncStatus('saving');
    setErrorMessage(null);

    const token = currentSession?.access_token || null;
    const userId = currentUser?.id || 'guest';

    // Immediate local cache for zero-latency resilience
    if (typeof window !== 'undefined') {
      const localKey = getStorageKey(targetBookId, targetChapter, currentUser?.id);
      localStorage.setItem(localKey, targetContent);
    }

    const result = await saveNoteBackend(
      targetBookId,
      targetChapter,
      targetContent,
      undefined,
      token,
      userId
    );

    if (result.success) {
      setSyncStatus('saved');
      setLastSavedAt(result.data?.updated_at ? new Date(result.data.updated_at) : new Date());
      setErrorMessage(null);
    } else {
      console.warn('Backend save failed:', result.error);
      // If server is unreachable or offline, status is local cache
      setSyncStatus('local');
      setErrorMessage(result.error || 'Saved locally (backend sync pending)');
    }
  };

  // Debounced 1000ms auto-saver
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedSaveRef.current = debounce((
      textToSave: string,
      bId: string,
      chNum: number,
      u: typeof user,
      s: typeof session
    ) => {
      persistNoteToBackend(textToSave, bId, chNum, u, s);
    }, 1000);

    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, []);

  // Fetch note from FastAPI backend whenever book, chapter, or session changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setSyncStatus('idle');
    setErrorMessage(null);

    if (debouncedSaveRef.current) {
      debouncedSaveRef.current.cancel();
    }

    // 1. Instant local preview from cache
    let cachedContent = '';
    if (typeof window !== 'undefined') {
      const localKey = getStorageKey(bookId, chapterNumber, user?.id);
      cachedContent = localStorage.getItem(localKey) || '';
      if (!cachedContent && !user) {
        cachedContent = localStorage.getItem(getStorageKey(bookId, chapterNumber)) || '';
      }
    }
    setContent(cachedContent);

    // 2. Fetch authoritative copy from FastAPI backend
    (async () => {
      const token = session?.access_token || null;
      const userId = user?.id || 'guest';

      const record = await fetchNoteBackend(bookId, chapterNumber, token, userId);
      if (isCancelled) return;

      if (record) {
        setContent(record.content || '');
        setLastSavedAt(record.updated_at ? new Date(record.updated_at) : null);
        setSyncStatus('saved');
        if (typeof window !== 'undefined') {
          localStorage.setItem(getStorageKey(bookId, chapterNumber, user?.id), record.content || '');
        }
      } else {
        // No remote note found, use local cache
        setSyncStatus(cachedContent ? 'local' : 'idle');
      }
      setLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, [bookId, chapterNumber, user, session]);

  // Handler for text input
  const handleContentChange = useCallback((newText: string) => {
    setContent(newText);
    setSyncStatus('saving');

    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey(bookIdRef.current, chapterNumberRef.current, userRef.current?.id);
      localStorage.setItem(storageKey, newText);
    }

    if (debouncedSaveRef.current) {
      debouncedSaveRef.current(
        newText,
        bookIdRef.current,
        chapterNumberRef.current,
        userRef.current,
        sessionRef.current
      );
    }
  }, []);

  // Immediate save flush
  const forceSave = useCallback(async () => {
    if (debouncedSaveRef.current) {
      debouncedSaveRef.current.cancel();
    }
    await persistNoteToBackend(
      content,
      bookIdRef.current,
      chapterNumberRef.current,
      userRef.current,
      sessionRef.current
    );
  }, [content]);

  return {
    content,
    loading,
    syncStatus,
    lastSavedAt,
    errorMessage,
    updateContent: handleContentChange,
    forceSave,
  };
}

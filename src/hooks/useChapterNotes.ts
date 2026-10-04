'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'local';

export function useChapterNotes(bookId: string, chapterNumber: number) {
  const { user } = useAuth();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep refs for debounced handler to always access latest values without recreating
  const userRef = useRef(user);
  const bookIdRef = useRef(bookId);
  const chapterNumberRef = useRef(chapterNumber);

  useEffect(() => {
    userRef.current = user;
    bookIdRef.current = bookId;
    chapterNumberRef.current = chapterNumber;
  }, [user, bookId, chapterNumber]);

  const getStorageKey = (bId: string, chNum: number, uId?: string) => {
    return uId ? `scripture_note_${uId}_${bId}_${chNum}` : `scripture_note_guest_${bId}_${chNum}`;
  };

  // Perform database upsert
  const persistNoteToDatabase = async (
    targetContent: string,
    targetBookId: string,
    targetChapter: number,
    currentUser: typeof user
  ) => {
    if (!currentUser || !isSupabaseConfigured) {
      // Saved locally
      if (typeof window !== 'undefined') {
        const localKey = getStorageKey(targetBookId, targetChapter);
        localStorage.setItem(localKey, targetContent);
      }
      setSyncStatus('local');
      setLastSavedAt(new Date());
      return;
    }

    try {
      setSyncStatus('saving');
      const { error } = await supabase
        .from('bible_notes')
        .upsert(
          {
            user_id: currentUser.id,
            book_id: targetBookId,
            chapter_number: targetChapter,
            content: targetContent,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,book_id,chapter_number',
          }
        );

      if (error) {
        console.error('Supabase upsert error:', error);
        setErrorMessage(error.message);
        setSyncStatus('error');
      } else {
        setSyncStatus('saved');
        setErrorMessage(null);
        setLastSavedAt(new Date());

        // Also cache locally for this user
        if (typeof window !== 'undefined') {
          const userKey = getStorageKey(targetBookId, targetChapter, currentUser.id);
          localStorage.setItem(userKey, targetContent);
        }
      }
    } catch (err: unknown) {
      console.error('Unexpected error persisting note:', err);
      setErrorMessage((err as Error).message || 'Failed to save note');
      setSyncStatus('error');
    }
  };

  // Debounced 1000ms saver using lodash debounce as required by blueprint
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedSaveRef.current = debounce((
      textToSave: string,
      bId: string,
      chNum: number,
      u: typeof user
    ) => {
      persistNoteToDatabase(textToSave, bId, chNum, u);
    }, 1000);

    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, []);

  // Fetch note whenever bookId, chapterNumber, or user changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setSyncStatus('idle');
    setErrorMessage(null);

    // Cancel any pending debounced save from previous chapter
    if (debouncedSaveRef.current) {
      debouncedSaveRef.current.cancel();
    }

    // 1. First check local storage for instant zero-latency preview
    let cachedInitialContent = '';
    if (typeof window !== 'undefined') {
      const localKey = getStorageKey(bookId, chapterNumber, user?.id);
      cachedInitialContent = localStorage.getItem(localKey) || '';
      if (!cachedInitialContent && !user) {
        const guestKey = getStorageKey(bookId, chapterNumber);
        cachedInitialContent = localStorage.getItem(guestKey) || '';
      }
    }

    setContent(cachedInitialContent);

    // 2. If logged in and Supabase is configured, fetch authoritative copy
    if (user && isSupabaseConfigured) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from('bible_notes')
            .select('content, updated_at')
            .eq('user_id', user.id)
            .eq('book_id', bookId)
            .eq('chapter_number', chapterNumber)
            .maybeSingle();

          if (isCancelled) return;

          if (error) {
            console.warn('Error fetching note from Supabase:', error);
            // Fall back to local cache if present
            setSyncStatus(cachedInitialContent ? 'local' : 'idle');
          } else if (data) {
            setContent(data.content || '');
            setLastSavedAt(data.updated_at ? new Date(data.updated_at) : null);
            setSyncStatus('saved');
            if (typeof window !== 'undefined') {
              localStorage.setItem(getStorageKey(bookId, chapterNumber, user.id), data.content || '');
            }
          } else {
            // No record exists in database yet
            setContent(cachedInitialContent || '');
            setSyncStatus(cachedInitialContent ? 'local' : 'idle');
          }
        } catch (err) {
          console.error('Fetch note error:', err);
          if (!isCancelled) {
            setSyncStatus(cachedInitialContent ? 'local' : 'idle');
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      })();
    } else {
      // Guest mode
      setLoading(false);
      setSyncStatus(cachedInitialContent ? 'local' : 'idle');
    }

    return () => {
      isCancelled = true;
    };
  }, [bookId, chapterNumber, user]);

  // Handler invoked when the user types
  const handleContentChange = useCallback((newText: string) => {
    setContent(newText);
    setSyncStatus('saving');

    // Immediate local storage backup
    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey(bookIdRef.current, chapterNumberRef.current, userRef.current?.id);
      localStorage.setItem(storageKey, newText);
    }

    // Trigger debounced 1000ms database upsert
    if (debouncedSaveRef.current) {
      debouncedSaveRef.current(newText, bookIdRef.current, chapterNumberRef.current, userRef.current);
    }
  }, []);

  // Force immediate save (flushes debounce)
  const forceSave = useCallback(async () => {
    if (debouncedSaveRef.current) {
      debouncedSaveRef.current.cancel();
    }
    await persistNoteToDatabase(content, bookIdRef.current, chapterNumberRef.current, userRef.current);
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

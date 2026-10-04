'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getBookMeta } from '@/lib/bible';
import { X, BookOpen, Clock, ChevronRight, FileText, Sparkles, RefreshCw } from 'lucide-react';

interface NoteSummary {
  book_id: string;
  chapter_number: number;
  content: string;
  updated_at?: string;
}

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (bookId: string, chapter: number) => void;
}

export function NotesDrawer({
  isOpen,
  onClose,
  onSelectChapter,
}: NotesDrawerProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAllNotes = async () => {
    setLoading(true);
    const loadedNotes: NoteSummary[] = [];

    // 1. If user is signed in with Supabase
    if (user && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('bible_notes')
          .select('book_id, chapter_number, content, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          data.forEach((item) => {
            if (item.content && item.content.trim()) {
              loadedNotes.push(item);
            }
          });
        }
      } catch (err) {
        console.error('Error fetching all notes:', err);
      }
    }

    // 2. Also check local storage notes
    if (typeof window !== 'undefined') {
      const prefix = user ? `scripture_note_${user.id}_` : 'scripture_note_guest_';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const parts = key.replace(prefix, '').split('_');
          if (parts.length === 2) {
            const bId = parts[0];
            const chNum = parseInt(parts[1], 10);
            const content = localStorage.getItem(key) || '';
            // Only add if not already present from database
            if (
              content.trim() &&
              !loadedNotes.some((n) => n.book_id === bId && n.chapter_number === chNum)
            ) {
              loadedNotes.push({
                book_id: bId,
                chapter_number: chNum,
                content,
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    setNotes(loadedNotes);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadAllNotes();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a0f1d]">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-100">My Scripture Notes</h3>
              <p className="text-xs text-slate-400">
                {notes.length} {notes.length === 1 ? 'chapter' : 'chapters'} with personal notes
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={loadAllNotes}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              title="Refresh notes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading your notes index...
            </div>
          ) : notes.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-300">No notes written yet</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Navigate to any chapter and start typing in the notes panel. Your notes will appear here for fast access!
              </p>
            </div>
          ) : (
            notes.map((item) => {
              const bookMeta = getBookMeta(item.book_id);
              const displayName = bookMeta ? bookMeta.name : item.book_id;
              const preview = item.content.slice(0, 140).replace(/^[#>\s-]+/gm, '');

              return (
                <div
                  key={`${item.book_id}-${item.chapter_number}`}
                  onClick={() => {
                    onSelectChapter(item.book_id, item.chapter_number);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-amber-300 group-hover:text-amber-200">
                      {displayName} {item.chapter_number}
                    </span>
                    <div className="flex items-center space-x-1 text-slate-500 group-hover:text-slate-300">
                      {item.updated_at && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.updated_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {preview || 'Empty note'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

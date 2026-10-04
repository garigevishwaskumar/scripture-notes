'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getBookMeta } from '@/lib/bible';
import { X, BookOpen, Search, ChevronRight, FileText, Sparkles, RefreshCw, Download } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

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
      setSearchQuery('');
    }
  }, [isOpen, user]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter((n) => {
      const bookMeta = getBookMeta(n.book_id);
      const bookName = bookMeta ? bookMeta.name.toLowerCase() : n.book_id.toLowerCase();
      const content = n.content.toLowerCase();
      return bookName.includes(query) || content.includes(query);
    });
  }, [notes, searchQuery]);

  const handleExportAllNotes = () => {
    if (!notes.length) return;
    const combinedMarkdown = notes
      .map((n) => {
        const bookMeta = getBookMeta(n.book_id);
        const name = bookMeta ? bookMeta.name : n.book_id;
        return `# ${name} Chapter ${n.chapter_number}\n\n${n.content}\n\n---\n`;
      })
      .join('\n');

    const blob = new Blob([combinedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scripture_journal_export_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col text-[var(--foreground)] overflow-hidden ring-1 ring-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] font-display">My Scripture Journal</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {notes.length} {notes.length === 1 ? 'chapter' : 'chapters'} with reflections
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {notes.length > 0 && (
              <button
                onClick={handleExportAllNotes}
                className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition cursor-pointer"
                title="Export all notes as Markdown file"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={loadAllNotes}
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition cursor-pointer"
              title="Refresh notes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        {notes.length > 0 && (
          <div className="p-3 bg-[var(--secondary)] border-b border-[var(--border)]">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes or scripture topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-[var(--muted-foreground)] text-sm">
              <Sparkles className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
              Loading your notes index...
            </div>
          ) : notes.length === 0 ? (
            <div className="py-16 text-center space-y-4 px-4">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--foreground)] font-display">Your Journal is Ready</h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xs mx-auto mt-1">
                  Navigate to any chapter in the Bible and record your thoughts, sermons, and prayers. They will be organized here.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] text-xs text-amber-700 dark:text-amber-300 italic font-nkjv">
                &ldquo;Thy word is a lamp unto my feet, and a light unto my path.&rdquo;
                <div className="not-italic text-[11px] text-[var(--muted-foreground)] font-sans mt-1">Psalm 119:105</div>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-[var(--muted-foreground)] text-xs">
              No notes found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredNotes.map((item) => {
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
                  className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-amber-500/50 hover:bg-[var(--secondary)] cursor-pointer transition group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[var(--foreground)] font-display group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                        {displayName} {item.chapter_number}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[var(--muted-foreground)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                      {item.updated_at && (
                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                          {new Date(item.updated_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
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

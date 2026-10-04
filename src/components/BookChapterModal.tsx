'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ALL_BOOKS, BibleBookMeta } from '@/lib/bible';
import { X, Search, ChevronRight, BookOpen, Layers, Sparkles } from 'lucide-react';

interface BookChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBookId: string;
  currentChapter: number;
  onSelect: (bookId: string, chapterNumber: number) => void;
}

export function BookChapterModal({
  isOpen,
  onClose,
  currentBookId,
  currentChapter,
  onSelect,
}: BookChapterModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestament, setSelectedTestament] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [activeBook, setActiveBook] = useState<BibleBookMeta | null>(() => {
    return ALL_BOOKS.find((b) => b.id.toLowerCase() === currentBookId.toLowerCase()) || ALL_BOOKS[0];
  });

  // Sync active book when opening
  useEffect(() => {
    if (isOpen) {
      const match = ALL_BOOKS.find((b) => b.id.toLowerCase() === currentBookId.toLowerCase());
      if (match) setActiveBook(match);
      setSearchQuery('');
    }
  }, [isOpen, currentBookId]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredBooks = useMemo(() => {
    return ALL_BOOKS.filter((book) => {
      const matchesSearch =
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTestament =
        selectedTestament === 'ALL' || book.testament === selectedTestament;
      return matchesSearch && matchesTestament;
    });
  }, [searchQuery, selectedTestament]);

  // If search query changes and filteredBooks has items, automatically select first match
  useEffect(() => {
    if (searchQuery.trim() && filteredBooks.length > 0) {
      setActiveBook(filteredBooks[0]);
    }
  }, [searchQuery, filteredBooks]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c101a] border border-white/[0.1] rounded-3xl shadow-2xl shadow-black/80 flex flex-col text-slate-100 overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-card/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Scripture Library</h3>
              <p className="text-xs text-slate-400">Choose any of the 66 Books of the King James Bible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-black/30 border-b border-white/[0.08] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search books (e.g. John, Psalms, Romans, Genesis)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/[0.08] self-start sm:self-auto">
            <button
              onClick={() => setSelectedTestament('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                selectedTestament === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (66)
            </button>
            <button
              onClick={() => setSelectedTestament('OT')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                selectedTestament === 'OT'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Old Test. (39)
            </button>
            <button
              onClick={() => setSelectedTestament('NT')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                selectedTestament === 'NT'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Test. (27)
            </button>
          </div>
        </div>

        {/* Content Area: Dual pane (Books on Left, Chapters on Right) */}
        <div className="flex-1 min-h-[350px] overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {/* Books List (col-span-5) */}
          <div className="md:col-span-5 overflow-y-auto max-h-[350px] md:max-h-[500px] p-2 space-y-1">
            {filteredBooks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No books match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredBooks.map((book) => {
                const isCurrent = book.id === currentBookId;
                const isSelected = activeBook?.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => setActiveBook(book)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          book.testament === 'OT'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        }`}
                      >
                        {book.testament}
                      </span>
                      <span>{book.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <span>{book.chapterCount} chs</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Chapters Grid (col-span-7) */}
          <div className="md:col-span-7 overflow-y-auto max-h-[350px] md:max-h-[500px] p-5 flex flex-col bg-black/10">
            {activeBook ? (
              <>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-base font-bold text-white font-display">
                      {activeBook.name} ({activeBook.chapterCount} Chapters)
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeBook.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {Array.from({ length: activeBook.chapterCount }, (_, i) => i + 1).map((chNum) => {
                    const isSelectedChapter =
                      activeBook.id === currentBookId && chNum === currentChapter;
                    return (
                      <button
                        key={chNum}
                        onClick={() => {
                          onSelect(activeBook.id, chNum);
                          onClose();
                        }}
                        className={`h-11 rounded-xl font-semibold text-sm flex items-center justify-center transition border cursor-pointer ${
                          isSelectedChapter
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                            : 'bg-white/[0.04] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:border-amber-500/50 hover:text-amber-300'
                        }`}
                      >
                        {chNum}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select a book to choose a chapter
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-black/40 border-t border-white/[0.08] text-xs text-slate-400 flex items-center justify-between">
          <span>Tip: Use <kbd className="bg-white/10 px-1 py-0.5 rounded font-mono text-[10px]">←</kbd> and <kbd className="bg-white/10 px-1 py-0.5 rounded font-mono text-[10px]">→</kbd> to quickly flip through chapters while reading</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

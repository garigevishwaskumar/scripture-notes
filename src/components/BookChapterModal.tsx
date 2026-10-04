'use client';

import React, { useState, useMemo } from 'react';
import { ALL_BOOKS, BibleBookMeta } from '@/lib/bible';
import { X, Search, ChevronRight, BookOpen, Layers } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-100">Select Scripture Chapter</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search books (e.g. John, Psalms, Romans)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setSelectedTestament('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                selectedTestament === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All (66)
            </button>
            <button
              onClick={() => setSelectedTestament('OT')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                selectedTestament === 'OT'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Old Testament (39)
            </button>
            <button
              onClick={() => setSelectedTestament('NT')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                selectedTestament === 'NT'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              New Testament (27)
            </button>
          </div>
        </div>

        {/* Content Area: Dual pane (Books on Left, Chapters on Right) */}
        <div className="flex-1 min-h-[350px] overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                          book.testament === 'OT'
                            ? 'bg-blue-900/40 text-blue-300 border border-blue-800/40'
                            : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/40'
                        }`}
                      >
                        {book.testament}
                      </span>
                      <span>{book.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          Current
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
          <div className="md:col-span-7 overflow-y-auto max-h-[350px] md:max-h-[500px] p-4 flex flex-col">
            {activeBook ? (
              <>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-200">
                      {activeBook.name} Chapters ({activeBook.chapterCount})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
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
                        className={`h-11 rounded-xl font-medium text-sm flex items-center justify-center transition border ${
                          isSelectedChapter
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                            : 'bg-slate-800/70 border-slate-700/60 text-slate-200 hover:bg-slate-700 hover:border-amber-500/50 hover:text-amber-300'
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
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Tip: You can use Left and Right arrow keys to flip chapters quickly</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

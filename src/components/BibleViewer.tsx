'use client';

import React, { useState } from 'react';
import { BibleBookMeta } from '@/lib/bible';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Copy,
  PlusCircle,
  Check,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';

interface BibleViewerProps {
  book: BibleBookMeta | null;
  chapterNumber: number;
  verses: string[];
  loading: boolean;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onInsertVerseQuote: (verseNumber: number, text: string) => void;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
}

export function BibleViewer({
  book,
  chapterNumber,
  verses,
  loading,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
  onInsertVerseQuote,
  fontSize,
  onChangeFontSize,
}: BibleViewerProps) {
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-base leading-relaxed';
      case 'md':
        return 'text-lg leading-loose';
      case 'lg':
        return 'text-xl leading-loose';
      case 'xl':
        return 'text-2xl leading-loose';
      default:
        return 'text-lg leading-loose';
    }
  };

  const handleCopyVerse = (verseNum: number, text: string) => {
    if (!book) return;
    const formatted = `"${text.trim()}" — ${book.name} ${chapterNumber}:${verseNum} (KJV)`;
    navigator.clipboard.writeText(formatted);
    setCopiedIndex(verseNum);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0f1d] border-r border-slate-800/80 overflow-hidden">
      {/* Top Chapter Header / Controls */}
      <div className="px-4 py-3 bg-[#0d1424] border-b border-slate-800/90 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            {book ? `${book.name} ${chapterNumber}` : 'Loading...'}
          </h2>
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            KJV
          </span>
        </div>

        {/* Font size control */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => {
              if (fontSize === 'xl') onChangeFontSize('lg');
              else if (fontSize === 'lg') onChangeFontSize('md');
              else if (fontSize === 'md') onChangeFontSize('sm');
            }}
            disabled={fontSize === 'sm'}
            className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded"
            title="Decrease font size"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-semibold text-slate-400 px-1 uppercase">
            {fontSize}
          </span>
          <button
            onClick={() => {
              if (fontSize === 'sm') onChangeFontSize('md');
              else if (fontSize === 'md') onChangeFontSize('lg');
              else if (fontSize === 'lg') onChangeFontSize('xl');
            }}
            disabled={fontSize === 'xl'}
            className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded"
            title="Increase font size"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Verses Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
        {loading ? (
          <div className="space-y-4 py-8 animate-pulse">
            <div className="h-6 bg-slate-800/60 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800/40 rounded w-full"></div>
              <div className="h-4 bg-slate-800/40 rounded w-5/6"></div>
              <div className="h-4 bg-slate-800/40 rounded w-11/12"></div>
              <div className="h-4 bg-slate-800/40 rounded w-4/5"></div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-4 bg-slate-800/40 rounded w-full"></div>
              <div className="h-4 bg-slate-800/40 rounded w-3/4"></div>
            </div>
          </div>
        ) : verses.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No verses found for this chapter.
          </div>
        ) : (
          <div className={`font-scripture ${getFontSizeClasses()} text-slate-200 space-y-3`}>
            {verses.map((verseText, idx) => {
              const verseNum = idx + 1;
              const isSelected = selectedVerseIndex === verseNum;
              const isCopied = copiedIndex === verseNum;

              return (
                <div
                  key={verseNum}
                  onClick={() => setSelectedVerseIndex(isSelected ? null : verseNum)}
                  className={`group relative p-2 rounded-xl transition duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <span className="select-none font-sans font-bold text-amber-500/90 text-sm mr-2.5 inline-block min-w-[1.4rem]">
                    {verseNum}
                  </span>
                  <span className="text-slate-200/95 tracking-normal">
                    {verseText}
                  </span>

                  {/* Context Action Overlay */}
                  <div
                    className={`mt-2 pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-xs font-sans transition-all duration-200 ${
                      isSelected
                        ? 'opacity-100 flex'
                        : 'opacity-0 group-hover:opacity-100 hidden group-hover:flex'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onInsertVerseQuote(verseNum, verseText)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition text-xs font-medium cursor-pointer"
                      title="Append this verse into your chapter notes"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Quote in Notes</span>
                    </button>

                    <button
                      onClick={() => handleCopyVerse(verseNum, verseText)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-xs font-medium cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chapter Navigation Footer inside scripture viewer */}
        <div className="pt-8 pb-4 flex items-center justify-between border-t border-slate-800/80">
          <button
            onClick={onNavigatePrev}
            disabled={!hasPrev}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Chapter</span>
          </button>

          <button
            onClick={onNavigateNext}
            disabled={!hasNext}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none transition text-sm cursor-pointer"
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

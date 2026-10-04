'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Volume2,
  VolumeX,
  AlignLeft,
  ListOrdered,
  Sparkles,
  Highlighter,
} from 'lucide-react';

export type HighlightColor = 'amber' | 'emerald' | 'blue' | 'purple' | null;

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
  const [highlights, setHighlights] = useState<Record<number, HighlightColor>>({});
  const [isReadingModeParagraph, setIsReadingModeParagraph] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load saved highlights for current book and chapter
  useEffect(() => {
    if (!book || typeof window === 'undefined') return;
    const storageKey = `scripture_hl_${book.id}_${chapterNumber}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHighlights(JSON.parse(saved));
      } else {
        setHighlights({});
      }
    } catch {
      setHighlights({});
    }
    // Stop any ongoing speech when switching chapters
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSelectedVerseIndex(null);
  }, [book, chapterNumber]);

  // Save highlight
  const handleSetHighlight = (verseNum: number, color: HighlightColor) => {
    if (!book || typeof window === 'undefined') return;
    const newHighlights = { ...highlights };
    if (!color) {
      delete newHighlights[verseNum];
    } else {
      newHighlights[verseNum] = color;
    }
    setHighlights(newHighlights);
    const storageKey = `scripture_hl_${book.id}_${chapterNumber}`;
    localStorage.setItem(storageKey, JSON.stringify(newHighlights));
  };

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-base sm:text-lg leading-[1.8] sm:leading-[1.9]';
      case 'md':
        return 'text-lg sm:text-xl leading-[1.85] sm:leading-[2.0]';
      case 'lg':
        return 'text-xl sm:text-2xl leading-[1.9] sm:leading-[2.1]';
      case 'xl':
        return 'text-2xl sm:text-3xl leading-[2.0] sm:leading-[2.2]';
      default:
        return 'text-lg sm:text-xl leading-[1.85] sm:leading-[2.0]';
    }
  };

  const handleCopyVerse = (verseNum: number, text: string) => {
    if (!book) return;
    const formatted = `"${text.trim()}" — ${book.name} ${chapterNumber}:${verseNum} (KJV)`;
    navigator.clipboard.writeText(formatted);
    setCopiedIndex(verseNum);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Audio Read Aloud using Web Speech API
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!verses.length) return;

    window.speechSynthesis.cancel();
    const textToRead = `${book?.name} Chapter ${chapterNumber}. ` + verses.join(' ');
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const wordCount = verses.reduce((acc, v) => acc + v.split(/\s+/).length, 0);
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080b11] border-r border-white/[0.08] overflow-hidden">
      {/* Chapter Editorial Header */}
      <div className="px-4 sm:px-8 py-3.5 bg-card/60 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {book?.testament === 'OT' ? 'Old Testament' : 'New Testament'}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {verses.length} verses · ~{estimatedReadTime} min read
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display mt-0.5">
              {book ? `${book.name} ${chapterNumber}` : 'Loading...'}
            </h2>
          </div>
        </div>

        {/* Action Controls: Audio, Flow mode, Font zoom */}
        <div className="flex items-center space-x-2">
          {/* Read Aloud Button */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/25'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
            }`}
            title={isSpeaking ? 'Stop reading' : 'Listen to chapter aloud'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Speaking</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Listen</span>
              </>
            )}
          </button>

          {/* Verse vs Paragraph Reading Mode */}
          <button
            onClick={() => setIsReadingModeParagraph(!isReadingModeParagraph)}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs transition cursor-pointer"
            title={isReadingModeParagraph ? 'Switch to Verse-by-Verse' : 'Switch to Paragraph Prose'}
          >
            {isReadingModeParagraph ? (
              <ListOrdered className="w-4 h-4 text-amber-400" />
            ) : (
              <AlignLeft className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Font size control */}
          <div className="flex items-center space-x-0.5 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => {
                if (fontSize === 'xl') onChangeFontSize('lg');
                else if (fontSize === 'lg') onChangeFontSize('md');
                else if (fontSize === 'md') onChangeFontSize('sm');
              }}
              disabled={fontSize === 'sm'}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded cursor-pointer"
              title="Decrease text size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-400 px-1 uppercase min-w-[20px] text-center">
              {fontSize}
            </span>
            <button
              onClick={() => {
                if (fontSize === 'sm') onChangeFontSize('md');
                else if (fontSize === 'md') onChangeFontSize('lg');
                else if (fontSize === 'lg') onChangeFontSize('xl');
              }}
              disabled={fontSize === 'xl'}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded cursor-pointer"
              title="Increase text size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Verses Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-16 py-8 space-y-4">
        {loading ? (
          <div className="space-y-4 py-8 animate-pulse max-w-2xl mx-auto">
            <div className="h-8 bg-white/[0.06] rounded-xl w-1/3"></div>
            <div className="space-y-3 pt-4">
              <div className="h-5 bg-white/[0.04] rounded-lg w-full"></div>
              <div className="h-5 bg-white/[0.04] rounded-lg w-5/6"></div>
              <div className="h-5 bg-white/[0.04] rounded-lg w-11/12"></div>
              <div className="h-5 bg-white/[0.04] rounded-lg w-4/5"></div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-5 bg-white/[0.04] rounded-lg w-full"></div>
              <div className="h-5 bg-white/[0.04] rounded-lg w-3/4"></div>
            </div>
          </div>
        ) : verses.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-serif text-lg">
            No verses found for this chapter.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Elegant Chapter Opener Plate */}
            <div className="text-center py-6 mb-4 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-amber-400/90 tracking-widest uppercase font-sans">
                The Holy Bible · King James Version
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-normal text-white mt-1 mb-2 tracking-tight">
                {book?.name}
              </h1>
              <div className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-400">
                Chapter {chapterNumber}
              </div>
            </div>

            {/* Verses Display (Verse-by-Verse or Paragraph) */}
            <div className={`font-scripture ${getFontSizeClasses()} text-slate-200 select-text`}>
              {verses.map((verseText, idx) => {
                const verseNum = idx + 1;
                const isSelected = selectedVerseIndex === verseNum;
                const isCopied = copiedIndex === verseNum;
                const highlight = highlights[verseNum];

                const highlightClasses = highlight
                  ? highlight === 'amber'
                    ? 'highlight-amber rounded-r-xl'
                    : highlight === 'emerald'
                    ? 'highlight-emerald rounded-r-xl'
                    : highlight === 'blue'
                    ? 'highlight-blue rounded-r-xl'
                    : 'highlight-purple rounded-r-xl'
                  : '';

                return (
                  <div
                    key={verseNum}
                    onClick={() => setSelectedVerseIndex(isSelected ? null : verseNum)}
                    className={`group relative p-2.5 rounded-xl transition duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.07] ring-1 ring-amber-500/40 shadow-lg'
                        : highlightClasses || 'hover:bg-white/[0.03]'
                    } ${isReadingModeParagraph ? 'inline' : 'block mb-2'}`}
                  >
                    {/* Verse Number Badge */}
                    <span className="select-none font-sans font-bold text-amber-500/80 text-xs sm:text-sm mr-2 inline-flex items-center justify-center min-w-[1.4rem] opacity-75 group-hover:opacity-100 transition">
                      {verseNum}
                    </span>

                    {/* Verse Text (with Drop Cap on Verse 1 for classic beauty) */}
                    <span className="text-slate-100/95 tracking-normal">
                      {verseText}
                    </span>

                    {/* Context Action Overlay Bar when clicked or hovered */}
                    <div
                      className={`mt-2.5 pt-2 border-t border-white/[0.08] items-center justify-between text-xs font-sans transition-all duration-200 ${
                        isSelected
                          ? 'opacity-100 flex'
                          : 'opacity-0 group-hover:opacity-100 hidden group-hover:flex'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Highlighting Palette */}
                      <div className="flex items-center space-x-1.5">
                        <Highlighter className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                        <button
                          onClick={() => handleSetHighlight(verseNum, 'amber')}
                          className="w-4 h-4 rounded-full bg-amber-400 hover:scale-125 transition shadow-sm cursor-pointer"
                          title="Highlight Amber (Promise / Faith)"
                        />
                        <button
                          onClick={() => handleSetHighlight(verseNum, 'emerald')}
                          className="w-4 h-4 rounded-full bg-emerald-400 hover:scale-125 transition shadow-sm cursor-pointer"
                          title="Highlight Emerald (Wisdom / Growth)"
                        />
                        <button
                          onClick={() => handleSetHighlight(verseNum, 'blue')}
                          className="w-4 h-4 rounded-full bg-sky-400 hover:scale-125 transition shadow-sm cursor-pointer"
                          title="Highlight Blue (Peace / Grace)"
                        />
                        <button
                          onClick={() => handleSetHighlight(verseNum, 'purple')}
                          className="w-4 h-4 rounded-full bg-purple-400 hover:scale-125 transition shadow-sm cursor-pointer"
                          title="Highlight Purple (Prophecy / Royalty)"
                        />
                        {highlight && (
                          <button
                            onClick={() => handleSetHighlight(verseNum, null)}
                            className="text-[10px] text-slate-400 hover:text-red-400 ml-1 underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Quote & Copy Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onInsertVerseQuote(verseNum, verseText)}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition text-xs font-semibold cursor-pointer shadow-sm"
                          title="Append this verse into your chapter study notes"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Quote in Notes</span>
                        </button>

                        <button
                          onClick={() => handleCopyVerse(verseNum, verseText)}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] transition text-xs font-medium cursor-pointer"
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
                  </div>
                );
              })}
            </div>

            {/* Chapter Navigation Footer */}
            <div className="pt-12 pb-8 flex items-center justify-between border-t border-white/[0.08] mt-8">
              <button
                onClick={onNavigatePrev}
                disabled={!hasPrev}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-card hover:bg-white/[0.06] border border-white/[0.08] text-slate-200 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition text-sm cursor-pointer shadow-sm group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
                <span>Previous Chapter</span>
              </button>

              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                {book?.name} · {chapterNumber} of {book?.chapterCount}
              </span>

              <button
                onClick={onNavigateNext}
                disabled={!hasNext}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-card hover:bg-white/[0.06] border border-white/[0.08] text-slate-200 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition text-sm cursor-pointer shadow-sm group"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

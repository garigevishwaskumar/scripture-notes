'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALL_BOOKS,
  BibleBookMeta,
  getChapterVerses,
  getAdjacentChapter,
} from '@/lib/bible';
import { useChapterNotes } from '@/hooks/useChapterNotes';
import { Navbar, ReadingTheme } from '@/components/Navbar';
import { BibleViewer } from '@/components/BibleViewer';
import { NoteEditor } from '@/components/NoteEditor';
import { BookChapterModal } from '@/components/BookChapterModal';
import { NotesDrawer } from '@/components/NotesDrawer';
import { AuthModal } from '@/components/AuthModal';
import { Book, FileEdit, Columns, Search, FolderArchive } from 'lucide-react';

interface BibleAppProps {
  initialBookId?: string;
  initialChapter?: number;
}

export function BibleApp({
  initialBookId = 'genesis',
  initialChapter = 1,
}: BibleAppProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Active book and chapter
  const [currentBookId, setCurrentBookId] = useState<string>(initialBookId);
  const [currentChapter, setCurrentChapter] = useState<number>(initialChapter);

  // Verse content state
  const [verses, setVerses] = useState<string[]>([]);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(true);
  const [currentBookMeta, setCurrentBookMeta] = useState<BibleBookMeta | null>(() => {
    return ALL_BOOKS.find((b) => b.id.toLowerCase() === initialBookId.toLowerCase()) || ALL_BOOKS[0];
  });

  // UI Modals and layout state
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'bible' | 'notes'>('split');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [theme, setTheme] = useState<ReadingTheme>('obsidian');

  // Load saved preferences from localStorage & apply theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('scripture_notes_font_size') as 'sm' | 'md' | 'lg' | 'xl';
      if (savedFontSize) setFontSize(savedFontSize);

      const savedTheme = localStorage.getItem('scripture_notes_theme') as ReadingTheme;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'obsidian');
      }

      // On mobile screens, default to 'bible' view instead of cramped split
      if (window.innerWidth < 768) {
        setViewMode('bible');
      }
    }
  }, []);

  const handleChangeTheme = (newTheme: ReadingTheme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('scripture_notes_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const handleChangeFontSize = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('scripture_notes_font_size', size);
    }
  };

  // Debounced chapter notes hook
  const {
    content: noteContent,
    loading: loadingNotes,
    syncStatus,
    lastSavedAt,
    errorMessage: noteErrorMessage,
    updateContent: updateNoteContent,
    forceSave: forceSaveNote,
  } = useChapterNotes(currentBookId, currentChapter);

  // Load verses when book or chapter changes
  useEffect(() => {
    let isCancelled = false;
    setLoadingVerses(true);

    getChapterVerses(currentBookId, currentChapter)
      .then((data) => {
        if (isCancelled) return;
        if (data) {
          setCurrentBookMeta(data.book);
          setVerses(data.verses);
        } else {
          setVerses([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load chapter verses:', err);
        if (!isCancelled) setVerses([]);
      })
      .finally(() => {
        if (!isCancelled) setLoadingVerses(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [currentBookId, currentChapter]);

  // Navigate to target book and chapter
  const navigateToChapter = useCallback(
    (targetBookId: string, targetChapter: number) => {
      setCurrentBookId(targetBookId);
      setCurrentChapter(targetChapter);

      const targetUrl = `/bible/${targetBookId}/${targetChapter}`;
      if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    },
    []
  );

  // Next / Prev adjacent calculations
  const nextTarget = getAdjacentChapter(currentBookId, currentChapter, 'next');
  const prevTarget = getAdjacentChapter(currentBookId, currentChapter, 'prev');

  const handlePrev = useCallback(() => {
    if (prevTarget) {
      navigateToChapter(prevTarget.bookId, prevTarget.chapterNumber);
    }
  }, [prevTarget, navigateToChapter]);

  const handleNext = useCallback(() => {
    if (nextTarget) {
      navigateToChapter(nextTarget.bookId, nextTarget.chapterNumber);
    }
  }, [nextTarget, navigateToChapter]);

  // Global Keyboard shortcuts: Arrow navigation & Cmd/Ctrl + K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K opens search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsBookPickerOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && prevTarget) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' && nextTarget) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, prevTarget, nextTarget]);

  // Insert verse quote into current notes
  const handleInsertVerseQuote = (verseNumber: number, verseText: string) => {
    const bookName = currentBookMeta ? currentBookMeta.name : currentBookId;
    const citation = `\n\n> "${verseText.trim()}"\n> — **${bookName} ${currentChapter}:${verseNumber}** (KJV)\n\n`;

    const newContent = noteContent.trim()
      ? `${noteContent.trim()}${citation}`
      : `> "${verseText.trim()}"\n> — **${bookName} ${currentChapter}:${verseNumber}** (KJV)\n\n`;

    updateNoteContent(newContent);

    // If on mobile and currently in 'bible' mode, switch to notes
    if (viewMode === 'bible' && typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('notes');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentBookName={currentBookMeta ? currentBookMeta.name : currentBookId}
        currentChapter={currentChapter}
        hasPrev={Boolean(prevTarget)}
        hasNext={Boolean(nextTarget)}
        onPrev={handlePrev}
        onNext={handleNext}
        onOpenBookPicker={() => setIsBookPickerOpen(true)}
        onOpenNotesDrawer={() => setIsNotesDrawerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        theme={theme}
        onChangeTheme={handleChangeTheme}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left: Scripture Viewer */}
        {(viewMode === 'split' || viewMode === 'bible') && (
          <div
            className={`h-full ${
              viewMode === 'split' ? 'w-full md:w-1/2 lg:w-3/5' : 'w-full'
            }`}
          >
            <BibleViewer
              book={currentBookMeta}
              chapterNumber={currentChapter}
              verses={verses}
              loading={loadingVerses}
              onNavigatePrev={handlePrev}
              onNavigateNext={handleNext}
              hasPrev={Boolean(prevTarget)}
              hasNext={Boolean(nextTarget)}
              onInsertVerseQuote={handleInsertVerseQuote}
              fontSize={fontSize}
              onChangeFontSize={handleChangeFontSize}
            />
          </div>
        )}

        {/* Right: Notes Editor */}
        {(viewMode === 'split' || viewMode === 'notes') && (
          <div
            className={`h-full ${
              viewMode === 'split' ? 'w-full md:w-1/2 lg:w-2/5' : 'w-full'
            }`}
          >
            <NoteEditor
              bookName={currentBookMeta ? currentBookMeta.name : currentBookId}
              chapterNumber={currentChapter}
              content={noteContent}
              loading={loadingNotes}
              syncStatus={syncStatus}
              lastSavedAt={lastSavedAt}
              errorMessage={noteErrorMessage}
              onContentChange={updateNoteContent}
              onForceSave={forceSaveNote}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Dock (visible on small mobile screens) */}
      <nav className="sm:hidden flex items-center justify-around bg-card/90 backdrop-blur-xl border-t border-white/[0.08] py-2 px-3 z-20">
        <button
          onClick={() => setViewMode('bible')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            viewMode === 'bible' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Book className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Scripture</span>
        </button>

        <button
          onClick={() => setViewMode('notes')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            viewMode === 'notes' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileEdit className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Notes</span>
        </button>

        <button
          onClick={() => setIsBookPickerOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-400 hover:text-white transition"
        >
          <Search className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[10px]">Books</span>
        </button>

        <button
          onClick={() => setIsNotesDrawerOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-400 hover:text-white transition"
        >
          <FolderArchive className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Journal</span>
        </button>
      </nav>

      {/* Modals & Drawers */}
      <BookChapterModal
        isOpen={isBookPickerOpen}
        onClose={() => setIsBookPickerOpen(false)}
        currentBookId={currentBookId}
        currentChapter={currentChapter}
        onSelect={(bId, chNum) => navigateToChapter(bId, chNum)}
      />

      <NotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        onSelectChapter={(bId, chNum) => navigateToChapter(bId, chNum)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

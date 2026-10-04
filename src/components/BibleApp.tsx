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
import { Navbar } from '@/components/Navbar';
import { BibleViewer } from '@/components/BibleViewer';
import { NoteEditor } from '@/components/NoteEditor';
import { BookChapterModal } from '@/components/BookChapterModal';
import { NotesDrawer } from '@/components/NotesDrawer';
import { AuthModal } from '@/components/AuthModal';

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

  // Load saved font size preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('scripture_notes_font_size') as 'sm' | 'md' | 'lg' | 'xl';
      if (savedFontSize) setFontSize(savedFontSize);

      // On small screens, default to 'bible' or 'notes' view instead of narrow split
      if (window.innerWidth < 768) {
        setViewMode('bible');
      }
    }
  }, []);

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

      // Smooth URL pushState
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

  // Keyboard shortcut listeners (left / right arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused inside textarea or input
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

    // If on mobile and currently in 'bible' mode, notify or switch view
    if (viewMode === 'bible' && typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('notes');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#090d16]">
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
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden">
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

'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  FolderArchive,
  Columns,
  Book,
  FileEdit,
  Search,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  currentBookName: string;
  currentChapter: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenBookPicker: () => void;
  onOpenNotesDrawer: () => void;
  onOpenAuthModal: () => void;
  viewMode: 'split' | 'bible' | 'notes';
  onChangeViewMode: (mode: 'split' | 'bible' | 'notes') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({
  currentBookName,
  currentChapter,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onOpenBookPicker,
  onOpenNotesDrawer,
  onOpenAuthModal,
  viewMode,
  onChangeViewMode,
  isDarkMode,
  onToggleDarkMode,
}: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="h-14 sm:h-16 bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)] px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 transition-colors shadow-xs">
      {/* Left: Branding & Chapter Jump Button */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* App Logo */}
        <button
          onClick={onOpenBookPicker}
          className="flex items-center space-x-2.5 cursor-pointer group text-left p-1 -ml-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.06] transition"
          title="Browse All 66 Books & Chapters (Cmd/Ctrl + K)"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all flex-shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base tracking-tight text-[var(--foreground)] leading-tight font-display">
              Scripture<span className="text-amber-500">Notes</span>
            </span>
            <span className="text-[10px] text-[var(--muted)] hidden sm:inline group-hover:text-amber-500 transition font-medium">
              NKJV & Study Studio
            </span>
          </div>
        </button>

        <div className="h-5 w-px bg-[var(--border)] hidden sm:block mx-1" />

        {/* Chapter Jump Selector */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-alt)] disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
            title="Previous chapter (← Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenBookPicker}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--card)] border border-[var(--border)] hover:border-amber-500/50 text-[var(--foreground)] font-semibold text-xs sm:text-sm transition group shadow-2xs cursor-pointer font-serif"
            title="Click to jump to any book or chapter"
          >
            <span className="tracking-tight">
              {currentBookName} {currentChapter}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-amber-500 transition" />
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-alt)] disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
            title="Next chapter (→ Right Arrow)"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Center: View Switcher (Desktop & Tablet) */}
      <div className="hidden sm:flex items-center bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-xl p-1 shadow-inner">
        <button
          onClick={() => onChangeViewMode('bible')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            viewMode === 'bible'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Focus on Scripture Reading"
        >
          <Book className="w-3.5 h-3.5" />
          <span>Bible</span>
        </button>

        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            viewMode === 'split'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Split View (Bible & Notes Side-by-Side)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split Studio</span>
        </button>

        <button
          onClick={() => onChangeViewMode('notes')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            viewMode === 'notes'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Focus on Journaling & Notes"
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Notes</span>
        </button>
      </div>

      {/* Right: Light/Dark Mode Switch, Quick Search, Notes & Account */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* LIGHT MODE / DARK MODE TOGGLE */}
        <button
          onClick={onToggleDarkMode}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold text-xs transition cursor-pointer shadow-2xs"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="hidden md:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Quick Search Shortcut */}
        <button
          onClick={onOpenBookPicker}
          className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs transition cursor-pointer"
          title="Quick Scripture Search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Search</span>
          <kbd className="text-[10px] bg-slate-200 dark:bg-white/[0.08] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* All Notes Drawer Button */}
        <button
          onClick={onOpenNotesDrawer}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-semibold transition cursor-pointer"
          title="Open All Chapter Notes"
        >
          <FolderArchive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden lg:inline text-[11px]">My Notes</span>
        </button>

        {/* Auth / Account */}
        {user ? (
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] rounded-xl px-2.5 py-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 hidden xl:inline max-w-[110px] truncate">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

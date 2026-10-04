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
  Palette,
} from 'lucide-react';

export type ReadingTheme = 'obsidian' | 'parchment' | 'navy';

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
  theme: ReadingTheme;
  onChangeTheme: (theme: ReadingTheme) => void;
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
  theme,
  onChangeTheme,
}: NavbarProps) {
  const { user, signOut } = useAuth();

  const cycleTheme = () => {
    if (theme === 'obsidian') onChangeTheme('parchment');
    else if (theme === 'parchment') onChangeTheme('navy');
    else onChangeTheme('obsidian');
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'parchment':
        return 'Parchment';
      case 'navy':
        return 'Velvet Navy';
      default:
        return 'Obsidian';
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-card/85 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 transition-colors">
      {/* Left: Branding & Chapter Jump Button */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* App Logo */}
        <button
          onClick={onOpenBookPicker}
          className="flex items-center space-x-2.5 cursor-pointer group text-left p-1 -ml-1 rounded-xl hover:bg-white/[0.06] transition"
          title="Browse All 66 Books & Chapters (Cmd/Ctrl + K)"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25 group-hover:scale-105 group-hover:rotate-1 transition-all flex-shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base tracking-tight text-white leading-tight font-display">
              SCRIPTURE<span className="text-amber-400 font-sans font-black">NOTES</span>
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline group-hover:text-amber-300 transition font-medium">
              Study & Journal Studio
            </span>
          </div>
        </button>

        <div className="h-5 w-px bg-white/10 hidden sm:block mx-1" />

        {/* Chapter Jump Selector */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
            title="Previous chapter (← Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenBookPicker}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-amber-500/50 text-slate-100 font-semibold text-xs sm:text-sm transition group shadow-sm cursor-pointer"
            title="Click to jump to any book or chapter"
          >
            <span className="tracking-tight">
              {currentBookName} {currentChapter}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-y-0.5 transition" />
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
            title="Next chapter (→ Right Arrow)"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Center: View Switcher (Desktop & Tablet) */}
      <div className="hidden sm:flex items-center bg-black/40 border border-white/[0.08] rounded-xl p-1 shadow-inner">
        <button
          onClick={() => onChangeViewMode('bible')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
            viewMode === 'bible'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Focus on Scripture Reading"
        >
          <Book className="w-3.5 h-3.5" />
          <span>Bible</span>
        </button>

        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
            viewMode === 'split'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Split View (Bible & Notes Side-by-Side)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split Studio</span>
        </button>

        <button
          onClick={() => onChangeViewMode('notes')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
            viewMode === 'notes'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Focus on Journaling & Notes"
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Notes</span>
        </button>
      </div>

      {/* Right: Quick Search, Theme, Notes Index & User */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Quick Search Shortcut */}
        <button
          onClick={onOpenBookPicker}
          className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
          title="Quick Scripture Search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span>Search</span>
          <kbd className="text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Reading Atmosphere Theme Switcher */}
        <button
          onClick={cycleTheme}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-amber-400 text-xs font-medium transition cursor-pointer"
          title={`Theme: ${getThemeLabel()} (Click to toggle)`}
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline text-[11px]">{getThemeLabel()}</span>
        </button>

        {/* All Notes Drawer Button */}
        <button
          onClick={onOpenNotesDrawer}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-amber-400 text-xs font-medium transition cursor-pointer"
          title="Open All Chapter Notes"
        >
          <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline text-[11px]">All Notes</span>
        </button>

        {/* Auth / Account */}
        {user ? (
          <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs text-slate-300 hidden xl:inline max-w-[110px] truncate">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="p-1 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
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

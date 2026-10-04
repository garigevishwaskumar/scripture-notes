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
  Sparkles,
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
}: NavbarProps) {
  const { user, signOut, isConfigured } = useAuth();

  return (
    <header className="h-14 sm:h-16 bg-[#090d16]/95 backdrop-blur border-b border-slate-800/90 px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Branding & Chapter Jump Button */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* App Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight text-slate-100 hidden sm:inline-block">
            Scripture<span className="text-amber-400">Notes</span>
          </span>
        </div>

        {/* Chapter Jump Selector */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Previous chapter"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenBookPicker}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-amber-500/50 text-slate-100 font-semibold text-xs sm:text-sm transition group shadow-sm cursor-pointer"
          >
            <span>
              {currentBookName} {currentChapter}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition" />
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Next chapter"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Center: View Switcher (Desktop & Mobile) */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
        <button
          onClick={() => onChangeViewMode('bible')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
            viewMode === 'bible'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Bible Only"
        >
          <Book className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Scripture</span>
        </button>

        <button
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
            viewMode === 'split'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Split View (Scripture + Notes)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Split View</span>
        </button>

        <button
          onClick={() => onChangeViewMode('notes')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
            viewMode === 'notes'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Notes Only"
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Notes</span>
        </button>
      </div>

      {/* Right: Notes Index & User Profile / Login */}
      <div className="flex items-center space-x-2">
        {/* All Notes Drawer Button */}
        <button
          onClick={onOpenNotesDrawer}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs font-medium transition"
          title="Open Notes Index"
        >
          <FolderArchive className="w-4 h-4" />
          <span className="hidden lg:inline">My Notes</span>
        </button>

        {/* Auth / Account */}
        {user ? (
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs text-slate-300 hidden md:inline max-w-[120px] truncate">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="p-1 text-slate-400 hover:text-red-400 rounded transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs transition shadow-md shadow-amber-500/20"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

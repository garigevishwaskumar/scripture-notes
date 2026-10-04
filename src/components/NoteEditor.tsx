'use client';

import React, { useRef } from 'react';
import { SyncStatus } from '@/hooks/useChapterNotes';
import {
  CloudCheck,
  CloudUpload,
  AlertCircle,
  HardDrive,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Clock,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NoteEditorProps {
  bookName: string;
  chapterNumber: number;
  content: string;
  loading: boolean;
  syncStatus: SyncStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  onContentChange: (newContent: string) => void;
  onForceSave: () => void;
}

export function NoteEditor({
  bookName,
  chapterNumber,
  content,
  loading,
  syncStatus,
  lastSavedAt,
  errorMessage,
  onContentChange,
  onForceSave,
}: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onContentChange(newContent);

    // Reset selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onContentChange(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNote = () => {
    const filename = `${bookName}_Chapter_${chapterNumber}_Notes.md`.toLowerCase().replace(/\s+/g, '_');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1424] overflow-hidden">
      {/* Editor Header */}
      <div className="px-4 py-3 bg-[#0a0f1d] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
            <span>Notes: {bookName} {chapterNumber}</span>
          </h2>
          <p className="text-xs text-slate-400">Personal chapter reflections & cross-references</p>
        </div>

        {/* Sync Status Indicator */}
        <div className="flex items-center space-x-2">
          {syncStatus === 'saving' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
              <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
              <span>Saving...</span>
            </div>
          )}

          {syncStatus === 'saved' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs" title="Synced with Supabase PostgreSQL">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Saved to Supabase</span>
            </div>
          )}

          {syncStatus === 'local' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs" title="Saved locally on this device">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Saved locally</span>
            </div>
          )}

          {syncStatus === 'error' && (
            <button
              onClick={onForceSave}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-950/40 border border-red-800 text-red-300 text-xs hover:bg-red-900/40 transition"
              title={errorMessage || 'Error saving. Click to retry.'}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Save failed (Retry)</span>
            </button>
          )}

          {/* Quick Note Actions */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              onClick={handleCopyNote}
              disabled={!content}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 disabled:opacity-30 transition"
              title="Copy notes to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownloadNote}
              disabled={!content}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 disabled:opacity-30 transition"
              title="Download Markdown note"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="px-3 py-1.5 bg-[#090e1c] border-b border-slate-800/80 flex items-center space-x-1 text-slate-400 text-xs flex-shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**', 'bold text')}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800/70 rounded transition"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*', '*', 'italic text')}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800/70 rounded transition"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('\n### ', '\n', 'Heading')}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800/70 rounded transition"
          title="Heading"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('\n- ', '\n', 'List item')}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800/70 rounded transition"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('\n> ', '\n', 'Quote')}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800/70 rounded transition"
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            const now = new Date().toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            insertFormatting(`\n*Date: ${now}*\n\n`);
          }}
          className="p-1.5 hover:text-slate-100 hover:bg-slate-800/70 rounded transition"
          title="Insert timestamp"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1" />

        <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
          {wordCount} words · {charCount} chars
        </div>
      </div>

      {/* Note Content Area */}
      <div className="flex-1 p-4 relative flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Loading note...
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Record your study notes, insights, prayers, and cross-references for ${bookName} ${chapterNumber}...\n\n(Tip: Click "Quote in Notes" on any verse on the left to instantly insert scripture citations)`}
            className="flex-1 w-full p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 font-mono text-sm sm:text-base leading-relaxed resize-none transition"
          />
        )}
      </div>

      {/* Editor Footer */}
      <div className="px-4 py-2 bg-[#0a0f1d] border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto-persisting every 1000ms debounce</span>
        </span>

        {lastSavedAt && (
          <span className="text-slate-500">
            Last saved {lastSavedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useRef, useState } from 'react';
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
  Eye,
  Edit3,
  Tag,
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
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const insertTemplate = (templateHeader: string) => {
    const textarea = textareaRef.current;
    const newContent = content.trim()
      ? `${content.trim()}\n\n${templateHeader}\n`
      : `${templateHeader}\n`;
    onContentChange(newContent);
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newContent.length, newContent.length);
      }
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

  // Simple Markdown renderer for Preview mode
  const renderSimpleMarkdown = (text: string) => {
    if (!text.trim()) {
      return (
        <div className="py-16 text-center text-slate-500 font-sans text-sm">
          No content written yet. Switch to <span className="text-amber-400 font-semibold">Write</span> mode to begin typing your thoughts.
        </div>
      );
    }

    const lines = text.split('\n');
    return (
      <div className="space-y-3 font-sans text-slate-200 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-amber-400 pt-2 pb-1 border-b border-white/[0.08]">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg font-bold text-white pt-3 pb-1 border-b border-white/[0.08]">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="pl-4 py-1.5 border-l-2 border-amber-500 bg-amber-500/[0.06] rounded-r-lg font-scripture text-slate-300 italic text-base my-2"
              >
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-300">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }
          return (
            <p key={idx} className="text-slate-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0e18] overflow-hidden">
      {/* Editor Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-card/60 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 flex-shrink-0 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Study Journal
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {wordCount} words
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-display mt-0.5">
            {bookName} Chapter {chapterNumber}
          </h2>
        </div>

        {/* Sync Status Indicator & Mode Switch */}
        <div className="flex items-center space-x-2">
          {/* Write / Preview Mode Toggle */}
          <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-xl p-0.5">
            <button
              onClick={() => setEditorMode('write')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                editorMode === 'write'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Sync badge */}
          {syncStatus === 'saving' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
              <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Saving...</span>
            </div>
          )}

          {syncStatus === 'saved' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs" title="Synced with Supabase Cloud">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
              <span className="hidden sm:inline">Cloud Synced</span>
            </div>
          )}

          {syncStatus === 'local' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-slate-300 text-xs" title="Saved locally in browser">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Saved locally</span>
            </div>
          )}

          {syncStatus === 'error' && (
            <button
              onClick={onForceSave}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-950/40 border border-red-800 text-red-300 text-xs hover:bg-red-900/40 transition cursor-pointer"
              title={errorMessage || 'Error saving. Click to retry.'}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          {/* Quick Note Actions */}
          <div className="flex items-center space-x-1 border-l border-white/[0.08] pl-2">
            <button
              onClick={handleCopyNote}
              disabled={!content}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition cursor-pointer"
              title="Copy notes"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownloadNote}
              disabled={!content}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition cursor-pointer"
              title="Download Markdown note (.md)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Formatting & Study Tag Chips */}
      <div className="px-4 py-2 bg-card/40 border-b border-white/[0.08] flex items-center justify-between gap-2 flex-shrink-0 overflow-x-auto">
        {/* Markdown Toolbar */}
        <div className="flex items-center space-x-1 text-slate-400 text-xs">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'bold')}
            className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'italic')}
            className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n### ', '\n', 'Section Title')}
            className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
            title="Heading"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n- ', '\n', 'Item')}
            className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n> ', '\n', 'Scripture quote or reflection')}
            className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
            title="Quote block"
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
              insertFormatting(`\n*Reflected on: ${now}*\n\n`);
            }}
            className="p-1.5 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
            title="Timestamp"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Journaling Tag Chips */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => insertTemplate('### 🕊️ Prayer & Thanksgiving')}
            className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 text-slate-300 hover:text-amber-300 transition text-[11px] cursor-pointer"
          >
            + Prayer
          </button>
          <button
            onClick={() => insertTemplate('### 🌟 God\'s Promise')}
            className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 text-slate-300 hover:text-amber-300 transition text-[11px] cursor-pointer"
          >
            + Promise
          </button>
          <button
            onClick={() => insertTemplate('### 📖 Sermon & Study Notes')}
            className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 text-slate-300 hover:text-amber-300 transition text-[11px] cursor-pointer"
          >
            + Study
          </button>
          <button
            onClick={() => insertTemplate('### 💡 Personal Application')}
            className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/30 text-slate-300 hover:text-amber-300 transition text-[11px] cursor-pointer"
          >
            + Life Application
          </button>
        </div>
      </div>

      {/* Note Content Area */}
      <div className="flex-1 p-4 sm:p-6 relative flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            <Sparkles className="w-4 h-4 animate-spin text-amber-500 mr-2" />
            Loading chapter note...
          </div>
        ) : editorMode === 'write' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Reflections, study notes, and insights for ${bookName} ${chapterNumber}...\n\n(Tip: Click "Quote in Notes" on any verse in the Bible panel to quote scripture citations, or click tags above)`}
            className="flex-1 w-full p-4 bg-black/30 border border-white/[0.08] rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 font-sans text-sm sm:text-base leading-relaxed resize-none transition"
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 bg-black/20 border border-white/[0.08] rounded-2xl">
            {renderSimpleMarkdown(content)}
          </div>
        )}
      </div>

      {/* Editor Footer */}
      <div className="px-4 sm:px-6 py-2 bg-card/60 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">Auto-saved continuously</span>
        </span>

        {lastSavedAt && (
          <span className="text-slate-500 text-[11px] font-mono">
            Saved {lastSavedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

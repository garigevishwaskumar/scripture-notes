'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Key, ShieldCheck, AlertCircle, Sparkles, BookOpen, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    isConfigured,
    enableGuestMode,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    if (mode === 'magic') {
      const { error } = await signInWithEmail(email);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Check your inbox! We sent you a magic login link.');
      }
    } else if (mode === 'signin') {
      if (!password) {
        setErrorMsg('Please enter your password.');
        setLoading(false);
        return;
      }
      const { error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        onClose();
      }
    } else {
      // signup
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Account created! Please check your email to confirm registration or sign in.');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0c101a] border border-white/[0.1] rounded-3xl shadow-2xl shadow-black/80 p-6 sm:p-7 text-slate-100 overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-display">
              {mode === 'signin' ? 'Sign In to ScriptureNotes' : mode === 'signup' ? 'Create Your Account' : 'Magic Link Sign In'}
            </h3>
            <p className="text-xs text-slate-400">Private personal notes synced with every chapter</p>
          </div>
        </div>

        {/* Supabase status warning if not configured yet */}
        {!isConfigured && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Supabase Notice:</span>
                <p className="mt-1 text-slate-300">
                  Supabase credentials are not configured in <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">.env.local</code>.
                  Your notes will still save automatically to local browser storage so nothing is lost!
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-slate-200 font-semibold text-sm flex items-center justify-center space-x-3 transition cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-white/[0.08]"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase tracking-wider font-semibold font-mono">
            Or with email
          </span>
          <div className="flex-grow border-t border-white/[0.08]"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2 pl-9 bg-white/[0.05] border border-white/[0.1] focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 pl-9 bg-white/[0.05] border border-white/[0.1] focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-amber-500/25 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
          </button>
        </form>

        {/* Mode switch */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-xs text-slate-400">
          {mode === 'signin' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                Need an account? Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode('magic')}
                className="text-slate-400 hover:text-white hover:underline cursor-pointer"
              >
                Passwordless Magic Link
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-amber-400 hover:underline w-full text-center cursor-pointer"
            >
              Already have an account? Sign In
            </button>
          )}
        </div>

        {/* Privacy & Data Security Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>How your data is protected</span>
          </div>
          <ul className="space-y-1 text-slate-400 leading-tight list-disc pl-3.5">
            <li>Your account is securely authenticated through your private Supabase database.</li>
            <li>Row-Level Security guarantees only you can access and read your personal notes.</li>
          </ul>
        </div>

        {/* Continue as guest */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              enableGuestMode();
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-amber-300 font-medium transition cursor-pointer"
          >
            Don&apos;t want to sign in? <span className="underline text-amber-400">Continue as Guest</span> (100% offline)
          </button>
        </div>
      </div>
    </div>
  );
}

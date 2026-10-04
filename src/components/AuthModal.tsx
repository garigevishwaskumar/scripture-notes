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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              {mode === 'signin' ? 'Sign In to ScriptureNotes' : mode === 'signup' ? 'Create Your Account' : 'Magic Link Sign In'}
            </h3>
            <p className="text-xs text-slate-400">Private notes linked to every chapter of the Bible</p>
          </div>
        </div>

        {/* Supabase status warning if not configured yet */}
        {!isConfigured && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Supabase Setup Notice:</span>
                <p className="mt-1 text-slate-300">
                  Supabase credentials are not yet configured in <code className="text-amber-300 bg-slate-900/80 px-1 py-0.5 rounded">.env.local</code>.
                  Your notes will still save automatically to local browser storage so nothing is lost!
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm flex items-center justify-center space-x-3 transition cursor-pointer disabled:opacity-50"
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
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Or with email
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2 pl-9 bg-slate-900/90 border border-slate-750 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 pl-9 bg-slate-900/90 border border-slate-750 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
          </button>
        </form>

        {/* Mode switch */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          {mode === 'signin' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-amber-400 hover:underline"
              >
                Need an account? Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode('magic')}
                className="text-slate-400 hover:text-slate-200 hover:underline"
              >
                Passwordless Magic Link
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-amber-400 hover:underline w-full text-center"
            >
              Already have an account? Sign In
            </button>
          )}
        </div>

        {/* Continue as guest */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              enableGuestMode();
              onClose();
            }}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            Continue as Guest (Local storage notes)
          </button>
        </div>
      </div>
    </div>
  );
}

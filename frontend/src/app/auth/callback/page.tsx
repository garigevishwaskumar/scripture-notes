'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      router.replace('/');
    }).catch((err) => {
      console.error('Auth callback error:', err);
      router.replace('/');
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-slate-100 p-4">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <h2 className="text-xl font-semibold text-slate-200">Completing Sign In...</h2>
        <p className="text-sm text-slate-400">Synchronizing your ScriptureNotes account...</p>
      </div>
    </div>
  );
}

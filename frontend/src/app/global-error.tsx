'use client';

/**
 * Global Error Boundary for Next.js App Router
 * Catches errors in root layout and provides fallback UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#080b11] text-white p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
          <h2 className="text-xl font-bold mb-2 text-slate-100 font-serif">Something went wrong</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {error?.message || 'An unexpected error occurred while loading the application.'}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

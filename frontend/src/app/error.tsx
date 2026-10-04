'use client';

/**
 * Standard Error Boundary for Next.js App Router route segments.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-md">
        <h2 className="text-lg font-bold mb-2 text-[var(--foreground)] font-serif">Scripture View Error</h2>
        <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
          {error?.message || 'Unable to display chapter. Please check your connection and retry.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

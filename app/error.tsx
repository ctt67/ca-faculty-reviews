"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center max-w-md">
        <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
        <p className="mt-3 text-slate-500 text-sm">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}

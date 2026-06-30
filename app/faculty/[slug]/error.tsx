"use client";

import { useEffect } from "react";

export default function FacultyError({
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
    <main className="min-h-screen bg-slate-100">
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-extrabold">Could not load faculty</h1>
          <p className="mt-3 text-slate-400">There was a problem loading this page.</p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500 mb-6">Please try again or return to the home page.</p>
          <div className="flex gap-3 justify-center">
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
      </section>
    </main>
  );
}

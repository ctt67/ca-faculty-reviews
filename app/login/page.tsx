"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";

function LoginContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  return (
    <button
      onClick={() => signInWithGoogle(next)}
      className="mt-8 w-full flex items-center justify-center gap-3 bg-gold text-ink py-3.5 rounded-xl font-semibold text-sm hover:bg-gold/90 transition"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-parchment flex items-center justify-center px-4">

      <div className="max-w-md w-full">

        {/* Brand */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block font-playfair text-2xl font-bold">
            <span className="text-gold">Care</span><span className="text-navy">Views</span>
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="font-playfair text-2xl font-bold text-ink">
            Sign in to write a review
          </h1>
          <p className="mt-2 text-ink/60 text-sm leading-relaxed">
            Google sign-in helps us keep reviews genuine and reduce spam. Your email is never shown publicly.
          </p>

          {/* Trust points */}
          <div className="mt-6 space-y-2.5">
            {[
              "Reduces spam and fake reviews",
              "Prevents duplicate submissions",
              "Your email is never displayed publicly",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-ink/70">
                <span className="w-4 h-4 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                  <span className="text-gold text-[10px] font-bold">✓</span>
                </span>
                {item}
              </div>
            ))}
          </div>

          <Suspense fallback={
            <button
              disabled
              className="mt-8 w-full bg-gold/50 text-ink py-3.5 rounded-xl font-semibold text-sm opacity-60 cursor-not-allowed"
            >
              Continue with Google
            </button>
          }>
            <LoginContent />
          </Suspense>

          <p className="mt-5 text-center text-[11px] text-ink/35 leading-relaxed">
            By continuing, you agree to our community guidelines and confirm you are a genuine CA student.
          </p>
        </div>

      </div>
    </main>
  );
}

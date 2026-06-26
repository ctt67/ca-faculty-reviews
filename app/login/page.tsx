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
            className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition"
        >
            Continue with Google
        </button>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

                <h1 className="text-3xl font-extrabold text-slate-900">
                    Sign in to write a review
                </h1>

                <p className="mt-4 text-slate-600 leading-relaxed">
                    We require Google sign-in to help keep reviews genuine and reduce spam.
                </p>

                <div className="mt-8 space-y-3">
                    <div className="flex gap-3">
                        <span>✓</span>
                        <span>Reduce spam and fake reviews</span>
                    </div>
                    <div className="flex gap-3">
                        <span>✓</span>
                        <span>Prevent duplicate submissions</span>
                    </div>
                    <div className="flex gap-3">
                        <span>✓</span>
                        <span>Your email is never displayed publicly</span>
                    </div>
                </div>

                <Suspense fallback={
                    <button
                        disabled
                        className="mt-10 w-full bg-blue-600 text-white rounded-xl py-3 font-semibold opacity-60"
                    >
                        Continue with Google
                    </button>
                }>
                    <LoginContent />
                </Suspense>

            </div>

        </main>
    );
}

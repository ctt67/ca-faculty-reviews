"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  source?: string;
  scheme?: "light" | "dark";
};

export default function NewsletterSignup({ source = "footer", scheme = "dark" }: Props) {
  const [email, setEmail]     = useState("");
  const [state, setState]     = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setMessage("Enter a valid email address.");
      setState("error");
      return;
    }
    setState("loading");
    const { error } = await supabase.from("subscribers").insert({ email: trimmed, source });
    if (!error || error.code === "23505") {
      setMessage("You're in. We'll keep you updated.");
      setState("done");
    } else {
      setMessage("Something went wrong. Try again.");
      setState("error");
    }
  };

  const inputCls = scheme === "dark"
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-gold"
    : "bg-white border-slate-200 text-ink placeholder:text-ink/35 focus:border-navy";

  const btnCls = scheme === "dark"
    ? "bg-gold text-ink hover:opacity-90"
    : "bg-navy text-white hover:opacity-90";

  const labelCls = scheme === "dark" ? "text-white/50" : "text-ink/50";

  if (state === "done") {
    return (
      <p className={`text-sm ${labelCls}`}>
        ✓ {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${labelCls}`}>
        Stay updated
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
          placeholder="your@email.com"
          className={`flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none transition ${inputCls}`}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition shrink-0 ${btnCls} disabled:opacity-50`}
        >
          {state === "loading" ? "…" : "Join"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-1.5 text-xs text-red-400">{message}</p>
      )}
    </form>
  );
}

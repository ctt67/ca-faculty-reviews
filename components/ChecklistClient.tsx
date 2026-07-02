"use client";

import { useState, useEffect } from "react";
import { CHECKLIST_GROUPS, CHECKLIST_REMEMBER } from "@/lib/checklist-content";

const STORAGE_KEY = "cv_buying_checklist_v1";

export default function ChecklistClient() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {}
  }, [checked, loaded]);

  const total = CHECKLIST_GROUPS.reduce((s, g) => s + g.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const allDone = done === total;

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function reset() {
    setChecked({});
  }

  return (
    <div>
      {/* Progress */}
      <div className="sticky top-0 z-10 bg-parchment/95 backdrop-blur-sm py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-200 mb-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="text-sm font-semibold text-ink tabular-nums">
            {done} / {total} cleared
          </p>
          {done > 0 && (
            <button onClick={reset} className="text-xs text-ink/40 hover:text-ink underline underline-offset-2 transition">
              Reset
            </button>
          )}
        </div>
        <div className="bg-slate-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${allDone ? "bg-green-500" : "bg-gold"}`}
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Groups */}
      {CHECKLIST_GROUPS.map((g, gi) => (
        <div key={g.head} className="mb-7">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-gold mb-3">{g.head}</p>
          <div className="space-y-2">
            {g.items.map((item, ii) => {
              const id = `${gi}-${ii}`;
              const isChecked = !!checked[id];
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className={`w-full flex items-start gap-3.5 text-left rounded-xl border p-4 transition ${
                    isChecked
                      ? "bg-white/60 border-slate-100"
                      : "bg-white border-slate-200 hover:border-gold/40 shadow-sm"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                      isChecked ? "bg-green-500 border-green-500 text-white" : "border-slate-300"
                    }`}
                  >
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.5L4.5 9L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm leading-relaxed transition ${isChecked ? "text-ink/35 line-through decoration-ink/20" : "text-ink/80"}`}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Verdict */}
      <div className={`rounded-2xl p-7 transition ${allDone ? "bg-green-50 border border-green-200" : "bg-white border border-slate-200"}`}>
        <p className="text-[10px] font-semibold tracking-widest uppercase text-ink/40 mb-2">
          One sentence to remember
        </p>
        <p className="font-playfair font-bold text-ink text-lg leading-snug">{CHECKLIST_REMEMBER}</p>
        {allDone && (
          <p className="text-green-700 text-sm font-semibold mt-3">
            All clear. You're ready to buy — go in with your eyes open. 🎉
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface Props {
  label: string;
  hint: string;
  v1: number;
  v2: number;
  name1: string;
  name2: string;
  hasReviews1: boolean;
  hasReviews2: boolean;
}

export default function MetricCard({ label, hint, v1, v2, name1, name2, hasReviews1, hasReviews2 }: Props) {
  const [showDesc, setShowDesc] = useState(false);

  const bothHaveData = hasReviews1 && hasReviews2;
  const isWinner1 = bothHaveData && v1 > v2;
  const isWinner2 = bothHaveData && v2 > v1;
  const isTie = bothHaveData && v1 === v2;

  const barColor1 = isWinner1 ? "bg-navy" : isTie ? "bg-navy/40" : "bg-slate-200";
  const barColor2 = isWinner2 ? "bg-navy" : isTie ? "bg-navy/40" : "bg-slate-200";

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-sm font-semibold text-ink">{label}</h3>
        <button
          onClick={() => setShowDesc((p) => !p)}
          className="text-[10px] text-ink/40 hover:text-ink/65 transition flex items-center gap-1 shrink-0 pt-0.5"
        >
          {showDesc ? "▲" : "▼"} What does this measure?
        </button>
      </div>

      {/* Description */}
      {showDesc && (
        <div className="bg-parchment rounded-lg px-4 py-3 mb-4 text-xs text-ink/60 leading-relaxed">
          {hint}
        </div>
      )}

      {/* Bars */}
      <div className="space-y-3">
        {/* Faculty 1 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-ink/55 truncate max-w-[55%]">{name1}</span>
            <div className="flex items-center gap-1">
              {hasReviews1 ? (
                <>
                  <span className={`text-sm font-bold tabular-nums ${isWinner1 ? "text-ink" : "text-ink/40"}`}>
                    {v1}
                  </span>
                  {isWinner1 && <span className="text-gold text-xs font-bold leading-none">↑</span>}
                  {isTie && <span className="text-ink/30 text-xs ml-0.5">=</span>}
                </>
              ) : (
                <span className="text-ink/25 text-sm">—</span>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor1}`}
              style={{ width: hasReviews1 ? `${(v1 / 5) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {/* Faculty 2 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-ink/55 truncate max-w-[55%]">{name2}</span>
            <div className="flex items-center gap-1">
              {hasReviews2 ? (
                <>
                  <span className={`text-sm font-bold tabular-nums ${isWinner2 ? "text-ink" : "text-ink/40"}`}>
                    {v2}
                  </span>
                  {isWinner2 && <span className="text-gold text-xs font-bold leading-none">↑</span>}
                  {isTie && <span className="text-ink/30 text-xs ml-0.5">=</span>}
                </>
              ) : (
                <span className="text-ink/25 text-sm">—</span>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor2}`}
              style={{ width: hasReviews2 ? `${(v2 / 5) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { getRatingLabel } from "@/lib/format";
import { ratingFields } from "@/lib/rating-config";

function getScoreWord(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Poor";
  return "Very Poor";
}

interface Props {
  review: Record<string, unknown> & { rating_reasons?: Record<string, string> | null };
}

export default function ReviewRatingDetails({ review }: Props) {
    const [expanded, setExpanded] = useState(false);

    const row = review as unknown as Record<string, unknown>;
    const entries = ratingFields
        .map((field) => ({
            key: field.key,
            rating: row[field.key],
            reason: review.rating_reasons?.[field.key],
        }))
        .filter(
            (item): item is { key: string; rating: number; reason: string | undefined } =>
                typeof item.rating === "number" && item.rating > 0
        );

    if (entries.length === 0) return null;

    const reasonCount = entries.filter(
        (e) => typeof e.reason === "string" && e.reason.trim().length > 0
    ).length;

    return (
        <div className="mt-8 border-t border-slate-100 pt-5">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-parchment"
            >
                <div className="text-left">
                    <h4 className="text-sm font-semibold text-ink">
                        Rating Breakdown
                    </h4>
                    <p className="mt-0.5 text-[10px] text-ink/40 uppercase tracking-wider">
                        {entries.length} {entries.length === 1 ? "rating" : "ratings"}
                        {reasonCount > 0 && ` · ${reasonCount} ${reasonCount === 1 ? "explanation" : "explanations"}`} from this reviewer
                    </p>
                </div>
                <span className="text-ink/30 text-sm ml-4 shrink-0">{expanded ? "▲" : "▼"}</span>
            </button>

            {expanded && (
                <div className="mt-4 space-y-2">
                    {entries.map((item) => (
                        <div key={item.key} className="flex items-start gap-2">
                            <span className="shrink-0 bg-gold/10 text-ink font-bold rounded-lg px-2 py-0.5 text-xs min-w-[36px] text-center">
                                {item.rating}/5
                            </span>
                            <div className="flex-1 min-w-0">
                                <span className="text-ink text-xs font-medium">{getRatingLabel(item.key)}</span>
                                <span className="text-ink/40 text-xs ml-1.5">— {getScoreWord(item.rating)}</span>
                                {item.reason && item.reason.trim().length > 0 && (
                                    <p className="text-ink/50 text-xs mt-0.5 italic">"{item.reason}"</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

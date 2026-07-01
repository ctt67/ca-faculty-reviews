"use client";

import { useState } from "react";
import { getRatingLabel } from "@/lib/format";
import { ratingFields } from "@/lib/rating-config";

interface Props {
  review: Record<string, unknown> & { rating_reasons?: Record<string, string> | null };
}

export default function ReviewRatingDetails({ review }: Props) {
    const [expanded, setExpanded] = useState(false);

    if (!review.rating_reasons) return null;

    const row = review as unknown as Record<string, unknown>;
    const entries = ratingFields
        .map((field) => ({
            key: field.key,
            reason: review.rating_reasons?.[field.key],
            rating: row[field.key],
        }))
        .filter(
            (item): item is { key: string; reason: string; rating: number } =>
                typeof item.reason === "string" &&
                item.reason.trim().length > 0 &&
                typeof item.rating === "number"
        );

    if (entries.length === 0) return null;

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
                        {entries.length} {entries.length === 1 ? "explanation" : "explanations"} from reviewer
                    </p>
                </div>
                <span className="text-ink/30 text-sm">{expanded ? "▲" : "▼"}</span>
            </button>

            {expanded && (
                <div className="mt-4 space-y-3">
                    {entries.map((item) => (
                        <div
                            key={item.key}
                            className="rounded-xl border border-slate-100 bg-parchment/50 p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-ink">
                                    {getRatingLabel(item.key)}
                                </span>
                                <span className="text-gold font-bold text-sm">
                                    ★ {item.rating.toFixed(1)}
                                </span>
                            </div>
                            <p className="text-sm italic leading-relaxed text-ink/60">
                                "{item.reason}"
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
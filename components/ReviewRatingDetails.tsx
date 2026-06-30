"use client";

import { useState } from "react";
import { getRatingLabel } from "@/lib/format";
import { ratingFields } from "@/lib/rating-config";
import type { Review } from "@/lib/types";

interface Props {
  review: Review;
}

export default function ReviewRatingDetails({ review }: Props) {
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

    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mt-8 border-t border-slate-200 pt-6">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition hover:bg-slate-50"
            >
                <div className="text-left">
                    <h4 className="font-semibold text-slate-900">
                        Rating Breakdown
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                        {entries.length} detailed{" "}
                        {entries.length === 1 ? "rating" : "ratings"}
                    </p>
                </div>

                <div className="text-slate-400 text-lg">
                    {expanded ? "▲" : "▼"}
                </div>
            </button>

            {expanded && (
                <div className="mt-5 space-y-4">
                    {entries.map((item) => (
                        <div
                            key={item.key}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-medium text-slate-900">
                                    {getRatingLabel(item.key)}
                                </div>

                                <div className="font-bold text-blue-600">
                                    ★ {item.rating.toFixed(1)}
                                </div>
                            </div>

                            <p className="mt-3 text-sm italic leading-relaxed text-slate-600">
                                "{item.reason}"
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
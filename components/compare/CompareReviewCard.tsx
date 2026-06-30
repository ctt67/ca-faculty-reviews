"use client";

import { useState } from "react";
import { getRatingLabel } from "@/lib/format";

function getScoreWord(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Poor";
  return "Very Poor";
}

interface Props {
  review: Record<string, any>;
  ratingFields: string[];
}

export default function CompareReviewCard({ review, ratingFields }: Props) {
  const [showRatings, setShowRatings] = useState(false);

  const ratedFields = ratingFields.filter((f) => review[f] != null);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-5">
        {review.course_type && (
          <div>
            <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Course</p>
            <p className="text-sm font-medium text-ink mt-0.5">{review.course_type}</p>
          </div>
        )}
        {review.student_type && (
          <div>
            <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Reviewer</p>
            <p className="text-sm font-medium text-ink mt-0.5">{review.student_type}</p>
          </div>
        )}
        {review.attempt && (
          <div>
            <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Attempt</p>
            <p className="text-sm font-medium text-ink mt-0.5">{review.attempt}</p>
          </div>
        )}
        {review.teacher_style && (
          <div>
            <p className="text-[10px] text-ink/40 uppercase tracking-wider font-medium">Teaching Style</p>
            <p className="text-sm font-medium text-ink mt-0.5">{review.teacher_style}</p>
          </div>
        )}
      </div>

      {/* Recommend badge */}
      {review.would_recommend !== null && review.would_recommend !== undefined && (
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
            review.would_recommend
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}>
            {review.would_recommend ? "✓ Recommends" : "✗ Does not recommend"}
          </span>
        </div>
      )}

      {/* Best for */}
      {review.best_for?.length > 0 && (
        <p className="text-sm text-ink/60 mb-4">
          <span className="font-semibold text-ink">Best for:</span>{" "}
          {review.best_for.join(", ")}
        </p>
      )}

      {/* Pros / Cons */}
      {(review.pros || review.cons) && (
        <div className="space-y-2 mb-4">
          {review.pros && (
            <div className="border-l-[3px] border-green-400 pl-3 py-0.5">
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Pros</p>
              <p className="text-ink/70 text-sm leading-relaxed">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="border-l-[3px] border-red-400 pl-3 py-0.5">
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">Cons</p>
              <p className="text-ink/70 text-sm leading-relaxed">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Review text */}
      {review.review_text && (
        <div className="border-l-[3px] border-gold pl-4 mb-4">
          <p className="text-ink/65 text-sm leading-relaxed">{review.review_text}</p>
        </div>
      )}

      {/* Rating breakdown — collapsed by default */}
      {ratedFields.length > 0 && (
        <div className="border-t border-slate-100 pt-4 mt-2">
          <button
            onClick={() => setShowRatings((p) => !p)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 hover:bg-parchment transition"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-ink">Rating Breakdown</p>
              <p className="text-[10px] text-ink/40 uppercase tracking-wider mt-0.5">
                {ratedFields.length} {ratedFields.length === 1 ? "rating" : "ratings"} from this reviewer
              </p>
            </div>
            <span className="text-ink/30 text-sm ml-4 shrink-0">{showRatings ? "▲" : "▼"}</span>
          </button>

          {showRatings && (
            <div className="mt-4 space-y-2">
              {ratingFields.map((field) => {
                const score = review[field];
                if (score == null) return null;
                const reason = review.rating_reasons?.[field];
                return (
                  <div key={field} className="flex items-start gap-2">
                    <span className="shrink-0 bg-gold/10 text-ink font-bold rounded-lg px-2 py-0.5 text-xs min-w-[36px] text-center">
                      {score}/5
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-ink text-xs font-medium">{getRatingLabel(field)}</span>
                      <span className="text-ink/40 text-xs ml-1.5">— {getScoreWord(score)}</span>
                      {reason && (
                        <p className="text-ink/50 text-xs mt-0.5 italic">"{reason}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

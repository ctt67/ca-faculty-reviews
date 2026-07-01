"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PUBLIC_REVIEW_COLUMNS } from "@/lib/format";
import ReviewRatingDetails from "@/components/ReviewRatingDetails";
import ReviewVote from "@/components/ReviewVote";
import ReportReview from "@/components/ReportReview";

const LOAD_COUNT = 5;

type VoteMap = Record<string, { up: number; down: number }>;
type Review = Record<string, any>;

const sortConfig: Record<string, { column: string; ascending: boolean }> = {
  newest:  { column: "created_at",     ascending: false },
  oldest:  { column: "created_at",     ascending: true  },
  highest: { column: "overall_rating", ascending: false },
  lowest:  { column: "overall_rating", ascending: true  },
  helpful: { column: "created_at",     ascending: false },
};

interface Props {
  initialReviews: Review[];
  initialVotes: VoteMap;
  total: number;
  slug: string;
  sort: string;
  filterAttempt: string;
  filterCourseType: string;
  isHelpful: boolean;
}

export default function ReviewsLoadMore({
  initialReviews,
  initialVotes,
  total,
  slug,
  sort,
  filterAttempt,
  filterCourseType,
  isHelpful,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [votes, setVotes] = useState<VoteMap>(initialVotes);
  const [loading, setLoading] = useState(false);

  const hasMore = !isHelpful && reviews.length < total;

  async function loadMore() {
    setLoading(true);
    const offset = reviews.length;
    const { column, ascending } = sortConfig[sort] ?? sortConfig.newest;

    let q = supabase
      .from("reviews")
      .select(PUBLIC_REVIEW_COLUMNS)
      .eq("faculty_slug", slug)
      .eq("approved", true)
      .order(column, { ascending })
      .range(offset, offset + LOAD_COUNT - 1);

    if (filterAttempt)    q = q.eq("attempt",     filterAttempt)    as typeof q;
    if (filterCourseType) q = q.eq("course_type", filterCourseType) as typeof q;

    const { data: newReviews } = await q;
    if (!newReviews?.length) { setLoading(false); return; }

    const newIds = (newReviews as unknown as Array<{ id: number }>).map((r) => r.id).filter(Boolean);
    const { data: voteData } = newIds.length
      ? await supabase.from("review_votes").select("review_id, vote_type").in("review_id", newIds)
      : { data: [] };

    setVotes((prev) => {
      const next = { ...prev };
      for (const v of voteData ?? []) {
        const entry = next[String(v.review_id)] ?? { up: 0, down: 0 };
        if (v.vote_type === "up") entry.up++;
        else entry.down++;
        next[String(v.review_id)] = entry;
      }
      return next;
    });
    setReviews((prev) => [...prev, ...(newReviews as unknown as Review[])]);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 sm:p-7">

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
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
                {review.would_recommend ? "✓ Recommends this course" : "✗ Does not recommend"}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
            <div className="border-l-[3px] border-gold pl-4">
              <p className="text-ink/65 text-sm leading-relaxed">{review.review_text}</p>
            </div>
          )}

          <ReviewRatingDetails review={review} />

          {/* Vote + Report row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <ReviewVote
                reviewId={review.id as number}
                initialUpvotes={votes[String(review.id)]?.up ?? 0}
                initialDownvotes={votes[String(review.id)]?.down ?? 0}
              />
              {review.updated_at && (
                <span className="text-[10px] text-ink/30 italic">
                  Edited {new Date(review.updated_at as string).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <ReportReview reviewId={review.id as number} />
          </div>

        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-3.5 rounded-xl border border-slate-200 text-sm font-medium text-ink hover:bg-slate-50 transition disabled:opacity-50"
        >
          {loading ? "Loading…" : "Show more reviews"}
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ratingFields } from "@/lib/rating-config";


const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

export default function AdminClient() {

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);

      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false });

      setReviews(data ?? []);
      setLoading(false);
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  const approveReview = async (reviewId: number) => {
    await supabase.from("reviews").update({ approved: true }).eq("id", reviewId);
    setReviews(reviews.filter((r) => r.id !== reviewId));
  };

  const rejectReview = async (reviewId: number) => {
    await supabase.from("reviews").delete().eq("id", reviewId);
    setReviews(reviews.filter((r) => r.id !== reviewId));
  };

  if (loading) {
    return <main className="p-10 text-slate-500">Loading...</main>;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-100">
        <section className="bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-5xl font-extrabold">Access Denied</h1>
            <p className="mt-4 text-slate-300">This page is only available to administrators.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-extrabold">Pending Reviews</h1>
          <p className="mt-4 text-slate-300">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} awaiting moderation.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">

        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900">All caught up!</h2>
            <p className="text-slate-500 mt-2">No pending reviews.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <a
                      href={`/faculty/${review.faculty_slug}`}
                      className="text-xl font-bold text-blue-600 hover:underline"
                    >
                      {review.faculty_slug}
                    </a>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {review.teacher_style && (
                        <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">{review.teacher_style}</span>
                      )}
                      {review.student_type && (
                        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.student_type}</span>
                      )}
                      {review.attempt && (
                        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.attempt}</span>
                      )}
                      {review.course_type && (
                        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.course_type}</span>
                      )}
                      {review.would_recommend !== null && review.would_recommend !== undefined && (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${review.would_recommend ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                          {review.would_recommend ? "✓ Recommended" : "✗ Not Recommended"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0">
                    {new Date(review.created_at).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Ratings grid — dynamic from rating-config */}
                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ratings</div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {ratingFields.map((field) =>
                      review[field.key] != null ? (
                        <div key={field.key} className="bg-slate-50 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-slate-900">{review[field.key]}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{field.label}</div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>

                {/* Best for */}
                {review.best_for?.length > 0 && (
                  <p className="text-sm text-slate-600 mb-4">
                    <span className="font-semibold text-slate-800">Best For:</span>{" "}
                    {review.best_for.join(", ")}
                  </p>
                )}

                {/* Pros / Cons */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {review.pros && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-green-700 mb-1">PROS</p>
                      <p className="text-slate-700 text-sm">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-red-600 mb-1">CONS</p>
                      <p className="text-slate-700 text-sm">{review.cons}</p>
                    </div>
                  )}
                </div>

                {/* Review text */}
                {review.review_text && (
                  <div className="bg-slate-50 rounded-xl p-4 mb-5">
                    <p className="text-xs font-semibold text-slate-500 mb-2">REVIEW</p>
                    <p className="text-slate-800 text-sm leading-relaxed">{review.review_text}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => approveReview(review.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectReview(review.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition"
                  >
                    Reject
                  </button>
                  <a
                    href={`/faculty/${review.faculty_slug}`}
                    className="text-slate-500 hover:text-slate-900 px-5 py-2.5 rounded-xl text-sm transition border border-slate-200 hover:border-slate-400"
                    target="_blank"
                  >
                    View Faculty
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}

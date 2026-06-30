import { supabase } from "@/lib/supabase";
import { getAverageMetric, getOverallRating, getRatingFields } from "@/lib/ratings";
import {
  formatFieldName,
  formatValue,
  getRatingLabel,
  getRatingHint,
  PUBLIC_FACULTY_FIELDS,
} from "@/lib/format";


import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateCompareMetadata } from "@/lib/seo";

// Converts a 1–5 numeric score to a word — used in per-review rating breakdown
function getScoreWord(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Poor";
  return "Very Poor";
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ faculty1: string; faculty2: string }>;
}): Promise<Metadata> {
  const { faculty1: faculty1Slug, faculty2: faculty2Slug } = await params;

  const [{ data: faculty1 }, { data: faculty2 }] = await Promise.all([
    supabase
      .from("faculties")
      .select("faculty_name, subject, level")
      .eq("slug", faculty1Slug)
      .single(),

    supabase
      .from("faculties")
      .select("faculty_name, subject, level")
      .eq("slug", faculty2Slug)
      .single(),
  ]);

  if (!faculty1 || !faculty2) {
    return {
      title: "Comparison Not Found | CA Reviews",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return generateCompareMetadata({
    faculty1: faculty1.faculty_name,
    faculty2: faculty2.faculty_name,

    faculty1Slug,
    faculty2Slug,

    subject: faculty1.subject,
    level: faculty1.level,
  });
}

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ faculty1: string; faculty2: string }>;
}) {
  const { faculty1: faculty1Slug, faculty2: faculty2Slug } = await params;

  const [{ data: faculty1 }, { data: faculty2 }] = await Promise.all([
    supabase.from("faculties").select("*").eq("slug", faculty1Slug).single(),
    supabase.from("faculties").select("*").eq("slug", faculty2Slug).single(),
  ]);

  if (!faculty1 || !faculty2) {
    notFound();
  }

  const [{ data: reviews1 }, { data: reviews2 }] = await Promise.all([
    supabase.from("reviews").select("*").eq("faculty_slug", faculty1Slug).eq("approved", true),
    supabase.from("reviews").select("*").eq("faculty_slug", faculty2Slug).eq("approved", true),
  ]);

  const faculty1Reviews = reviews1 ?? [];
  const faculty2Reviews = reviews2 ?? [];
  const faculty1Rating = getOverallRating(faculty1Reviews);
  const faculty2Rating = getOverallRating(faculty2Reviews);

  // Faculty detail fields — whitelist from PUBLIC_FACULTY_FIELDS, auto-updates
  const facultyFields = Object.keys(faculty1).filter(
    (field) => PUBLIC_FACULTY_FIELDS.has(field)
  );

  // Rating fields — derived from actual review data, auto-updates
  const ratingFields = getRatingFields(
    faculty1Reviews.length > 0 ? faculty1Reviews : faculty2Reviews
  );

  const hasAnyReviews = faculty1Reviews.length > 0 || faculty2Reviews.length > 0;

  const winner = (v1: number, v2: number) => {
    if (v1 > v2) return "left";
    if (v2 > v1) return "right";
    return "tie";
  };

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <a
            href="/compare"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
          >
            ← Back to Compare
          </a>
          <h1 className="text-5xl md:text-6xl font-extrabold">
            <span className="text-blue-400">{faculty1.faculty_name}</span>
            <span className="text-slate-500 mx-4">vs</span>
            <span className="text-blue-400">{faculty2.faculty_name}</span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg">
            {faculty1.subject} · {faculty1.level}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 space-y-10">

        {/* Overall Rating Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { faculty: faculty1, reviews: faculty1Reviews, rating: faculty1Rating, otherRating: faculty2Rating },
            { faculty: faculty2, reviews: faculty2Reviews, rating: faculty2Rating, otherRating: faculty1Rating },
          ].map(({ faculty, reviews, rating, otherRating }) => (
            <div key={faculty.slug} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{faculty.faculty_name}</h2>
                  <p className="text-slate-500 text-sm mt-1">{faculty.subject}</p>
                </div>
                {rating > otherRating && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Best Rated
                  </span>
                )}
              </div>
              <div className="mt-6">
                <div className="text-6xl font-extrabold text-blue-600">
                  {reviews.length > 0 ? `★ ${rating}` : "—"}
                </div>
                <div className="text-slate-400 text-sm mt-1">Overall Rating</div>
              </div>
              <p className="text-slate-400 text-sm mt-3">{reviews.length} Reviews</p>
            </div>
          ))}
        </div>

        {/* Faculty Details — fully dynamic */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Faculty Details</h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3">
              <div className="p-4 bg-slate-50 font-semibold text-slate-500 text-sm uppercase tracking-wide border-b">Metric</div>
              <div className="p-4 bg-slate-50 font-bold text-slate-900 text-center border-b border-l">{faculty1.faculty_name}</div>
              <div className="p-4 bg-slate-50 font-bold text-slate-900 text-center border-b border-l">{faculty2.faculty_name}</div>

              {facultyFields.map((field) => (
                <div key={field} className="contents">
                  <div className="p-4 border-b text-slate-600 text-sm">{formatFieldName(field)}</div>
                  <div className="p-4 border-b border-l text-center text-slate-900 font-medium text-sm">
                    {formatValue(faculty1[field])}
                  </div>
                  <div className="p-4 border-b border-l text-center text-slate-900 font-medium text-sm">
                    {formatValue(faculty2[field])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ratings Comparison — dynamic from actual review data */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ratings Comparison</h2>
          <p className="mb-4 mt-2 text-sm text-slate-500">
            Ratings are calculated from approved reviews available at the time of viewing.
            Differences may also reflect the number of reviews each faculty has received.
          </p>

          {!hasAnyReviews || ratingFields.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-400">
              No ratings available yet for these faculties.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="p-4 bg-slate-50 font-semibold text-slate-500 text-sm uppercase tracking-wide border-b">Metric</div>
                <div className="p-4 bg-slate-50 font-bold text-slate-900 text-center border-b border-l">{faculty1.faculty_name}</div>
                <div className="p-4 bg-slate-50 font-bold text-slate-900 text-center border-b border-l">{faculty2.faculty_name}</div>

                {ratingFields.map((field) => {
                  const v1 = getAverageMetric(faculty1Reviews, field);
                  const v2 = getAverageMetric(faculty2Reviews, field);
                  const w = winner(v1, v2);
                  return (
                    <div key={field} className="contents">
                      <div className="p-4 border-b text-slate-600 text-sm">
                        <p className="font-medium text-slate-700">{getRatingLabel(field)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{getRatingHint(field)}</p>
                      </div>
                      <div className={`p-4 border-b border-l text-center font-bold text-sm ${w === "left" ? "text-blue-600 bg-blue-50" : "text-slate-900"}`}>
                        {faculty1Reviews.length > 0 ? v1 : "—"}
                        {w === "left" && <span className="ml-1 text-xs">↑</span>}
                      </div>
                      <div className={`p-4 border-b border-l text-center font-bold text-sm ${w === "right" ? "text-blue-600 bg-blue-50" : "text-slate-900"}`}>
                        {faculty2Reviews.length > 0 ? v2 : "—"}
                        {w === "right" && <span className="ml-1 text-xs">↑</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* What Students Are Saying — matches faculty page review card style */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What Students Are Saying</h2>
          <p className="mb-6 -mt-3 text-sm text-slate-500">
            Reviews represent the opinions of individual students and do not necessarily reflect the views of CAFacultyReviews.
          </p>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {[
              { faculty: faculty1, reviews: faculty1Reviews },
              { faculty: faculty2, reviews: faculty2Reviews },
            ].map(({ faculty, reviews }) => (
              <div key={faculty.slug}>

                {/* Column heading */}
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  {faculty.faculty_name}
                  <span className="text-slate-400 font-normal text-sm">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </h3>

                {reviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                    No reviews yet.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                      >

                        {/* Background grid — matches faculty page */}
                        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                          {review.course_type && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Course</p>
                              <p className="font-medium text-slate-900">{review.course_type}</p>
                            </div>
                          )}
                          {review.student_type && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Reviewer</p>
                              <p className="font-medium text-slate-900">{review.student_type}</p>
                            </div>
                          )}
                          {review.attempt && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Attempt</p>
                              <p className="font-medium text-slate-900">{review.attempt}</p>
                            </div>
                          )}
                          {review.teacher_style && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide">Teaching Style</p>
                              <p className="font-medium text-slate-900">{review.teacher_style}</p>
                            </div>
                          )}
                        </div>

                        {/* Recommend badge */}
                        {review.would_recommend !== null && review.would_recommend !== undefined && (
                          <div className="mb-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${review.would_recommend
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                              }`}>
                              {review.would_recommend
                                ? "✓ Reviewer recommends this course"
                                : "✗ Reviewer does not recommend this course"}
                            </span>
                          </div>
                        )}

                        {/* Best For */}
                        {review.best_for?.length > 0 && (
                          <p className="text-sm text-slate-600 mb-4">
                            <span className="font-semibold text-slate-900">Best suited for:</span>{" "}
                            {review.best_for.join(", ")}
                          </p>
                        )}

                        {/* Pros / Cons */}
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          {review.pros && (
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                              <p className="text-xs font-semibold text-green-700 mb-1">PROS</p>
                              <p className="text-slate-700 text-sm">{review.pros}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                              <p className="text-xs font-semibold text-red-600 mb-1">CONS</p>
                              <p className="text-slate-700 text-sm">{review.cons}</p>
                            </div>
                          )}
                        </div>

                        {/* Review text */}
                        {review.review_text && (
                          <div className="border-l-4 border-blue-500 pl-4 mb-4">
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {review.review_text}
                            </p>
                          </div>
                        )}

                        {/* Per-rating breakdown with optional reasons */}
                        {ratingFields.some((f) => review[f] != null) && (
                          <div className="border-t border-slate-100 pt-4 mt-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                              Ratings
                            </p>
                            <div className="space-y-2">
                              {ratingFields.map((field) => {
                                const score = review[field];
                                if (score == null) return null;
                                const reason = review.rating_reasons?.[field];
                                return (
                                  <div key={field} className="flex items-start gap-2 text-sm">

                                    {/* Score badge */}
                                    <span className="shrink-0 bg-blue-50 text-blue-700 font-bold rounded-lg px-2 py-0.5 text-xs min-w-[36px] text-center">
                                      {score}/5
                                    </span>

                                    <div className="flex-1 min-w-0">
                                      {/* Label + word rating on one line */}
                                      <span className="text-slate-700 font-medium">
                                        {getRatingLabel(field)}
                                      </span>
                                      <span className="text-slate-400 text-xs ml-1.5">
                                        — {getScoreWord(score)}
                                      </span>

                                      {/* Reason on next line if provided */}
                                      {reason && (
                                        <p className="text-slate-500 text-xs mt-0.5 italic">
                                          "{reason}"
                                        </p>
                                      )}
                                    </div>

                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}

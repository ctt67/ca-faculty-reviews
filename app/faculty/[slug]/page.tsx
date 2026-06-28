import { supabase } from "@/lib/supabase";
import { getAverageMetric, getOverallRating, getRatingFields } from "@/lib/ratings";
import {
  formatFieldName,
  formatValue,
  getRatingLabel,
  getRatingDescription,
  PUBLIC_FACULTY_FIELDS,
} from "@/lib/format";

import ReviewRatingDetails from "@/components/ReviewRatingDetails";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateFacultyMetadata } from "@/lib/seo";

import { generateFacultySchema } from "@/lib/schema";

function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${Math.min((value / 5) * 100, 100)}%` }}
        />
      </div>
      <span className="text-slate-900 font-bold text-sm w-8 text-right">{value}</span>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: faculty } = await supabase
    .from("faculties")
    .select("slug, faculty_name, subject, level")
    .eq("slug", slug)
    .single();

  if (!faculty) {
    return {
      title: "Faculty Not Found | CA Reviews",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return generateFacultyMetadata(faculty);
}


export default async function FacultyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: faculty } = await supabase
    .from("faculties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!faculty) {
    notFound();
  }


  const { data: facultyReviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("faculty_slug", slug)
    .eq("approved", true);

  const reviews = facultyReviews ?? [];
  const overallRating = getOverallRating(reviews);
  const schema = generateFacultySchema({
    slug: faculty.slug,
    faculty_name: faculty.faculty_name,
    subject: faculty.subject,
    level: faculty.level,
    reviewCount: reviews.length,
    rating: overallRating,
  });

  // Faculty details: all columns except meta/link fields — auto-updates when DB columns are added
  const facultyFields = Object.keys(faculty).filter(
    (field) => PUBLIC_FACULTY_FIELDS.has(field)
  );

  // Rating fields: derived from actual review data — auto-updates when new rating columns are added
  const ratingFields = getRatingFields(reviews);

  return (
    <main className="min-h-screen bg-slate-100">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">

          <a
            href={`/${faculty.level?.toLowerCase()}/${faculty.subject?.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
          >
            ← {faculty.subject}
          </a>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                  {faculty.level}
                </span>
                <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                  {faculty.subject}
                </span>
              </div>
              <h1 className="text-5xl font-extrabold">{faculty.faculty_name}</h1>
              <p className="text-slate-400 mt-3">
                {reviews.length} student {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center shrink-0">
              <div className="text-6xl font-extrabold text-blue-400">
                {reviews.length > 0 ? `★ ${overallRating}` : "—"}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ratings are calculated from approved student reviews and update as new reviews are published.
              </p>
              <div className="text-slate-400 text-sm mt-1">Overall Rating</div>
            </div>
          </div>

        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">

        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Faculty Details — fully dynamic from DB columns */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Faculty Details</h2>
            <div className="space-y-4">
              {facultyFields.map((field) => (
                <div key={field} className="flex justify-between items-start gap-4">
                  <span className="text-slate-500 text-sm shrink-0">
                    {formatFieldName(field)}
                  </span>
                  <span className="font-semibold text-slate-900 text-right text-sm">
                    {formatValue(faculty[field])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <a
            href={`/review/${faculty.slug}`}
            className="w-full text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition block"
          >
            Write Review
          </a>

          {(faculty.website) && (
            <div className="flex flex-col gap-3">
              {faculty.website && (
                <a
                  href={faculty.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
                >
                  Visit Website
                </a>
              )}

            </div>
          )}

          {/* Ratings Summary — dynamic from actual review data */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Ratings</h2>
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm">No ratings yet.</p>
            ) : (
              <div className="space-y-4">
                {ratingFields.map((field) => {



                  return (
                    <div key={field}>
                      <div className="mb-2">
                        <p className="text-slate-700 text-sm font-medium">
                          {getRatingLabel(field)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {getRatingDescription(field)}
                        </p>
                      </div>
                      <RatingBar value={getAverageMetric(reviews, field)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compare CTA */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg">Compare this faculty</h3>
            <p className="text-blue-100 text-sm mt-1">
              See how {faculty.faculty_name} stacks up against others.
            </p>
            <a
              href="/compare"
              className="mt-4 block text-center bg-white text-blue-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
            >
              Go to Compare →
            </a>
          </div>

        </div>

        {/* Right column — reviews */}
        <div className="lg:col-span-2">

          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Student Reviews
            <span className="ml-3 text-slate-400 font-normal text-lg">({reviews.length})</span>
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Reviews represent the opinions of individual students and do not necessarily reflect the views of CAFacultyReviews.
          </p>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              No reviews yet for this faculty.
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7"
                >

                  <div className="grid grid-cols-2 gap-3 mb-5 text-sm">

                    {review.course_type && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Course
                        </p>
                        <p className="font-medium text-slate-900">
                          {review.course_type}
                        </p>
                      </div>
                    )}

                    {review.student_type && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Reviewer
                        </p>
                        <p className="font-medium text-slate-900">
                          {review.student_type}
                        </p>
                      </div>
                    )}

                    {review.attempt && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Attempt
                        </p>
                        <p className="font-medium text-slate-900">
                          {review.attempt}
                        </p>
                      </div>
                    )}

                    {review.teacher_style && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Teaching Style
                        </p>
                        <p className="font-medium text-slate-900">
                          {review.teacher_style}
                        </p>
                      </div>
                    )}

                  </div>

                  {review.would_recommend !== null &&
                    review.would_recommend !== undefined && (
                      <div className="mb-5">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${review.would_recommend
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                            }`}
                        >
                          {review.would_recommend
                            ? "✓ Reviewer recommends this course"
                            : "✗ Reviewer does not recommend this course"}
                        </span>
                      </div>
                    )}

                  {review.best_for?.length > 0 && (
                    <p className="text-sm text-slate-600 mb-4">
                      <span className="font-semibold text-slate-900">
                        Best suited for:
                      </span>{" "}
                      {review.best_for.join(", ")}
                    </p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
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

                  {review.review_text && (
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {review.review_text}
                      </p>
                    </div>
                  )}

                  <ReviewRatingDetails review={review} />

                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </main>
  );
}

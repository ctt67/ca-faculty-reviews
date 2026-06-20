import { supabase } from "@/lib/supabase";
import { getAverageMetric, getOverallRating } from "@/lib/ratings";
import { ratingFields } from "@/lib/rating-config";


function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-slate-900 font-bold text-sm w-8 text-right">{value}</span>
    </div>
  );
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
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Faculty not found</h1>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Home</a>
        </div>
      </main>
    );
  }

  const { data: facultyReviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("faculty_slug", slug)
    .eq("approved", true);

  const reviews = facultyReviews ?? [];
  const overallRating = getOverallRating(reviews);
  const facultyFields = Object.keys(
    faculty
  ).filter(
    (field) =>
      ![
        "id",
        "slug",
        "faculty_name",
        "subject",
        "level",
        "active",
        "website",
        "youtube",
        "created_at",
        "updated_at",
      ].includes(field)
  );



  const formatFieldName = (
    field: string
  ) =>
    field
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (c) => c.toUpperCase()
      );
  return (
    <main className="min-h-screen bg-slate-100">

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
              <p className="text-slate-400 mt-3">{reviews.length} student {reviews.length === 1 ? "review" : "reviews"}</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center shrink-0">
              <div className="text-6xl font-extrabold text-blue-400">
                {reviews.length > 0 ? `★ ${overallRating}` : "—"}
              </div>
              <div className="text-slate-400 text-sm mt-1">Overall Rating</div>
            </div>
          </div>

        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">

        {/* Left column — details + ratings */}
        <div className="lg:col-span-1 space-y-6">

          {/* Faculty Details */}
          <div className="space-y-4">

            {facultyFields.map((field) => (

              <div
                key={field}
                className="flex justify-between items-center gap-4"
              >

                <span className="text-slate-500 text-sm">
                  {formatFieldName(field)}
                </span>

                <span className="font-semibold text-slate-900 text-right">

                  {Array.isArray(
                    faculty[field]
                  )
                    ? faculty[field].join(", ")
                    : String(
                      faculty[field] ?? "-"
                    )}

                </span>

              </div>

            ))}

          </div>

          <a
            href={`/review/${faculty.slug}`}
            className="w-full text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition block"
          >
            Write Review
          </a>

          {(faculty.website || faculty.youtube) && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
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
              {faculty.youtube && (
                <a
                  href={faculty.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition"
                >
                  YouTube Channel
                </a>
              )}
            </div>
          )}


          {/* Ratings Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Ratings</h2>
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm">No ratings yet.</p>
            ) : (
              <div className="space-y-4">
                {ratingFields.map((field) => (

                  <div key={field.key}>

                    <div className="flex justify-between mb-1.5">

                      <span className="text-slate-500 text-sm">
                        {formatFieldName(field.key)}
                      </span>

                    </div>

                    <RatingBar
                      value={getAverageMetric(
                        reviews,
                        field.key
                      )}
                    />

                  </div>

                ))}
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

                  <div className="flex flex-wrap gap-2 mb-5">
                    {review.teacher_style && (
                      <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">
                        {review.teacher_style}
                      </span>
                    )}
                    {review.student_type && (
                      <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">
                        {review.student_type}
                      </span>
                    )}
                    {review.attempt && (
                      <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">
                        {review.attempt}
                      </span>
                    )}
                    {review.would_recommend !== undefined && (
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${review.would_recommend ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {review.would_recommend ? "✓ Recommended" : "✗ Not Recommended"}
                      </span>
                    )}
                  </div>

                  {review.best_for?.length > 0 && (
                    <p className="text-sm text-slate-600 mb-3">
                      <span className="font-semibold text-slate-800">Best For:</span>{" "}
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
                    <p className="text-slate-700 text-sm leading-relaxed border-l-4 border-blue-500 pl-4">
                      {review.review_text}
                    </p>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </main >
  );
}

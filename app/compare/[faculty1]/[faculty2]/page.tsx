import { supabase } from "@/lib/supabase";
import { getAverageMetric, getOverallRating } from "@/lib/ratings";

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
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Faculty not found</h1>
          <a href="/compare" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Compare</a>
        </div>
      </main>
    );
  }

  const [{ data: reviews1 }, { data: reviews2 }] = await Promise.all([
    supabase.from("reviews").select("*").eq("faculty_slug", faculty1Slug),
    supabase.from("reviews").select("*").eq("faculty_slug", faculty2Slug),
  ]);

  const faculty1Reviews = reviews1 ?? [];
  const faculty2Reviews = reviews2 ?? [];
  const faculty1Rating = getOverallRating(faculty1Reviews);
  const faculty2Rating = getOverallRating(faculty2Reviews);

  const facultyFields = Object.keys(faculty1).filter(
    (field) =>
      ![
        "id", "slug", "faculty_name", "subject", "level",
        "active", "website", "youtube", "created_at", "updated_at",
      ].includes(field)
  );

  const ratingFields = Object.keys(faculty1Reviews[0] ?? {}).filter(
    (field) =>
      typeof faculty1Reviews[0]?.[field] === "number" &&
      !["id", "faculty_id"].includes(field)
  );

  const formatFieldName = (field: string) =>
    field.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatValue = (val: any) => {
    if (Array.isArray(val)) return val.join(", ");
    if (val === null || val === undefined) return "—";
    if (typeof val === "number" && val > 1000) return `₹${val.toLocaleString("en-IN")}`;
    return String(val);
  };

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
          <a href="/compare" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition">
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
                  {reviews.length > 0 ? rating : "—"}
                </div>
                <div className="text-slate-400 text-sm mt-1">Overall Rating</div>
              </div>
              <p className="text-slate-400 text-sm mt-3">{reviews.length} Reviews</p>
            </div>
          ))}
        </div>

        {/* Faculty Details */}
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

        {/* Ratings Comparison */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ratings Comparison</h2>
          {ratingFields.length === 0 ? (
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
                      <div className="p-4 border-b text-slate-600 text-sm">{formatFieldName(field)}</div>
                      <div className={`p-4 border-b border-l text-center font-bold text-sm ${w === "left" ? "text-blue-600 bg-blue-50" : "text-slate-900"}`}>
                        {v1}
                        {w === "left" && <span className="ml-1 text-xs">↑</span>}
                      </div>
                      <div className={`p-4 border-b border-l text-center font-bold text-sm ${w === "right" ? "text-blue-600 bg-blue-50" : "text-slate-900"}`}>
                        {v2}
                        {w === "right" && <span className="ml-1 text-xs">↑</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Student Reviews */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What Students Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { faculty: faculty1, reviews: faculty1Reviews },
              { faculty: faculty2, reviews: faculty2Reviews },
            ].map(({ faculty, reviews }) => (
              <div key={faculty.slug} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{faculty.faculty_name}</h3>

                {reviews.length === 0 ? (
                  <p className="text-slate-400 text-sm">No reviews yet.</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {review.teacher_style && (
                            <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">{review.teacher_style}</span>
                          )}
                          {review.student_type && (
                            <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.student_type}</span>
                          )}
                          {review.attempt && (
                            <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1 text-xs font-medium">{review.attempt}</span>
                          )}
                        </div>
                        {review.best_for?.length > 0 && (
                          <p className="text-xs text-slate-600 mb-2">
                            <span className="font-semibold">Best For:</span> {review.best_for.join(", ")}
                          </p>
                        )}
                        {review.pros && (
                          <p className="text-xs text-slate-600 mb-1">
                            <span className="font-semibold text-green-700">Pros:</span> {review.pros}
                          </p>
                        )}
                        {review.cons && (
                          <p className="text-xs text-slate-600 mb-2">
                            <span className="font-semibold text-red-600">Cons:</span> {review.cons}
                          </p>
                        )}
                        {review.review_text && (
                          <p className="text-slate-600 text-sm italic border-l-2 border-blue-400 pl-3">
                            {review.review_text}
                          </p>
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

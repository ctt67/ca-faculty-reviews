import { supabase } from "@/lib/supabase";
import { getOverallRating } from "@/lib/ratings";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ level: string; subject: string }>;
}) {
  const { level, subject } = await params;

  const { data: subjectFaculties, error } = await supabase
    .from("faculties")
    .select("*")
    .ilike("subject", subject)
    .ilike("level", level)
    .eq("active", true);

  if (error) {
    return (
      <main className="max-w-7xl mx-auto p-10 text-red-500">
        Error loading faculties.
      </main>
    );
  }

  // Only fetch reviews for faculties on this page — not all reviews
  const slugs = subjectFaculties?.map((f) => f.slug) ?? [];

  const { data: allReviews } = slugs.length
    ? await supabase
      .from("reviews")
      .select("*")
      .in("faculty_slug", slugs)
      .eq("approved", true)
    : { data: [] };

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-4xl">

            <a
              href={`/${level}`}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
            >
              ← {level.toUpperCase()}
            </a>

            <h1 className="text-5xl md:text-7xl font-extrabold">
              {subject.toUpperCase()}
            </h1>

            <p className="mt-6 text-xl text-slate-400">
              Compare faculty reviews, ratings and student experiences.
            </p>

          </div>
        </div>
      </section>

      {/* Faculty Cards */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        {(!subjectFaculties || subjectFaculties.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            No faculties found for this subject yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {subjectFaculties.map((faculty) => {

              const facultyReviews =
                allReviews?.filter((r) => r.faculty_slug === faculty.slug) ?? [];

              const overallRating = getOverallRating(facultyReviews);
              const hasReviews = facultyReviews.length > 0;
              const bestFor = hasReviews ? facultyReviews[0]?.best_for?.[0] : null;
              const teachingStyle = hasReviews ? facultyReviews[0]?.teacher_style : null;
              const reviewPreview = hasReviews ? facultyReviews[0]?.review_text : null;

              return (
                <a
                  key={faculty.slug}
                  href={`/faculty/${faculty.slug}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all p-8 block group"
                >

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-slate-900 truncate">
                        {faculty.faculty_name}
                      </h2>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {teachingStyle && (
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            {teachingStyle}
                          </span>
                        )}
                        {bestFor && (
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                            {bestFor}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-center shrink-0">
                      <div className="text-4xl font-extrabold text-blue-600">
                        {hasReviews ? `★ ${overallRating}` : "—"}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Rating</div>
                    </div>
                  </div>

                  <div className="mt-3 text-slate-400 text-xs">
                    {facultyReviews.length} {facultyReviews.length === 1 ? "Review" : "Reviews"}
                  </div>

                  <div className="mt-5 border-l-4 border-blue-500 pl-4">
                    <p className="text-slate-500 italic text-sm line-clamp-3">
                      {reviewPreview ? `"${reviewPreview}"` : "No reviews yet. Be the first to review."}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-7">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-slate-900 text-sm">₹{faculty.starting_price?.toLocaleString("en-IN")}</div>
                      <div className="text-xs text-slate-400 mt-1">Price</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-slate-900 text-sm">{faculty.regular_hours}h</div>
                      <div className="text-xs text-slate-400 mt-1">Hours</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-slate-900 text-sm">{faculty.mode?.[0] ?? "—"}</div>
                      <div className="text-xs text-slate-400 mt-1">Mode</div>
                    </div>
                  </div>

                  <div className="mt-7 text-blue-600 font-semibold text-sm group-hover:underline">
                    View Profile →
                  </div>

                </a>
              );
            })}
          </div>
        )}

      </section>

    </main>
  );
}

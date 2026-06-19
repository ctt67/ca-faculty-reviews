import { supabase } from "@/lib/supabase";
import { getOverallRating } from "@/lib/ratings";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;

  const { data: subjectFaculties, error } =
    await supabase
      .from("faculties")
      .select("*")
      .ilike("subject", subject)
      .eq("level", "Final");

  if (error) {
    return (
      <main className="p-10">
        Error loading faculties.
      </main>
    );
  }

  const { data: allReviews } =
    await supabase
      .from("reviews")
      .select("*");

  return (
    <main className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold">
        Final {subject.toUpperCase()} Faculties
      </h1>

      <p className="mt-2 text-gray-500">
        Browse, compare and choose the right faculty.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

        {subjectFaculties?.map((faculty) => {

          const facultyReviews =
            allReviews?.filter(
              (review) =>
                review.faculty_slug ===
                faculty.slug
            ) ?? [];

          const overallRating =
            getOverallRating(
              facultyReviews
            );

          const bestFor =
            facultyReviews[0]?.best_for?.[0] ??
            "No Reviews Yet";

          const teachingStyle =
            facultyReviews[0]
              ?.teacher_style ??
            "Unknown";

          const reviewPreview =
            facultyReviews[0]
              ?.review_text ??
            "No reviews yet.";

          return (
            <a
              key={faculty.slug}
              href={`/faculty/${faculty.slug}`}
              className="border rounded-xl p-6 hover:border-gray-400 hover:shadow-lg transition-all block"
            >

              <div className="flex justify-between items-start">

                <h2 className="text-2xl font-bold">
                  {faculty.faculty_name}
                </h2>

                <div className="text-right">

                  <div className="text-3xl font-bold">
                    ⭐ {overallRating}
                  </div>

                  <div className="text-sm text-gray-500">
                    {facultyReviews.length} Reviews
                  </div>

                </div>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="border rounded-full px-3 py-1 text-sm">
                  {teachingStyle}
                </span>

                <span className="border rounded-full px-3 py-1 text-sm">
                  {bestFor}
                </span>

              </div>

              <div className="mt-4 text-sm text-gray-600 line-clamp-2 italic">
                "{reviewPreview}"
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">

                <div className="border rounded-lg p-3 text-center">

                  <div className="font-bold">
                    ₹{faculty.starting_price}
                  </div>

                  <div className="text-xs text-gray-500">
                    Price
                  </div>

                </div>

                <div className="border rounded-lg p-3 text-center">

                  <div className="font-bold">
                    {faculty.regular_hours}
                  </div>

                  <div className="text-xs text-gray-500">
                    Hours
                  </div>

                </div>

                <div className="border rounded-lg p-3 text-center">

                  <div className="font-bold">
                    {faculty.mode?.[0]}
                  </div>

                  <div className="text-xs text-gray-500">
                    Mode
                  </div>

                </div>

              </div>

              <div className="mt-6 text-sm font-medium text-gray-600">
                See Reviews & Profile →
              </div>

            </a>
          );
        })}

      </div>

    </main>
  );
}
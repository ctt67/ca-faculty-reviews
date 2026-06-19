import { supabase } from "@/lib/supabase";
import {
  getAverageMetric,
  getOverallRating,
} from "@/lib/ratings";

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
    return <div>Faculty not found</div>;
  }

  const { data: facultyReviews } =
    await supabase
      .from("reviews")
      .select("*")
      .eq("faculty_slug", slug);

  const reviews = facultyReviews ?? [];

  return (
    <main className="max-w-6xl mx-auto p-10">

      <div className="border rounded-xl p-8 shadow-sm">
        <h1 className="text-4xl font-bold">
          {faculty.faculty_name}
        </h1>

        <div className="flex gap-2 mt-3">
          <span className="border rounded-full px-3 py-1 text-sm">
            {faculty.level}
          </span>

          <span className="border rounded-full px-3 py-1 text-sm">
            {faculty.subject}
          </span>
        </div>

        <div className="mt-6">
          <div className="text-5xl font-bold">
            ⭐ {getOverallRating(reviews)}
          </div>

          <div className="text-lg text-gray-400 mt-1">
            Overall Rating
          </div>

          <div className="text-gray-500 mt-1">
            {reviews.length} Reviews
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">

          <div>
            <p className="text-sm text-gray-500">
              Starting Price
            </p>

            <p className="font-semibold">
              ₹{faculty.starting_price}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Regular Hours
            </p>

            <p className="font-semibold">
              {faculty.regular_hours}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Languages
            </p>

            <p className="font-semibold">
              {faculty.language?.join(", ")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Mode
            </p>

            <p className="font-semibold">
              {faculty.mode?.join(", ")}
            </p>
          </div>

        </div>
      </div>

      <div className="border rounded-xl p-8 mt-8 shadow-sm">

        <h2 className="text-2xl font-bold">
          Ratings Summary
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Understandability
            </p>

            <p className="text-2xl font-bold">
              {getAverageMetric(
                reviews,
                "understandability"
              )}
            </p>
          </div>

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Exam Focus
            </p>

            <p className="text-2xl font-bold">
              {getAverageMetric(
                reviews,
                "exam_focus"
              )}
            </p>
          </div>

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Study Material
            </p>

            <p className="text-2xl font-bold">
              {getAverageMetric(
                reviews,
                "study_material_quality"
              )}
            </p>
          </div>

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Mock Coverage
            </p>

            <p className="text-2xl font-bold">
              {getAverageMetric(
                reviews,
                "mock_coverage"
              )}
            </p>
          </div>

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Doubt Resolution
            </p>

            <p className="text-2xl font-bold">
              {getAverageMetric(
                reviews,
                "doubt_resolution"
              )}
            </p>
          </div>

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Value For Money
            </p>

            <p className="text-2xl font-bold">
              {getAverageMetric(
                reviews,
                "value_for_money"
              )}
            </p>
          </div>

        </div>

      </div>

      <div className="mt-12">

        <h2 className="text-3xl font-bold">
          Student Reviews
        </h2>

        <div className="mt-4 space-y-4">

          {reviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-xl p-8 shadow-sm"
            >

              <div className="flex flex-wrap gap-2 mb-4">

                <span className="border rounded-full px-4 py-1 text-sm">
                  {review.teacher_style}
                </span>

                <span className="border rounded-full px-4 py-1 text-sm">
                  {review.best_for?.join(", ")}
                </span>

                <span className="border rounded-full px-4 py-1 text-sm">
                  {review.would_recommend
                    ? "Recommended"
                    : "Not Recommended"}
                </span>

              </div>

              <p>
                Attempt: {review.attempt}
              </p>

              <p>
                Student Type: {review.student_type}
              </p>

              <p className="mt-4">
                <strong>Pros:</strong>{" "}
                {review.pros}
              </p>

              <p>
                <strong>Cons:</strong>{" "}
                {review.cons}
              </p>

              <p className="mt-4">
                {review.review_text}
              </p>

            </div>
          ))}

        </div>

      </div>

    </main>
  );
}
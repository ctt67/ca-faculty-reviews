import { supabase } from "@/lib/supabase";
import {
  getAverageMetric,
  getOverallRating,
} from "@/lib/ratings";

export default async function ComparePage({
  params,
}: {
  params: Promise<{
    faculty1: string;
    faculty2: string;
  }>;
}) {
  const {
    faculty1: faculty1Slug,
    faculty2: faculty2Slug,
  } = await params;

  const { data: faculty1 } = await supabase
    .from("faculties")
    .select("*")
    .eq("slug", faculty1Slug)
    .single();

  const { data: faculty2 } = await supabase
    .from("faculties")
    .select("*")
    .eq("slug", faculty2Slug)
    .single();

  if (!faculty1 || !faculty2) {
    return (
      <main className="max-w-4xl mx-auto p-10">
        <h1 className="text-3xl font-bold">
          Faculty not found
        </h1>
      </main>
    );
  }

  const { data: reviews1 } = await supabase
    .from("reviews")
    .select("*")
    .eq("faculty_slug", faculty1Slug);

  const { data: reviews2 } = await supabase
    .from("reviews")
    .select("*")
    .eq("faculty_slug", faculty2Slug);

  const faculty1Reviews = reviews1 ?? [];
  const faculty2Reviews = reviews2 ?? [];

  return (
    <main className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold mb-10">
        Compare Faculties
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div className="border rounded-xl p-6">
          <h2 className="text-3xl font-bold">
            {faculty1.faculty_name}
          </h2>

          <p className="text-gray-500 mt-2">
            {faculty1.subject}
          </p>

          <div className="mt-4 text-4xl font-bold">
            ⭐ {getOverallRating(
              faculty1Reviews
            )}
          </div>

          <p className="text-gray-500">
            {faculty1Reviews.length} Reviews
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-3xl font-bold">
            {faculty2.faculty_name}
          </h2>

          <p className="text-gray-500 mt-2">
            {faculty2.subject}
          </p>

          <div className="mt-4 text-4xl font-bold">
            ⭐ {getOverallRating(
              faculty2Reviews
            )}
          </div>

          <p className="text-gray-500">
            {faculty2Reviews.length} Reviews
          </p>
        </div>

      </div>

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Faculty Details
        </h2>

        <div className="grid grid-cols-3 border rounded-xl overflow-hidden">

          <div className="font-bold p-4 border-b">
            Metric
          </div>

          <div className="font-bold p-4 border-b text-center">
            {faculty1.faculty_name}
          </div>

          <div className="font-bold p-4 border-b text-center">
            {faculty2.faculty_name}
          </div>

          <div className="p-4 border-b">
            Starting Price
          </div>

          <div className="p-4 border-b text-center">
            ₹{faculty1.starting_price}
          </div>

          <div className="p-4 border-b text-center">
            ₹{faculty2.starting_price}
          </div>

          <div className="p-4 border-b">
            Regular Hours
          </div>

          <div className="p-4 border-b text-center">
            {faculty1.regular_hours}
          </div>

          <div className="p-4 border-b text-center">
            {faculty2.regular_hours}
          </div>

          <div className="p-4 border-b">
            Fast Track Hours
          </div>

          <div className="p-4 border-b text-center">
            {faculty1.fast_track_hours}
          </div>

          <div className="p-4 border-b text-center">
            {faculty2.fast_track_hours}
          </div>

          <div className="p-4 border-b">
            Languages
          </div>

          <div className="p-4 border-b text-center">
            {faculty1.language?.join(", ")}
          </div>

          <div className="p-4 border-b text-center">
            {faculty2.language?.join(", ")}
          </div>

          <div className="p-4">
            Mode
          </div>

          <div className="p-4 text-center">
            {faculty1.mode?.join(", ")}
          </div>

          <div className="p-4 text-center">
            {faculty2.mode?.join(", ")}
          </div>

        </div>

      </div>

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Ratings Comparison
        </h2>

        <div className="grid grid-cols-3 border rounded-xl overflow-hidden">

          <div className="font-bold p-4 border-b">
            Metric
          </div>

          <div className="font-bold p-4 border-b text-center">
            {faculty1.faculty_name}
          </div>

          <div className="font-bold p-4 border-b text-center">
            {faculty2.faculty_name}
          </div>

          {[
            [
              "Understandability",
              "understandability",
            ],
            [
              "Exam Focus",
              "exam_focus",
            ],
            [
              "Study Material",
              "study_material_quality",
            ],
            [
              "Mock Coverage",
              "mock_coverage",
            ],
            [
              "Doubt Resolution",
              "doubt_resolution",
            ],
            [
              "Value For Money",
              "value_for_money",
            ],
          ].map(([label, field]) => (
            <div
              key={label}
              className="contents"
            >
              <div className="p-4 border-b">
                {label}
              </div>

              <div className="p-4 border-b text-center">
                {getAverageMetric(
                  faculty1Reviews,
                  field
                )}
              </div>

              <div className="p-4 border-b text-center">
                {getAverageMetric(
                  faculty2Reviews,
                  field
                )}
              </div>
            </div>
          ))}

        </div>

      </div>

      <div className="mt-12">

        <h2 className="text-3xl font-bold mb-6">
          What Students Are Saying
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="border rounded-xl p-6">

            <h3 className="text-2xl font-bold mb-4">
              {faculty1.faculty_name}
            </h3>

            {faculty1Reviews.map(
              (review) => (
                <div
                  key={review.id}
                  className="border-b pb-6 mb-6 last:border-0"
                >

                  <div className="flex flex-wrap gap-2 mb-3">

                    <span className="border rounded-full px-3 py-1 text-sm">
                      {
                        review.teacher_style
                      }
                    </span>

                    <span className="border rounded-full px-3 py-1 text-sm">
                      {
                        review.student_type
                      }
                    </span>

                    <span className="border rounded-full px-3 py-1 text-sm">
                      {review.attempt}
                    </span>

                  </div>

                  <p className="mb-2">
                    <strong>
                      Best For:
                    </strong>{" "}
                    {review.best_for?.join(
                      ", "
                    )}
                  </p>

                  <p className="mb-2">
                    <strong>
                      Pros:
                    </strong>{" "}
                    {review.pros}
                  </p>

                  <p className="mb-2">
                    <strong>
                      Cons:
                    </strong>{" "}
                    {review.cons}
                  </p>

                  <p className="text-gray-700">
                    {review.review_text}
                  </p>

                </div>
              )
            )}

          </div>

          <div className="border rounded-xl p-6">

            <h3 className="text-2xl font-bold mb-4">
              {faculty2.faculty_name}
            </h3>

            {faculty2Reviews.map(
              (review) => (
                <div
                  key={review.id}
                  className="border-b pb-6 mb-6 last:border-0"
                >

                  <div className="flex flex-wrap gap-2 mb-3">

                    <span className="border rounded-full px-3 py-1 text-sm">
                      {
                        review.teacher_style
                      }
                    </span>

                    <span className="border rounded-full px-3 py-1 text-sm">
                      {
                        review.student_type
                      }
                    </span>

                    <span className="border rounded-full px-3 py-1 text-sm">
                      {review.attempt}
                    </span>

                  </div>

                  <p className="mb-2">
                    <strong>
                      Best For:
                    </strong>{" "}
                    {review.best_for?.join(
                      ", "
                    )}
                  </p>

                  <p className="mb-2">
                    <strong>
                      Pros:
                    </strong>{" "}
                    {review.pros}
                  </p>

                  <p className="mb-2">
                    <strong>
                      Cons:
                    </strong>{" "}
                    {review.cons}
                  </p>

                  <p className="text-gray-700">
                    {review.review_text}
                  </p>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </main>
  );
}
import { ratingFields } from "./rating-config";



export function getRatingFields(reviews: any[]): string[] {
  if (reviews.length === 0) return [];

  const sample = reviews[0];

  return ratingFields
    .map((field) => field.key)
    .filter((key) => key in sample);
}

export function getOverallRating(facultyReviews: any[]): number {
  if (facultyReviews.length === 0) return 0;

  const fields = getRatingFields(facultyReviews);
  if (fields.length === 0) return 0;

  const total = facultyReviews.reduce(
    (sum, review) =>
      sum +
      fields.reduce(
        (fieldSum, field) => fieldSum + Number(review[field] || 0),
        0
      ),
    0
  );

  return Number(
    (total / (facultyReviews.length * fields.length)).toFixed(1)
  );
}

export function getAverageMetric(
  facultyReviews: any[],
  metric: string
): number {
  if (facultyReviews.length === 0) return 0;

  return Number(
    (
      facultyReviews.reduce(
        (sum, review) => sum + Number(review[metric] || 0),
        0
      ) / facultyReviews.length
    ).toFixed(1)
  );
}

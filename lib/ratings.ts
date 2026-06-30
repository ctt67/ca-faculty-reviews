import { ratingFields } from "./rating-config";

type Row = Record<string, unknown>;

export function getRatingFields(reviews: Row[]): string[] {
  if (reviews.length === 0) return [];
  const sample = reviews[0];
  return ratingFields.map((f) => f.key).filter((key) => key in sample);
}

export function getOverallRating(facultyReviews: Row[]): number {
  if (facultyReviews.length === 0) return 0;
  const fields = getRatingFields(facultyReviews);
  if (fields.length === 0) return 0;

  const total = facultyReviews.reduce(
    (sum, review) =>
      sum + fields.reduce((s, field) => s + Number(review[field] || 0), 0),
    0
  );

  return Number((total / (facultyReviews.length * fields.length)).toFixed(1));
}

export function getAverageMetric(facultyReviews: Row[], metric: string): number {
  if (facultyReviews.length === 0) return 0;
  return Number(
    (
      facultyReviews.reduce((sum, r) => sum + Number(r[metric] || 0), 0) /
      facultyReviews.length
    ).toFixed(1)
  );
}

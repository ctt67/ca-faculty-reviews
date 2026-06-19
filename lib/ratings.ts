export function getOverallRating(
  facultyReviews: any[]
) {
  if (facultyReviews.length === 0) {
    return 0;
  }

  const total = facultyReviews.reduce(
    (sum, review) =>
      sum +
      Number(review.understandability || 0) +
      Number(review.exam_focus || 0) +
      Number(
        review.study_material_quality || 0
      ) +
      Number(review.mock_coverage || 0) +
      Number(review.doubt_resolution || 0) +
      Number(review.value_for_money || 0),
    0
  );

  return Number(
    (
      total /
      (facultyReviews.length * 6)
    ).toFixed(1)
  );
}

export function getAverageMetric(
  facultyReviews: any[],
  metric: string
) {
  if (facultyReviews.length === 0) {
    return 0;
  }

  return Number(
    (
      facultyReviews.reduce(
        (sum, review) =>
          sum +
          Number(review[metric] || 0),
        0
      ) / facultyReviews.length
    ).toFixed(1)
  );
}
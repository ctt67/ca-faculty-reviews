import { ratingFields } from "./rating-config";

// Words that should always render in ALL CAPS when derived from URL slugs.
// Add new abbreviations here as subjects are added to the DB.
const SUBJECT_ABBREVIATIONS = new Set([
  "afm", "fr", "dt", "idt", "sfm", "sm", "isca", "eis", "sbl", "mcs", "ma", "bcr",
]);

export function formatSubjectName(subject: string): string {
  return decodeURIComponent(subject).replace(/\w\S*/g, (word) => {
    const lower = word.toLowerCase();
    if (SUBJECT_ABBREVIATIONS.has(lower)) return lower.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number" && value > 1000) return `₹${value.toLocaleString("en-IN")}`;
  return String(value);
}

// Only fields worth showing in the Faculty Details sidebar card.
// Faculty name / subject / level are already in the page hero.
// Website has its own button. Active/youtube are internal.
export const PUBLIC_FACULTY_FIELDS = new Set(["language", "mode"]);

// Columns safe to ship to the public faculty/compare/subject pages.
// Excludes user_id and anti-spam/analytics metadata (typing_started_at,
// submitted_at, time_taken_seconds, referrer, utm_source, device_type, ip_hash).
export const PUBLIC_REVIEW_COLUMNS = [
  "id", "faculty_slug", "created_at",
  "attempt", "student_type", "course_type", "teacher_style", "course_progress",
  "class_environment", "actual_duration_hours", "best_for", "would_recommend",
  "pros", "cons", "review_text", "rating_reasons",
  "understandability", "exam_focus", "study_material_quality", "mock_coverage",
  "coverage_of_questions", "doubt_resolution", "revision_support", "notes_quality",
  "pace_of_teaching", "time_efficiency", "value_for_money", "expectation_match",
].join(", ");

export function formatFieldName(field: string): string {
  return field.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getRatingLabel(key: string): string {
  return ratingFields.find((f) => f.key === key)?.label ?? formatFieldName(key);
}

export function getRatingHint(key: string): string {
  return ratingFields.find((f) => f.key === key)?.hint ?? "";
}

export function getRating(key: string) {
  return ratingFields.find((f) => f.key === key);
}

import { ratingFields } from "./rating-config";

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

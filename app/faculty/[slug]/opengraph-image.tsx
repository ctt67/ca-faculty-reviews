import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import { getOverallRating } from "@/lib/ratings";
import { formatSubjectName } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ data: faculty }, { data: rawReviews }] = await Promise.all([
    supabase.from("faculties").select("faculty_name, subject, level").eq("slug", slug).single(),
    supabase.from("reviews").select("*").eq("faculty_slug", slug).eq("approved", true),
  ]);

  const reviews = (rawReviews ?? []) as unknown as Record<string, unknown>[];
  const hasReviews = reviews.length > 0;
  const rating = hasReviews ? getOverallRating(reviews) : null;
  const reviewCount = reviews.length;
  const name = faculty?.faculty_name ?? "Faculty";
  const subject = faculty ? formatSubjectName(faculty.subject ?? "") : "";
  const level = faculty?.level ?? "";

  // Truncate long names so they don't overflow
  const displayName = name.length > 28 ? name.slice(0, 26) + "…" : name;

  return new ImageResponse(
    <div
      style={{
        background: "#1B3055",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top: wordmark + badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: "#C9A84C", fontSize: "28px", fontWeight: "800" }}>Care</span>
          <span style={{ color: "white", fontSize: "28px", fontWeight: "800" }}>Views</span>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          padding: "6px 18px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "15px",
          fontWeight: "600",
        }}>
          Faculty Review
        </div>
      </div>

      {/* Middle: content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Subject + Level */}
        <div style={{
          color: "rgba(201,168,76,0.75)",
          fontSize: "18px",
          fontWeight: "700",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}>
          {level}{subject ? ` · ${subject}` : ""}
        </div>

        {/* Faculty name */}
        <div style={{
          color: "white",
          fontSize: displayName.length > 18 ? "64px" : "80px",
          fontWeight: "800",
          lineHeight: 1.05,
          letterSpacing: "-1.5px",
        }}>
          {displayName}
        </div>

        {/* Rating row */}
        {rating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "6px" }}>
            {/* Stars */}
            <div style={{ display: "flex", gap: "3px" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  color: rating >= i - 0.25 ? "#C9A84C" : "rgba(255,255,255,0.15)",
                  fontSize: "32px",
                  lineHeight: 1,
                }}>★</div>
              ))}
            </div>
            {/* Numeric rating */}
            <span style={{ color: "#C9A84C", fontSize: "36px", fontWeight: "800", lineHeight: 1 }}>
              {rating}
            </span>
            {/* Review count */}
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "20px", fontWeight: "500" }}>
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}

        {!hasReviews && (
          <div style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "20px",
            fontWeight: "500",
            marginTop: "6px",
          }}>
            Be the first to leave a review
          </div>
        )}
      </div>

      {/* Bottom: URL */}
      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "17px", fontWeight: "500" }}>
        careviews.in — Honest CA Faculty Reviews
      </div>
    </div>,
    { ...size },
  );
}

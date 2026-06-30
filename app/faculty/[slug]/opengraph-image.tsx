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
  const displayName = name.length > 26 ? name.slice(0, 24) + "…" : name;
  const nameFontSize = displayName.length > 18 ? "64px" : "80px";

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
          <span style={{ color: "white", fontSize: "28px", fontWeight: "800" }}>Careviews</span>
        </div>
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          padding: "6px 18px",
        }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", fontWeight: "600" }}>
            Faculty Review
          </span>
        </div>
      </div>

      {/* Middle: faculty info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Level · Subject */}
        <div style={{ display: "flex" }}>
          <span style={{
            color: "rgba(201,168,76,0.75)",
            fontSize: "18px",
            fontWeight: "700",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}>
            {level}{subject ? ` · ${subject}` : ""}
          </span>
        </div>

        {/* Name */}
        <div style={{ display: "flex" }}>
          <span style={{
            color: "white",
            fontSize: nameFontSize,
            fontWeight: "800",
            lineHeight: 1.05,
            letterSpacing: "-1.5px",
          }}>
            {displayName}
          </span>
        </div>

        {/* Rating row */}
        {rating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "6px" }}>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="30" height="30" viewBox="0 0 24 24"
                  fill={rating >= i - 0.25 ? "#C9A84C" : "rgba(255,255,255,0.15)"}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span style={{ color: "#C9A84C", fontSize: "36px", fontWeight: "800", lineHeight: 1 }}>
              {rating}
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "20px", fontWeight: "500" }}>
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}

        {!hasReviews && (
          <div style={{ display: "flex", marginTop: "6px" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "20px", fontWeight: "500" }}>
              Be the first to leave a review
            </span>
          </div>
        )}
      </div>

      {/* Bottom: URL */}
      <div style={{ display: "flex" }}>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "17px", fontWeight: "500" }}>
          careviews.in — Honest CA Faculty Reviews
        </span>
      </div>
    </div>,
    { ...size },
  );
}

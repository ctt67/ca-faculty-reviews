import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import { formatSubjectName } from "@/lib/format";
import { LEVEL_LABELS } from "@/lib/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ level: string; subject: string }>;
}) {
  const { level, subject } = await params;

  const [{ data: faculties }, { data: reviews }] = await Promise.all([
    supabase.from("faculties").select("slug").eq("active", true).ilike("level", level).ilike("subject", subject),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", true)
      .in("faculty_slug",
        (await supabase.from("faculties").select("slug").ilike("level", level).ilike("subject", subject))
          .data?.map((f) => f.slug) ?? []
      ),
  ]);

  const facultyCount = faculties?.length ?? 0;
  const reviewCount  = (reviews as unknown as { count?: number } | null)?.count ?? 0;

  const subjectLabel = formatSubjectName(subject);
  const levelLabel   = LEVEL_LABELS[level.toLowerCase()] ?? `CA ${level.toUpperCase()}`;

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
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "white", fontSize: "28px", fontWeight: "800" }}>Careviews</span>
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          padding: "6px 18px",
        }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", fontWeight: "600" }}>
            {levelLabel}
          </span>
        </div>
      </div>

      {/* Subject name */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <span style={{
          color: "rgba(201,168,76,0.8)",
          fontSize: "18px",
          fontWeight: "700",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}>
          Subject Reviews
        </span>
        <span style={{
          color: "white",
          fontSize: subjectLabel.length > 20 ? "64px" : "80px",
          fontWeight: "800",
          lineHeight: 1.05,
          letterSpacing: "-1.5px",
        }}>
          {subjectLabel}
        </span>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
          {facultyCount > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ color: "#C9A84C", fontSize: "40px", fontWeight: "800", lineHeight: 1 }}>
                {facultyCount}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "17px", fontWeight: "500" }}>
                {facultyCount === 1 ? "faculty" : "faculties"}
              </span>
            </div>
          )}
          {reviewCount > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ color: "#C9A84C", fontSize: "40px", fontWeight: "800", lineHeight: 1 }}>
                {reviewCount}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "17px", fontWeight: "500" }}>
                student {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "17px", fontWeight: "500" }}>
        careviews.in — Honest CA Faculty Reviews
      </span>
    </div>,
    { ...size },
  );
}

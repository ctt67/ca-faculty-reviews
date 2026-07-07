import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#1B3055",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ color: "white", fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px" }}>Careviews</span>
      </div>

      {/* Headline block */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex" }}>
          <span style={{ color: "rgba(201,168,76,0.7)", fontSize: "20px", fontWeight: "600", letterSpacing: "4px", textTransform: "uppercase" }}>
            India's Independent CA Review Platform
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
          <span style={{ color: "white", fontSize: "80px", fontWeight: "800", lineHeight: 1.05, letterSpacing: "-2px" }}>
            CA Faculty Reviews
          </span>
          <span style={{ color: "white", fontSize: "80px", fontWeight: "800", lineHeight: 1.05, letterSpacing: "-2px" }}>
            by Students
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "24px", fontWeight: "400", lineHeight: 1.5 }}>
            Compare faculties across teaching quality, exam focus,
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "24px", fontWeight: "400", lineHeight: 1.5 }}>
            doubt resolution and more. Independent, no paid rankings.
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "18px" }}>careviews.in</span>
        <div style={{
          display: "flex",
          background: "rgba(201,168,76,0.15)",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "24px",
          padding: "8px 20px",
          color: "#C9A84C",
          fontSize: "16px",
          fontWeight: "600",
        }}>
          <span>CA Final · CA Inter · Foundation</span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}

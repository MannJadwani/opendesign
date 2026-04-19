import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OpenDesign — Open-source AI design canvas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #E8E0D0 0%, #F5F0E8 60%, #FDEFE8 100%)",
          color: "#1F1B16",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#1F1B16",
              color: "#F5F0E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            O
          </div>
          <div style={{ fontSize: 36, letterSpacing: -0.5 }}>
            Open
            <span style={{ color: "#D9623A", fontStyle: "italic" }}>Design</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1,
              letterSpacing: -2,
              fontWeight: 500,
            }}
          >
            Prompt it. Shape it. Ship it.
          </div>
          <div style={{ fontSize: 30, color: "#6B655D", maxWidth: 960 }}>
            Open-source AI design canvas. Turn briefs into editable UI, slide
            decks, and wireframes — powered by any OpenRouter model.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#6B655D",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          <span style={{ color: "#D9623A" }}>●</span> opendesign.app
        </div>
      </div>
    ),
    { ...size },
  );
}

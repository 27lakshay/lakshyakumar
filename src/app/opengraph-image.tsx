import { ImageResponse } from "next/og";

import { resume } from "@/content/resume";
import { siteConfig } from "@/lib/metadata";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const { identity } = resume;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0C0C0F",
          color: "#F5F5F5",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            marginBottom: 24,
          }}
        >
          {identity.headline.join(" ")}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#94A3B8",
            marginBottom: 48,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {identity.tagline}
        </div>
        <div style={{ fontSize: 28, color: "#5EEAD4" }}>{identity.name}</div>
      </div>
    ),
    { ...size },
  );
}

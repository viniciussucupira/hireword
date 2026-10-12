import { ImageResponse } from "next/og";

export const alt = "Hireword — job applications that read clear and confident";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card people see when the site is shared. It shows the product doing
 * its one job — a real before and after, with the same facts on both
 * sides — because a sample persuades more than an adjective does.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FBFAF7",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* soft colour, the same three hues the site uses */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 700,
            height: 560,
            borderRadius: 9999,
            background: "#E9F0FF",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -140,
            width: 620,
            height: 520,
            borderRadius: 9999,
            background: "#E9F6F2",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 56px 64px 72px",
            width: 640,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: "linear-gradient(135deg, #2764E7 0%, #10233F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              <svg width="54" height="54" viewBox="0 0 32 32">
                <path d="M10 23V10M10 16.5h11.6M21.6 23V8.6" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m18.8 11.4 2.8-2.8 2.8 2.8" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 29, fontWeight: 600, color: "#10233F" }}>Hireword</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: 58,
                fontWeight: 700,
                color: "#10233F",
                lineHeight: 1.08,
                letterSpacing: -2,
              }}
            >
              Job applications that read clear and confident
            </div>
            <div style={{ fontSize: 27, color: "#667085", lineHeight: 1.4 }}>
              Clearer cover letters, resume bullets and recruiter messages. Review, edit, and make them yours.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                background: "#2764E7",
                color: "white",
                fontSize: 23,
                fontWeight: 600,
                padding: "13px 26px",
                borderRadius: 999,
                display: "flex",
                whiteSpace: "nowrap",
              }}
            >
              $19 a month, cancel anytime
            </div>
            <div style={{ fontSize: 23, color: "#667085", display: "flex" }}>hireword.com</div>
          </div>
        </div>

        {/* the product, doing the thing */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
            padding: "0 64px 0 0",
            width: 560,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "white",
              border: "1px solid #E3E8F0",
              borderRadius: 22,
              padding: "26px 28px",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 700, color: "#676E7D", letterSpacing: 2, display: "flex" }}>
              YOUR DRAFT
            </div>
            <div style={{ fontSize: 24, color: "#667085", lineHeight: 1.5, display: "flex" }}>
              I am writing for apply to the position of Financial Analyst that I saw in your website.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 6 }}>
            <div
              style={{
                display: "flex",
                background: "#E8F6F3",
                color: "#0B7D70",
                fontSize: 19,
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: 999,
              }}
            >
              Illustrative example
            </div>
            <div style={{ display: "flex", fontSize: 19, color: "#676E7D" }}>names · dates · numbers</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "#EEF4FF",
              border: "1px solid #DBE7FF",
              borderRadius: 22,
              padding: "26px 28px",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1D4FB8", letterSpacing: 2, display: "flex" }}>
              REWRITTEN
            </div>
            <div style={{ fontSize: 24, color: "#18202B", lineHeight: 1.5, display: "flex" }}>
              I&apos;m writing to apply for the Financial Analyst position listed on your site.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

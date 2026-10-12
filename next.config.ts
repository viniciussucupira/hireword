import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The two writing pages had addresses built on the non-native angle until
  // 12 Oct 2026. Links and search results that point there keep working.
  async redirects() {
    return [
      { source: "/cover-letter-for-non-native-speakers", destination: "/cover-letter-rewriter", permanent: true },
      { source: "/native-sounding-resume", destination: "/resume-rewriter", permanent: true },
    ];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
};

// withBotId adds the two addresses the login form's challenge is fetched
// from, on this site's own name (lib/bot-check.ts), and nothing else.
export default withBotId(nextConfig);

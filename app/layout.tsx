import type { Metadata, Viewport } from "next";
// Inter, served from our own domain instead of fonts.googleapis.com: one
// less third party in the request path of a page that promises privacy,
// and no render-blocking stylesheet on someone else's server. Each
// @font-face carries a unicode-range, so a visitor downloads only the
// subset their text needs.
import "@fontsource-variable/inter/wght.css";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Toaster } from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = "https://hireword.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Hireword — Cover Letters and Resumes That Read Clear and Confident",
  description:
    "Rewrite your cover letter, resume bullets, and recruiter messages in clear, natural English. Pro is $19/month; try one rewrite a day free.",
  openGraph: {
    title: "Hireword — Cover Letters and Resumes That Read Clear and Confident",
    description:
      "Polish your cover letter, resume, or LinkedIn message in American or British English. Pro is $19/month; try one rewrite a day free, no email or card.",
    url: SITE_URL,
    siteName: "Hireword",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hireword — Cover Letters and Resumes That Read Clear and Confident",
    description:
      "Polish your cover letter, resume, or LinkedIn message in American or British English. Pro is $19/month; try one rewrite a day free, no email or card.",
  },
  verification: {
    google: "PPtQILt6oZAUpSMtxJiEetgcxi5jLKAXjkpSLPreuk0",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

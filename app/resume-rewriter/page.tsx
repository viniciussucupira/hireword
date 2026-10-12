import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";
import { getToolPage } from "@/lib/tool-pages";

const page = getToolPage("resume-rewriter");

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: { canonical: `/${page.slug}` },
  openGraph: { title: page.ogTitle, description: page.ogDescription },
  twitter: { title: page.ogTitle, description: page.ogDescription },
};

export default function Page() {
  return <ToolLanding page={page} />;
}

import type { Metadata } from "next";
import Home from "@/components/Home";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hireword",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI tool that rewrites cover letters, resume bullet points, and recruiter messages so they read clear, confident, and professional.",
  offers: [
    { "@type": "Offer", price: "19", priceCurrency: "USD", name: "Monthly" },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Home />
    </>
  );
}

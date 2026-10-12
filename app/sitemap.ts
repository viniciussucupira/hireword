import type { MetadataRoute } from "next";
import { PROFESSIONS } from "@/lib/professions";

const SITE_URL = "https://hireword.com";

const DOC_TYPE_PREFIXES = [
  "cover-letter-for",
  "resume-bullet-points-for",
  "linkedin-message-for",
  "follow-up-email-for",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const combinationPages: MetadataRoute.Sitemap = DOC_TYPE_PREFIXES.flatMap((prefix) =>
    PROFESSIONS.map((p) => ({
      url: `${SITE_URL}/${prefix}/${p.slug}`,
      lastModified: now,
      priority: 0.6,
    }))
  );

  return [
    { url: SITE_URL, lastModified: now, priority: 1.0 },
    { url: `${SITE_URL}/cover-letter-rewriter`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/resume-rewriter`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/recruiter-message-rewriter`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/visa-sponsorship-cover-letter`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/job-application-letter-rewriter`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/cv-english-rewriter`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/ats-friendly-resume-bullet-points`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/linkedin-connection-message-rewriter`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/interview-follow-up-email-generator`, lastModified: now, priority: 0.7 },
    ...combinationPages,
    { url: `${SITE_URL}/terms`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/refunds`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/support`, lastModified: now, priority: 0.3 },
  ];
}

export const APP_NAME = "Hireword";

export const SUPPORT_EMAIL = "support@hireword.com";

export const FREE_LIMIT_PER_DAY = 1;
export const MAX_INPUT_CHARS = 6000;
export const PRO_BURST_LIMIT = 20;
export const PRO_BURST_SECONDS = 60;

export const FREE_LIMIT_MESSAGE =
    "Today's free rewrite in this browser has been used. Try again after midnight UTC, or get Pro to keep going.";

export const CONTEXT_TYPES = [
  {
    value: "cover-letter",
    label: "Cover letter",
    instruction:
      "This is a cover letter paragraph for a job application. Keep it warm, confident, and professional — the register a native English-speaking candidate would use when writing to a hiring manager.",
  },
  {
    value: "resume-bullet",
    label: "Resume bullet points",
    instruction:
      "These are resume/CV bullet points. Keep them concise, start with strong action verbs, remove filler words, and match the terse, results-oriented style native English resumes use. Preserve every fact, number, and achievement exactly — never invent or exaggerate results.",
  },
  {
    value: "linkedin-message",
    label: "LinkedIn message",
    instruction:
      "This is a LinkedIn message to a recruiter or hiring manager. Keep it short, direct, and natural — the way a native English speaker would casually-but-professionally message someone on LinkedIn. Avoid stiff or overly formal phrasing.",
  },
  {
    value: "follow-up-email",
    label: "Follow-up email",
    instruction:
      "This is a follow-up email after an application or interview. Keep it polite, brief, and natural — the tone a native English-speaking professional uses to follow up without sounding pushy.",
  },
] as const;

export type ContextType = (typeof CONTEXT_TYPES)[number]["value"];

// Where the payment page is served. Paddle opens a live checkout only on a
// domain it has approved; nativeapply.net is, hireword.com is not yet. When
// hireword.com reads "Checkout approved" in Paddle (Checkout, Website
// approval), set this to "https://hireword.com" and drop "/checkout" from
// LEGACY_STAYS in proxy.ts in the same change. See proxy.ts.
export const CHECKOUT_ORIGIN = "https://nativeapply.net";


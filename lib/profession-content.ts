import type { FaqItem } from "@/components/marketing/Faq";
import type { ContextType } from "./constants";
import type { Example } from "./examples";
import type { Profession } from "./professions";

export type DocKey = "cover-letter" | "resume-bullet" | "linkedin-message" | "follow-up-email";

export type DocType = {
  key: DocKey;
  context: ContextType;
  urlPrefix: string;
  /** "cover letter" */
  label: string;
  /** "Cover Letter" */
  labelCapitalized: string;
  ctaLabel: string;
};

export const DOC_TYPES: Record<DocKey, DocType> = {
  "cover-letter": {
    key: "cover-letter",
    context: "cover-letter",
    urlPrefix: "cover-letter-for",
    label: "cover letter",
    labelCapitalized: "Cover Letter",
    ctaLabel: "Rewrite my cover letter",
  },
  "resume-bullet": {
    key: "resume-bullet",
    context: "resume-bullet",
    urlPrefix: "resume-bullet-points-for",
    label: "resume bullet points",
    labelCapitalized: "Resume Bullet Points",
    ctaLabel: "Rewrite my bullet points",
  },
  "linkedin-message": {
    key: "linkedin-message",
    context: "linkedin-message",
    urlPrefix: "linkedin-message-for",
    label: "LinkedIn message",
    labelCapitalized: "LinkedIn Message",
    ctaLabel: "Rewrite my message",
  },
  "follow-up-email": {
    key: "follow-up-email",
    context: "follow-up-email",
    urlPrefix: "follow-up-email-for",
    label: "follow-up email",
    labelCapitalized: "Follow-Up Email",
    ctaLabel: "Rewrite my follow-up",
  },
};

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function roleArticle(role: string): string {
  return /^(?:[AEIOU]|HR\b)/i.test(role) ? "an" : "a";
}

/* ------------------------------------------------------------------ */
/* Hero copy                                                           */
/* ------------------------------------------------------------------ */

export function professionIntro(doc: DocType, p: Profession): string {
  switch (doc.key) {
    case "cover-letter":
      return `Paste the cover letter you wrote as ${p.singular} and get it back in natural professional English. Compare the rewrite with your original and review your employers, dates, and numbers before sending.`;
    case "resume-bullet":
      return `Make your experience as ${p.singular} easier to read. Paste your resume or CV bullets, choose American or British English, and review a concise rewrite for your next application.`;
    case "linkedin-message":
      return `Paste the message you are about to send to a recruiter about ${p.label.toLowerCase()} roles and get it back short, warm, and easy to answer — without the formality that reads as distance in English.`;
    case "follow-up-email":
      return `Paste the thank-you note or status check you drafted after ${roleArticle(p.role)} ${p.role} interview and review a polite, brief rewrite before sending.`;
  }
}

/* ------------------------------------------------------------------ */
/* Placeholder inside the editor                                       */
/* ------------------------------------------------------------------ */

export function professionPlaceholder(doc: DocType, p: Profession): string {
  switch (doc.key) {
    case "cover-letter":
      return `Dear Hiring Manager,\n\nI am writing for apply to the position of ${p.role}. In my last job I was responsible for ${p.duty}…`;
    case "resume-bullet":
      return `• Was responsible for ${p.duty}\n• Participated in the improvement of the processes of the team…`;
    case "linkedin-message":
      return `Hello Sarah, I hope this message find you well. I saw your announce for the position of ${p.role} and I would like very much that you consider my candidature…`;
    case "follow-up-email":
      return `Dear Ms. Alvarez,\n\nI want to thank you for the interview of yesterday for the position of ${p.role}. I am still very interest in the position…`;
  }
}

/* ------------------------------------------------------------------ */
/* Before / after example                                              */
/* ------------------------------------------------------------------ */

export function professionExample(doc: DocType, p: Profession): Example {
  const shared = { context: doc.context, tab: doc.labelCapitalized };

  switch (doc.key) {
    case "cover-letter":
      return {
        ...shared,
        caption: `Opening paragraph of an application for ${roleArticle(p.role)} ${p.role} role`,
        before: `Dear Hiring Manager,\n\nI am writing [[cut:for apply]] to the position of ${p.role}. In my [[cut:most recent]] job I [[cut:was responsible for]] ${p.duty}, and I [[cut:am very interest for]] work in your company.`,
        after: `Dear Hiring Manager,\n\n[[add:I'm writing to apply for]] the ${p.role} position. [[add:In my most recent role, I]] ${p.dutyNatural}, and [[add:I'd welcome the chance to bring that work to]] your company.`,
        notes: ["More natural", "Same numbers", "Confident tone"],
      };
    case "resume-bullet":
      return {
        ...shared,
        caption: `A bullet point from the experience section of ${p.singular}`,
        before: `• [[cut:Was responsible for]] ${p.duty}\n• [[cut:Participated in the improvement of the processes of]] the team`,
        after: `• [[add:${cap(p.dutyNatural)}]]\n• [[add:Contributed to improving team processes]]`,
        notes: ["Verb first", "Shorter", "Facts preserved"],
      };
    case "linkedin-message":
      return {
        ...shared,
        caption: `First message to a recruiter hiring ${p.label.toLowerCase()}`,
        before: `Hello Sarah, I hope this message [[cut:find]] you well. I saw your [[cut:announce for the position of]] ${p.role} and I [[cut:would like very much that you consider my candidature]]. Thank you for your attention.`,
        after: `Hi Sarah, I hope [[add:you're doing well]]. I saw your [[add:post for the]] ${p.role} [[add:role, and I'd love to be considered]]. [[add:Thanks for your time]].`,
        notes: ["Warmer", "Shorter", "Easy to answer"],
      };
    case "follow-up-email":
      return {
        ...shared,
        caption: `Thank-you note sent the day after ${roleArticle(p.role)} ${p.role} interview`,
        before: `Dear Ms. Alvarez,\n\nI want to thank you for [[cut:the interview of yesterday]] for the position of ${p.role}. I am still very [[cut:interest in]] the position and I [[cut:stay at your disposition for any question]].`,
        after: `Dear Ms. Alvarez,\n\nThank you for [[add:taking the time to meet me yesterday]] about the ${p.role} [[add:role]]. I'm still very [[add:interested]], and [[add:I'm happy to answer any questions]].`,
        notes: ["Polite, not pushy", "Correct tense"],
      };
  }
}

/* ------------------------------------------------------------------ */
/* Benefits                                                            */
/* ------------------------------------------------------------------ */

export function professionBenefits(doc: DocType, p: Profession): { title: string; body: string }[] {
  const keepsFacts = {
    title: "Your record stays your record",
    body: `The rewrite is instructed to preserve your employers, dates, certifications, and contribution as ${p.singular}. Compare both versions before sending; the number check cannot verify every fact.`,
  };

  switch (doc.key) {
    case "cover-letter":
      return [
        {
          title: "Opens the way a strong letter opens",
          body: "Preposition slips like “writing for apply” or “interest for work” are corrected in the first line, where they cost the most.",
        },
        {
          title: `Vocabulary that fits ${p.label.toLowerCase()}`,
          body: `Keeps the terms used in your field rather than flattening everything into generic business English, so the letter reads like it was written by ${p.singular}.`,
        },
        keepsFacts,
      ];
    case "resume-bullet":
      return [
        {
          title: "Every line starts with a verb",
          body: "“Was responsible for the coordination of” becomes one strong verb. Recruiters skim resumes in seconds, and the first word of each line does the work.",
        },
        {
          title: `Clear descriptions of your work`,
          body: "Improve the wording of skills and responsibilities already in your draft. Hireword does not read the job description, add missing qualifications, or test ATS compatibility.",
        },
        keepsFacts,
      ];
    case "linkedin-message":
      return [
        {
          title: "Brief and easy to read",
          body: "Recruiters read messages between meetings. The rewrite cuts the opening ceremony and puts the role and your ask where they can be seen.",
        },
        {
          title: "Friendly, not formal",
          body: `“Dear Madam, I would like very much that you consider my candidature” becomes something a recruiter hiring ${p.label.toLowerCase()} can reply to in one line.`,
        },
        keepsFacts,
      ];
    case "follow-up-email":
      return [
        {
          title: "Grateful without sounding anxious",
          body: "Repeated apologies and over-thanking are removed, and the warmth stays. In English, that line is narrow and easy to cross by accident.",
        },
        {
          title: "Asks about the decision politely",
          body: `Turns “I would like to know if there is already a decision” into a question a hiring manager interviewing ${p.label.toLowerCase()} can answer without feeling chased.`,
        },
        keepsFacts,
      ];
  }
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export function professionFaq(doc: DocType, p: Profession): FaqItem[] {
  return [
    {
      q: `What makes ${doc.label} sound natural for ${p.label.toLowerCase()}?`,
      a: `It uses the vocabulary and tone hiring managers expect in your field, replaces wordy or awkward phrasing, and keeps sentences short and direct — the way ${p.singular} working in English would write it.`,
    },
    {
      q: `Will it change the facts in my ${doc.label}?`,
      a: "The tool is instructed to preserve employers, dates, numbers, certifications, and achievements. Numeric expressions are compared with your original, but no automatic check can verify every fact. Review both versions before sending.",
    },
    {
      q: `What does it cost for ${p.label.toLowerCase()}?`,
      a: "Hireword Pro is $19 a month, with no lock-in. One free rewrite a day, with no email or card required, lets you see the result on your own text first.",
    },
    {
      q: `Can I use the same rewrite for every application?`,
      a: `Reuse relevant experience, but check the role, employer, and purpose each time. Add truthful details that fit the application before rewriting. Hireword does not compare your text with the employer's job description.`,
    },
  ];
}

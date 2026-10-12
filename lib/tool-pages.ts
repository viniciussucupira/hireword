import type { FaqItem } from "@/components/marketing/Faq";
import type { ContextType } from "./constants";
import type { Example } from "./examples";

export type ToolPage = {
  slug: string;
  context: ContextType;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  eyebrow: string;
  headingLead: string;
  headingAccent: string;
  intro: string;
  ctaLabel: string;
  placeholder: string;
  benefits: { title: string; body: string }[];
  guidance: { title: string; intro: string; items: string[] };
  example: Example;
  faq: FaqItem[];
  related: { href: string; label: string }[];
};

const PRICE_LINE = "$19/month, with one free rewrite a day to try it first.";

export const TOOL_PAGES: Record<string, ToolPage> = {
  /* ------------------------------------------------------------------ */
  "cover-letter-rewriter": {
    slug: "cover-letter-rewriter",
    context: "cover-letter",
    metaTitle: "Cover Letter Rewriter | Hireword",
    metaDescription:
      "Rewrite your cover letter into the English a hiring manager expects — warm, confident, and free of awkward phrasing. " +
      PRICE_LINE,
    ogTitle: "Cover Letter Rewriter",
    ogDescription:
      "Improve your cover letter's English, compare it with your original, and make final edits. Pro is US$19/month; try one free rewrite a day.",
    eyebrow: "Cover letter rewriter",
    headingLead: "Your experience, expressed in",
    headingAccent: "clear, confident English",
    intro:
      "Make your experience easy to understand. Paste your draft and review a rewrite with warm, confident wording for your next application.",
    ctaLabel: "Rewrite my cover letter",
    placeholder:
      "Dear Hiring Manager,\n\nI am writing for apply to the position of Product Designer that I saw announced in your website. I have 5 years of experience in design of mobile applications…",
    benefits: [
      {
        title: "Opens the way a strong letter opens",
        body: "“I am writing for apply to the position of…” becomes “I'm writing to apply for the…” — the small preposition slips a hiring manager notices in the first line.",
      },
      {
        title: "Confident without sounding arrogant",
        body: "Keeps a modest, professional register while removing the apologetic phrasing that undersells you.",
      },
      {
        title: "Your experience, ready for review",
        body: "The tool is instructed to keep years, employers, titles, and numbers. Compare the rewrite with your original before sending.",
      },
      {
        title: "Ready to paste into the application form",
        body: "Plain text out, no formatting to clean up, no markdown symbols to delete before you submit.",
      },
    ],
    guidance: {
      title: "What a strong cover letter paragraph does",
      intro: "Rewriting fixes the English. These four habits are worth fixing in the draft itself.",
      items: [
        "Name the exact role and where you saw it in the first sentence.",
        "Give one concrete reason you fit — a project, a number, a responsibility — not three vague ones.",
        "Say what you would do for them, not only what you want from them.",
        "Keep it to three short paragraphs. Length is not evidence of effort.",
      ],
    },
    example: {
      context: "cover-letter",
      tab: "Cover letter",
      caption: "Opening paragraph of an application for a Product Designer role",
      before:
        "Dear Sir/Madam,\n\nI am writing [[cut:for apply]] to the position of Product Designer [[cut:that I saw announced in]] your website. I have 5 years of experience [[cut:in design of]] mobile applications and I [[cut:think that I could be a good addition for]] your team.",
      after:
        "Dear Hiring Manager,\n\n[[add:I'm writing to apply for]] the Product Designer [[add:role listed on]] your website. I have 5 years of experience [[add:designing]] mobile applications, and [[add:I believe I would be a strong addition to]] your team.",
      notes: ["More natural", "Confident tone", "Five years kept"],
    },
    faq: [
      {
        q: "Should I start from a rough draft?",
        a: "Yes. Write it in English, in your own words, even if it is rough. Hireword works from your own sentences, so the result still sounds like you.",
      },
      {
        q: "Will it make my cover letter longer?",
        a: "Usually shorter. Clear professional English is direct, so padding and repetition tend to disappear while the content stays.",
      },
      {
        q: "Can I rewrite the whole letter at once?",
        a: "Yes, up to 6,000 characters per request, including spaces and line breaks. For longer drafts, shorten the text or split it into parts within that limit. Each part uses a separate rewrite; the free allowance is one per browser per day.",
      },
      {
        q: "Does it keep the company name and role title?",
        a: "The rewrite is instructed to keep names, titles, dates, and numbers. A numeric comparison flags differences; review names and meaning yourself before sending.",
      },
    ],
    related: [
      { href: "/job-application-letter-rewriter", label: "Job application letter rewriter" },
      { href: "/visa-sponsorship-cover-letter", label: "Visa sponsorship cover letter" },
      { href: "/resume-rewriter", label: "Resume rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "resume-rewriter": {
    slug: "resume-rewriter",
    context: "resume-bullet",
    metaTitle: "Resume Rewriter — Clear, Concise Resume Bullets | Hireword",
    metaDescription:
      "Rewrite your resume bullet points into concise professional English, with a built-in number comparison and editable results. " +
      PRICE_LINE,
    ogTitle: "Clear, Concise Resume Bullets",
    ogDescription:
      "Make resume bullets concise and natural, with a built-in number comparison. Pro is US$19/month; try one free rewrite a day.",
    eyebrow: "Resume rewriter",
    headingLead: "Resume bullets that sound",
    headingAccent: "clear, concise, and professional",
    intro:
      "Make your contribution easier to understand. Paste your resume or CV bullets, choose American or British English, and review a more concise version before applying.",
    ctaLabel: "Rewrite my resume bullets",
    placeholder:
      "• Was responsible for the management of a team of 8 developers\n• Participated in the implementation of a new CRM that reduced the response time in 40%\n• Made the monthly reports for the direction…",
    benefits: [
      {
        title: "Clear action verbs",
        body: "“Was responsible for the management of” becomes “Managed”. One word instead of six, and it reads like a strong resume.",
      },
      {
        title: "Filler removed, metrics kept",
        body: "Remove wordy phrasing while keeping your contribution accurate. Helping a team is different from leading it; check that the rewrite preserves that distinction and your metrics.",
      },
      {
        title: "Consistent tense and parallel structure",
        body: "Past roles in past tense, current role in present, every bullet built the same way — the detail recruiters notice without knowing why.",
      },
      {
        title: "Review your achievements",
        body: "The rewrite is instructed not to turn “helped” into “led” or invent a percentage. AI can still make mistakes: compare responsibilities, achievements, and numbers before using the result.",
      },
    ],
    guidance: {
      title: "What a US-style resume bullet looks like",
      intro: "The rewrite handles the English. These are the structural rules behind it.",
      items: [
        "Use an accurate action verb: present tense for ongoing work, past tense for completed work.",
        "One achievement per bullet, one line if possible, two at most.",
        "Put the result in the bullet — a number, a percentage, a timeframe.",
        "For concise resume bullets, start with the action rather than “I”.",
        "Choose the most relevant responsibilities and results; there is no fixed number of bullets for every role.",
      ],
    },
    example: {
      context: "resume-bullet",
      tab: "Resume bullets",
      caption: "Three bullets from the current role of a software team lead",
      before:
        "• [[cut:Was responsible for the management of]] a team of 8 developers\n• [[cut:Participated in the implementation of]] a new CRM [[cut:that reduced the response time in]] 40%\n• [[cut:Made the monthly reports for the direction]]",
      after:
        "• [[add:Managed]] a team of 8 developers\n• [[add:Contributed to implementing]] a new CRM [[add:that reduced response time by]] 40%\n• [[add:Produced monthly reports for management]]",
      notes: ["Verb first", "More concise", "8 and 40% kept"],
    },
    faq: [
      {
        q: "Can I paste my whole experience section?",
        a: "Yes. Paste every bullet from one role together so the rewrite keeps them parallel with each other. Up to 6,000 characters at a time.",
      },
      {
        q: "Will it keep my bullet symbols?",
        a: "The rewrite aims to keep your list readable, but bullet symbols and line breaks may change. Review the result and its formatting when you paste it into your resume.",
      },
      {
        q: "Is this different from the ATS page?",
        a: "Both pages use the same resume rewriting setting. The ATS page adds guidance about clear wording and formatting; it does not run an ATS scan, score your resume, or compare it with a job ad.",
      },
      {
        q: "Will it translate my job title?",
        a: "The tool is instructed to preserve job titles. Review the result and only use a local equivalent if it accurately describes your role.",
      },
    ],
    related: [
      { href: "/ats-friendly-resume-bullet-points", label: "ATS-friendly resume bullet points" },
      { href: "/cv-english-rewriter", label: "CV rewriter for UK and Europe" },
      { href: "/cover-letter-rewriter", label: "Cover letter rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "cv-english-rewriter": {
    slug: "cv-english-rewriter",
    context: "resume-bullet",
    metaTitle: "CV English Rewriter for UK and Europe | Hireword",
    metaDescription:
      "Improve your CV bullets in American or British English, then review the result alongside your original. " +
      PRICE_LINE,
    ogTitle: "CV English Rewriter",
    ogDescription:
      "Paste your CV bullets and get them back clear, concise, and professional for UK and EU applications. $19/month.",
    eyebrow: "CV rewriter",
    headingLead: "A CV that reads as",
    headingAccent: "understated and precise",
    intro:
      "Make your CV clear and easy to read. Choose the English style your employer uses, then review a concise rewrite of your own experience.",
    ctaLabel: "Rewrite my CV bullets",
    placeholder:
      "• Realised the coordination of the quality control process for 3 production lines\n• Was in charge of the formation of new colleagues\n• Obtained a reduction of 15% in the waste of material…",
    benefits: [
      {
        title: "Measured, not boastful",
        body: "Replace vague phrasing with clear descriptions of your contribution. Review the result for a tone that fits the role and employer.",
      },
      {
        title: "False friends corrected",
        body: "“Realised the coordination”, “obtained a reduction”, “formation of colleagues” — the wordy constructions that weaken a CV, replaced with the direct English equivalent.",
      },
      {
        title: "Consistent, scannable lines",
        body: "Every bullet gets the same shape, so someone reading quickly can see what you did without hunting for it.",
      },
      {
        title: "Your metrics stay yours",
        body: "The tool is instructed to keep 15% and 3 production lines as written. The number comparison flags differences so you can review them before sending.",
      },
    ],
    guidance: {
      title: "Prepare your CV for the role",
      intro: "Expectations vary by employer, profession, and country. Check the application instructions before rewriting.",
      items: [
        "Follow any page or word limit in the posting and prioritize relevant experience.",
        "Lead with the responsibility, follow with the measurable outcome.",
        "Keep the language plain — superlatives read as noise, not confidence.",
        "No photo, no date of birth, no marital status for UK applications.",
      ],
    },
    example: {
      context: "resume-bullet",
      tab: "CV bullets",
      caption: "Bullets from the current role of a production quality coordinator",
      before:
        "• [[cut:Realised the coordination of]] the quality control process for 3 production lines\n• [[cut:Was in charge of the formation of]] new colleagues\n• [[cut:Obtained a reduction of]] 15% [[cut:in the waste of material]]",
      after:
        "• [[add:Coordinated]] the quality control process [[add:across]] 3 production lines\n• [[add:Trained]] new colleagues\n• [[add:Reduced material waste by]] 15%",
      notes: ["Plain English", "Same facts", "Scannable"],
    },
    faq: [
      {
        q: "Does it use British spelling?",
        a: "British English is selected by default on this CV page. You can switch to American English above the editor. Choose the style your employer uses, then review the result; names, currencies, and dates are not converted.",
      },
      {
        q: "Should my CV be different for each country?",
        a: "Tailor your experience to the role and follow local and employer instructions about length and personal details. Hireword improves the English; it does not check country-specific application requirements.",
      },
      {
        q: "Can it rewrite my personal statement too?",
        a: "Yes, though the cover letter setting suits a personal statement better, because it keeps full sentences rather than compressing them into bullets.",
      },
      {
        q: "Will it remove my qualifications or dates?",
        a: "The rewrite is instructed to preserve dates, institutions, grades, and certifications. Compare the original and result to confirm they are correct.",
      },
    ],
    related: [
      { href: "/resume-rewriter", label: "Resume rewriter for US applications" },
      { href: "/ats-friendly-resume-bullet-points", label: "ATS-friendly resume bullet points" },
      { href: "/cover-letter-rewriter", label: "Cover letter rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "ats-friendly-resume-bullet-points": {
    slug: "ats-friendly-resume-bullet-points",
    context: "resume-bullet",
    metaTitle: "ATS-Friendly Resume Bullet Points | Hireword",
    metaDescription:
      "Improve the English of your resume bullets and review practical formatting guidance. No ATS scan or score. " +
      PRICE_LINE,
    ogTitle: "ATS-Friendly Resume Bullet Points",
    ogDescription:
      "Rewrite resume bullets in clear English. Includes formatting guidance, not an ATS scan or screening guarantee. $19/month.",
    eyebrow: "ATS bullet points",
    headingLead: "Clear resume bullets, with",
    headingAccent: "practical formatting guidance",
    intro:
      "Make your existing experience easier to read in plain English. This page uses our resume rewriter and adds formatting guidance. It does not scan an ATS, score your resume, or guarantee that an application passes a screening system.",
    ctaLabel: "Rewrite my bullets",
    placeholder:
      "• Had the responsibility of the optimisation of the processes of the logistic sector, obtaining a diminution of the costs\n• Acted in the elaboration of dashboards for the follow-up of the KPIs…",
    benefits: [
      {
        title: "Clear, relevant wording",
        body: "Simplify complicated phrasing while keeping the skills and tools you actually named. Check relevant terminology against the job description yourself.",
      },
      {
        title: "One idea per line",
        body: "Aim for a clear responsibility or result in each bullet. Review the rewrite and split a long bullet yourself where needed.",
      },
      {
        title: "Results made explicit",
        body: "Make the result you described easier to read. The tool is instructed to use only your facts; check the number comparison and the meaning before submitting.",
      },
      {
        title: "No keyword stuffing",
        body: "The tool is instructed not to add skills or tools absent from your draft. Check that every term in the result accurately describes your experience.",
      },
    ],
    guidance: {
      title: "What actually helps with an ATS",
      intro: "These are formatting suggestions, not a compatibility test. Follow the employer’s file and layout requirements.",
      items: [
        "Use the words from the job description when they honestly describe your work.",
        "Standard section headings — Experience, Education, Skills — beat creative ones.",
        "Keep formatting simple: no tables, text boxes, columns, or graphics in the experience section.",
        "Spell out an acronym once, then use it: “search engine optimisation (SEO)”.",
        "Use the file type requested by the employer. When permitted, choose a document with selectable text rather than a scanned image.",
      ],
    },
    example: {
      context: "resume-bullet",
      tab: "ATS bullets",
      caption: "Two bullets from a logistics analyst's resume",
      before:
        "• [[cut:Had the responsibility of the optimisation of the processes of]] the logistics [[cut:sector, obtaining a diminution of the costs of]] 12%\n• [[cut:Acted in the elaboration of]] dashboards [[cut:for the follow-up of]] the KPIs [[cut:of the area]]",
      after:
        "• [[add:Optimised]] logistics [[add:processes and cut costs by]] 12%\n• [[add:Built]] dashboards [[add:to track department]] KPIs",
      notes: ["Plain keywords", "One claim per line", "12% kept"],
    },
    faq: [
      {
        q: "Does Hireword score my resume against a job description?",
        a: "No, and we would rather say so than pretend. It rewrites the English of your bullets. Matching your experience to a specific posting is a judgement call that stays with you.",
      },
      {
        q: "Will it add keywords from the job ad?",
        a: "No job ad is supplied to the rewriter. Check relevant terms yourself and include only skills you actually have. The tool is instructed not to invent qualifications, but you must review the result.",
      },
      {
        q: "Should I keep my bullet characters?",
        a: "Simple bullets or hyphens are a practical choice. Parsing varies by system, so follow the employer’s instructions and check the uploaded document’s preview.",
      },
      {
        q: "How many bullets should each role have?",
        a: "Use enough bullets to show your relevant contribution without repetition. There is no fixed count or ATS advantage guaranteed by a particular number. You can paste related bullets together for a consistent rewrite.",
      },
    ],
    related: [
      { href: "/resume-rewriter", label: "Resume rewriter" },
      { href: "/cv-english-rewriter", label: "CV rewriter for UK and Europe" },
      { href: "/cover-letter-rewriter", label: "Cover letter rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "recruiter-message-rewriter": {
    slug: "recruiter-message-rewriter",
    context: "linkedin-message",
    metaTitle: "Recruiter Message Rewriter | Hireword",
    metaDescription:
      "Rewrite your message to a recruiter so it sounds natural and confident instead of stiff or over-formal. " + PRICE_LINE,
    ogTitle: "Recruiter Message Rewriter",
    ogDescription:
      "Paste your message to a recruiter and get it back short, warm, and natural. $19/month.",
    eyebrow: "Recruiter message rewriter",
    headingLead: "Message a recruiter like a",
    headingAccent: "colleague, not a form letter",
    intro:
      "Make your message clear, specific, and easy to read. Paste your draft and review a friendly, professional rewrite. A clearer message cannot guarantee a reply.",
    ctaLabel: "Rewrite my message",
    placeholder:
      "Dear Madam, I hope this message find you well. I am writing to you because I saw the announce of the position of Data Engineer in your company and I would like very much that you consider my candidature…",
    benefits: [
      {
        title: "Formal becomes friendly",
        body: "“Dear Madam, I would like very much that you consider my candidature” becomes something a recruiter can reply to in one line.",
      },
      {
        title: "Short enough to be read on a phone",
        body: "Most recruiter messages are read between meetings. The rewrite cuts the opening ceremony and gets to the role.",
      },
      {
        title: "Asks clearly for the next step",
        body: "A message without a question rarely gets an answer. The rewrite keeps your ask visible instead of buried in politeness.",
      },
      {
        title: "Still unmistakably you",
        body: "It works from your sentences, so the message that arrives is the one you meant to send — not a template a hundred other candidates also used.",
      },
    ],
    guidance: {
      title: "Make your message easy to answer",
      intro: "The English matters. So does the shape of the message.",
      items: [
        "Use their name and name the exact role in the first line.",
        "Give one reason you fit, not your whole history.",
        "Keep the first message brief and focused on the role and your reason for reaching out.",
        "End with a small, easy question rather than a large request.",
        "Respect any contact instructions in the posting and avoid repeated unsolicited messages.",
      ],
    },
    example: {
      context: "linkedin-message",
      tab: "Recruiter message",
      caption: "First message to a recruiter about a Data Engineer opening",
      before:
        "Dear Mrs. Lindqvist, I hope this message [[cut:find]] you well. I am writing to you because I saw [[cut:the announce of the position of]] Data Engineer in your company and I [[cut:would like very much that you consider my candidature]]. Thank you for your attention.",
      after:
        "Hi [[add:Ms.]] Lindqvist, I hope [[add:you're doing well]]. I saw [[add:your opening for]] the Data Engineer [[add:role]], and [[add:I'd love to be considered]]. Thanks for your time.",
      notes: ["Warmer", "More concise", "Same request"],
    },
    faq: [
      {
        q: "Is it acceptable to write “Hi” to a recruiter?",
        a: "In the US, UK, and most of Europe, yes — “Hi [first name]” is the normal register for a first professional message. “Dear Sir/Madam” reads as distant and slightly dated.",
      },
      {
        q: "Can I reuse the same message for several recruiters?",
        a: "Adapt the name, role, and reason for reaching out each time. Review the details before sending so the message fits its recipient.",
      },
      {
        q: "Does it work for a reply, not just a first message?",
        a: "Yes. Paste your reply draft and it comes back in the same natural register, which is where over-formality tends to creep back in.",
      },
      {
        q: "Will it keep the role title exactly?",
        a: "The tool is instructed to keep names, companies, titles, and dates. Check them against your original before sending.",
      },
    ],
    related: [
      { href: "/linkedin-connection-message-rewriter", label: "LinkedIn connection message rewriter" },
      { href: "/interview-follow-up-email-generator", label: "Interview follow-up email" },
      { href: "/cover-letter-rewriter", label: "Cover letter rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "linkedin-connection-message-rewriter": {
    slug: "linkedin-connection-message-rewriter",
    context: "linkedin-message",
    metaTitle: "LinkedIn Connection Message Rewriter | Hireword",
    metaDescription:
      "Rewrite your LinkedIn connection request or networking note so it sounds natural, warm, and worth accepting. " +
      PRICE_LINE,
    ogTitle: "LinkedIn Connection Message Rewriter",
    ogDescription:
      "Paste your LinkedIn note and get it back short, natural, and easy to accept. $19/month.",
    eyebrow: "LinkedIn message rewriter",
    headingLead: "A connection note that feels",
    headingAccent: "personal and professional",
    intro:
      "Start a professional conversation with a short, personal note. Paste your draft, review the rewrite, and check it against the character limit shown in your LinkedIn composer before sending.",
    ctaLabel: "Rewrite my LinkedIn note",
    placeholder:
      "Hello, I would like to add you to my professional network because I am very interested in the area of your company and I think we could have a professional exchange very enriching…",
    benefits: [
      {
        title: "Short enough for a connection note",
        body: "Connection-note limits can differ from regular messages. The editor counts your draft and result so you can compare them with the limit LinkedIn shows for your account. Edit the result here if it needs shortening.",
      },
      {
        title: "Specific instead of generic",
        body: "Keeps the actual reason you are reaching out — their post, their team, the role — rather than the empty “expand my network” opening.",
      },
      {
        title: "Warm without over-familiarity",
        body: "Natural English for a stranger you respect: friendly, brief, and free of the phrases that read as flattery.",
      },
      {
        title: "No fake personalisation",
        body: "Include only a real reason for connecting. The rewrite is instructed not to invent compliments or personal connections; check the result before sending.",
      },
    ],
    guidance: {
      title: "How to write the note itself",
      intro: "A brief introduction works best when every sentence has a purpose.",
      items: [
        "Say where you found them in six words or fewer.",
        "Give one honest, concrete reason for connecting.",
        "Do not ask for a job in the connection request itself — ask after they accept.",
        "Use the limited space for your reason for connecting rather than a long generic introduction.",
        "Read it aloud. If it sounds like a sales sequence, it reads like one.",
      ],
    },
    example: {
      context: "linkedin-message",
      tab: "Connection note",
      caption: "Connection request to an engineering manager after a conference talk",
      before:
        "Hello, I [[cut:assisted to]] your [[cut:presentation about]] reliability [[cut:in the conference of]] last week and I [[cut:would like very much to]] follow your work [[cut:in the future]].",
      after:
        "Hi — I [[add:was at]] your [[add:talk on]] reliability last week, and I'd [[add:like to]] follow your work.",
      notes: ["Natural phrasing", "Nothing invented", "Short enough to send"],
    },
    faq: [
      {
        q: "Should I always add a note to a connection request?",
        a: "A short, relevant note can provide context when someone does not know you. Whether you can add one depends on the options LinkedIn shows for your account.",
      },
      {
        q: "Does it count characters for me?",
        a: "Yes. Both versions have a character count. Check the limit shown in your LinkedIn composer, then shorten the editable result if needed. Hireword does not automatically enforce LinkedIn's account-specific limit.",
      },
      {
        q: "Can I use it for InMail as well?",
        a: "Yes. Both pages use the LinkedIn message setting. Check the length allowed in your LinkedIn composer and edit the result to fit.",
      },
      {
        q: "Will it write the note from scratch for me?",
        a: "It rewrites your own draft. Include a real reason for reaching out and a clear request; the tool is instructed not to invent a personal connection or experience.",
      },
    ],
    related: [
      { href: "/recruiter-message-rewriter", label: "Recruiter message rewriter" },
      { href: "/interview-follow-up-email-generator", label: "Interview follow-up email" },
      { href: "/resume-rewriter", label: "Resume rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "interview-follow-up-email-generator": {
    slug: "interview-follow-up-email-generator",
    context: "follow-up-email",
    metaTitle: "Interview Follow-Up Email Rewriter | Hireword",
    metaDescription:
      "Rewrite your post-interview thank-you or follow-up email so it sounds polite, natural, and never pushy. " + PRICE_LINE,
    ogTitle: "Interview Follow-Up Email Rewriter",
    ogDescription:
      "Paste your follow-up draft and get it back warm, brief, and correctly timed in tone. $19/month.",
    eyebrow: "Interview follow-up",
    headingLead: "Follow up warmly, without sounding",
    headingAccent: "impatient",
    intro:
      "The gap between grateful and pushy is narrow in English, and it is easy to land on the wrong side by accident. Paste your thank-you note or status check and get it back polite, brief, and correctly pitched.",
    ctaLabel: "Rewrite my follow-up",
    placeholder:
      "Dear Mr. Chen,\n\nI want to thank you for the interview of yesterday. I am still very interest in the position and I would like to know if there is already a decision about the process…",
    benefits: [
      {
        title: "Grateful, not anxious",
        body: "Removes the phrasing that signals nervousness — repeated apologies, over-thanking, and hedging — while keeping the warmth.",
      },
      {
        title: "Asks about the timeline politely",
        body: "“I would like to know if there is already a decision” becomes a question a hiring manager can answer without feeling chased.",
      },
      {
        title: "Correct tense throughout",
        body: "Yesterday's interview stays in the past, your interest stays in the present. Tense slips are the most common giveaway in follow-ups.",
      },
      {
        title: "Short enough to be read at once",
        body: "A follow-up that fits on one phone screen is easy to answer on the spot. One that scrolls is easy to leave for later.",
      },
    ],
    guidance: {
      title: "When and what to send",
      intro: "Timing does as much work as wording here.",
      items: [
        "Send the thank-you within 24 hours of the interview, while they still remember you.",
        "Mention one specific thing from the conversation — it proves you were listening.",
        "If they gave you a date, wait until it passes before checking in.",
        "If no timeline was given, allow time for a response before a brief check-in, and respect any request not to follow up.",
        "Reply in the existing email thread rather than starting a new one.",
      ],
    },
    example: {
      context: "follow-up-email",
      tab: "Follow-up email",
      caption: "Thank-you note sent the day after a first interview",
      before:
        "Dear Mr. Chen,\n\nI want to thank you for [[cut:the interview of yesterday]]. I am still very [[cut:interest in]] the position and [[cut:I would like to know if there is already a decision about the process]].",
      after:
        "Dear Mr. Chen,\n\nThank you for [[add:taking the time to meet me yesterday]]. I'm still very [[add:interested in]] the role, and [[add:I'd be glad to hear how the process is moving when you have an update]].",
      notes: ["Polite, not pushy", "Correct tense", "Easy to answer"],
    },
    faq: [
      {
        q: "How long should a thank-you email be?",
        a: "Four to six lines. Thank them, name one thing from the conversation, restate your interest, and stop.",
      },
      {
        q: "Is it rude to ask about the decision?",
        a: "Not if you ask once and phrase it as an offer to wait. The rewrite keeps that balance, which is exactly where many drafts slip.",
      },
      {
        q: "Should I write to each interviewer separately?",
        a: "If you met several people and have their addresses, yes — a short individual note beats one group email. Rewrite each one so they are not identical.",
      },
      {
        q: "What if I was rejected and want to stay in touch?",
        a: "You can rewrite a brief reply that thanks them and expresses a genuine wish to stay in touch. Respect their decision and review your message before sending.",
      },
    ],
    related: [
      { href: "/recruiter-message-rewriter", label: "Recruiter message rewriter" },
      { href: "/linkedin-connection-message-rewriter", label: "LinkedIn connection message rewriter" },
      { href: "/cover-letter-rewriter", label: "Cover letter rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "job-application-letter-rewriter": {
    slug: "job-application-letter-rewriter",
    context: "cover-letter",
    metaTitle: "Job Application Letter Rewriter | Hireword",
    metaDescription:
      "Improve your application letter in clear, professional English, then review the editable result against your draft. " +
      PRICE_LINE,
    ogTitle: "Job Application Letter Rewriter",
    ogDescription:
      "Paste the letter you are about to send and get it back natural and confident. $19/month.",
    eyebrow: "Application letter rewriter",
    headingLead: "The letter you are about to send,",
    headingAccent: "in clearer English",
    intro:
      "Make your application letter clear and easy to follow. Paste your own English draft, review the rewrite, and adapt the final text to the role and application instructions.",
    ctaLabel: "Rewrite my letter",
    placeholder:
      "Dear Recruitment Team,\n\nI would like to present my candidature for the position of Logistics Coordinator published in your careers page. I have worked during 7 years in the sector of transport…",
    benefits: [
      {
        title: "Fixes the structural English, not just the words",
        body: "Long sentences are split, the order of ideas is corrected, and the letter arrives in the shape an English reader expects.",
      },
      {
        title: "Removes the stiff openings",
        body: "“I would like to present my candidature” and “I have worked during 7 years” are the kind of stiff phrasing that weakens a letter. Both go.",
      },
      {
        title: "Your experience remains the starting point",
        body: "The rewrite is instructed to preserve durations, employers, and responsibilities. Compare the result with your original to make sure the wording stays accurate.",
      },
      {
        title: "Plain text, ready for the form field",
        body: "No formatting to strip, no stray symbols to delete before you submit the application.",
      },
    ],
    guidance: {
      title: "A possible structure for your letter",
      intro: "Use this as a starting point, then follow the employer’s instructions and the needs of your application.",
      items: [
        "Paragraph one: the role, where you saw it, and one sentence on why you fit.",
        "Paragraph two: your strongest relevant evidence — a project, a number, a responsibility.",
        "Paragraph three: what you would bring to them, and a straightforward closing line.",
        "Address a person if the posting names one. “Dear Hiring Manager” is a fine fallback; “To whom it may concern” is not.",
      ],
    },
    example: {
      context: "cover-letter",
      tab: "Application letter",
      caption: "Opening of an application for a Logistics Coordinator role",
      before:
        "Dear Recruitment Team,\n\nI [[cut:would like to present my candidature for]] the position of Logistics Coordinator [[cut:published in]] your careers page. I have worked [[cut:during 7 years in the sector of transport]] and I [[cut:possess]] experience in route planning.",
      after:
        "Dear Hiring Manager,\n\nI'm [[add:applying for]] the Logistics Coordinator [[add:role posted on]] your careers page. I have [[add:7 years of experience in transport]], [[add:including]] route planning.",
      notes: ["Clearer structure", "Seven years kept", "Shorter"],
    },
    faq: [
      {
        q: "Is an application letter the same as a cover letter?",
        a: "The terms often overlap, but employers may ask for different content. Both Hireword pages use the cover letter setting. Follow the requirements of the application you are preparing.",
      },
      {
        q: "Can I paste a letter that is already in English?",
        a: "That is exactly the case this is built for. It does not translate; it takes the English you wrote and makes it clearer and more natural.",
      },
      {
        q: "Will it keep the name of the company?",
        a: "The tool is instructed to keep company names, role titles, and dates. Review them alongside your original before sending.",
      },
      {
        q: "How long should the letter be?",
        a: "Follow the employer’s word or page limit. Keep your letter focused on relevant experience and remove repetition. Three short paragraphs can be a useful starting point, not a fixed rule.",
      },
    ],
    related: [
      { href: "/cover-letter-rewriter", label: "Cover letter rewriter" },
      { href: "/visa-sponsorship-cover-letter", label: "Visa sponsorship cover letter" },
      { href: "/cv-english-rewriter", label: "CV rewriter" },
    ],
  },

  /* ------------------------------------------------------------------ */
  "visa-sponsorship-cover-letter": {
    slug: "visa-sponsorship-cover-letter",
    context: "cover-letter",
    metaTitle: "Visa Sponsorship Cover Letter Rewriter | Hireword",
    metaDescription:
      "Rewrite the cover letter for a role that offers visa sponsorship — clear, professional English that states your situation plainly. " +
      PRICE_LINE,
    ogTitle: "Visa Sponsorship Cover Letter Rewriter",
    ogDescription:
      "Applying for a role that sponsors visas? Paste your cover letter and get it back clear and professional. $19/month.",
    eyebrow: "Visa sponsorship cover letter",
    headingLead: "State your situation plainly, in",
    headingAccent: "confident English",
    intro:
      "When a role offers sponsorship, the letter has one extra job: saying where you stand without apology and without ambiguity. Paste your draft and get it back clear, factual, and professional.",
    ctaLabel: "Rewrite my cover letter",
    placeholder:
      "Dear Hiring Manager,\n\nI am writing for the position of Mechanical Engineer. I am actually living in Brazil and I would need the sponsorship of visa that your announce mentions…",
    benefits: [
      {
        title: "Direct about sponsorship, never apologetic",
        body: "The rewrite states your requirement as a fact, the way an experienced applicant would state a notice period — no hedging, no over-explaining.",
      },
      {
        title: "Fixes the false friends that matter here",
        body: "“I am actually living in Brazil” means something different in English. Errors like this one are common in exactly this paragraph.",
      },
      {
        title: "Your status needs your review",
        body: "The tool is instructed to preserve how you describe your visa situation. Check the wording carefully before sending; a rewrite does not verify your immigration status.",
      },
      {
        title: "Leads with your value, not your paperwork",
        body: "Follow the employer’s instructions about sponsorship information. Arrange your own draft clearly before rewriting; Hireword does not check immigration or hiring requirements.",
      },
    ],
    guidance: {
      title: "How to handle sponsorship in the letter",
      intro: "The wording is only half of it. This is the part candidates most often get wrong.",
      items: [
        "Check the posting for sponsorship information. If it is unclear, ask the employer rather than assuming eligibility.",
        "Mention your situation once, in one sentence, near the end of the letter.",
        "State facts you can support: your current country, and the type of permission you would need.",
        "Do not promise a timeline or an outcome you cannot control.",
        "If you already hold a work permit for that country, say so early — it is an advantage, not a footnote.",
      ],
    },
    example: {
      context: "cover-letter",
      tab: "Sponsorship paragraph",
      caption: "The sponsorship paragraph of an application for a Mechanical Engineer role",
      before:
        "I am [[cut:actually]] living in Brazil and I would need [[cut:the sponsorship of visa that your announce mentions]]. I [[cut:stay at your disposition for]] any [[cut:information]] about [[cut:this subject]].",
      after:
        "I am [[add:currently based]] in Brazil and would need [[add:the visa sponsorship mentioned in your posting]]. [[add:I'm happy to share any details you need about my situation]].",
      notes: ["Plain and factual", "Status unchanged", "No apology"],
    },
    faq: [
      {
        q: "Should I mention that I need sponsorship at all?",
        a: "If the posting offers it, yes — one clear sentence saves a conversation later. Hiding it rarely works, because the question appears in the first screening call anyway.",
      },
      {
        q: "Will the tool give me immigration advice?",
        a: "No, and it should not. It rewrites the English of what you wrote. Questions about visa categories and eligibility belong with a qualified immigration adviser.",
      },
      {
        q: "Can it change how I describe my status?",
        a: "It is instructed to preserve your description, but you must review the result carefully. Hireword improves wording; it cannot verify your status or determine eligibility.",
      },
      {
        q: "Does this work for student and graduate visa routes too?",
        a: "You can rewrite your own description of your situation. Review every detail and use a qualified immigration adviser for questions about status or eligibility.",
      },
    ],
    related: [
      { href: "/cover-letter-rewriter", label: "Cover letter rewriter" },
      { href: "/job-application-letter-rewriter", label: "Job application letter rewriter" },
      { href: "/cv-english-rewriter", label: "CV rewriter" },
    ],
  },
};

export function getToolPage(slug: string): ToolPage {
  const page = TOOL_PAGES[slug];
  if (!page) throw new Error(`Unknown tool page: ${slug}`);
  return page;
}

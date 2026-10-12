export type Plan = {
  id: "free" | "monthly";
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
  note?: string;
};

export const MONTHLY_PLAN: Plan = {
  id: "monthly",
  name: "Monthly Pro",
  price: "$19",
  cadence: "USD per month",
  summary: "Polish up to 10 applications a day while you are job hunting.",
  features: [
    "Up to 10 cover letters a day",
    "All four document types",
    "American or British English",
    "Compare numeric expressions with your draft",
    "Cancel anytime — access runs to the end of the paid month",
    "Access Pro on another browser with a secure email link",
  ],
};

export const FREE_PLAN: Plan = {
  id: "free",
  name: "Free",
  price: "$0",
  cadence: "no subscription",
  summary: "Try your own draft before deciding whether you need Pro.",
  features: [
    "1 rewrite a day",
    "All four document types",
    "No email, password, or card required",
    "American or British English",
    "Review, edit, and copy your result",
  ],
};

export const PLANS: Plan[] = [FREE_PLAN, MONTHLY_PLAN];

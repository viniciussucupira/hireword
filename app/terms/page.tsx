import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/legal/LegalLayout";
import { SUPPORT_EMAIL, PRO_BURST_LIMIT, PRO_BURST_SECONDS, MAX_INPUT_CHARS } from "@/lib/constants";
import { PRO_DAILY_REWRITES } from "@/lib/allowance";

export const metadata: Metadata = {
  title: "Terms of Service | Hireword",
  description: "Terms of Service for Hireword.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "service",
    heading: "1. The Service",
    body: (
      <p>
        Hireword rewrites text you submit — such as cover letters, resume bullet points, and messages to
        recruiters — using artificial intelligence, so it reads more clearly and professionally. Without a
        paid plan, use is limited to one rewrite per browser per day, resetting at midnight UTC. Failed generations
        do not use this allowance. Free rewrites also share a daily ceiling across all free users; when it is reached,
        free rewrites pause until midnight UTC. Hireword Pro includes up to {PRO_DAILY_REWRITES} rewrites per day, as
        described in section 5. Each request supports up to {MAX_INPUT_CHARS.toLocaleString("en-US")} characters,
        including spaces and line breaks. Some symbols, such as emoji, count as more than one character in the editor.
      </p>
    ),
  },
  {
    id: "content",
    heading: "2. Your content",
    body: (
      <p>
        You retain all rights to the text you submit. We do not claim ownership over your content, and we do not use
        your submissions to train AI models. Do not submit content you don&apos;t have the right to share, or content
        that is unlawful, defamatory, or infringes on someone else&apos;s rights.
      </p>
    ),
  },
  {
    id: "no-guarantee",
    heading: "3. No guaranteed outcome",
    body: (
      <p>
        Hireword helps you write clearer, more natural English. It does not guarantee that you will get an
        interview, an offer, or any specific job-search outcome. AI can make mistakes or change the meaning of a
        sentence. Review every result before using it, especially names, dates, qualifications, and achievements.
        Hireword does not make hiring decisions or verify your credentials.
      </p>
    ),
  },
  {
    id: "payments",
    heading: "4. Payments",
    body: (
      <>
        <p>Hireword offers one paid plan: Pro at US$19 per month. If you subscribe, it renews automatically
          each month until cancelled. Checkout shows the currency, applicable taxes, and total before you pay.
          Any future price change will be communicated before it applies, with consent where required by law.</p>
        <p>Paddle is our Merchant of Record and authorised reseller. It handles payment processing, billing,
          taxes, and refunds. Purchases are also subject to the <a href="https://www.paddle.com/legal/buyer-terms">Paddle Buyer Terms</a>.</p>
        <p>You can <a href="/subscription#cancel">cancel on Hireword</a> after verifying your purchase email.
          Confirm cancellation before the next renewal to stop future renewals. You normally keep Pro until the
          end of the paid billing period. Cancelling does not automatically request a refund. Your first payment
          has a 14-day money-back guarantee, and renewals are refunded only where the law requires it or a fault on our side kept Pro from working; see our <a href="/refunds">Refund Policy</a>.</p>
      </>
    ),
  },
  {
    id: "access",
    heading: "5. Access and responsible use",
    body: (
      <>
        <p>No Hireword password is required. To use your purchase in another browser or recover access,
          request a single-use login link at <a href="/login">Log in</a> using your purchase email.
          Links expire after 15 minutes. Keep login links private and contact support if you lose access to that email.
          You can log out of one browser, or of every device at once, from the same page.</p>
        <p>Pro includes up to {PRO_DAILY_REWRITES} rewrites per day for each Pro account, where a day runs from 00:00 to
          24:00 UTC. Each rewrite counts as one, whatever its length, and each request accepts up to
          {" "}{MAX_INPUT_CHARS.toLocaleString("en-US")} characters. A rewrite that fails or that we cannot show you does
          not count. Unused rewrites do not carry over to the next day and have no cash value. Each Pro account also
          has a monthly safeguard against automated use, measured by the cost of the AI processing it requests and
          reset at 00:00 UTC on the 1st of each month; if an account reaches it, Pro rewrites pause until it resets.
          While a Pro renewal payment is past due, Pro rewrites pause until the payment succeeds; the free daily
          rewrite stays available. A Lifetime purchase made while that plan was sold keeps the access it was sold,
          without the daily limit or the monthly safeguard.</p>
        <p>Do not disrupt the service or attempt to bypass security controls. Temporary safeguards may limit
          abusive traffic. To protect availability, each Pro account can also submit up to {PRO_BURST_LIMIT} rewrite
          requests per {PRO_BURST_SECONDS} seconds across its browsers and devices.
          Service interruptions can still occur.
          If you cannot use a paid service, contact us so we can restore access or address the payment.</p>
        <p>Our <a href="/privacy">Privacy Policy</a> explains how text, access details, and usage data are processed.</p>
        <p>Copy, email, and WhatsApp tools help you move a result to another application. Hireword does
          not send job applications or messages on your behalf. You choose the recipient and confirm sending
          in the other application. Its availability and terms depend on that provider. Long results may
          need to be copied and pasted instead of opened through a link.</p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "6. Changes and your rights",
    body: (
      <p>
        We may update these Terms and will show the revised date here. Material changes affecting paid access
        will be communicated in advance, with consent where required. Changes do not reduce benefits you have
        already paid for. Nothing in these Terms excludes rights or remedies that cannot be excluded under
        applicable consumer law.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "7. Contact",
    body: (
      <p>
        Questions about these Terms can be sent to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="October 12, 2026"
      intro={
        <>
          Hireword is a product operated by Vinicius Colares Sucupira, an individual trading as Solrenning (&quot;we&quot;, &quot;us&quot;). By using hireword.com
          (the &quot;Service&quot;), you agree to these Terms.
        </>
      }
      sections={sections}
    />
  );
}

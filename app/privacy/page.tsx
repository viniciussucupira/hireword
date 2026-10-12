import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/legal/LegalLayout";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | Hireword",
  description: "Privacy Policy for Hireword.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "text",
    heading: "1. Text you submit",
    body: (
      <p>
        The text you paste into Hireword is sent to our AI provider (Anthropic) solely to generate a rewritten
        version. We do not save drafts or rewrites in Hireword databases or application logs.
        Anthropic processes the text under its <a href="https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data">API data-retention terms</a>; our no-storage policy does not
        mean the provider has zero retention. We do not use your submissions to train AI models. The result
        stays in the open page so you can review and copy it. Only include personal information needed for
        the rewrite. Hireword does not make hiring decisions about you.
      </p>
    ),
  },
  {
    id: "sharing",
    heading: "Sharing your rewritten text",
    body: (
      <>
        <p>Copy places the result on your device clipboard. Open email app passes the result to your
          configured email application. WhatsApp opens a third-party page with your result included in the
          link. Opening that link shares the text with WhatsApp even if you do not send a message.</p>
        <p>These actions happen only when you choose them. Hireword does not choose recipients or send
          messages for you. Links containing text may remain in browser history. Your email provider and
          WhatsApp process information under their own policies. For sensitive text, consider copying it
          and pasting only the information you want to share. Links to our other products open separate
          websites with their own privacy policies.</p>
      </>
    ),
  },
  {
    id: "email",
    heading: "2. Your email address",
    body: (
      <p>
        Free rewrites do not require an email address. If you previously supplied one through our free-rewrite
        form, it remains separate from your drafts and usage counts; these legacy records do not have an
        automatic expiry. You can request deletion at the address below. Marketing messages require an
        appropriate legal basis, including consent where required. We never sell your email or share it with advertisers.
        Paid access and support may require your email address. When you request an access link, we use Resend
        to deliver it to your email address. The link expires after 15 minutes and can be used once. We store
        its hashed token and your email for up to 15 minutes, and hashed email/IP request counters for up to
        one hour to prevent abuse. Resend processes delivery data under its own retention terms. Access-link
        requests do not subscribe you to marketing emails.
      </p>
    ),
  },
  {
    id: "limits",
    heading: "3. Usage limits",
    body: (
      <p>
        Your free daily allowance is linked to a random browser identifier, not shared with everyone on your
        internet connection. Daily allowance records expire within 48 hours. Hashed IP counters used separately
        to prevent automated abuse expire after one hour. We also record token counts and estimated AI costs,
        separated into free and paid usage. Daily totals and monthly pseudonymous paid-usage totals are kept
        for up to 400 days. To count Pro&apos;s daily rewrites, we keep the day&apos;s request
        identifiers for each Pro account under a keyed hash of its email address, deleted after two days. For the
        monthly safeguard against automated use, we keep the month&apos;s estimated AI cost for each Pro account under
        a keyed hash, deleted after 40 days, and one shared daily total for all free use, deleted after three days. When Paddle reports a renewal payment as past due, we keep a mark under
        a hash of the email address for at most four days. These records do not contain your drafts or rewritten text.
      </p>
    ),
  },
  {
    id: "payment",
    heading: "4. Payment information",
    body: (
      <p>
        If you purchase Hireword Pro, your payment is handled entirely by Paddle.com, our Merchant of Record. We
        never see or store your card details. Paddle shares your email address with us so we can activate your Pro
        access. We also receive transaction and subscription identifiers and status information to verify
        purchases, renewals, cancellations, and refunds. Monthly access records expire after the paid period
        plus a short processing grace period. Some purchase references do not have an automatic expiry.
        Refund-request records include a transaction identifier and request time and have no automatic expiry;
        we retain them to prevent duplicate refund submissions and resolve payment disputes.
        If you purchase Pro, we keep the resulting records as needed to provide access, resolve
        payment issues, and meet applicable recordkeeping obligations. Deletion requests are reviewed against those needs.
      </p>
    ),
  },
  {
    id: "cookies",
    heading: "5. Cookies, local storage, and analytics",
    body: (
      <p>
        We use secure, httpOnly cookies for your browser&apos;s free allowance and purchased Pro access, lasting
        up to one year. A separate billing cookie lasts 15 minutes after you verify your email to manage a subscription.
        An older version saved a local flag after email entry; free rewrites no longer use that flag. We
        use <a href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics</a> for cookie-free
        traffic statistics, such as page views, referring sites, device types, and countries. We
        don&apos;t use advertising cookies.
      </p>
    ),
  },
  {
    id: "providers",
    heading: "6. Providers and international processing",
    body: (
      <>
        <p>Vercel hosts Hireword and processes technical request information, including, when a login link
          is asked for, a check that a person&apos;s browser sent the request rather than a program, made by
          reading the browser&apos;s answer to a small challenge. Upstash stores access,
          subscription, security, and usage records. Anthropic generates rewrites, Resend delivers access
          emails, and Paddle handles purchases. Support messages are processed to respond to your request.
          Hosting and delivery providers may retain operational logs under their own policies, separately
          from the application-record lifetimes listed above.</p>
        <p>These providers may process information outside your country, where data-protection laws may differ.
          Their own privacy and contractual terms also apply to their processing. Contact us for information
          about the providers and safeguards relevant to your data. We may disclose information when legally
          required or necessary to investigate fraud or protect the service.</p>
      </>
    ),
  },
  {
    id: "purposes",
    heading: "7. Why we process information",
    body: (
      <p>Where data-protection law requires a legal basis, we process information necessary to provide
        requested rewrites, purchased access, billing management, and support to perform our contract with
        you. Security controls, abuse prevention, and service-cost monitoring support our legitimate
        interests in operating a reliable service, subject to your rights. We process records required by
        law to meet legal obligations and rely on consent where required for optional processing.</p>
    ),
  },
  {
    id: "contact",
    heading: "8. Your choices and contact",
    body: (
      <>
        <p>Contact Solrenning at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> for privacy questions
          or requests. Depending on applicable law, you may have rights to access, correct, delete, or obtain
          a copy of your information, restrict processing, or object to it. You can withdraw consent for
          processing based on consent without affecting earlier lawful processing, and complain to your
          local data-protection authority.</p>
        <p>We may need to verify your identity before disclosing or changing purchase records. Do not send
          passwords or full payment-card details. Clearing browser cookies removes remembered access on
          that browser; it does not cancel a subscription or delete payment records. To stop renewals,
          use <a href="/subscription#cancel">Cancel subscription</a>.</p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="October 12, 2026"
      intro={
        <>
          Hireword is operated by Vinicius Colares Sucupira, an individual trading as Solrenning (&quot;we&quot;, &quot;us&quot;), the controller of the personal data described here. This page explains what data we
          collect and why.
        </>
      }
      sections={sections}
    />
  );
}

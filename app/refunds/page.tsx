import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/legal/LegalLayout";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund Policy | Hireword",
  description: "Refund Policy for Hireword.",
  alternates: { canonical: "/refunds" },
};

const sections: LegalSection[] = [
  {
    id: "monthly",
    heading: "Monthly plan",
    body: (
      <>
        <p>
          Your first Pro payment is fully refundable for 14 days: request it within 14 days of that charge for a full refund, no questions asked and no reason needed. Renewals are not refundable, except where the law of your country requires a refund, or where a fault on our side kept Pro from working and we could not fix it, in which case we refund the period it affected.
        </p>
        <p>
          You can cancel at any time. Cancellation stops future renewals and keeps the remaining paid period, which is refunded only under the rule above. Request your first-payment refund directly on this site; the confirmation also stops renewal. For a payment the law or a fault on our side makes refundable, use <a href="https://paddle.net/contact">Paddle payment help</a>. You do not need to email Hireword. This policy does not limit your statutory rights.
        </p>
      </>
    ),
  },
  {
    id: "cancel",
    heading: "How to cancel",
    body: (
      <>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open <a href="/subscription#cancel">Billing &amp; support</a> and enter the email used for your purchase.</li>
          <li>Open the secure link in your email to verify access. No Hireword password or Paddle login is required.</li>
          <li>Select your subscription, choose Cancel subscription, and confirm. Check the confirmation and access end date.</li>
        </ol>
        <p>Cancel before your next renewal. A confirmed cancellation stops future renewals; it does not refund
          an existing charge. If you want a refund as well, follow the instructions below. A refund may end the
          Pro access associated with the refunded payment.</p>
        <p>If you cannot access your email or the cancellation fails, contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          You can also use the management link in your Paddle receipt or <a href="https://paddle.net">Paddle payment support</a>.
          Keep a copy of your request and contact us if confirmation does not arrive. A delay in our response
          does not remove rights you have under applicable law.</p>
      </>
    ),
  },
  {
    id: "how",
    heading: "How to request a refund",
    body: (
      <>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open <a href="/subscription#refund">Request a refund</a> and verify your purchase email using the secure link we send automatically.</li>
          <li>Review the first payment shown, choose Request a refund, and confirm the refund and cancellation of future renewals.</li>
          <li>We submit eligible requests directly to Paddle. Check the status on the same page. A request awaiting approval is not yet an approved refund.</li>
        </ol>
        <p>No support email or explanation is needed for an eligible payment request. Paddle may require
          its own approval. Approved refunds return to the original payment method; the time for the credit
          to appear depends on that provider. Access from the refunded payment ends.</p>
        <p>Your request date determines whether you meet our 14-day guarantee, even if processing takes longer.
          If the automated option is unavailable, a request is unconfirmed, or another charge needs review,
          use <a href="https://paddle.net/contact">Paddle payment help</a> directly. Keep your request confirmation.
          You do not need to email Hireword. Never share a password or full card number.</p>
      </>
    ),
  },
  {
    id: "rights",
    heading: "Your consumer rights",
    body: (
      <p>This policy is in addition to any refund, withdrawal, or other consumer rights provided by applicable
        law. It does not remove those rights or shorten mandatory deadlines. See the <a href="https://www.paddle.com/legal/buyer-terms">Paddle Buyer Terms</a> for
        the terms that apply to your payment.</p>
    ),
  },
];

export default function RefundsPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      updated="October 12, 2026"
      intro="All payments for Hireword are processed by Paddle.com, acting as Merchant of Record. Paddle handles billing and refunds on our behalf."
      sections={sections}
    />
  );
}

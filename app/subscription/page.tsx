import type { Metadata } from "next";
import Link from "next/link";
import BillingManager from "./BillingManager";
import { ButtonLink } from "@/components/ui/Primitives";
export const metadata: Metadata = { title: "Billing & support | Hireword", description: "Cancel renewal, request a refund, or log in to Hireword Pro. No password or Paddle login needed.", alternates: { canonical: "/subscription" } };
export default function SubscriptionPage() {
 return <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-6 sm:py-16">
  <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Billing &amp; support</h1>
  <p className="mt-4 text-lg leading-7 text-muted">Manage your Hireword subscription here. No password, Paddle login, or email to support required.</p>
  <div className="mt-8 grid gap-4 sm:grid-cols-2">
   <article className="rounded-2xl border border-line bg-white p-6"><h2 className="text-xl font-semibold text-ink">Cancel subscription</h2><p className="mt-3 leading-7 text-muted">Stop future renewals. Keep access for the period already paid for, unless that payment is refunded. Cancellation does not return money.</p><ButtonLink href="#cancel" variant="secondary" className="mt-5">Cancel subscription</ButtonLink></article>
   <article className="rounded-2xl border border-line bg-white p-6"><h2 className="text-xl font-semibold text-ink">Request a refund</h2><p className="mt-3 leading-7 text-muted">A refund returns money to your original payment method. Your first payment has a 14-day refund guarantee; request it here. Renewals are refunded only where the law requires it or a fault on our side kept Pro from working. This also stops renewal; access from the refunded payment ends once approved.</p><ButtonLink href="#refund" variant="secondary" className="mt-5">Request a refund</ButtonLink></article>
  </div>
  <section id="cancel" className="mt-8 scroll-mt-24 rounded-2xl border border-line p-6 sm:p-8">
   <h2 className="text-2xl font-semibold text-ink">Manage cancellation &amp; refunds</h2>
   <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-muted"><li>Enter the email you used at checkout.</li><li>Open the secure email link and select “Manage my subscription”.</li><li>Choose cancellation or refund below, then confirm your choice.</li></ol>
   <p className="mt-3 text-sm leading-6 text-muted">Already verified? Your options appear below. Opening the email link does not cancel anything or request a refund.</p>
   <BillingManager />
  </section>
  <section className="mt-8 rounded-2xl border border-line p-6"><h2 className="text-lg font-semibold text-ink">Need Pro on this device?</h2><p className="mt-2 leading-7 text-muted">Log in with your purchase email. You do not need to pay again.</p><ButtonLink href="/login" variant="secondary" className="mt-4">Log in</ButtonLink></section>
  <details className="mt-8 border-t border-line pt-5"><summary className="cursor-pointer py-2 font-semibold text-ink">Payment help &amp; other options</summary><p className="mt-3 leading-7 text-muted">For a payment that needs review, an inaccessible purchase email, or a problem with these options, contact Paddle payment support. A support request is not a completed cancellation or approved refund until confirmed.</p><a href="https://paddle.net/contact" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center font-semibold underline">Paddle payment help</a><p className="mt-3 leading-7 text-muted">To update your payment method or download an invoice, use the Paddle customer portal linked in your receipt.</p></details>
  <p className="mt-6 text-sm leading-6 text-muted">Closing this site or clearing cookies does not stop renewal. Refund approval and processing are handled by Paddle. See the <Link href="/refunds" className="underline">refund policy</Link> for eligibility and your rights.</p>
 </div>;
}

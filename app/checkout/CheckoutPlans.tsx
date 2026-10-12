"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FREE_PLAN, MONTHLY_PLAN, type Plan } from "@/lib/plans";
import { Button, ButtonLink, Container, Eyebrow, Section } from "@/components/ui/Primitives";
import { IconCheck, IconLock, IconClock, IconShield, IconReceipt } from "@/components/ui/Icons";
import { useProStatus, refreshProStatus } from "@/components/ui/useProStatus";
import { activatePurchase } from "@/lib/payment-activation";
import { CHECKOUT_ORIGIN, PRO_BURST_LIMIT, PRO_BURST_SECONDS } from "@/lib/constants";
import { RECOVERY_ORIGIN } from "@/lib/recovery";

type PaddleCheckoutEvent = {
  name: string;
  data?: { transaction_id?: string };
};

type PaddleClient = {
  Environment: { set: (env: string) => void };
  Setup: (options: { token?: string; eventCallback: (event: PaddleCheckoutEvent) => void }) => void;
  Checkout: {
    open: (options: {
      items: { priceId: string; quantity: number }[];
      settings?: { locale?: string };
    }) => void;
  };
};

declare global {
  interface Window {
    Paddle: PaddleClient;
  }
}

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!;

function PlanColumn({
  plan,
  highlight = false,
  children,
  footnote,
}: {
  plan: Plan;
  highlight?: boolean;
  children: React.ReactNode;
  footnote?: string;
}) {
  return (
    <div
      className={
        "relative flex flex-col rounded-2xl border p-6 sm:p-7 " +
        (highlight
          ? "border-brand bg-white shadow-[0_28px_70px_-50px_rgba(16,35,63,0.6)] lg:-my-4 lg:py-10"
          : "border-line bg-white")
      }
    >
      {highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white">
          Cancel anytime
        </span>
      )}
      <p className="text-[0.9375rem] font-semibold text-navy">{plan.name}</p>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[2.75rem] font-semibold leading-none tracking-[-0.03em] text-navy">
          {plan.price}
        </span>
        <span className="text-sm text-muted">{plan.cadence}</span>
      </p>
      <p className="mt-3 text-[0.9375rem] leading-6 text-muted">{plan.summary}</p>
      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[0.9375rem] leading-6 text-ink">
            <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-7">{children}</div>
      {footnote && <p className="mt-3 text-center text-[0.8125rem] text-muted">{footnote}</p>}
    </div>
  );
}

export default function CheckoutPlans() {
  const { isPro, ready: accessReady, unavailable: accessUnavailable } = useProStatus();
  const [paddleReady, setPaddleReady] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [restoreId, setRestoreId] = useState("");
  const confirmationInFlight = useRef(false);
  const checkoutInFlight = useRef(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // The payment page may be served from an earlier, Paddle-approved address
  // (see CHECKOUT_ORIGIN and proxy.ts). Pro is a cookie on the site's own
  // name, so a purchase made there is handed back here with its transaction
  // id after "#activate=", verified with Paddle, and switched on.
  useEffect(() => {
    if (window.location.origin !== RECOVERY_ORIGIN) return;
    const match = window.location.hash.match(/^#activate=(txn_[a-z0-9]{26})$/);
    if (!match) return;
    const transactionId = match[1];
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    Promise.resolve().then(async () => {
      setPaymentReceived(true);
      setRestoreId(transactionId);
      confirmationInFlight.current = true;
      setConfirming(true);
      try {
        if (!await activatePurchase(transactionId)) throw new Error("Activation pending");
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/?upgraded=1");
      } catch {
        setCheckoutError("Your payment completed, but activation could not be confirmed. Use Log in below to retry. Do not pay again.");
      } finally {
        confirmationInFlight.current = false;
        setConfirming(false);
      }
    });
  }, []);

  // Arrived from the site's own name to pay: open the checkout once it is ready.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || !paddleReady || !accessReady || accessUnavailable) return;
    if (window.location.origin === RECOVERY_ORIGIN || window.location.hash !== "#start") return;
    autoStarted.current = true;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    handleCheckout(MONTHLY_PRICE_ID);
  });

  useEffect(() => {
    if (paddleReady) return;
    const timer = window.setTimeout(() => setCheckoutError("Checkout is taking longer than expected. Refresh this page or try again later."), 15000);
    return () => window.clearTimeout(timer);
  }, [paddleReady]);

  function initializePaddle() {
    if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || !MONTHLY_PRICE_ID) {
      setCheckoutError("Checkout is temporarily unavailable. You can still use the free rewrite.");
      return;
    }
    try {
    if (window.Paddle) {
      const env = process.env.NEXT_PUBLIC_PADDLE_ENV;
      if (env === "sandbox") {
        window.Paddle.Environment.set("sandbox");
      }
      window.Paddle.Setup({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        eventCallback: eventCallback,
      });
      setPaddleReady(true);
      setCheckoutError("");
    }
    } catch {
      setCheckoutError("We could not load secure checkout. Refresh the page to try again.");
    }
  }

  async function eventCallback(event: PaddleCheckoutEvent) {
    if (event.name === "checkout.closed" || event.name === "checkout.error") {
      checkoutInFlight.current = false;
      setCheckoutOpen(false);
      if (event.name === "checkout.error") setCheckoutError("Secure checkout could not open. Please try again shortly or contact support.");
      return;
    }
    if (event.name !== "checkout.completed" || confirmationInFlight.current) return;
    setPaymentReceived(true);
    setCheckoutError("");
    const transactionId = event.data?.transaction_id;
    if (!transactionId) {
      setCheckoutError("Payment completed, but we could not activate this browser. Log in with your purchase email to switch Pro on. Do not pay again.");
      return;
    }
    setRestoreId(transactionId);
    if (window.location.origin !== RECOVERY_ORIGIN) {
      // Paid on the earlier address: switch Pro on where it will be used.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${RECOVERY_ORIGIN}/checkout#activate=${encodeURIComponent(transactionId)}`);
      return;
    }
    confirmationInFlight.current = true;
    setConfirming(true);
    const done = () => {
      // Full page navigation (not router.push) is intentional: it makes the
      // home page re-read the Pro cookie that /api/paddle/confirm just set.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/?upgraded=1");
    };
    try {
    if (!await activatePurchase(transactionId)) throw new Error("Activation pending");
    done();
    } catch {
      setCheckoutError("Your payment completed, but activation could not be confirmed. Use Log in below to retry. Do not pay again.");
    } finally {
      confirmationInFlight.current = false;
      setConfirming(false);
    }
  }

  function handleCheckout(priceId: string) {
    // Plans and Pro status are read here, on the site's own name, so a reader
    // who already has Pro is never offered a second purchase. Only the
    // payment itself opens on the Paddle-approved address (CHECKOUT_ORIGIN).
    if (window.location.origin !== CHECKOUT_ORIGIN && window.location.origin === RECOVERY_ORIGIN) {
      if (!priceId || paymentReceived || isPro || !accessReady || accessUnavailable) return;
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${CHECKOUT_ORIGIN}/checkout#start`);
      return;
    }
    if (!window.Paddle || !priceId || checkoutInFlight.current || paymentReceived || isPro || !accessReady || accessUnavailable) return;
    checkoutInFlight.current = true;
    setCheckoutOpen(true);
    setCheckoutError("");
    try {
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: { locale: "en" },
    });
    } catch {
      checkoutInFlight.current = false;
      setCheckoutOpen(false);
      setCheckoutError("Secure checkout could not open. Refresh the page and try again.");
    }
  }

  return (
    <>
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" onReady={initializePaddle} onError={() => setCheckoutError("Secure checkout could not load. Check your connection and refresh the page.")} strategy="afterInteractive" />

      <Section tone="white" className="relative overflow-hidden">
        <div className="na-aurora" aria-hidden="true">
          <span className="na-orb-blue" />
          <span className="na-orb-jade" />
        </div>
        <Container size="wide" className="relative py-14 sm:py-20">
          <div className="na-rise mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-navy sm:text-[2.75rem]">
              Unlimited rewrites for <span className="na-accent-text">$19 a month</span>
            </h1>
            <p className="text-[1.0625rem] leading-7 text-muted">
              One paid plan with everything in it. Try it free first, and cancel the moment your job search ends —
              access runs to the end of the month you already paid for.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl items-stretch gap-8 md:grid-cols-2">
            <PlanColumn plan={FREE_PLAN} footnote="One allowance per browser, resetting at midnight UTC.">
              <ButtonLink href="/#tool" variant="secondary" size="lg" className="w-full">Try the free rewriter</ButtonLink>
            </PlanColumn>
            <PlanColumn plan={MONTHLY_PLAN} highlight footnote="Full refund within 14 days of your first payment.">
              {isPro ? <div role="status"><p className="mb-3 text-sm font-semibold text-success">Pro is already active in this browser. No new purchase is needed.</p><ButtonLink href="/#tool" size="lg" className="w-full">Continue rewriting</ButtonLink></div> : <>
              <Button
                size="lg"
                onClick={() => handleCheckout(MONTHLY_PRICE_ID)}
                disabled={!paddleReady || checkoutOpen || paymentReceived || !accessReady || accessUnavailable}
                className="w-full"
              >
                {!accessReady ? "Checking access…" : accessUnavailable ? "Access check unavailable" : confirming ? "Activating Pro…" : paymentReceived ? "Payment completed" : checkoutOpen ? "Checkout open…" : paddleReady ? "Subscribe monthly" : checkoutError ? "Checkout unavailable" : "Loading checkout…"}
              </Button>
              <p className="mt-3 text-xs leading-5 text-muted">Renews monthly until canceled. Any applicable taxes and the final total are shown in secure checkout.</p>
              <p className="mt-3 text-sm text-muted">Already subscribed? <Link href="/login" className="font-semibold text-brand-700 underline underline-offset-4">Log in</Link> before buying again.</p>
              </>}
              {accessUnavailable && <div role="alert" className="mt-4 text-sm leading-6 text-flag"><p>We could not check whether you already have Pro. Please retry before paying to avoid a duplicate purchase.</p><button type="button" onClick={refreshProStatus} className="min-h-11 font-semibold underline">Check my access again</button></div>}
              {checkoutError && (
                <div role="alert" className="mt-4 text-sm leading-6 text-flag">
                  <p>{checkoutError}</p>
                  <Link href="/support" className="mt-2 inline-flex min-h-11 items-center font-semibold underline">Get help</Link>
                  {paymentReceived && <Link href={restoreId ? `/login?txn=${encodeURIComponent(restoreId)}` : "/login"} className="mt-2 inline-flex min-h-11 items-center font-semibold underline">Log in</Link>}
                </div>
              )}
            </PlanColumn>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-muted">Both plans use the same rewriting tool, English styles, and number comparison. Each request accepts up to 6,000 characters. Pro removes the daily rewrite limit, with a safeguard of {PRO_BURST_LIMIT} requests per {PRO_BURST_SECONDS} seconds per account.</p>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-6 text-muted">No Hireword account or password to create. Pay securely with Paddle, keep your receipt, and Pro activates in this browser. <Link href="/subscription" className="font-semibold text-brand-700 underline">Access & billing help</Link> · <Link href="/subscription#cancel" className="font-semibold text-brand-700 underline">How to cancel</Link></p>

          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[0.875rem] text-muted">
            {[
              { Icon: IconLock, text: "Secure payment by Paddle", tone: "text-brand" },
              { Icon: IconShield, text: "Hireword never stores your card", tone: "text-jade" },
              { Icon: IconClock, text: "14-day refund policy", tone: "text-amber" },
              { Icon: IconCheck, text: "Cancel the monthly plan anytime", tone: "text-violet" },
            ].map(({ Icon, text, tone }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className={`h-[1.1rem] w-[1.1rem] ${tone}`} />
                {text}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container size="wide" className="py-14 sm:py-18">
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-[1.0625rem] font-semibold text-navy">What you are paying for</h2>
              <p className="mt-2.5 text-[0.9375rem] leading-6 text-muted">
                Unlimited rewrites while the subscription is active, all four document types, and no lock-in: you
                cancel on the Hireword Access & billing page and keep access until the end of the month you paid for.
              </p>
              <p className="mt-3 text-[0.9375rem] leading-6 text-muted">
                The full wording is in the{" "}
                <Link href="/terms" className="font-medium text-brand-700 underline underline-offset-4">
                  Terms
                </Link>{" "}
                and the{" "}
                <Link href="/refunds" className="font-medium text-brand-700 underline underline-offset-4">
                  Refund Policy
                </Link>
                . We would rather write the exact terms down than promise more than we can deliver.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="flex items-center gap-2 text-[1.0625rem] font-semibold text-navy">
                <IconReceipt className="h-5 w-5 text-brand" />
                Already paid on another device?
              </h2>
              <p className="mt-2.5 text-[0.9375rem] leading-6 text-muted">
                Pro is remembered in the browser you paid from. To use it somewhere else, log in with your
                purchase email — no password or new payment needed.
              </p>
              <ButtonLink href="/login" variant="secondary" className="mt-5">
                Log in
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

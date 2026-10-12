"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { Button, ButtonLink, Container, Eyebrow, Section } from "@/components/ui/Primitives";
import { IconAlert, IconCheck, IconLock, IconReceipt } from "@/components/ui/Icons";
import { refreshProStatus } from "@/components/ui/useProStatus";
import { parseRestoreInput } from "@/lib/restore-input";
import { EmailRequest } from "./EmailAccess";

type Status = "idle" | "working" | "done" | "failed";

const STEPS = [
  {
    title: "Open your Paddle receipt",
    body: "It is the email that arrived right after your payment, from Paddle.com, with the subject line naming Hireword.",
  },
  {
    title: "Copy the transaction ID",
    body: "Look for the transaction ID in your receipt or purchase details. It starts with txn_. If you cannot find it, ask support below; you do not need to buy again.",
  },
  {
    title: "Paste it into the form",
    body: "We check it against your purchase and switch Pro on in this browser. Nothing else is asked of you.",
  },
];

const EMAIL_STEPS = [
  { title: "Enter your purchase email", body: "Use the same email you entered at checkout. There is no password to remember." },
  { title: "Open your login email", body: "Check your inbox and spam folder. The link expires in 15 minutes and works once." },
  { title: "Tap Log in", body: "Open the link on the device you want to use. We check your purchase and switch Pro on, with no new charge." },
];

function ReceiptIllustration() {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Where to find it
      </p>
      <div className="mt-4 rounded-xl border border-line bg-ivory p-4" role="img" aria-label="Example Paddle receipt showing the transaction ID line near the bottom">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <IconReceipt className="h-4 w-4 text-muted-soft" />
          <span className="text-[0.75rem] font-semibold text-navy">Paddle.com receipt</span>
        </div>
        <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
          <div className="flex items-center justify-between">
            <span className="h-2 w-24 rounded-full bg-line" />
            <span className="h-2 w-12 rounded-full bg-line" />
          </div>
          <div className="flex items-center justify-between">
            <span className="h-2 w-32 rounded-full bg-line" />
            <span className="h-2 w-10 rounded-full bg-line" />
          </div>
          <div className="mt-2 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-700">
              Transaction ID
            </p>
            <p className="mt-0.5 font-mono text-[0.75rem] text-navy">txn_01hq8k3m…</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginForm({ emailEnabled = false }: { emailEnabled?: boolean }) {
  const [transactionId, setTransactionId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [fieldError, setFieldError] = useState("");
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);

  async function restore(id: string) {
    setStatus("working");
    setServiceUnavailable(false);
    setLoginRequired(false);
    try {
      const res = await fetch("/api/paddle/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id.trim() }),
        signal: AbortSignal.timeout(30000),
      });
      setServiceUnavailable(res.status >= 500 || res.status === 429 || res.status === 409);
      setLoginRequired(res.status === 403 && (await res.clone().json().catch(() => null))?.error === "login_required");
      if (res.ok) refreshProStatus();
      setStatus(res.ok ? "done" : "failed");
    } catch {
      setServiceUnavailable(true);
      setStatus("failed");
    }
  }

  useEffect(() => {
    // Prefill legacy links, then remove the bearer code from browser history.
    const fromLink = new URLSearchParams(window.location.search).get("txn");
    if (fromLink) {
      Promise.resolve().then(() => {
        setTransactionId(fromLink);
        const url = new URL(window.location.href);
        url.searchParams.delete("txn");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      });
    }
  }, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldError("");
    const raw = transactionId.trim();
    if (!raw) {
      setFieldError("Paste the transaction ID from your receipt.");
      return;
    }
    const normalized = parseRestoreInput(raw);
    if (!normalized) {
      setFieldError("Paste one complete code starting with txn_, or your restore link. Cannot find it? Use the recovery help below.");
      return;
    }
    setTransactionId(normalized);
    restore(normalized);
  }

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Log in to Hireword Pro")}&body=${encodeURIComponent(
    "Hi, I cannot log in to Hireword Pro. I'm writing from the email I used to pay."
  )}`;

  return (
    <>
      <Section tone="white">
        <Container size="wide" className="py-14 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="flex flex-col gap-5">
              <Eyebrow>Log in</Eyebrow>
              <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-navy sm:text-[2.5rem]">
                Log in to <span className="na-accent-text">Hireword Pro.</span>
              </h1>
              <p className="max-w-xl text-[1.0625rem] leading-7 text-muted">
                {emailEnabled
                  ? "There is no password. Enter the email you used to pay and we will send you a one-time login link. Use it on a new device, after clearing cookies, or whenever Pro is not showing. Logging in never charges you."
                  : "There is no password. Pro is remembered in the browser you paid from. Use this page after switching devices or clearing cookies to reconnect your existing purchase, without another charge."}
              </p>

              {emailEnabled && status !== "done" && <EmailRequest />}
              <Link href="#receipt-help" className="inline-flex min-h-11 items-center font-semibold text-brand-700 underline underline-offset-4">{emailEnabled ? "Need more help?" : "No purchase code? Get recovery help"}</Link>

              {status === "done" ? (
                <div className="mt-2 rounded-2xl border border-success/25 bg-success-50 p-6" role="status">
                  <p className="flex items-center gap-2.5 text-[1.0625rem] font-semibold text-navy">
                    <IconCheck className="h-5 w-5 text-success" />
                    Pro is active in this browser
                  </p>
                  <p className="mt-2 text-[0.9375rem] leading-6 text-muted">
                    600 rewrites a month, starting now. Nothing else to set up.
                  </p>
                  <ButtonLink href="/#tool" className="mt-5">
                    Start rewriting
                  </ButtonLink>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3">
                  <label htmlFor="txn" className="text-sm font-semibold text-navy">
                    {emailEnabled ? "Just paid? Use the purchase code from your receipt" : "Purchase code or restore link"}
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id="txn"
                      value={transactionId}
                      disabled={status === "working"}
                      onChange={(e) => { setTransactionId(e.target.value); setFieldError(""); if (status === "failed") setStatus("idle"); }}
                      placeholder="Paste your txn_ code or restore link"
                      autoComplete="off"
                      spellCheck={false}
                      aria-describedby={fieldError ? "txn-error txn-help" : "txn-help"}
                      aria-invalid={Boolean(fieldError) || status === "failed"}
                      className="h-12 w-full rounded-full border border-line-strong bg-white px-5 font-mono text-[0.9375rem] text-ink placeholder:font-sans placeholder:text-muted-soft focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 sm:flex-1"
                    />
                    <Button type="submit" size="lg" disabled={status === "working"} className="sm:w-auto">
                      {status === "working" ? "Checking…" : emailEnabled ? "Use purchase code" : "Log in with code"}
                    </Button>
                  </div>
                  <p id="txn-help" className="text-[0.8125rem] text-muted">
                    The purchase code is called a transaction ID and begins with <code className="rounded bg-ivory px-1 py-0.5 font-mono">txn_</code>.{" "}
                    {emailEnabled ? "It logs you in for 24 hours after payment. After that, use your email above." : "You can also paste a restore link sent by support."}
                  </p>

                  {fieldError && (
                    <p id="txn-error" role="alert" className="flex items-center gap-2 text-[0.875rem] font-medium text-flag">
                      <IconAlert className="h-4 w-4" />
                      {fieldError}
                    </p>
                  )}

                  {status === "failed" && (
                    <div role="alert" className="rounded-2xl border border-flag/25 bg-flag-50 p-4">
                      <p className="flex items-center gap-2 text-[0.9375rem] font-semibold text-navy">
                        <IconAlert className="h-4 w-4 text-flag" />
                        {serviceUnavailable ? "We could not check your purchase right now" : loginRequired ? "Log in with your email instead" : "We could not find an active purchase with that ID"}
                      </p>
                      <p className="mt-1.5 text-[0.875rem] leading-6 text-muted">
                        {serviceUnavailable ? "Please try again shortly. This does not mean your subscription has ended. You do not need to pay again." : loginRequired ? "Purchase codes work for 24 hours after payment. Enter the email you used to pay above and we will send you a login link. Your purchase is safe and you do not need to pay again." : "Check the full code from your receipt. If it still does not work, contact support from your purchase email. You do not need to pay again."}
                      </p>
                      <a
                        href={mailto}
                        className="mt-3 inline-flex min-h-11 items-center text-[0.875rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Email {SUPPORT_EMAIL}
                      </a>
                    </div>
                  )}
                </form>
              )}

              <p className="flex items-start gap-2 text-[0.8125rem] leading-5 text-muted">
                <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {emailEnabled ? "Keep your login links and receipts private." : "Keep your transaction ID and restore link private: they unlock your subscription."}{" "}
                Logging in does not charge you again or reveal your card details.
              </p>
              <p className="text-sm leading-6 text-muted">This does not renew or cancel your subscription. To stop future payments, <Link href="/subscription#cancel" className="font-semibold text-brand-700 underline">see how to cancel</Link>.</p>
              {status !== "done" && !emailEnabled && (
                <p className="text-sm leading-6 text-muted">
                  Cannot find your receipt?{" "}
                  <a href={mailto} className="font-semibold text-brand-700 underline underline-offset-4">
                    Ask support for a restore link
                  </a>
                  {" "}from the email you used to pay. Support will help you recover access.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <ol className="flex flex-col gap-4">
                {(emailEnabled ? EMAIL_STEPS : STEPS).map((step, index) => (
                  <li key={step.title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[0.8125rem] font-semibold text-brand-700">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-[0.9375rem] font-semibold text-navy">{step.title}</span>
                      <span className="mt-1 block text-[0.875rem] leading-6 text-muted">{step.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              {!emailEnabled && <ReceiptIllustration />}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="ivory" id="receipt-help" className="scroll-mt-24">
        <Container size="wide" className="py-12 sm:py-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
            <h2 className="text-[1.0625rem] font-semibold text-navy">{emailEnabled ? "Cannot log in?" : "Recover access without a purchase code"}</h2>
            <p className="text-[0.9375rem] leading-6 text-muted">
              Email us from the address you used to pay, or tell us if you no longer have access to it. Our support team will verify the purchase and help you log in. This is a manual support request, not an automatic login email. Do not buy again to recover a purchase. Have not bought Pro yet? The{" "}
              <Link href="/checkout" className="font-medium text-brand-700 underline underline-offset-4">
                Pro pricing is here
              </Link>
              .
            </p>
            <ButtonLink href={mailto} variant="secondary" className="mt-2">
              Get help recovering my purchase
            </ButtonLink>
            <p className="text-sm leading-6 text-muted">No email app? Write to {SUPPORT_EMAIL}. If you no longer have access to the purchase email, tell us so we can help verify ownership.</p>
          </div>
        </Container>
      </Section>
    </>
  );
}

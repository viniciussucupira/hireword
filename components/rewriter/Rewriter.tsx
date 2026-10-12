"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTEXT_TYPES, ContextType, FREE_LIMIT_PER_DAY, MAX_INPUT_CHARS } from "@/lib/constants";
import { ENGLISH_VARIANTS, type EnglishVariant, reviewNumbers } from "@/lib/rewrite-review";
import { Button, ButtonLink, Pill } from "@/components/ui/Primitives";
import {
  IconAlert,
  IconCheck,
  IconCopy,
  IconCoverLetter,
  IconFollowUpEmail,
  IconRecruiterMessage,
  IconResumeBullets,
  IconSparkle,
} from "@/components/ui/Icons";
import { useProStatus } from "@/components/ui/useProStatus";
import { textSharing } from "@/lib/text-sharing";

/** The reminder appears only when this many of today's Pro rewrites, or fewer, are left. */
const LOW_REMAINING_TODAY = 2;

type Allowance = { remaining: number; limit: number };

function readAllowance(value: unknown): Allowance | null {
  if (!value || typeof value !== "object") return null;
  const { remaining, limit } = value as Record<string, unknown>;
  return Number.isSafeInteger(remaining) && Number.isSafeInteger(limit) && Number(remaining) >= 0 && Number(limit) > 0
    ? { remaining: Number(remaining), limit: Number(limit) }
    : null;
}

const MAX_CHARS = MAX_INPUT_CHARS;

const CONTEXT_ICONS: Record<ContextType, typeof IconCoverLetter> = {
  "cover-letter": IconCoverLetter,
  "resume-bullet": IconResumeBullets,
  "linkedin-message": IconRecruiterMessage,
  "follow-up-email": IconFollowUpEmail,
};

const PLACEHOLDERS: Record<ContextType, string> = {
  "cover-letter":
    "Dear Hiring Manager,\n\nI am writing for apply to the position of Data Analyst that I saw in your website…",
  "resume-bullet":
    "• Was responsible for the making of monthly reports for the sales team\n• Participated in the migration of the database…",
  "linkedin-message":
    "Hello Sarah, I saw your announce about the open position in your team and I would like very much to be considered…",
  "follow-up-email":
    "Dear Mr. Chen,\n\nI want to thank you for the interview of yesterday. I am still very interest in the position…",
};

type Phase = "idle" | "loading" | "done" | "error";

type Props = {
  initialContext?: ContextType;
  initialEnglishVariant?: EnglishVariant;
  /** Locks the tool to one document type (used on single-purpose pages). */
  lockContext?: boolean;
  placeholder?: string;
  className?: string;
};

export default function Rewriter({
  initialContext = "cover-letter",
  initialEnglishVariant = "en-US",
  lockContext = false,
  placeholder,
  className = "",
}: Props) {
  const [context, setContext] = useState<ContextType>(initialContext);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [allowanceUsed, setAllowanceUsed] = useState(false);
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const [englishVariant, setEnglishVariant] = useState<EnglishVariant>(initialEnglishVariant);
  const [submittedDraft, setSubmittedDraft] = useState("");
  const [submittedContext, setSubmittedContext] = useState<ContextType>(initialContext);
  const [submittedVariant, setSubmittedVariant] = useState<EnglishVariant>(initialEnglishVariant);

  const [justUpgraded, setJustUpgraded] = useState(false);
  const { isPro, needsRestore, unavailable } = useProStatus();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editedResultRef = useRef<HTMLTextAreaElement | null>(null);
  const copyVersion = useRef(0);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [ctaVisible, setCtaVisible] = useState(true);

  const tooLong = text.length > MAX_CHARS;
  const hasText = text.trim().length > 0;

  useEffect(() => {
    if ((phase === "done" || phase === "error") && window.matchMedia("(max-width: 1023px)").matches) {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    }
  }, [phase]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get("upgraded") === "1") {
        setJustUpgraded(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Keeps the sticky mobile action bar off screen while the real button shows.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const runRewrite = useCallback(
    async (body: string, contextValue: ContextType) => {
      copyVersion.current++;
      setPhase("loading");
      setError("");
      setLimitReached(false);
      setAllowanceUsed(false);
      setCopied(false); setCopyError("");
      try {
        const res = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: body, context: contextValue, englishVariant }),
          signal: AbortSignal.timeout(60000),
        });
        const data = await res.json().catch(() => ({}));
        const left = readAllowance(data.allowance);
        if (left) setAllowance(left);
        if (!res.ok) {
          if (data.error === "limit_reached" || data.error === "free_pool_used") setLimitReached(true);
          if (data.error === "daily_limit_reached" || data.error === "monthly_safeguard_reached" || data.error === "payment_past_due") setAllowanceUsed(true);
          setError(data.message || "Something went wrong. Please try again.");
          setPhase("error");
          return;
        }
        if (typeof data.rewritten !== "string" || !data.rewritten.trim()) {
          throw new Error("Missing rewrite");
        }
        setResult(data.rewritten);
        setSubmittedDraft(body);
        setSubmittedContext(contextValue);
        setSubmittedVariant(englishVariant);
        setPhase("done");
      } catch {
        setError("The request timed out or the connection was interrupted. Your draft is still here. Please try again shortly.");
        setPhase("error");
      }
    },
    [englishVariant]
  );

  function handleSubmit() {
    if (!hasText || tooLong || phase === "loading") return;
    runRewrite(text, context);
  }

  async function handleCopy() {
    if (!result.trim()) return;
    const version = ++copyVersion.current;
    setCopyError("");
    try {
      await navigator.clipboard.writeText(result);
      if (version !== copyVersion.current) return;
      setCopied(true);
      window.setTimeout(() => { if (version === copyVersion.current) setCopied(false); }, 2200);
    } catch {
      if (version !== copyVersion.current) return;
      setCopied(false);
      editedResultRef.current?.focus();
      editedResultRef.current?.select();
      setCopyError("Your browser blocked automatic copying. Select the result, then use Copy from your device’s menu or press Ctrl+C / Command+C.");
    }
  }

  function handleReset() {
    copyVersion.current++;
    setText("");
    setResult("");
    setPhase("idle");
    setError("");
    setLimitReached(false);
    setAllowanceUsed(false);
    setSubmittedDraft("");
    setCopied(false); setCopyError("");
    textareaRef.current?.focus();
  }

  const contextLabel = CONTEXT_TYPES.find((c) => c.value === context)?.label ?? "Message";
  const activePlaceholder = placeholder ?? PLACEHOLDERS[context];
  const numberReview = reviewNumbers(submittedDraft, result);
  const resultOutdated = phase === "done" && (text !== submittedDraft || context !== submittedContext || englishVariant !== submittedVariant);
  const resultContextLabel = CONTEXT_TYPES.find((c) => c.value === submittedContext)?.label ?? "Message";
  const sharing = textSharing(result, resultContextLabel);

  return (
    <div className={className}>
      {(needsRestore || unavailable) && (
        <div role="status" className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-navy">
          {needsRestore ? "Please log in once to refresh Pro in this browser. You do not need to pay again. " : "We could not check your Pro access right now. Please refresh before rewriting if you are a subscriber. "}
          <Link href="/login" className="font-semibold underline underline-offset-4">Log in</Link>
        </div>
      )}
      {justUpgraded && isPro && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-success/25 bg-success-50 p-4 text-[0.9375rem] text-navy">
          <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <p>
            Pro is active in this browser.
          </p>
        </div>
      )}

      <div className="na-workspace overflow-hidden rounded-[1.5rem] border border-line bg-white">
        {/* ---------- document type ---------- */}
        <div className="border-b border-line bg-brand-50/60 px-4 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p id="na-context-label" className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-navy">
              {lockContext ? "Document type" : "What are you writing?"}
            </p>
            {isPro && (
              <Pill tone="success">
                <IconCheck className="h-3.5 w-3.5" /> Pro
              </Pill>
            )}
          </div>
          {/* A calm reminder only near the end of the day's rewrites; the figure itself lives in the FAQ and the Terms. */}
          <div aria-live="polite" aria-atomic="true">
            {isPro && allowance && allowance.remaining <= LOW_REMAINING_TODAY && (
              <p className="mt-3 rounded-xl border border-brand-100 bg-white/70 px-3.5 py-2 text-[0.8125rem] leading-5 text-muted">
                {allowance.remaining === 1 ? "1 rewrite" : `${allowance.remaining} rewrites`} left today.
                They reset at 00:00 UTC.
              </p>
            )}
          </div>

          <div
            className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4"
            role={lockContext ? undefined : "radiogroup"}
            aria-labelledby="na-context-label"
          >
            {CONTEXT_TYPES.map((item) => {
              const Icon = CONTEXT_ICONS[item.value];
              const selected = item.value === context;
              if (lockContext && !selected) return null;
              return (
                <button
                  key={item.value}
                  type="button"
                  role={lockContext ? undefined : "radio"}
                  aria-checked={lockContext ? undefined : selected}
                  tabIndex={!lockContext && !selected ? -1 : 0}
                  onKeyDown={(event) => {
                    if (lockContext || !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    const current = CONTEXT_TYPES.findIndex((entry) => entry.value === context);
                    const next = event.key === "Home" ? 0 : event.key === "End" ? CONTEXT_TYPES.length - 1 : (current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + CONTEXT_TYPES.length) % CONTEXT_TYPES.length;
                    setContext(CONTEXT_TYPES[next].value);
                    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
                    buttons?.[next]?.focus();
                  }}
                  disabled={lockContext || phase === "loading"}
                  onClick={() => setContext(item.value)}
                  className={
                    "flex min-h-[3.25rem] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[0.875rem] font-medium transition-colors duration-200 " +
                    (selected
                      ? "border-brand bg-white text-navy shadow-[0_0_0_1px_rgba(39,100,231,0.55)]"
                      : "border-line bg-white/70 text-muted hover:border-brand-300 hover:bg-white hover:text-navy") +
                    (lockContext ? " col-span-2 md:col-span-1 cursor-default" : "")
                  }
                >
                  <Icon className={"h-[1.15rem] w-[1.15rem] shrink-0 " + (selected ? "text-brand" : "text-muted-soft")} />
                  <span className="leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label htmlFor="na-english" className="text-sm font-medium text-navy">English style</label>
            <select
              id="na-english"
              value={englishVariant}
              disabled={phase === "loading"}
              onChange={(event) => setEnglishVariant(event.target.value as EnglishVariant)}
              className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm text-navy focus:outline-none focus:ring-4 focus:ring-brand/15"
            >
              {ENGLISH_VARIANTS.map((variant) => <option key={variant.value} value={variant.value}>{variant.label}</option>)}
            </select>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">Choose the spelling your employer uses. Names, currencies, and dates are not converted.</p>
          {lockContext && <p className="mt-2 text-sm text-muted">Working on a different document? <Link href="/#tool" className="font-medium text-brand-700 underline underline-offset-4">Open all four document types</Link></p>}
        </div>

        {/* ---------- editor ---------- */}
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="flex flex-col border-b border-line p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="na-text" className="text-sm font-semibold text-navy">
                Your draft
              </label>
              <span
                className={"text-xs tabular-nums " + (tooLong ? "font-semibold text-flag" : "text-muted-soft")}
              >
                {text.length.toLocaleString("en-US")} / {MAX_CHARS.toLocaleString("en-US")}
              </span>
            </div>

            <textarea
              id="na-text"
              ref={textareaRef}
              value={text}
              disabled={phase === "loading"}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={activePlaceholder}
              rows={10}
              spellCheck={false}
              aria-describedby="na-text-help"
              aria-invalid={tooLong}
              className="mt-3 w-full flex-1 resize-y rounded-xl border border-line bg-white px-4 py-3.5 text-base leading-7 text-ink placeholder:text-muted-soft focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
            />

            <p id="na-text-help" className="mt-2 text-[0.8125rem] text-muted">
              {tooLong
                ? `That is ${(text.length - MAX_CHARS).toLocaleString("en-US")} ${text.length - MAX_CHARS === 1 ? "character" : "characters"} over the limit. Shorten it or split it into parts of up to ${MAX_CHARS.toLocaleString("en-US")} characters. Each part uses a separate rewrite.`
                : "Paste your own English draft. The rewrite is instructed to keep your names, dates, numbers, and facts."}
            </p>

              <div ref={ctaRef} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!hasText || tooLong || phase === "loading"}
                  className="w-full sm:w-auto"
                >
                  {phase === "loading" ? (
                    <>
                      <span className="flex items-center gap-1" aria-hidden="true">
                        <span className="na-dot-1 h-1.5 w-1.5 rounded-full bg-white" />
                        <span className="na-dot-2 h-1.5 w-1.5 rounded-full bg-white" />
                        <span className="na-dot-3 h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      Rewriting
                    </>
                  ) : (
                    <>
                      <IconSparkle className="h-[1.1rem] w-[1.1rem]" />
                      Rewrite my text
                    </>
                  )}
                </Button>
                {!isPro && (
                  <p className="text-[0.8125rem] leading-5 text-muted">
                    {FREE_LIMIT_PER_DAY === 1 ? "1 free rewrite a day" : `${FREE_LIMIT_PER_DAY} free rewrites a day`}.
                    No email or card required. One allowance per browser; resets at midnight UTC.
                  </p>
                )}
              </div>
          </div>

          {/* ---------- result ---------- */}
          <div className="flex flex-col bg-ivory/50 p-4 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-navy">Rewritten</h3>
              {phase === "done" && (
                <span className="text-xs tabular-nums text-muted-soft">
                  {result.length.toLocaleString("en-US")} characters
                </span>
              )}
            </div>

            <div
              ref={resultRef}
              tabIndex={-1}
              aria-live="polite"
              aria-atomic="false"
              className="mt-3 flex flex-1 scroll-mt-24 flex-col rounded-xl border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {phase === "loading" && (
                <div className="relative flex-1 overflow-hidden rounded-xl p-5">
                  <div className="na-sweep pointer-events-none absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-navy">Rewriting your {contextLabel.toLowerCase()}…</p>
                  <div className="mt-4 flex flex-col gap-2.5" aria-hidden="true">
                    <span className="h-3 w-[92%] rounded-full bg-brand-50" />
                    <span className="h-3 w-[84%] rounded-full bg-brand-50" />
                    <span className="h-3 w-[96%] rounded-full bg-brand-50" />
                    <span className="h-3 w-[62%] rounded-full bg-brand-50" />
                  </div>
                  <p className="mt-5 text-[0.8125rem] text-muted">This usually takes a few seconds.</p>
                </div>
              )}

              {phase === "done" && (
                <div className="na-fade flex flex-1 flex-col">
                  <p className="border-b border-line px-5 py-3 text-xs font-medium text-muted">{resultContextLabel} · {ENGLISH_VARIANTS.find((item) => item.value === submittedVariant)?.label}</p>
                  {resultOutdated && <p role="status" className="border-b border-line bg-brand-50 px-5 py-3 text-sm text-navy">Your draft or settings changed. This result belongs to the previous version. Rewrite again to apply your changes.</p>}
                  <div className="border-b border-line px-5 py-4 text-sm">
                    <p className={numberReview.changed ? "font-semibold text-flag" : "font-semibold text-navy"}>
                      {numberReview.changed ? "Check the numbers before sending" : numberReview.hasNumbers ? "Numeric expressions match your draft" : "Ready for your review"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {numberReview.changed ? "A number, currency, or unit was added, removed, or changed. Compare the original below." : "Check names, meaning, and achievements too. A number check cannot verify every fact."}
                    </p>
                    <details className="mt-3">
                      <summary className="cursor-pointer font-medium text-brand-700">Compare with your original</summary>
                      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-ivory p-3 leading-6 text-ink">{submittedDraft}</p>
                    </details>
                  </div>
                  <label htmlFor="na-result" className="px-5 pt-4 text-sm font-medium text-navy">Review and edit your result</label>
                  <textarea ref={editedResultRef} id="na-result" value={result} onChange={(event) => { copyVersion.current++; setResult(event.target.value); setCopied(false); setCopyError(""); setError(""); }} rows={10} spellCheck lang={submittedVariant} aria-describedby="na-result-help" className="m-3 min-h-56 flex-1 resize-y rounded-lg border border-line bg-white px-3 py-3 text-base leading-7 text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15" />
                  <p id="na-result-help" className="px-5 pb-3 text-xs leading-5 text-muted">Make final adjustments here. Copy and sharing use this edited version. Editing does not use another rewrite.</p>
                  <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
                    <Button type="button" onClick={handleCopy} disabled={!result.trim()} variant={copied ? "secondary" : "primary"}>
                      {copied ? <IconCheck className="h-4 w-4 text-success" /> : <IconCopy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    {sharing.email ? <a
                      href={sharing.email}
                      className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:text-navy"
                    >
                      Open email app
                    </a> : <button type="button" disabled className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-muted-soft">Open email app</button>}
                    {sharing.whatsapp ? <a
                      href={sharing.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:text-navy"
                    >
                      WhatsApp
                    </a> : <button type="button" disabled className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-muted-soft">WhatsApp</button>}
                    <button
                      type="button"
                      onClick={handleReset}
                      className="ml-auto inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:text-navy"
                    >
                      Start another text
                    </button>
                  </div>
                  {sharing.tooLong && <p role="status" className="border-t border-line bg-brand-50 px-4 py-3 text-sm text-navy">This text is too long for a reliable app link. Copy the full result above and paste it into your email or WhatsApp. Nothing has been shortened or sent.</p>}
                  {/* An instruction to the model is not a guarantee, so the
                      last check stays with the person sending the letter. */}
                  <p className="border-t border-line px-4 py-3 text-[0.8125rem] leading-5 text-muted">
                    Review names, dates, numbers, and meaning before sending. Email opens your configured mail app.
                    WhatsApp receives the text when you open its link, even before you send. You choose the recipient and confirm sending in that app.
                  </p>
                  <p className="px-4 pb-3 text-xs leading-5 text-muted">Email uses your device’s default mail app, not a connected Gmail account. Gmail, Outlook, Apple Mail, Yahoo Mail, and other providers can be used through a configured mail app or by copying and pasting. If nothing opens, copy the result and paste it into your preferred email service.</p>
                  {copyError && <p role="alert" className="px-4 pb-3 text-sm text-flag">{copyError}</p>}
                </div>
              )}

              {phase === "error" && (
                <div className="flex flex-1 flex-col justify-center gap-3 p-5" role="alert">
                  <span
                    className={
                      "inline-flex h-10 w-10 items-center justify-center rounded-full " +
                      (limitReached ? "bg-brand-50 text-brand-700" : "bg-flag-50 text-flag")
                    }
                  >
                    {limitReached ? <IconSparkle className="h-5 w-5" /> : <IconAlert className="h-5 w-5" />}
                  </span>
                  <p className="text-[0.9375rem] leading-6 text-navy">{error}</p>
                  {result && <details className="rounded-xl border border-line p-3 text-sm"><summary className="cursor-pointer font-medium text-brand-700">Your previous result is still available</summary><textarea ref={editedResultRef} readOnly aria-label="Previous result" value={result} rows={8} className="mt-3 w-full rounded-lg border border-line p-3 text-base leading-6" /><Button type="button" onClick={handleCopy} variant="secondary" className="mt-3">{copied ? "Copied" : "Copy previous result"}</Button>{copyError && <p role="alert" className="mt-3 text-flag">{copyError}</p>}</details>}
                  {limitReached ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <ButtonLink href="/checkout">See Pro pricing</ButtonLink>
                      <ButtonLink href="/login" variant="secondary">
                        Log in
                      </ButtonLink>
                    </div>
                  ) : allowanceUsed ? null : (
                    <Button type="button" variant="secondary" onClick={handleSubmit} className="self-start">
                      Try again
                    </Button>
                  )}
                </div>
              )}

              {phase === "idle" && (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                  <svg
                    viewBox="0 0 120 88"
                    className="h-20 w-28 text-brand-100"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  >
                    <rect x="10" y="8" width="66" height="72" rx="8" />
                    <path d="M24 28h38M24 40h38M24 52h24" />
                    <circle cx="94" cy="58" r="20" className="text-brand-50" />
                    <path d="m85 58 6.5 6.5L103 52" className="text-brand-300" strokeWidth="3.2" />
                  </svg>
                  <p className="max-w-[22rem] text-[0.9375rem] leading-6 text-muted">
                    {hasText
                      ? "Press “Rewrite my text” and your polished version appears here."
                      : "Paste your draft to get started. Your polished version appears here, ready to review and copy."}
                  </p>
                </div>
              )}
            </div>

            <ul className="mt-4 flex flex-col gap-2 text-[0.8125rem] leading-5 text-muted">
              <li className="flex items-start gap-2">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Your text is not stored on Hireword servers.
              </li>
              <li className="flex items-start gap-2">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Numeric expressions checked against your original.
              </li>
              <li className="flex items-start gap-2">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Review names, meaning, and your level of responsibility before sending.
              </li>
            </ul>
          </div>
        </div>

        {!isPro && (
          <div className="flex flex-col items-center gap-1 border-t border-line bg-white px-4 py-4 text-center sm:flex-row sm:justify-center sm:gap-2 sm:py-3.5">
            <p className="text-[0.875rem] text-muted">
              Hireword Pro: <span className="font-semibold text-navy">$19/month</span>, cancel anytime.
            </p>
            <Link
              href="/checkout"
              className="text-[0.875rem] font-semibold text-brand-700 underline underline-offset-4 hover:text-brand"
            >
              See Pro pricing
            </Link>
          </div>
        )}
      </div>

      {/* Sticky action bar, only while the person is editing and the real button is off screen. */}
      {hasText && !ctaVisible && !limitReached && phase !== "loading" && phase !== "done" && (
        <>
          <div aria-hidden="true" className="h-[5.25rem] lg:hidden" />
          <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <Button type="button" size="lg" onClick={handleSubmit} disabled={tooLong} className="w-full">
              <IconSparkle className="h-[1.1rem] w-[1.1rem]" />
              Rewrite my text
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

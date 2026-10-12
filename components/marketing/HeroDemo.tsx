"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconCopy, IconCoverLetter, IconFacts } from "@/components/ui/Icons";

const AFTER_PLAIN =
  "I'm writing to apply for the Financial Analyst position. I have 6 years of experience preparing reports, and I'd welcome the chance to bring that work to your team.";

export default function HeroDemo() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    timer.current = window.setTimeout(() => setRevealed(true), reduced ? 0 : 1100);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(AFTER_PLAIN);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-x-6 -inset-y-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_55%_at_50%_35%,rgba(39,100,231,0.10),transparent_75%)]"
      />
      <div className="na-demo overflow-hidden rounded-[1.5rem] border border-line bg-white">
        {/* window chrome */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-navy px-4 py-4">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-700">
            <IconCoverLetter className="h-3.5 w-3.5" />
            Cover letter
          </span>
          <span className="ml-auto text-[0.6875rem] font-medium text-white/80">Illustrative example</span>
        </div>

        <div className="p-4 sm:p-6">
          {/* before */}
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-soft">Your draft</p>
          <p className="mt-2 rounded-xl bg-ivory px-4 py-3.5 text-[0.9375rem] leading-7 text-muted">
            I am writing <span className="na-mark-cut">for apply</span> to the position of Financial Analyst. I have 6
            years of experience <span className="na-mark-cut">in make reports</span> and I am{" "}
            <span className="na-mark-cut">very motivated for work in</span> your company.
          </p>

          {/* review step */}
          <div className="relative my-3.5 flex items-center justify-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden="true" />
            <span
              className={
                "relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition-all duration-500 " +
                (revealed
                  ? "border-success/25 bg-success-50 text-success"
                  : "border-brand-100 bg-brand-50 text-brand-700")
              }
            >
              {revealed ? (
                <>
                  <IconCheck className="h-3.5 w-3.5" />
                  Rewritten
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="na-dot-1 h-1.5 w-1.5 rounded-full bg-brand" />
                    <span className="na-dot-2 h-1.5 w-1.5 rounded-full bg-brand" />
                    <span className="na-dot-3 h-1.5 w-1.5 rounded-full bg-brand" />
                  </span>
                  Reviewing
                </>
              )}
            </span>
          </div>

          {/* after */}
          <div
            className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3.5 transition-all duration-700"
            style={{ opacity: revealed ? 1 : 0.35, transform: revealed ? "none" : "translateY(6px)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-700">
                Rewritten
              </p>
              <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-success">
                <IconFacts className="h-3.5 w-3.5" />
                Facts preserved
              </span>
            </div>
            <p className="mt-2 text-[0.9375rem] leading-7 text-ink">
              <span className="na-mark-add">I&apos;m writing to apply for</span> the Financial Analyst position. I have{" "}
              6 years of experience{" "}
              <span className="na-mark-add">preparing reports</span>, and I&apos;d welcome the chance to bring
              that work to your team.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copy}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[0.75rem] font-semibold text-white transition-colors hover:bg-navy-700"
              >
                {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
                {copied ? "Example copied" : "Copy example"}
              </button>
              <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[0.6875rem] font-medium text-muted">
                More natural
              </span>
              <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[0.6875rem] font-medium text-muted">
                Professional tone
              </span>
            </div>
            {copyError && <p role="alert" className="mt-3 text-xs text-flag">Your browser blocked copying. Select the example above and copy it manually.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

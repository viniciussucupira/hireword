"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import MoreFromUs from "@/components/MoreFromUs";
import { SUPPORT_EMAIL } from "@/lib/constants";

const EXPLORE = [
  ["/#tool", "Rewrite your text"],
  ["/#how-it-works", "How it works"],
  ["/#examples", "Before & after"],
];
const WRITING = [
  ["/cover-letter-rewriter", "Cover letters"],
  ["/recruiter-message-rewriter", "Recruiter messages"],
  ["/resume-rewriter", "Resume bullets"],
  ["/linkedin-connection-message-rewriter", "LinkedIn messages"],
  ["/cv-english-rewriter", "CV writing"],
  ["/interview-follow-up-email-generator", "Interview follow-ups"],
  ["/ats-friendly-resume-bullet-points", "ATS-friendly bullets"],
  ["/job-application-letter-rewriter", "Application letters"],
  ["/visa-sponsorship-cover-letter", "Visa sponsorship"],
];
const DOCUMENTS = [WRITING[0], WRITING[2], WRITING[4], WRITING[6], WRITING[7], WRITING[8]];
const MESSAGES = [WRITING[1], WRITING[3], WRITING[5]];
// Same label and order in every Solrenning product.
const ACCOUNT = [
  ["/login", "Log in"],
  ["/checkout", "Pricing"],
  ["/subscription#cancel", "Cancel subscription"],
  ["/subscription#refund", "Request a refund"],
  ["/support", "Contact support"],
];
const LEGAL = [["/terms", "Terms of Service"], ["/privacy", "Privacy Policy"], ["/refunds", "Refund Policy"]];
// Pages where the person is in the middle of a task get the slim footer.
const SLIM = /^\/(checkout|login|restore|subscription)(\/|$)/;
const linkClass = "inline-flex min-h-11 items-center rounded-sm text-sm leading-6 text-muted transition-colors hover:text-brand-700 hover:underline underline-offset-4";
const headingClass = "mb-3 text-sm font-semibold leading-6 text-ink";
function Links({ items }: { items: string[][] }) {
  return <ul className="grid">{items.map(([href, label]) => <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>)}</ul>;
}
export default function Footer() {
  const pathname = usePathname() || "/";
  const year = new Date().getFullYear();
  if (SLIM.test(pathname)) {
    return <footer className="family-footer mt-auto border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="text-xs leading-6 text-muted">© {year} Hireword. A <a href="https://solrenning.com/#products" target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4">Solrenning</a> product.</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-6">{[...LEGAL, ["/support", "Support"]].map(([href, label]) => <Link key={href} href={href} className={linkClass}>{label}</Link>)}</nav>
      </div>
    </footer>;
  }
  return <footer className="family-footer mt-auto border-t border-line bg-white">
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="family-footer-grid">
        <div className="footer-brand">
          <Link href="/" aria-label="Hireword — home" className="inline-flex"><Logo size={34} href={null}/></Link>
          <p className="mt-5 max-w-[15rem] text-sm leading-7 text-muted">Clear, natural English.<br/>More confidence in your next application.</p>
          <p className="mt-4"><a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass + " break-all"}>{SUPPORT_EMAIL}</a></p>
          <p className="mt-6 border-l-2 border-line pl-3 text-xs leading-6 text-muted">A <a href="https://solrenning.com/#products" target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4">Solrenning</a> product.</p>
        </div>
        <nav aria-label="Get started"><h2 className={headingClass}>Get started</h2><Links items={EXPLORE}/></nav>
        <nav aria-label="Resumes and letters"><h2 className={headingClass}>Resumes &amp; letters</h2><Links items={DOCUMENTS}/></nav>
        <nav aria-label="Messages and follow-ups"><h2 className={headingClass}>Messages &amp; follow-ups</h2><Links items={MESSAGES}/></nav>
        <nav aria-label="Account and billing" className="footer-help"><h2 className={headingClass}>Account &amp; billing</h2><p className="family-help-intro">Your plan. Your control.</p><Links items={ACCOUNT}/></nav>
      </div>
      <div className="text-muted"><MoreFromUs/></div>
      <div className="mt-8 border-t border-line pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs leading-6 text-muted">© {year} Hireword.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6">{LEGAL.map(([href,label])=><Link key={href} href={href} className={linkClass}>{label}</Link>)}</nav>
        </div>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-muted">Payments processed by Paddle, our merchant of record.</p>
          <a href="https://turbo0.com/item/hireword" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center">
            {/* Turbo0's own badge, as its free listing asks; a remote SVG, so next/image adds nothing. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://img.turbo0.com/badge-listed-light.svg" alt="Listed on Turbo0" width={98} height={32} style={{ height: 32, width: "auto" }} loading="lazy" />
          </a>
        </div>
      </div>
    </div>
  </footer>;
}

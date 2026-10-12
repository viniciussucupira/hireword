import Link from "next/link";
import Rewriter from "@/components/rewriter/Rewriter";
import ExamplePair from "@/components/marketing/ExamplePair";
import Faq from "@/components/marketing/Faq";
import FinalCta from "@/components/marketing/FinalCta";
import TrustStrip from "@/components/marketing/TrustStrip";
import Reveal from "@/components/ui/Reveal";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui/Primitives";
import { IconArrowRight, IconCheck } from "@/components/ui/Icons";
import { ACCENT_RULES } from "@/lib/accents";
import type { ToolPage } from "@/lib/tool-pages";

const SITE_URL = "https://hireword.com";

export default function ToolLanding({ page }: { page: ToolPage }) {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hireword", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: page.eyebrow,
        item: `${SITE_URL}/${page.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ---------------- hero ---------------- */}
      <Section tone="white" className="relative overflow-hidden">
        <div className="na-aurora" aria-hidden="true">
          <span className="na-orb-blue" />
          <span className="na-orb-jade" />
          <span className="na-orb-amber" />
        </div>
        <Container size="wide" className="relative pb-10 pt-8 sm:pb-14 sm:pt-12">
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted-soft">
              <li>
                <Link href="/" className="hover:text-navy">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-muted">{page.eyebrow}</li>
            </ol>
          </nav>

          <div className="na-rise mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <Eyebrow>{page.eyebrow}</Eyebrow>
            <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-navy sm:text-[2.75rem]">
              {page.headingLead} <span className="na-accent-text">{page.headingAccent}</span>
            </h1>
            <p className="max-w-2xl text-[1.0625rem] leading-7 text-muted sm:text-lg">{page.intro}</p>
            <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="#tool" size="lg" className="w-full sm:w-auto">
                {page.ctaLabel}
              </ButtonLink>
              <ButtonLink href="#example" size="lg" variant="secondary" className="w-full sm:w-auto">
                See the example
              </ButtonLink>
            </div>
            <p className="text-[0.875rem] text-muted">
              Hireword Pro is $19 a month, cancel anytime. Try one rewrite a day free, with no email or card.
            </p>
          </div>
        </Container>
      </Section>

      <TrustStrip />

      {/* ---------------- tool ---------------- */}
      <Section tone="white" id="tool" className="scroll-mt-20">
        <Container size="wide" className="py-12 sm:py-16">
          <p className="mb-5 text-sm leading-6 text-muted">The Hireword editor, set to this document type. Paste English text up to 6,000 characters; review and copy the result into your application.</p>
          <Rewriter key={page.slug} initialContext={page.context} initialEnglishVariant={page.slug === "cv-english-rewriter" ? "en-GB" : "en-US"} lockContext placeholder={page.placeholder} />
        </Container>
      </Section>

      {/* ---------------- benefits ---------------- */}
      <Section tone="ivory">
        <Container size="wide" className="py-16 sm:py-20">
          <SectionHeading eyebrow="What changes" title="What this rewrite does to your draft" />
          <div className="mt-11 grid gap-5 sm:grid-cols-2">
            {page.benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 60}>
                <div className="relative flex h-full flex-col gap-2.5 overflow-hidden rounded-2xl border border-line bg-white p-6">
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${ACCENT_RULES[index % ACCENT_RULES.length]}`}
                  />
                  <h3 className="text-[1.0625rem] font-semibold text-navy">{benefit.title}</h3>
                  <p className="text-[0.9375rem] leading-6 text-muted">{benefit.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------- example ---------------- */}
      <Section tone="white" id="example" className="relative overflow-hidden scroll-mt-20">
        <div className="na-aurora" aria-hidden="true">
          <span className="na-orb-jade" />
        </div>
        <Container size="wide" className="relative py-16 sm:py-20">
          <SectionHeading
            eyebrow="Before and after"
            title="One rewrite, start to finish"
            description="An illustrative example of this document type. Highlighted phrases show the edits. Your result will depend on your draft."
          />
          <div className="mt-10">
            <ExamplePair example={page.example} />
          </div>
        </Container>
      </Section>

      {/* ---------------- guidance ---------------- */}
      <Section tone="navy" className="relative overflow-hidden">
        <div className="na-aurora" aria-hidden="true">
          <span className="na-orb-night-blue" />
          <span className="na-orb-night-violet" />
        </div>
        <Container size="wide" className="relative py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionHeading
              align="left"
              onDark
              eyebrow="Worth knowing"
              title={page.guidance.title}
              description={page.guidance.intro}
            />
            <ul className="flex flex-col gap-3.5">
              {page.guidance.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[1rem] leading-7 text-white/90">
                  <IconCheck className="mt-1.5 h-4 w-4 shrink-0 text-brand-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ---------------- faq ---------------- */}
      <Section tone="white">
        <Container size="wide" className="py-16 sm:py-20">
          <SectionHeading eyebrow="Questions" title={`${page.eyebrow}: common questions`} />
          <div className="mt-10">
            <Faq items={page.faq} withSchema />
          </div>
        </Container>
      </Section>

      {/* ---------------- related ---------------- */}
      <Section tone="ivory">
        <Container size="wide" className="py-14 sm:py-16">
          <h2 className="text-center text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Also useful in this job search
          </h2>
          <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3">
            {page.related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[0.875rem] font-medium text-navy transition-colors hover:border-brand-300 hover:bg-brand-50/60"
                >
                  {item.label}
                  <IconArrowRight className="h-4 w-4 text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <FinalCta href="#tool" cta={page.ctaLabel} />
    </>
  );
}

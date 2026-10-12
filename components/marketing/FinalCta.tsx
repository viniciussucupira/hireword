import { ButtonLink, Container } from "@/components/ui/Primitives";

export default function FinalCta({
  title = "Send the version that sounds like you at your best.",
  body = "Paste your draft, read the rewrite, and decide for yourself. Pro is 600 rewrites a month for $19, cancel anytime. One free rewrite a day to start.",
  href = "/#tool",
  cta = "Rewrite my text",
}: {
  title?: string;
  body?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <section className="na-finale relative overflow-hidden border-y border-white/10 bg-navy">
      <div className="na-aurora" aria-hidden="true">
        <span className="na-orb-night-blue" />
        <span className="na-orb-night-violet" />
        <span className="na-orb-night-jade" />
      </div>
      <Container size="wide" className="relative py-16 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="font-[Georgia,serif] text-[2.125rem] font-normal leading-[1.14] tracking-[-0.035em] text-white sm:text-[3rem]">
            {title}
          </h2>
          <p className="text-[1.0625rem] leading-7 text-brand-100/80">{body}</p>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={href} size="lg" variant="onNavy">
              {cta}
            </ButtonLink>
            <ButtonLink
              href="/checkout"
              size="lg"
              className="border border-white/25 bg-transparent text-white hover:bg-white/10"
              variant="ghost"
            >
              See pricing
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

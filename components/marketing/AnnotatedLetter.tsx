import { IconFacts } from "@/components/ui/Icons";

type Layer = {
  n: number;
  label: string;
  note: string;
  tone: "brand" | "success";
};

const LAYERS: Layer[] = [
  {
    n: 1,
    label: "Grammar and articles",
    note: "The small slips a reader notices first, corrected first.",
    tone: "brand",
  },
  {
    n: 2,
    label: "Natural phrasing",
    note: "Awkward constructions replaced with what an experienced professional would write.",
    tone: "brand",
  },
  {
    n: 3,
    label: "Tone for the document",
    note: "Warm for a cover letter, terse for a resume, brief for a message.",
    tone: "brand",
  },
  {
    n: 4,
    label: "Your experience, checked by you",
    note: "Compare employers, dates, numbers, and responsibilities before sending.",
    tone: "success",
  },
];

function Mark({
  children,
  n,
  tone = "brand",
}: {
  children: React.ReactNode;
  n: number;
  tone?: "brand" | "success";
}) {
  const styles =
    tone === "success"
      ? "bg-success-50 decoration-success/50"
      : "bg-brand-50 decoration-brand/45";
  const badge = tone === "success" ? "bg-success text-white" : "bg-brand text-white";
  return (
    <span className={`rounded-sm px-0.5 underline decoration-2 underline-offset-4 ${styles}`}>
      {children}
      <sup
        className={`ml-1 inline-grid h-[1.05rem] w-[1.05rem] translate-y-[-0.15rem] place-items-center rounded-full text-[0.625rem] font-bold leading-none ${badge}`}
        aria-label={`annotation ${n}`}
      >
        {n}
      </sup>
    </span>
  );
}

export default function AnnotatedLetter() {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-4 -z-10 rounded-[2rem] bg-[radial-gradient(60%_55%_at_45%_30%,rgba(39,100,231,0.10),transparent_75%)]"
        />
        <div className="rounded-[1.5rem] border border-line bg-white p-6 shadow-[0_28px_70px_-50px_rgba(16,35,63,0.55)] sm:p-8">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-soft">
              Cover letter · illustrative example
            </p>
            <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-success">
              <IconFacts className="h-3.5 w-3.5" />
              Review your facts
            </span>
          </div>

          <p className="mt-5 text-[1rem] leading-9 text-ink sm:text-[1.0625rem]">
            Dear Hiring Manager,
          </p>
          <p className="mt-3 text-[1rem] leading-9 text-ink sm:text-[1.0625rem]">
            <Mark n={1}>I&apos;m writing to apply for</Mark> the Product Designer role at{" "}
            <Mark n={4} tone="success">
              Acme Corp
            </Mark>
            . Over the past <Mark n={4} tone="success">four years</Mark> I have{" "}
            <Mark n={2}>led design for two mobile products</Mark>, and{" "}
            <Mark n={3}>I&apos;d welcome the chance to bring that work to your team</Mark>.
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {LAYERS.map((layer) => (
          <li key={layer.n} className="flex items-start gap-3 rounded-xl border border-line bg-white/70 p-3.5">
            <span
              className={
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.6875rem] font-bold text-white " +
                (layer.tone === "success" ? "bg-success" : "bg-brand")
              }
            >
              {layer.n}
            </span>
            <span>
              <span className="block text-[0.875rem] font-semibold text-navy">{layer.label}</span>
              <span className="mt-0.5 block text-[0.8125rem] leading-5 text-muted">{layer.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

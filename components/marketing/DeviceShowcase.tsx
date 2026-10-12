import { IconCheck, IconCopy, IconRecruiterMessage } from "@/components/ui/Icons";

function Line({ w, tone = "line" }: { w: string; tone?: "line" | "brand" | "ink" }) {
  const tones = { line: "bg-line", brand: "bg-brand-100", ink: "bg-line-strong" } as const;
  return <span className={`block h-2 rounded-full ${tones[tone]}`} style={{ width: w }} />;
}

function LaptopScreen() {
  return (
    <div className="w-full">
      <div className="rounded-t-2xl border border-line-strong bg-ink/90 p-2.5 pb-0 shadow-[0_30px_60px_-45px_rgba(16,35,63,0.8)]">
        <div className="overflow-hidden rounded-t-xl bg-white">
          <div className="flex items-center gap-2 border-b border-line bg-ivory px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[0.5625rem] font-medium text-muted-soft">
              hireword.com
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
              <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-muted-soft">
                Your draft
              </span>
              <Line w="100%" />
              <Line w="88%" />
              <Line w="94%" />
              <Line w="60%" />
              <span className="mt-1 inline-flex h-6 w-28 items-center justify-center rounded-full bg-brand text-[0.5625rem] font-semibold text-white">
                Rewrite my text
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-brand-100 bg-brand-50/50 p-3">
              <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-brand-700">
                Rewritten
              </span>
              <Line w="96%" tone="brand" />
              <Line w="82%" tone="brand" />
              <Line w="90%" tone="brand" />
              <Line w="54%" tone="brand" />
              <span className="mt-1 inline-flex items-center gap-1 text-[0.5625rem] font-semibold text-success">
                <IconCheck className="h-2.5 w-2.5" /> Facts preserved
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-[104%] -translate-x-[2%] rounded-b-xl border border-t-0 border-line-strong bg-gradient-to-b from-[#dfe4ec] to-[#c6cdd9]" />
    </div>
  );
}

function PhoneScreen() {
  return (
    <div className="w-[13rem] shrink-0 rounded-[2.25rem] border border-line-strong bg-white p-2 shadow-[0_24px_50px_-28px_rgba(16,35,63,0.45)] sm:w-[12.5rem] lg:w-[13.5rem]">
      <div className="overflow-hidden rounded-[1.75rem] border border-line bg-white">
        <div className="flex justify-center bg-ivory pt-2">
          <span className="h-1 w-12 rounded-full bg-line-strong" />
        </div>
        <div className="flex flex-col gap-3 p-3.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-[0.625rem] font-semibold text-brand-700">
            <IconRecruiterMessage className="h-3 w-3" />
            Recruiter message
          </span>
          <p className="rounded-xl border border-line bg-white px-3 py-2.5 text-[0.75rem] leading-5 text-ink">
            Hi Sarah, I hope you&apos;re doing well. I saw your post for the Backend Developer role, and I&apos;d love
            to be considered. Thanks for your time.
          </p>
          <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-navy text-[0.6875rem] font-semibold text-white">
            <IconCopy className="h-3.5 w-3.5" />
            Copy
          </span>
          <div className="flex items-center justify-between px-1 text-[0.625rem] font-medium text-muted">
            <span>Email</span>
            <span>WhatsApp</span>
            <span>Start another</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeviceShowcase() {
  return (
    <div className="flex items-end justify-center">
      <div className="hidden min-w-0 w-full max-w-[26rem] sm:block">
        <LaptopScreen />
      </div>
      <div className="relative z-10 sm:ml-4 sm:mb-[-1.25rem]">
        <PhoneScreen />
      </div>
    </div>
  );
}

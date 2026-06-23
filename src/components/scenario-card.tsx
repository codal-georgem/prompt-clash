import type { Scenario } from "@/types/domain";

type ScenarioCardProps = {
  scenario: Scenario;
  onClick?: () => void;
};

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const [area, title] = scenario.title.includes("|")
    ? scenario.title.split("|").map((part) => part.trim())
    : ["General", scenario.title];

  const content = (
    <>
      <div className="pointer-events-none absolute -right-12 -top-10 h-28 w-28 rounded-full bg-cyan-100/60 blur-2xl transition group-hover:bg-cyan-200/55" />

      <div className="relative mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
          Area: {area}
        </span>
      </div>

      <h3 className="relative text-lg font-semibold text-slate-900 md:text-xl">
        <span className="text-slate-500">Title: </span>
        {title}
      </h3>

      <p className="relative mt-3 text-sm leading-6 text-slate-600">
        <span className="font-semibold text-slate-500">Description: </span>
        {scenario.description}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        className="group relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.55)]"
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)]">{content}</article>;
}

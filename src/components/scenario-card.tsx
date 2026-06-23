import type { Scenario } from "@/types/domain";

type ScenarioCardProps = {
  scenario: Scenario;
  onClick?: () => void;
};

const AREA_COLOURS: Record<string, { bg: string; text: string; blob: string }> = {
  QA: { bg: "bg-violet-50 border-violet-200", text: "text-violet-700", blob: "bg-violet-100/70" },
  PM: { bg: "bg-sky-50 border-sky-200", text: "text-sky-700", blob: "bg-sky-100/70" },
  Developer: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", blob: "bg-amber-100/70" },
  "Data Analyst": { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", blob: "bg-emerald-100/70" },
  Support: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", blob: "bg-rose-100/70" },
  Common: { bg: "bg-slate-100 border-slate-200", text: "text-slate-600", blob: "bg-slate-200/60" },
  General: { bg: "bg-slate-100 border-slate-200", text: "text-slate-600", blob: "bg-slate-200/60" },
};

const DIFFICULTY_COLOURS: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-rose-100 text-rose-700 border-rose-200",
};

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  const [area, title] = scenario.title.includes("|")
    ? scenario.title.split("|").map((part) => part.trim())
    : ["General", scenario.title];

  const areaStyle = AREA_COLOURS[area] ?? AREA_COLOURS.General;
  const difficultyStyle =
    DIFFICULTY_COLOURS[scenario.difficulty ?? "Beginner"] ?? DIFFICULTY_COLOURS.Beginner;

  const content = (
    <>
      <div
        className={`pointer-events-none absolute -right-12 -top-10 h-28 w-28 rounded-full blur-2xl transition-all duration-300 group-hover:scale-125 ${areaStyle.blob}`}
      />

      {/* Badges row */}
      <div className="relative mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide ${areaStyle.bg} ${areaStyle.text}`}
        >
          {area}
        </span>
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${difficultyStyle}`}
        >
          {scenario.difficulty ?? "Beginner"}
        </span>
      </div>

      {/* Title */}
      <h3 className="relative text-base font-semibold leading-snug text-slate-900 md:text-lg">
        {title}
      </h3>

      {/* Description */}
      <p className="relative mt-2.5 line-clamp-3 text-sm leading-6 text-slate-500">
        {scenario.description}
      </p>

      {onClick ? (
        <p className={`mt-4 text-xs font-semibold ${areaStyle.text} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}>
          Click to submit your prompt →
        </p>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}

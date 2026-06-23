import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "neutral" | "teal" | "sky" | "amber" | "emerald";
};

const toneMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  neutral: "from-slate-50 to-white border-slate-200",
  teal: "from-teal-50 to-white border-teal-200",
  sky: "from-sky-50 to-white border-sky-200",
  amber: "from-amber-50 to-white border-amber-200",
  emerald: "from-emerald-50 to-white border-emerald-200",
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <article
      className={`rounded-2xl border bg-gradient-to-br px-4 py-4 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)] ${toneMap[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {Icon ? (
          <div className="rounded-lg bg-white/80 p-2 shadow-sm">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </article>
  );
}

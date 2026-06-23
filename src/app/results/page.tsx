import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { ResultsDashboardClient } from "@/components/results/results-dashboard-client";

export const dynamic = "force-dynamic";

export default function ResultsPage() {
  return (
    <main className="w-full space-y-8 px-4 py-10 md:px-10 md:py-14 lg:px-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-8 md:p-12">
        <div className="pointer-events-none absolute -right-24 -top-16 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-16 h-56 w-56 rounded-full bg-teal-200/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
              <BarChart3 className="h-3 w-3" />
              Analytics &amp; Rankings
            </span>
            <h1 className="font-heading text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
              Results{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-base text-slate-600">
              Compare prompts, track team performance, and identify learning opportunities.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-150 hover:scale-[1.02] hover:bg-slate-50 md:self-auto"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scenarios
          </Link>
        </div>
      </section>

      <ResultsDashboardClient />
    </main>
  );
}

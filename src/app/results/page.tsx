import Link from "next/link";
import { ResultsDashboardClient } from "@/components/results/results-dashboard-client";

export const dynamic = "force-dynamic";

export default function ResultsPage() {
  return (
    <main className="w-full space-y-8 px-4 py-10 md:px-10 md:py-14 lg:px-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-8">
        <div className="absolute -right-20 -top-12 h-44 w-44 rounded-full bg-emerald-200/40 blur-2xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Results Dashboard</h1>
          <p className="mt-2 text-slate-600">Analytics, rankings, and team learning insights.</p>
        </div>
        <Link className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700" href="/">
          Back to home
        </Link>
        </div>
      </section>

      <ResultsDashboardClient />
    </main>
  );
}

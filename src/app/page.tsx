import Link from "next/link";
import { ArrowRight, BarChart3, Sparkles, Trophy, Zap } from "lucide-react";
import { HomeScenariosModal } from "@/components/home-scenarios-modal";
import { ensureScenariosSeeded, getScenarios } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureScenariosSeeded();
  const scenarios = await getScenarios();

  return (
    <main className="w-full px-4 py-10 md:px-10 md:py-14 lg:px-16">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-8 md:p-12">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-16 h-56 w-56 rounded-full bg-slate-300/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-teal-200/20 blur-2xl" />

        <div className="relative">
          {/* Pill badge */}
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
            <Zap className="h-3 w-3" />
            AI Prompt Engineering Challenge
          </span>

          {/* Headline */}
          <h1 className="font-heading text-5xl font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            Prompt{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
              Clash
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Write AI prompts against real workplace scenarios. Get instant
            AI-scored feedback. Compete with your team.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.03] hover:bg-slate-700 active:scale-[0.97]"
              href="#scenarios"
            >
              Start a Scenario
              <ArrowRight className="h-4 w-4" />
            </a>
            {/* <Link
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-150 hover:scale-[1.03] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]"
              href="/results"
            >
              <BarChart3 className="h-4 w-4" />
              View Results
            </Link> */}
          </div>

          {/* Stat row */}
          <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-slate-900">{scenarios.length}</span>
              <span className="text-slate-500">Scenarios</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span className="font-semibold text-slate-900">AI-Scored</span>
              <span className="text-slate-500">in seconds</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-cyan-500" />
              <span className="font-semibold text-slate-900">Instant</span>
              <span className="text-slate-500">feedback</span>
            </div>
          </div>
        </div>
      </section>

      <HomeScenariosModal scenarios={scenarios} />
    </main>
  );
}

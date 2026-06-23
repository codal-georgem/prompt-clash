import Link from "next/link";
import { HomeScenariosModal } from "@/components/home-scenarios-modal";
import { ensureScenariosSeeded, getScenarios } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureScenariosSeeded();
  const scenarios = await getScenarios();

  return (
    <main className="w-full px-4 py-10 md:px-10 md:py-14 lg:px-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-8 md:p-11">
        <div className="absolute -right-20 -top-16 h-48 w-48 rounded-full bg-cyan-200/35 blur-2xl" />
        <div className="absolute -bottom-10 left-24 h-40 w-40 rounded-full bg-slate-200/45 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">Prompt Clash</h1>
            <p className="max-w-3xl text-slate-700">
              Improve your Prompt Engineering skills and compete with your team.
            </p>
          </div>
          {/* <Link
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            href="/results"
          >
            View results dashboard
          </Link> */}
        </div>
      </section>

      <HomeScenariosModal scenarios={scenarios} />
    </main>
  );
}

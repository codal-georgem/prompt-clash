import Link from "next/link";
import { BarChart3, Zap } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-10 lg:px-16">
        {/* Brand */}
        <Link
          className="flex items-center gap-2 text-slate-900 transition-opacity hover:opacity-80"
          href="/"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Zap className="h-4 w-4" />
          </span>
          <span className="font-heading text-base font-bold tracking-tight">
            Prompt Clash
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link
            className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex"
            href="/"
          >
            Scenarios
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.03] hover:bg-slate-700 active:scale-[0.97]"
            href="/results"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Results
          </Link>
        </nav>
      </div>
    </header>
  );
}

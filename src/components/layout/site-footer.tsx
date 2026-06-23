import Link from "next/link";
import { Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row md:px-10 lg:px-16">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Prompt Clash</span>
          <span>— Sharpen your AI prompting skills.</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link className="transition-colors hover:text-slate-800" href="/">
            Scenarios
          </Link>
          <Link className="transition-colors hover:text-slate-800" href="/results">
            Results
          </Link>
        </nav>
      </div>
    </footer>
  );
}

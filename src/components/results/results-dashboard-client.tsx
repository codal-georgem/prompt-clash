"use client";

import { useMemo, useState } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import {
  BarChart3,
  CheckCircle2,
  CircleHelp,
  Gauge,
  ListChecks,
  Medal,
  PieChart,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import type { ResultsAnalytics, SubmissionWithAnalysis } from "@/types/domain";

ChartJS.register(ArcElement, Tooltip, Legend);

async function fetchAnalytics(): Promise<ResultsAnalytics> {
  const response = await fetch("/api/results/analytics", { cache: "no-store" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(payload.error ?? "Failed to fetch analytics");
  }
  return (await response.json()) as ResultsAnalytics;
}

async function fetchAnalyticsWithRetry(): Promise<ResultsAnalytics> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetchAnalytics();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to load dashboard data");
}

function PromptColumn({
  heading,
  row,
  tone,
}: {
  heading: string;
  row: SubmissionWithAnalysis | null;
  tone: "good" | "best" | "worst";
}) {
  const toneClass =
    tone === "best"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "good"
        ? "border-sky-200 bg-sky-50"
        : "border-amber-200 bg-amber-50";

  const techniques = row ? analyzePromptTechniques(row.promptText) : null;

  const techniquesRows = techniques
    ? [
        { label: "Clarity", strong: techniques.clarity },
        { label: "Context", strong: techniques.context },
        { label: "Constraints", strong: techniques.constraints },
        { label: "Specificity", strong: techniques.specificity },
        { label: "Output Format", strong: techniques.outputFormat },
      ]
    : [];

  return (
    <article className={`rounded-2xl border px-5 py-4 ${toneClass}`}>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        {tone === "best" ? <Sparkles className="h-4 w-4" /> : null}
        {tone === "good" ? <Target className="h-4 w-4" /> : null}
        {tone === "worst" ? <TrendingUp className="h-4 w-4" /> : null}
        {heading}
      </h3>
      {!row ? (
        <p className="mt-2 text-sm text-slate-600">No analyzed prompts yet.</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Scenario:</span> {row.scenarioTitle}
          </p>
          <p>
            <span className="font-semibold">Score:</span> {row.score}
          </p>
          <p>
            <span className="font-semibold">Prompt:</span> {row.promptText}
          </p>
          <div className="mt-3 rounded-xl border border-white/60 bg-white/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Technique Diff
            </p>
            <div className="mt-2 space-y-2 text-xs">
              {techniquesRows.map((item) => (
                <div
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5"
                  key={item.label}
                >
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                      item.strong
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.strong ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {item.strong ? "Strong" : "Weak"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function analyzePromptTechniques(promptText: string) {
  const text = promptText.toLowerCase();
  const hasAny = (tokens: string[]) =>
    tokens.some((token) => text.includes(token));

  return {
    clarity: hasAny(["clear", "concise", "goal", "objective"]),
    context: hasAny(["context", "background", "given", "about"]),
    constraints: hasAny([
      "must",
      "limit",
      "constraint",
      "should not",
      "do not",
    ]),
    specificity: hasAny([
      "exact",
      "specific",
      "step",
      "criteria",
      "acceptance",
    ]),
    outputFormat: hasAny(["format", "table", "json", "bullet", "sections"]),
  };
}

function PromptList({
  title,
  rows,
}: {
  title: string;
  rows: SubmissionWithAnalysis[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-4">
      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <ListChecks className="h-4 w-4 text-slate-500" />
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No prompts available.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {rows.map((row) => (
            <li
              className="rounded-lg border border-slate-200 bg-white p-3"
              key={row.submissionId}
            >
              <p className="line-clamp-3">{row.promptText}</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Score: {row.score}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function LeaderboardModal({
  rows,
  onClose,
}: {
  rows: SubmissionWithAnalysis[];
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [page, rows]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Trophy className="h-5 w-5 text-amber-500" />
            Leaderboard
          </h3>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="overflow-x-auto px-5 py-4">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-600">
              No analyzed submissions yet.
            </p>
          ) : (
            <table className="w-full min-w-[900px] table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 pr-4">Rank</th>
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Scenario</th>
                  <th className="pb-3 pr-4">Prompt</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  const rank = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      className="border-b border-slate-100"
                      key={row.submissionId}
                    >
                      <td className="py-3 pr-4 font-semibold">#{rank}</td>
                      <td className="py-3 pr-4">{row.employeeName}</td>
                      <td className="py-3 pr-4">{row.scenarioTitle}</td>
                      <td className="py-3 pr-4 align-top">
                        <div className="max-h-28 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 p-2 text-xs leading-5 text-slate-700">
                          {row.promptText}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{row.category}</td>
                      <td className="py-3 font-semibold">{row.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CircleHelp className="h-5 w-5 text-sky-600" />
            Prompt Score Calculation
          </h3>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm text-slate-700">
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            Score is calculated out of <span className="font-semibold">100</span> using the Golden Rule and prompt engineering rubric.
          </p>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-semibold text-slate-900">Golden Rule Check</p>
            <p>
              The prompt must match the selected scenario title and description. If relevance is weak or mismatched,
              score is heavily reduced.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">Rubric Criteria (20 each)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Scenario Relevance</li>
                <li>Clarity</li>
                <li>Context</li>
                <li>Constraints and Specificity</li>
                <li>Output Format Definition</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">Category Mapping</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <span className="font-semibold">0-40:</span> Beginner
                </li>
                <li>
                  <span className="font-semibold">41-75:</span> Intermediate
                </li>
                <li>
                  <span className="font-semibold">76-100:</span> Advanced
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultsDashboardClient() {
  const [analytics, setAnalytics] = useState<ResultsAnalytics | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const data = await fetchAnalyticsWithRetry();
      setAnalytics(data);
      toast.success("Dashboard loaded successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load dashboard",
      );
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const pieData = useMemo(() => {
    if (!analytics) return null;

    return {
      labels: ["Worst", "Good", "Best"],
      datasets: [
        {
          label: "Prompt Count",
          data: [
            analytics.worstPrompts.length,
            analytics.goodPrompts.length,
            analytics.bestPrompts.length,
          ],
          backgroundColor: ["#f59e0b", "#38bdf8", "#10b981"],
          borderColor: ["#d97706", "#0284c7", "#059669"],
          borderWidth: 1,
        },
      ],
    };
  }, [analytics]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/40 to-teal-50/50 px-5 py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Result Dashboard
            </h2>
            <p className="text-sm text-slate-600">
              Load metrics and prompt quality comparisons in one click.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                if (!analytics) {
                  await loadDashboard();
                }
                setShowLeaderboard(true);
              }}
              variant="outline"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Open Leaderboard
            </Button>
            <Button disabled={isLoadingDashboard} onClick={loadDashboard}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoadingDashboard
                ? "Loading Dashboard..."
                : "Show Result Dashboard"}
            </Button>
          </div>
        </div>
      </section>

      {analytics ? (
        <>
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.5)] xl:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                <Gauge className="h-5 w-5 text-sky-600" />
                Summary Metrics
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Total Submissions"
                  value={analytics.metrics.totalSubmissions}
                  icon={Users}
                  tone="teal"
                />
                <MetricCard
                  label="Advanced Count"
                  value={analytics.metrics.advancedCount}
                  icon={Sparkles}
                  tone="emerald"
                />
                <MetricCard
                  label="Intermediate Count"
                  value={analytics.metrics.intermediateCount}
                  icon={Target}
                  tone="sky"
                />
                <MetricCard
                  label="Beginner Count"
                  value={analytics.metrics.beginnerCount}
                  icon={TrendingUp}
                  tone="amber"
                />
                <MetricCard
                  label="Average Score"
                  value={analytics.metrics.averageScore}
                  icon={Medal}
                  tone="neutral"
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                <PieChart className="h-5 w-5 text-teal-600" />
                Prompt Category Split
              </h2>
              <div className="mx-auto max-w-md">
                {pieData ? <Pie data={pieData} /> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <Sparkles className="h-5 w-5 text-cyan-600" />
                Prompt Quality
              </h2>
              <Button onClick={() => setShowScoreInfo(true)} size="sm" variant="outline">
                <CircleHelp className="mr-2 h-4 w-4" />
                Score Info
              </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <PromptColumn
                heading="Worst Prompt"
                row={analytics.worstPrompt}
                tone="worst"
              />
              <PromptColumn
                heading="Good Prompt"
                row={analytics.goodPrompt}
                tone="good"
              />
              <PromptColumn
                heading="Best Prompt"
                row={analytics.bestPrompt}
                tone="best"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <ListChecks className="h-5 w-5 text-slate-600" />
              Prompt Lists (All Prompts by Category)
            </h2>
            <p className="text-sm text-slate-600">
              Each prompt appears in exactly one category based on score: Worst
              (0-40), Good (41-75), Best (76-100).
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              <PromptList rows={analytics.worstPrompts} title="Worst Prompts" />
              <PromptList rows={analytics.goodPrompts} title="Good Prompts" />
              <PromptList rows={analytics.bestPrompts} title="Best Prompts" />
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm text-slate-600">
            Click "Show Result Dashboard" to load complete analytics in one
            request.
          </p>
        </section>
      )}

      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          rows={analytics?.leaderboard ?? []}
        />
      )}
      {showScoreInfo && <ScoreInfoModal onClose={() => setShowScoreInfo(false)} />}
    </div>
  );
}

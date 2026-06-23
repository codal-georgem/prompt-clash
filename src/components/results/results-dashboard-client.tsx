"use client";

import { useMemo, useState } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import {
  BarChart3,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
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

type ScoreBreakdownItem = {
  label: string;
  points: number;
  max: number;
  note: string;
};

function getCategoryRange(category: SubmissionWithAnalysis["category"]) {
  if (category === "Beginner") return "0-40";
  if (category === "Intermediate") return "41-75";
  return "76-100";
}

function buildScoreBreakdown(
  row: SubmissionWithAnalysis,
): ScoreBreakdownItem[] {
  const techniques = analyzePromptTechniques(row.promptText);
  const hasMismatchWeakness = row.weaknesses.some((item) =>
    /scenario mismatch|does not sufficiently match|not match/i.test(item),
  );

  const maxPerCriterion = 20;
  const raw: ScoreBreakdownItem[] = [
    {
      label: "Scenario Relevance",
      points: hasMismatchWeakness ? 4 : 16,
      max: maxPerCriterion,
      note: hasMismatchWeakness
        ? "Weak match with selected scenario."
        : "Aligned with selected scenario context.",
    },
    {
      label: "Clarity",
      points: techniques.clarity ? 16 : 8,
      max: maxPerCriterion,
      note: techniques.clarity
        ? "Prompt goals/instructions are clear."
        : "Improve instruction clarity.",
    },
    {
      label: "Context",
      points: techniques.context ? 16 : 8,
      max: maxPerCriterion,
      note: techniques.context
        ? "Contains useful background/context."
        : "Add scenario/background context.",
    },
    {
      label: "Constraints + Specificity",
      points: techniques.constraints || techniques.specificity ? 16 : 8,
      max: maxPerCriterion,
      note:
        techniques.constraints || techniques.specificity
          ? "Includes constraints/specific guidance."
          : "Add concrete constraints and criteria.",
    },
    {
      label: "Output Format",
      points: techniques.outputFormat ? 16 : 8,
      max: maxPerCriterion,
      note: techniques.outputFormat
        ? "Output format is defined."
        : "Specify expected output format.",
    },
  ];

  // Keep breakdown total exactly equal to final score for transparent point accounting.
  let currentTotal = raw.reduce((sum, item) => sum + item.points, 0);
  let delta = row.score - currentTotal;

  if (delta !== 0) {
    const ordered = delta > 0 ? [1, 2, 3, 4, 0] : [0, 3, 1, 2, 4];

    while (delta !== 0) {
      let moved = false;
      for (const idx of ordered) {
        if (delta > 0 && raw[idx].points < raw[idx].max) {
          raw[idx].points += 1;
          delta -= 1;
          moved = true;
        } else if (delta < 0 && raw[idx].points > 0) {
          raw[idx].points -= 1;
          delta += 1;
          moved = true;
        }

        if (delta === 0) break;
      }

      if (!moved) break;
    }
  }

  return raw;
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
  const scoreDetails = row ? buildScoreBreakdown(row) : [];

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
            <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {row.category} ({getCategoryRange(row.category)})
            </span>
          </p>
          <p>
            <span className="font-semibold">Prompt:</span> {row.promptText}
          </p>
          <div className="mt-3 rounded-xl border border-white/60 bg-white/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Score Points
            </p>
            <div className="mt-2 space-y-1.5 text-xs text-slate-700">
              {scoreDetails.map((item) => (
                <div
                  className="flex items-center justify-between"
                  key={item.label}
                >
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">
                    {item.points}/{item.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
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
  onSelectRow,
}: {
  title: string;
  rows: SubmissionWithAnalysis[];
  onSelectRow: (row: SubmissionWithAnalysis) => void;
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
              <button
                className="w-full text-left"
                onClick={() => onSelectRow(row)}
                type="button"
              >
                <p className="line-clamp-3">{row.promptText}</p>
                <div className="mt-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <p>Score: {row.score}</p>
                  <span className="text-cyan-700">View details</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function PromptDetailsModal({
  onClose,
  row,
}: {
  onClose: () => void;
  row: SubmissionWithAnalysis;
}) {
  const breakdown = buildScoreBreakdown(row);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-2 sm:p-4 md:items-center">
      <div className="my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-4 sm:max-h-[calc(100dvh-2rem)] md:my-0">
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ClipboardList className="h-5 w-5 text-cyan-600" />
            Prompt Score Details
          </h3>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Scenario
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {row.scenarioTitle}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Final Score
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {row.score}/100
                <span className="ml-2 text-sm font-medium text-slate-500">
                  {row.category} ({getCategoryRange(row.category)})
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 font-semibold text-slate-900">
              Points Breakdown
            </p>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.points}/{item.max}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-cyan-500"
                      style={{ width: `${(item.points / item.max) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-semibold text-slate-900">Prompt</p>
            <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
              {row.promptText}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-2 font-semibold text-emerald-900">Strengths</p>
              {row.strengths.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-xs text-emerald-900">
                  {row.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-800">No strengths listed.</p>
              )}
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="mb-2 font-semibold text-rose-900">Weaknesses</p>
              {row.weaknesses.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-xs text-rose-900">
                  {row.weaknesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-rose-800">No weaknesses listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-2 sm:p-4 md:items-center">
      <div className="my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-4 sm:max-h-[calc(100dvh-2rem)] md:my-0">
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Trophy className="h-5 w-5 text-amber-500" />
            Leaderboard
          </h3>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-600">
              No analyzed submissions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
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
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-between border-t border-slate-200 px-5 py-4">
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-2 sm:p-4 md:items-center">
      <div className="my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-4 sm:max-h-[calc(100dvh-2rem)] md:my-0">
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CircleHelp className="h-5 w-5 text-sky-600" />
            Prompt Score Calculation
          </h3>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            Score is calculated out of{" "}
            <span className="font-semibold">100</span> using the Golden Rule and
            prompt engineering rubric.
          </p>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-semibold text-slate-900">
              Golden Rule Check
            </p>
            <p>
              The prompt must match the selected scenario title and description.
              If relevance is weak or mismatched, score is heavily reduced.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-900">
                Rubric Criteria (20 each)
              </p>
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
  const [selectedPrompt, setSelectedPrompt] =
    useState<SubmissionWithAnalysis | null>(null);

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
              <Button
                onClick={() => setShowScoreInfo(true)}
                size="sm"
                variant="outline"
              >
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
              <PromptList
                onSelectRow={setSelectedPrompt}
                rows={analytics.worstPrompts}
                title="Worst Prompts"
              />
              <PromptList
                onSelectRow={setSelectedPrompt}
                rows={analytics.goodPrompts}
                title="Good Prompts"
              />
              <PromptList
                onSelectRow={setSelectedPrompt}
                rows={analytics.bestPrompts}
                title="Best Prompts"
              />
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
      {selectedPrompt && (
        <PromptDetailsModal
          onClose={() => setSelectedPrompt(null)}
          row={selectedPrompt}
        />
      )}
      {showScoreInfo && (
        <ScoreInfoModal onClose={() => setShowScoreInfo(false)} />
      )}
    </div>
  );
}

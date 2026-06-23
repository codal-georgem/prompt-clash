import type { DashboardMetrics, PromptCategory, ResultsAnalytics, Scenario, SubmissionWithAnalysis } from "@/types/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const predefinedScenarios: Omit<Scenario, "id" | "created_at">[] = [
  {
    title: "QA | Build a regression strategy for checkout bugfix",
    description:
      "Create a regression prompt that asks for happy path, edge cases, browser coverage, payment failure handling, and risk-based prioritization for a checkout bugfix release.",
    difficulty: "Beginner",
  },
  {
    title: "QA | Design an API test plan for profile update endpoint",
    description:
      "Generate API test scenarios for success paths, invalid payloads, auth/permission checks, rate limiting, and response contract validation for a profile update endpoint.",
    difficulty: "Intermediate",
  },
  {
    title: "PM | Convert product brief into sprint-ready user stories",
    description:
      "Transform a feature brief into user stories with acceptance criteria, dependencies, assumptions, and release scope notes suitable for sprint planning.",
    difficulty: "Intermediate",
  },
  {
    title: "PM | Draft stakeholder update from roadmap changes",
    description:
      "Create a prompt that generates a concise stakeholder update including changed milestones, customer impact, mitigation plan, and communication tone guidance.",
    difficulty: "Beginner",
  },
  {
    title: "Developer | Refactor legacy authentication module",
    description:
      "Write a prompt requesting a safe refactor plan for legacy auth code, including architecture proposal, migration steps, backward compatibility, and test strategy.",
    difficulty: "Advanced",
  },
  {
    title: "Developer | Create incident postmortem from logs",
    description:
      "Generate a postmortem prompt that asks for timeline, root cause hypotheses, blast radius, prevention actions, and measurable follow-ups based on incident data.",
    difficulty: "Advanced",
  },
  {
    title: "Common | Summarize meeting transcript with ownership",
    description:
      "Design a prompt to summarize a meeting into decisions, owners, due dates, unresolved questions, and next-step checklist in a structured format.",
    difficulty: "Beginner",
  },
  {
    title: "Common | Write a professional client follow-up email",
    description:
      "Generate a prompt for drafting client follow-up emails with context recap, clear asks, deadlines, and professional tone adapted to recipient seniority.",
    difficulty: "Beginner",
  },
  {
    title: "Data Analyst | Analyze churn spike and propose experiments",
    description:
      "Create a prompt that asks for churn analysis by segment, likely drivers, confidence level, and prioritized experiments with expected impact and metrics.",
    difficulty: "Intermediate",
  },
  {
    title: "Support | Triage bug report and customer response",
    description:
      "Build a prompt that classifies bug severity, asks clarifying questions, drafts a customer-safe response, and proposes escalation criteria.",
    difficulty: "Advanced",
  },
];

const legacyScenarioTitles = [
  "Create a professional client email",
  "Generate user stories from requirements",
  "Create test cases for a feature",
  "Summarize a meeting transcript",
  "Analyze a bug report",
];

export async function ensureScenariosSeeded() {
  const supabase = createSupabaseServerClient();

  const { error: deleteLegacyError } = await supabase.from("scenarios").delete().in("title", legacyScenarioTitles);
  if (deleteLegacyError) {
    throw new Error(`Unable to remove legacy scenarios: ${deleteLegacyError.message}`);
  }

  const { data: existing, error } = await supabase.from("scenarios").select("title");
  if (error) {
    throw new Error(`Unable to fetch existing scenarios: ${error.message}`);
  }

  const existingTitles = new Set((existing ?? []).map((s: { title: string }) => s.title));
  const missing = predefinedScenarios.filter((scenario) => !existingTitles.has(scenario.title));

  if (missing.length > 0) {
    const { error: insertError } = await supabase
      .from("scenarios")
      .insert(missing as Array<{ title: string; description: string; difficulty: string }>);
    if (insertError) {
      throw new Error(`Unable to seed scenarios: ${insertError.message}`);
    }
  }
}

export async function getScenarios(): Promise<Scenario[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("scenarios").select("*").order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to fetch scenarios: ${error.message}`);
  }

  return (data ?? []) as Scenario[];
}

function toCategory(raw: string): PromptCategory {
  if (raw === "Advanced" || raw === "Intermediate" || raw === "Beginner") {
    return raw;
  }
  return "Beginner";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function getSubmissionAnalytics(): Promise<ResultsAnalytics> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("prompt_analysis")
    .select(
      "score, category, strengths, weaknesses, improved_prompt, created_at, submissions!inner(id, employee_name, prompt_text, scenario_id, created_at, scenarios!inner(id, title))"
    )
    .order("score", { ascending: false });

  if (error) {
    throw new Error(`Unable to fetch analysis data: ${error.message}`);
  }

  const rows: SubmissionWithAnalysis[] = (data ?? []).map((row: any) => ({
    submissionId: row.submissions.id,
    scenarioId: row.submissions.scenario_id,
    scenarioTitle: row.submissions.scenarios.title,
    employeeName: row.submissions.employee_name,
    promptText: row.submissions.prompt_text,
    score: row.score,
    category: toCategory(row.category),
    strengths: toStringArray(row.strengths),
    weaknesses: toStringArray(row.weaknesses),
    improvedPrompt: row.improved_prompt,
    createdAt: row.created_at,
  }));

  const metrics: DashboardMetrics = {
    totalSubmissions: rows.length,
    advancedCount: rows.filter((r) => r.category === "Advanced").length,
    intermediateCount: rows.filter((r) => r.category === "Intermediate").length,
    beginnerCount: rows.filter((r) => r.category === "Beginner").length,
    averageScore: rows.length > 0 ? Number((rows.reduce((acc, r) => acc + r.score, 0) / rows.length).toFixed(1)) : 0,
  };

  const byScenarioMap = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const current = byScenarioMap.get(row.scenarioTitle) ?? { total: 0, count: 0 };
    byScenarioMap.set(row.scenarioTitle, { total: current.total + row.score, count: current.count + 1 });
  }

  const scenarioAverages = [...byScenarioMap.entries()].map(([scenario, stat]) => ({
    scenario,
    averageScore: Number((stat.total / stat.count).toFixed(1)),
  }));

  const leaderboard = rows.slice(0, 10);
  const bestPrompt = rows.length >= 1 ? rows[0] : null;
  const worstPrompt = rows.length >= 2 ? rows[rows.length - 1] : null;
  const goodPrompt = rows.length >= 3 ? rows[Math.floor(rows.length / 2)] : null;
  const needsImprovementList = [...rows].sort((a, b) => a.score - b.score).slice(0, 10);

  const bestPrompts = rows.filter((row) => row.score >= 76);
  const goodPrompts = rows.filter((row) => row.score >= 41 && row.score <= 75);
  const worstPrompts = rows.filter((row) => row.score <= 40);

  return {
    metrics,
    categoryBreakdown: [
      { name: "Advanced", value: metrics.advancedCount },
      { name: "Intermediate", value: metrics.intermediateCount },
      { name: "Beginner", value: metrics.beginnerCount },
    ],
    scenarioAverages,
    leaderboard,
    bestPrompt,
    goodPrompt,
    worstPrompt,
    bestPrompts,
    goodPrompts,
    worstPrompts,
    needsImprovementList,
  };
}

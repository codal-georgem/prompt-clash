"use server";

import { revalidatePath } from "next/cache";
import { enforceScenarioGoldenRule } from "@/lib/actions/golden-rule";
import { evaluatePrompt } from "@/lib/gemini/client";
import { detectPromptTechnique } from "@/lib/prompt-technique";
import { getSubmissionAnalytics } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchResultsData() {
  return getSubmissionAnalytics();
}

type GenerateAnalysesResult = {
  created: number;
  skipped: number;
  failed: number;
  message: string;
};

async function backoff(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function evaluateWithRetry(input: {
  promptText: string;
  scenarioTitle: string;
  scenarioDescription: string;
}) {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < 3) {
    try {
      const aiEvaluation = await evaluatePrompt(input);
      return enforceScenarioGoldenRule(aiEvaluation, input);
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (!msg.includes("429") || attempt === 2) {
        throw error;
      }
      await backoff((attempt + 1) * 1200);
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Evaluation failed");
}

export async function generatePendingAnalyses(): Promise<GenerateAnalysesResult> {
  const supabase = createSupabaseServerClient();

  const [{ data: allSubmissions, error: submissionsError }, { data: analyses, error: analysesError }] = await Promise.all([
    supabase.from("submissions").select("id, scenario_id, prompt_text"),
    supabase.from("prompt_analysis").select("submission_id"),
  ]);

  if (submissionsError) {
    throw new Error(`Unable to load submissions: ${submissionsError.message}`);
  }

  if (analysesError) {
    throw new Error(`Unable to load existing analyses: ${analysesError.message}`);
  }

  const analyzedIds = new Set((analyses ?? []).map((row: { submission_id: string }) => row.submission_id));
  const pending = (allSubmissions ?? []).filter((s: { id: string }) => !analyzedIds.has(s.id));

  const scenarioIds = [...new Set((pending as Array<{ scenario_id: string }>).map((p) => p.scenario_id))];
  const { data: scenarioRows, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, title, description")
    .in("id", scenarioIds);

  if (scenarioError) {
    throw new Error(`Unable to load scenarios for pending analyses: ${scenarioError.message}`);
  }

  const scenarioMap = new Map((scenarioRows ?? []).map((row: { id: string; title: string; description: string }) => [row.id, row]));

  if (pending.length === 0) {
    return {
      created: 0,
      skipped: 0,
      failed: 0,
      message: "No pending submissions found.",
    };
  }

  let created = 0;
  let failed = 0;

  for (const submission of pending as Array<{ id: string; scenario_id: string; prompt_text: string }>) {
    try {
      const scenario = scenarioMap.get(submission.scenario_id);
      if (!scenario) {
        failed += 1;
        continue;
      }

      const evaluation = await evaluateWithRetry({
        promptText: submission.prompt_text,
        scenarioTitle: scenario.title,
        scenarioDescription: scenario.description,
      });

      const technique = detectPromptTechnique(submission.prompt_text);
      const techniqueLine = `Prompt Technique: ${technique.name} (${technique.confidence}% confidence)`;
      const strengths = evaluation.strengths.some((item) => item.startsWith("Prompt Technique:"))
        ? evaluation.strengths
        : [techniqueLine, ...evaluation.strengths];

      const { error: insertError } = await supabase.from("prompt_analysis").insert({
        submission_id: submission.id,
        score: evaluation.score,
        category: evaluation.category,
        strengths,
        weaknesses: evaluation.weaknesses,
        improved_prompt: evaluation.improvedPrompt,
      });

      if (insertError) {
        failed += 1;
      } else {
        created += 1;
      }
    } catch {
      failed += 1;
    }
  }

  revalidatePath("/results");

  return {
    created,
    skipped: 0,
    failed,
    message: `Generated ${created} analyses. Failed: ${failed}.`,
  };
}

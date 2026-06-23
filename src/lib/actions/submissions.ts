"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { enforceScenarioGoldenRule } from "@/lib/actions/golden-rule";
import { evaluatePrompt } from "@/lib/gemini/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PromptCategory, PromptEvaluation } from "@/types/domain";

const submissionSchema = z.object({
  scenarioId: z.string().uuid("Please select a scenario"),
  promptText: z.string().trim().min(20, "Prompt must be at least 20 characters"),
});

type SubmitResult = {
  success: boolean;
  message: string;
};

function categoryFromScore(score: number): PromptCategory {
  if (score <= 40) return "Beginner";
  if (score <= 75) return "Intermediate";
  return "Advanced";
}

function localFallbackEvaluation(input: {
  promptText: string;
  scenarioTitle: string;
  scenarioDescription: string;
}): PromptEvaluation {
  const promptText = input.promptText;
  const lower = promptText.toLowerCase();
  let score = 20;

  const scenarioCorpus = `${input.scenarioTitle} ${input.scenarioDescription}`.toLowerCase();
  const scenarioTokens = scenarioCorpus
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3)
    .slice(0, 20);

  const relevanceHits = scenarioTokens.filter((token) => lower.includes(token)).length;
  const relevanceRatio = scenarioTokens.length > 0 ? relevanceHits / scenarioTokens.length : 0;

  if (relevanceRatio >= 0.3) score += 20;
  else if (relevanceRatio >= 0.15) score += 12;
  else score += 2;

  const signals = [
    ["context", 15],
    ["constraint", 15],
    ["format", 15],
    ["output", 10],
    ["example", 10],
    ["step", 10],
  ] as const;

  for (const [token, points] of signals) {
    if (lower.includes(token)) {
      score += points;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    category: categoryFromScore(score),
    strengths: ["Submission was analyzed using local fallback scoring with scenario relevance checks."],
    weaknesses: ["AI service was unavailable during submission; re-run analysis later for richer feedback."],
    improvedPrompt: `Improve this prompt so it clearly matches the scenario requirements (${input.scenarioTitle}), and add context, constraints, and explicit output format: ${promptText}`,
  };
}

async function evaluateWithRetry(input: {
  promptText: string;
  scenarioTitle: string;
  scenarioDescription: string;
}): Promise<PromptEvaluation> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const aiEvaluation = await evaluatePrompt(input);
      return enforceScenarioGoldenRule(aiEvaluation, input);
    } catch (error) {
      lastError = error;
    }
  }

  const fallback = localFallbackEvaluation({
    ...input,
    promptText: `${input.promptText} [fallback reason: ${lastError instanceof Error ? lastError.message : "unknown"}]`,
  });
  return enforceScenarioGoldenRule(fallback, input);
}

export async function submitPromptAction(input: {
  scenarioId: string;
  promptText: string;
}): Promise<SubmitResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid submission",
    };
  }

  const supabase = createSupabaseServerClient();

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("title, description")
    .eq("id", parsed.data.scenarioId)
    .single();

  if (scenarioError || !scenario) {
    return {
      success: false,
      message: scenarioError?.message ?? "Selected scenario not found",
    };
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .insert([
      {
        scenario_id: parsed.data.scenarioId,
        employee_name: "Participant",
        prompt_text: parsed.data.promptText,
      },
    ] as Array<{ scenario_id: string; employee_name: string; prompt_text: string }>)
    .select("id")
    .single();

  const submissionId = (submission as { id?: string } | null)?.id;

  if (submissionError || !submissionId) {
    return {
      success: false,
      message: submissionError?.message ?? "Failed to store submission",
    };
  }

  const evaluation = await evaluateWithRetry({
    promptText: parsed.data.promptText,
    scenarioTitle: scenario.title,
    scenarioDescription: scenario.description,
  });

  const { error: analysisError } = await supabase.from("prompt_analysis").insert({
    submission_id: submissionId,
    score: evaluation.score,
    category: evaluation.category,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    improved_prompt: evaluation.improvedPrompt,
  });

  if (analysisError) {
    return {
      success: false,
      message: `Submission saved, but analysis failed: ${analysisError.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/results");

  return {
    success: true,
    message: "Prompt submitted and analyzed successfully.",
  };
}

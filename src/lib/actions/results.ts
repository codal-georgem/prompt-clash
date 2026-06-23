"use server";

import { revalidatePath } from "next/cache";
import { evaluatePrompt } from "@/lib/gemini/client";
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

async function evaluateWithRetry(promptText: string) {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < 3) {
    try {
      return await evaluatePrompt(promptText);
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
    supabase.from("submissions").select("id, prompt_text"),
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

  for (const submission of pending as Array<{ id: string; prompt_text: string }>) {
    try {
      const evaluation = await evaluateWithRetry(submission.prompt_text);
      const { error: insertError } = await supabase.from("prompt_analysis").insert({
        submission_id: submission.id,
        score: evaluation.score,
        category: evaluation.category,
        strengths: evaluation.strengths,
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

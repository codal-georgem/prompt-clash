import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { PromptCategory, PromptEvaluation, ResultsAnalytics } from "@/types/domain";

const evaluationSchema = z.object({
  score: z.number().int().min(0).max(100),
  category: z.enum(["Beginner", "Intermediate", "Advanced"]),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  improvedPrompt: z.string().min(1),
});

const GEMINI_MODEL = "gemini-2.0-flash";

const submissionWithAnalysisSchema = z.object({
  submissionId: z.string(),
  scenarioId: z.string(),
  scenarioTitle: z.string(),
  employeeName: z.string(),
  promptText: z.string(),
  score: z.number().int().min(0).max(100),
  category: z.enum(["Beginner", "Intermediate", "Advanced"]),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvedPrompt: z.string(),
  createdAt: z.string(),
});

const resultsAnalyticsSchema = z.object({
  metrics: z.object({
    totalSubmissions: z.number().int().min(0),
    advancedCount: z.number().int().min(0),
    intermediateCount: z.number().int().min(0),
    beginnerCount: z.number().int().min(0),
    averageScore: z.number().min(0).max(100),
  }),
  categoryBreakdown: z.array(
    z.object({
      name: z.enum(["Beginner", "Intermediate", "Advanced"]),
      value: z.number().int().min(0),
    })
  ),
  scenarioAverages: z.array(
    z.object({
      scenario: z.string(),
      averageScore: z.number().min(0).max(100),
    })
  ),
  leaderboard: z.array(submissionWithAnalysisSchema),
  bestPrompt: submissionWithAnalysisSchema.nullable(),
  goodPrompt: submissionWithAnalysisSchema.nullable(),
  worstPrompt: submissionWithAnalysisSchema.nullable(),
  bestPrompts: z.array(submissionWithAnalysisSchema),
  goodPrompts: z.array(submissionWithAnalysisSchema),
  worstPrompts: z.array(submissionWithAnalysisSchema),
  needsImprovementList: z.array(submissionWithAnalysisSchema),
});

function categoryFromScore(score: number): PromptCategory {
  if (score <= 40) return "Beginner";
  if (score <= 75) return "Intermediate";
  return "Advanced";
}

function extractJsonObject(rawText: string): unknown {
  const trimmed = rawText.trim();

  if (!trimmed) {
    throw new Error("Gemini returned empty output");
  }

  const deFenced = trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(deFenced);
  } catch {
    const first = deFenced.indexOf("{");
    const last = deFenced.lastIndexOf("}");
    if (first === -1 || last === -1 || first >= last) {
      throw new Error("No valid JSON object found in Gemini response");
    }
    return JSON.parse(deFenced.slice(first, last + 1));
  }
}

function buildEvaluationPrompt(input: {
  promptText: string;
  scenarioTitle: string;
  scenarioDescription: string;
}): string {
  return [
    "You are evaluating an employee prompt for prompt engineering quality.",
    "The prompt MUST match the selected scenario title and description.",
    "Golden Rule:",
    "If the prompt does not align with scenario intent/requirements, heavily penalize the score.",
    "Score based on this rubric (20 points each):",
    "1) Scenario Relevance (based on selected title + description)",
    "2) Clarity",
    "3) Context",
    "4) Constraints + Specificity",
    "5) Output Format Definition",
    "Total score must be between 0 and 100.",
    "Category rules:",
    "0-40 => Beginner",
    "41-75 => Intermediate",
    "76-100 => Advanced",
    "Return valid JSON only with this exact shape:",
    "{",
    '  "score": 85,',
    '  "category": "Advanced",',
    '  "strengths": ["..."],',
    '  "weaknesses": ["..."],',
    '  "improvedPrompt": "..."',
    "}",
    "Do not include markdown fences.",
    "Selected scenario title:",
    input.scenarioTitle,
    "Selected scenario description:",
    input.scenarioDescription,
    "Employee prompt to evaluate:",
    input.promptText,
  ].join("\n");
}

export async function evaluatePrompt(input: {
  promptText: string;
  scenarioTitle: string;
  scenarioDescription: string;
}): Promise<PromptEvaluation> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildEvaluationPrompt(input),
  });

  const rawText = (response.text ?? "").trim();
  const parsed = extractJsonObject(rawText);
  const validated = evaluationSchema.parse(parsed);

  const normalizedScore = Math.min(100, Math.max(0, validated.score));
  return {
    score: normalizedScore,
    category: categoryFromScore(normalizedScore),
    strengths: validated.strengths,
    weaknesses: validated.weaknesses,
    improvedPrompt: validated.improvedPrompt,
  };
}

function buildDashboardPrompt(snapshotJson: string): string {
  return [
    "You are generating one dashboard JSON for Prompt Clash from database snapshot data.",
    "Use this rubric for any prompt needing analysis (20 points each): clarity, context, constraints, specificity, output format.",
    "Category mapping: 0-40 Beginner, 41-75 Intermediate, 76-100 Advanced.",
    "If a submission already has analysis in input, keep it. If missing analysis, infer score/category/strengths/weaknesses/improvedPrompt from prompt_text.",
    "Return JSON only and strictly follow this shape:",
    "{",
    '  "metrics": { "totalSubmissions": 0, "advancedCount": 0, "intermediateCount": 0, "beginnerCount": 0, "averageScore": 0 },',
    '  "categoryBreakdown": [{ "name": "Advanced", "value": 0 }, { "name": "Intermediate", "value": 0 }, { "name": "Beginner", "value": 0 }],',
    '  "scenarioAverages": [{ "scenario": "...", "averageScore": 0 }],',
    '  "leaderboard": [SubmissionWithAnalysis... top 10 by score desc],',
    '  "bestPrompt": SubmissionWithAnalysis|null,',
    '  "goodPrompt": SubmissionWithAnalysis|null,',
    '  "worstPrompt": SubmissionWithAnalysis|null,',
    '  "bestPrompts": [SubmissionWithAnalysis... top 5 by score],',
    '  "goodPrompts": [SubmissionWithAnalysis... middle 5 by score],',
    '  "worstPrompts": [SubmissionWithAnalysis... lowest 5 by score],',
    '  "needsImprovementList": [SubmissionWithAnalysis... lowest 10 by score],',
    "}",
    "SubmissionWithAnalysis fields required:",
    "submissionId, scenarioId, scenarioTitle, employeeName, promptText, score, category, strengths[], weaknesses[], improvedPrompt, createdAt",
    "Set employeeName to empty string in all output rows.",
    "Do not include markdown fences.",
    "Database snapshot JSON:",
    snapshotJson,
  ].join("\n");
}

export async function generateDashboardFromSnapshot(snapshot: unknown): Promise<ResultsAnalytics> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildDashboardPrompt(JSON.stringify(snapshot)),
  });

  const rawText = (response.text ?? "").trim();
  const parsed = extractJsonObject(rawText);
  const validated = resultsAnalyticsSchema.parse(parsed);

  return validated;
}

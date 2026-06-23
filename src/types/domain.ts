import type { Database } from "@/types/database";

export type Scenario = Database["public"]["Tables"]["scenarios"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type PromptAnalysis = Database["public"]["Tables"]["prompt_analysis"]["Row"];

export type PromptCategory = "Beginner" | "Intermediate" | "Advanced";

export type PromptEvaluation = {
  score: number;
  category: PromptCategory;
  strengths: string[];
  weaknesses: string[];
  improvedPrompt: string;
};

export type SubmissionWithAnalysis = {
  submissionId: string;
  scenarioId: string;
  scenarioTitle: string;
  employeeName: string;
  promptText: string;
  score: number;
  category: PromptCategory;
  strengths: string[];
  weaknesses: string[];
  improvedPrompt: string;
  createdAt: string;
};

export type DashboardMetrics = {
  totalSubmissions: number;
  advancedCount: number;
  intermediateCount: number;
  beginnerCount: number;
  averageScore: number;
};

export type InsightPack = {
  commonMistakes: string;
  mostMissingComponents: string;
  learningSuggestions: string;
  maturity: string;
};

export type ResultsAnalytics = {
  metrics: DashboardMetrics;
  categoryBreakdown: Array<{ name: PromptCategory; value: number }>;
  scenarioAverages: Array<{ scenario: string; averageScore: number }>;
  leaderboard: SubmissionWithAnalysis[];
  bestPrompt: SubmissionWithAnalysis | null;
  goodPrompt: SubmissionWithAnalysis | null;
  worstPrompt: SubmissionWithAnalysis | null;
  bestPrompts: SubmissionWithAnalysis[];
  goodPrompts: SubmissionWithAnalysis[];
  worstPrompts: SubmissionWithAnalysis[];
  needsImprovementList: SubmissionWithAnalysis[];
};

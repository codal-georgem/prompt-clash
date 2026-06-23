import type { PromptCategory, PromptEvaluation } from "@/types/domain";

type ScenarioAwareInput = {
  promptText: string;
  scenarioTitle: string;
  scenarioDescription: string;
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "into",
  "your",
  "their",
  "have",
  "will",
  "should",
  "would",
  "about",
  "using",
  "create",
  "write",
  "design",
  "generate",
  "prompt",
]);

function toCategory(score: number): PromptCategory {
  if (score <= 40) return "Beginner";
  if (score <= 75) return "Intermediate";
  return "Advanced";
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4)
    .filter((token) => !STOP_WORDS.has(token));
}

export function getScenarioRelevance(input: ScenarioAwareInput) {
  const promptKeywords = new Set(extractKeywords(input.promptText));
  const scenarioKeywords = Array.from(
    new Set(extractKeywords(`${input.scenarioTitle} ${input.scenarioDescription}`))
  );

  if (scenarioKeywords.length === 0) {
    return { ratio: 0, matched: [] as string[] };
  }

  const matched = scenarioKeywords.filter((token) => promptKeywords.has(token));
  return {
    ratio: matched.length / scenarioKeywords.length,
    matched,
  };
}

export function enforceScenarioGoldenRule(
  evaluation: PromptEvaluation,
  input: ScenarioAwareInput
): PromptEvaluation {
  const relevance = getScenarioRelevance(input);

  let adjustedScore = evaluation.score;
  const extraWeaknesses: string[] = [];

  if (relevance.ratio < 0.12) {
    adjustedScore = Math.min(adjustedScore, 30);
    extraWeaknesses.push(
      "Prompt does not sufficiently match selected scenario requirements (title/description mismatch)."
    );
  } else if (relevance.ratio < 0.2) {
    adjustedScore = Math.max(0, adjustedScore - 25);
    adjustedScore = Math.min(adjustedScore, 55);
    extraWeaknesses.push(
      "Prompt has partial scenario mismatch; strengthen relevance to the selected scenario context."
    );
  }

  const normalizedScore = Math.max(0, Math.min(100, adjustedScore));

  return {
    ...evaluation,
    score: normalizedScore,
    category: toCategory(normalizedScore),
    weaknesses: [...extraWeaknesses, ...evaluation.weaknesses],
    improvedPrompt:
      relevance.ratio < 0.2
        ? `Revise this prompt so it directly addresses scenario: ${input.scenarioTitle}. Scenario details: ${input.scenarioDescription}. Original prompt: ${input.promptText}`
        : evaluation.improvedPrompt,
  };
}

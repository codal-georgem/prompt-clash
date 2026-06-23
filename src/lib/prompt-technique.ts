export type PromptTechniqueName =
  | "Zero-Shot Prompting"
  | "Few-Shot Prompting"
  | "Role Prompting"
  | "Chain of Thought (CoT)"
  | "Structured Output Prompting"
  | "Constraint-Based Prompting"
  | "Contextual Prompting"
  | "Task Decomposition"
  | "Self-Critique Prompting"
  | "Reflection Prompting"
  | "Tree of Thoughts (ToT)"
  | "ReAct Prompting"
  | "Persona Prompting"
  | "Comparative Prompting"
  | "Scenario-Based Prompting"
  | "Template Prompting"
  | "Iterative Refinement Prompting"
  | "Output Priming"
  | "Multi-Perspective Prompting"
  | "Evaluation Prompting";

export type PromptTechnique = {
  name: PromptTechniqueName;
  confidence: number;
  reason: string;
};

type TechniqueRule = {
  name: PromptTechniqueName;
  reason: string;
  any: string[];
};

const TECHNIQUE_RULES: TechniqueRule[] = [
  {
    name: "Few-Shot Prompting",
    reason: "Prompt references examples or asks to continue a demonstrated pattern.",
    any: ["example", "few-shot", "here are", "in the same format", "following examples"],
  },
  {
    name: "Role Prompting",
    reason: "Prompt explicitly assigns an expert role.",
    any: ["act as", "you are a", "as a senior", "as an expert"],
  },
  {
    name: "Persona Prompting",
    reason: "Prompt asks the model to simulate a specific person or identity.",
    any: ["as a staff engineer", "as a product manager", "simulate", "persona"],
  },
  {
    name: "Chain of Thought (CoT)",
    reason: "Prompt asks for step-by-step reasoning.",
    any: ["step by step", "think step", "reason step", "show your reasoning"],
  },
  {
    name: "Structured Output Prompting",
    reason: "Prompt requires a controlled/structured response format.",
    any: ["markdown table", "json", "format", "bullet", "sections", "yaml", "csv"],
  },
  {
    name: "Constraint-Based Prompting",
    reason: "Prompt sets strict boundaries, limits, or mandatory rules.",
    any: ["must", "only", "do not", "should not", "constraints", "limit", "exactly"],
  },
  {
    name: "Contextual Prompting",
    reason: "Prompt includes project/business context as grounding.",
    any: ["context", "background", "project", "business", "platform", "given this"],
  },
  {
    name: "Task Decomposition",
    reason: "Prompt breaks work into ordered sub-tasks.",
    any: ["first", "then", "next", "finally", "phase", "analyze, then", "step 1"],
  },
  {
    name: "Self-Critique Prompting",
    reason: "Prompt asks model to review and critique its own output.",
    any: ["review your answer", "identify weaknesses", "critique", "self-critique"],
  },
  {
    name: "Reflection Prompting",
    reason: "Prompt asks for an improved version after reflection.",
    any: ["improve", "optimize", "revise", "reflection", "iterate on your answer"],
  },
  {
    name: "Tree of Thoughts (ToT)",
    reason: "Prompt explores multiple alternatives before choosing.",
    any: ["3 possible", "multiple approaches", "compare approaches", "tree of thoughts", "alternatives"],
  },
  {
    name: "ReAct Prompting",
    reason: "Prompt asks to reason, act, and verify in sequence.",
    any: ["analyze requirements", "validate risks", "reason and act", "react", "verify"],
  },
  {
    name: "Comparative Prompting",
    reason: "Prompt asks to compare two or more options.",
    any: ["compare", "versus", "vs", "trade-offs", "pros and cons"],
  },
  {
    name: "Scenario-Based Prompting",
    reason: "Prompt is framed as a realistic situation or incident.",
    any: ["scenario", "situation", "production", "incident", "deployment failed"],
  },
  {
    name: "Template Prompting",
    reason: "Prompt asks to use a reusable template format.",
    any: ["template", "use this format", "fill this", "using this structure"],
  },
  {
    name: "Iterative Refinement Prompting",
    reason: "Prompt explicitly asks for versioned improvement cycles.",
    any: ["version 1", "version 2", "iterate", "refine", "incremental"],
  },
  {
    name: "Output Priming",
    reason: "Prompt pre-defines how the output should begin/look.",
    any: ["output should", "return in this format", "response format", "start with"],
  },
  {
    name: "Multi-Perspective Prompting",
    reason: "Prompt asks for viewpoints from multiple roles.",
    any: ["from different perspectives", "developer, qa, pm", "multiple viewpoints", "as developer"],
  },
  {
    name: "Evaluation Prompting",
    reason: "Prompt asks for scoring, rating, or assessment.",
    any: ["rate", "score", "evaluate", "assessment", "1-10", "rubric"],
  },
];

function countMatches(text: string, terms: string[]) {
  return terms.reduce((count, term) => (text.includes(term) ? count + 1 : count), 0);
}

export function detectPromptTechnique(promptText: string): PromptTechnique {
  const text = promptText.toLowerCase();
  const hits = TECHNIQUE_RULES
    .map((rule) => ({
      rule,
      score: countMatches(text, rule.any),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (hits.length > 0) {
    const best = hits[0];
    const confidence = Math.min(96, 62 + best.score * 11);
    return {
      name: best.rule.name,
      confidence,
      reason: best.rule.reason,
    };
  }

  return {
    name: "Zero-Shot Prompting",
    confidence: 60,
    reason: "Prompt is a direct instruction without examples or advanced orchestration hints.",
  };
}

import type { InsightPack } from "@/types/domain";

type InsightsCardsProps = {
  insights: InsightPack;
};

export function InsightsCards({ insights }: InsightsCardsProps) {
  const items = [
    { title: "Common Mistakes", value: insights.commonMistakes },
    { title: "Most Missing Components", value: insights.mostMissingComponents },
    { title: "Learning Suggestions", value: insights.learningSuggestions },
    { title: "Team Prompt Engineering Maturity", value: insights.maturity },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4" key={item.title}>
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <div className="mt-2">
            <p className="text-sm text-slate-700">{item.value}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

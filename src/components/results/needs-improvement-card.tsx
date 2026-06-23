import type { SubmissionWithAnalysis } from "@/types/domain";

type NeedsImprovementCardProps = {
  row: SubmissionWithAnalysis | null;
};

export function NeedsImprovementCard({ row }: NeedsImprovementCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <h3 className="mb-3 text-xl font-semibold text-slate-900">Needs Improvement</h3>
        {!row ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">Employee:</span> {row.employeeName}
            </p>
            <p>
              <span className="font-semibold">Scenario:</span> {row.scenarioTitle}
            </p>
            <p>
              <span className="font-semibold">Score:</span> {row.score}
            </p>
            <p>
              <span className="font-semibold">Prompt:</span> {row.promptText}
            </p>
            <p>
              <span className="font-semibold">AI Suggested Improved Prompt:</span> {row.improvedPrompt}
            </p>
          </div>
        )}
    </section>
  );
}

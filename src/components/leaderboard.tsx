import type { SubmissionWithAnalysis } from "@/types/domain";

type LeaderboardProps = {
  rows: SubmissionWithAnalysis[];
};

export function Leaderboard({ rows }: LeaderboardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Leaderboard (Top 10)</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4">Rank</th>
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Scenario</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr className="border-b border-border/70" key={row.submissionId}>
                    <td className="py-3 pr-4 font-medium">#{idx + 1}</td>
                    <td className="py-3 pr-4">{row.employeeName}</td>
                    <td className="py-3 pr-4">{row.scenarioTitle}</td>
                    <td className="py-3 pr-4">{row.category}</td>
                    <td className="py-3 font-semibold">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </section>
  );
}

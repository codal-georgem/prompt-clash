"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ScenarioAverageDatum = {
  scenario: string;
  averageScore: number;
};

type ScenarioBarChartProps = {
  data: ScenarioAverageDatum[];
};

export function ScenarioBarChart({ data }: ScenarioBarChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 10, right: 10, top: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="scenario" angle={-25} textAnchor="end" interval={0} height={72} tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="averageScore" fill="#334155" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

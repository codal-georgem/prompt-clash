"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type CategoryDatum = {
  name: string;
  value: number;
};

type CategoryPieChartProps = {
  data: CategoryDatum[];
};

const COLORS = ["#0F766E", "#0EA5E9", "#F59E0B"];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" dataKey="value" innerRadius={55} outerRadius={90} label>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

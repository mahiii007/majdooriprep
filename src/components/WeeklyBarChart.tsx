"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export function WeeklyBarChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#212633" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "ui-monospace, Menlo, monospace" }}
        />
        <Tooltip
          cursor={{ fill: "#f2a03d0d" }}
          contentStyle={{
            background: "#11141b",
            border: "1px solid #212633",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "ui-monospace, Menlo, monospace",
          }}
          labelStyle={{ color: "#9ca3af" }}
          itemStyle={{ color: "#f2a03d" }}
        />
        <Bar dataKey="count" fill="#f2a03d" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

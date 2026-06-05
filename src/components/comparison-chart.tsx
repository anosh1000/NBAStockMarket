"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlayerStatsSnapshot } from "@/lib/mock-data";

type ComparisonChartProps = {
  seasonStats: PlayerStatsSnapshot;
  last10Stats: PlayerStatsSnapshot;
};

export function ComparisonChart({ seasonStats, last10Stats }: ComparisonChartProps) {
  const [mounted, setMounted] = useState(false);
  const data = [
    { metric: "PPG", season: seasonStats.ppg, last10: last10Stats.ppg },
    { metric: "APG", season: seasonStats.apg, last10: last10Stats.apg },
    { metric: "RPG", season: seasonStats.rpg, last10: last10Stats.rpg },
    {
      metric: "TS%",
      season: Number((seasonStats.tsPct * 100).toFixed(1)),
      last10: Number((last10Stats.tsPct * 100).toFixed(1)),
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-[320px]">
      {!mounted ? (
        <div className="flex h-full items-center justify-center rounded-xl border border-border/70 bg-secondary/20 text-sm text-muted-foreground">
          Loading chart...
        </div>
      ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="metric"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Bar dataKey="season" name="Season Avg" fill="hsl(var(--muted-foreground))" radius={6} />
          <Bar dataKey="last10" name="Last 10" fill="hsl(var(--primary))" radius={6} />
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}

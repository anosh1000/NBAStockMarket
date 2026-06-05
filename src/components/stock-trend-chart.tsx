"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { StockHistoryPoint } from "@/lib/mock-data";

type ChartRange = "30D" | "90D" | "Season";

type StockTrendChartProps = {
  history: StockHistoryPoint[];
};

const ranges: ChartRange[] = ["30D", "90D", "Season"];

export function StockTrendChart({ history }: StockTrendChartProps) {
  const [range, setRange] = useState<ChartRange>("30D");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (range === "30D") {
      return history.slice(-30);
    }

    if (range === "90D") {
      return history.slice(-90);
    }

    return history;
  }, [history, range]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ranges.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={range === item ? "default" : "outline"}
            onClick={() => setRange(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="h-[320px]">
        {!mounted ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-border/70 bg-secondary/20 text-sm text-muted-foreground">
            Loading chart...
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              domain={[-100, 100]}
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
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

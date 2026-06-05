import { clamp } from "@/lib/utils";

export type StockMetricSnapshot = {
  ppg: number;
  apg: number;
  tsPct: number;
};

export type StockScoreInput = {
  last10: StockMetricSnapshot;
  season: StockMetricSnapshot;
  teamLast10WinPct: number;
};

export type StockScoreBreakdown = {
  score: number;
  scoringTrend: number;
  efficiencyTrend: number;
  playmakingTrend: number;
  teamSuccess: number;
};

function percentTrend(recent: number, baseline: number) {
  if (baseline <= 0) {
    return 0;
  }

  return ((recent - baseline) / baseline) * 100;
}

function roundMetric(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateStockScore(input: StockScoreInput): StockScoreBreakdown {
  const scoringTrend = clamp(
    percentTrend(input.last10.ppg, input.season.ppg) * 4,
    -100,
    100,
  );
  const efficiencyTrend = clamp(
    (input.last10.tsPct - input.season.tsPct) * 100 * 12,
    -100,
    100,
  );
  const playmakingTrend = clamp(
    percentTrend(input.last10.apg, input.season.apg) * 4,
    -100,
    100,
  );
  const teamSuccess = clamp((input.teamLast10WinPct - 0.5) * 200, -100, 100);

  const score =
    scoringTrend * 0.4 +
    efficiencyTrend * 0.25 +
    playmakingTrend * 0.2 +
    teamSuccess * 0.15;

  return {
    score: roundMetric(clamp(score, -100, 100)),
    scoringTrend: roundMetric(scoringTrend),
    efficiencyTrend: roundMetric(efficiencyTrend),
    playmakingTrend: roundMetric(playmakingTrend),
    teamSuccess: roundMetric(teamSuccess),
  };
}

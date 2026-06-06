import { clamp } from "@/lib/utils";

export type StockMetricSnapshot = {
  ppg: number;
  apg: number;
  tsPct: number;
  rpg?: number;
  mpg?: number;
};

export type StockScoreInput = {
  last10: StockMetricSnapshot;
  season: StockMetricSnapshot;
  teamLast10WinPct: number;
  gamesPlayed?: number;
  recentGamesPlayed?: number;
  seasonsExperience?: number;
};

export type StockScoreBreakdown = {
  score: number;
  scoringTrend: number;
  efficiencyTrend: number;
  playmakingTrend: number;
  roleTrend: number;
  teamSuccess: number;
  qualityScore: number;
  trendScore: number;
  productionScore: number;
  roleScore: number;
  efficiencyScore: number;
  availabilityScore: number;
  consistencyScore: number;
  seasonsExperience: number;
  mainBoardEligible: boolean;
  breakoutEligible: boolean;
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

function qualityAdjustedScore(value: number) {
  return value * 2 - 100;
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
  const seasonRpg = input.season.rpg ?? 0;
  const seasonMpg = input.season.mpg ?? 28;
  const last10Mpg = input.last10.mpg ?? seasonMpg;
  const roleTrend = clamp(percentTrend(last10Mpg, seasonMpg) * 2.5, -100, 100);
  const teamSuccess = clamp((input.teamLast10WinPct - 0.5) * 200, -100, 100);
  const productionScore = clamp(
    input.season.ppg * 2 + seasonRpg * 1.35 + input.season.apg * 2.15,
    0,
    100,
  );
  const roleScore = clamp((seasonMpg / 32) * 100, 0, 100);
  const efficiencyScore = clamp(50 + (input.season.tsPct - 0.56) * 250, 0, 100);
  const gamesPlayed = input.gamesPlayed ?? 65;
  const recentGamesPlayed = input.recentGamesPlayed ?? 10;
  const seasonsExperience = input.seasonsExperience ?? 3;
  const availabilityScore = clamp((gamesPlayed / 65) * 100, 0, 100);
  const consistencyScore =
    seasonMpg > 0
      ? clamp(100 - Math.abs(last10Mpg - seasonMpg) * 4, 0, 100)
      : 0;
  const qualityScore =
    productionScore * 0.4 +
    roleScore * 0.25 +
    efficiencyScore * 0.2 +
    availabilityScore * 0.1 +
    consistencyScore * 0.05;
  const trendScore =
    scoringTrend * 0.35 +
    efficiencyTrend * 0.25 +
    playmakingTrend * 0.2 +
    roleTrend * 0.2;
  const mainBoardEligible =
    gamesPlayed >= 25 &&
    seasonsExperience >= 2 &&
    seasonMpg >= 20 &&
    qualityScore >= 45 &&
    productionScore >= 30;
  const breakoutEligible =
    !mainBoardEligible &&
    (seasonsExperience < 2 || qualityScore < 45) &&
    recentGamesPlayed >= 5 &&
    last10Mpg >= 10 &&
    trendScore >= 20;

  const score =
    qualityAdjustedScore(qualityScore) * 0.65 + trendScore * 0.25 + teamSuccess * 0.1;

  return {
    score: roundMetric(clamp(score, -100, 100)),
    scoringTrend: roundMetric(scoringTrend),
    efficiencyTrend: roundMetric(efficiencyTrend),
    playmakingTrend: roundMetric(playmakingTrend),
    roleTrend: roundMetric(roleTrend),
    teamSuccess: roundMetric(teamSuccess),
    qualityScore: roundMetric(qualityScore),
    trendScore: roundMetric(trendScore),
    productionScore: roundMetric(productionScore),
    roleScore: roundMetric(roleScore),
    efficiencyScore: roundMetric(efficiencyScore),
    availabilityScore: roundMetric(availabilityScore),
    consistencyScore: roundMetric(consistencyScore),
    seasonsExperience,
    mainBoardEligible,
    breakoutEligible,
  };
}

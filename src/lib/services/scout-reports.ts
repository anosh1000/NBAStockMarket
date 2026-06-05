import OpenAI from "openai";
import type { PlayerMarket } from "@/lib/mock-data";

export type GeneratedScoutReport = {
  report: string;
  generatedAt: Date;
  stockScoreAtGeneration: number;
};

export function shouldRegenerateReport(params: {
  lastGeneratedAt?: Date;
  previousScore?: number;
  currentScore: number;
}) {
  if (!params.lastGeneratedAt) {
    return true;
  }

  const hoursSinceGeneration =
    (Date.now() - params.lastGeneratedAt.getTime()) / (1000 * 60 * 60);
  const scoreMovedSignificantly =
    params.previousScore === undefined ||
    Math.abs(params.currentScore - params.previousScore) >= 8;

  return hoursSinceGeneration >= 24 || scoreMovedSignificantly;
}

export function buildScoutReportPrompt(player: PlayerMarket) {
  return `
Write a concise NBA scouting report for a financial-style player stock dashboard.

Player: ${player.name}
Team: ${player.team}
Position: ${player.position}
Current stock score: ${player.stock.score}
Last 10 games: ${player.last10Stats.ppg} PPG, ${player.last10Stats.rpg} RPG, ${player.last10Stats.apg} APG, ${player.last10Stats.tsPct} TS%
Season average: ${player.seasonStats.ppg} PPG, ${player.seasonStats.rpg} RPG, ${player.seasonStats.apg} APG, ${player.seasonStats.tsPct} TS%

Return sections:
1. Summary
2. Why Stock Is Rising/Falling
3. Strengths
4. Concerns
5. Outlook
`.trim();
}

export async function generateScoutReport(player: PlayerMarket): Promise<GeneratedScoutReport> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      report: [
        player.report.summary,
        player.report.movement,
        `Strengths: ${player.report.strengths.join("; ")}`,
        `Concerns: ${player.report.concerns.join("; ")}`,
        `Outlook: ${player.report.outlook}`,
      ].join("\n\n"),
      generatedAt: new Date(),
      stockScoreAtGeneration: player.stock.score,
    };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: buildScoutReportPrompt(player),
  });

  return {
    report: response.output_text,
    generatedAt: new Date(),
    stockScoreAtGeneration: player.stock.score,
  };
}

import OpenAI from "openai";
import type { PlayerMarket, ScoutReportSections } from "@/lib/mock-data";

export type GeneratedScoutReport = {
  report: string;
  generatedAt: Date;
  stockScoreAtGeneration: number;
};

let openAiDisabledForProcess = false;

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

Return ONLY valid JSON. Do not include markdown, numbering, labels inside values, or text outside JSON.
Use this exact shape:
{
  "summary": "1-2 sentences.",
  "movement": "2-3 sentences explaining why the stock is rising or falling.",
  "strengths": ["short strength 1", "short strength 2", "short strength 3"],
  "concerns": ["short concern 1", "short concern 2"],
  "outlook": "1-2 sentences."
}
`.trim();
}

function serializeReport(report: ScoutReportSections) {
  return JSON.stringify(report);
}

function buildFallbackReport(player: PlayerMarket): GeneratedScoutReport {
  return {
    report: serializeReport(player.report),
    generatedAt: new Date(),
    stockScoreAtGeneration: player.stock.score,
  };
}

function parseJsonReport(value: string): ScoutReportSections | null {
  try {
    const parsed = JSON.parse(value) as Partial<ScoutReportSections>;

    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.movement !== "string" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.concerns) ||
      typeof parsed.outlook !== "string"
    ) {
      return null;
    }

    return {
      summary: parsed.summary,
      movement: parsed.movement,
      strengths: parsed.strengths.filter((item): item is string => typeof item === "string"),
      concerns: parsed.concerns.filter((item): item is string => typeof item === "string"),
      outlook: parsed.outlook,
    };
  } catch {
    return null;
  }
}

export async function generateScoutReport(player: PlayerMarket): Promise<GeneratedScoutReport> {
  if (!process.env.OPENAI_API_KEY || openAiDisabledForProcess) {
    return buildFallbackReport(player);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: buildScoutReportPrompt(player),
    });
    const parsedReport = parseJsonReport(response.output_text);

    return {
      report: serializeReport(parsedReport ?? player.report),
      generatedAt: new Date(),
      stockScoreAtGeneration: player.stock.score,
    };
  } catch (error) {
    openAiDisabledForProcess = true;
    console.warn(`OpenAI report generation failed for ${player.name}. Using fallback report.`, error);
    return buildFallbackReport(player);
  }
}

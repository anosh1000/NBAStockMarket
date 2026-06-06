import type { PlayerMarket, ScoutReportSections } from "@/lib/mock-data";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import { OfficialNbaStatsProvider, type IngestedPlayerMarket } from "@/lib/services/nba-data";
import { generateScoutReport, shouldRegenerateReport } from "@/lib/services/scout-reports";

export type DailyRefreshResult = {
  refreshedAt: string;
  provider: string;
  playersConsidered: number;
  playersUpdated: number;
  gameLogsWritten: number;
  reportsGenerated: number;
  message: string;
};

function startOfUtcDay(date = new Date()) {
  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

function buildReportSections(player: IngestedPlayerMarket): ScoutReportSections {
  const direction = player.stock.score >= 0 ? "rising" : "falling";
  const scoringDelta = player.last10Stats.ppg - player.seasonStats.ppg;
  const efficiencyDelta = player.last10Stats.tsPct - player.seasonStats.tsPct;

  return {
    summary: `${player.name}'s stock is ${direction} with a current score of ${player.stock.score.toFixed(
      1,
    )}.`,
    movement: `The real NBA game-log feed shows a ${scoringDelta >= 0 ? "positive" : "negative"} scoring gap of ${scoringDelta.toFixed(
      1,
    )} PPG and a ${efficiencyDelta >= 0 ? "positive" : "negative"} true-shooting gap of ${(
      efficiencyDelta * 100
    ).toFixed(1)} percentage points over the last 10 games.`,
    strengths: [
      `Last 10 scoring: ${player.last10Stats.ppg.toFixed(1)} PPG`,
      `Last 10 playmaking: ${player.last10Stats.apg.toFixed(1)} APG`,
      `Quality score: ${player.stock.qualityScore.toFixed(1)}`,
      `Recent team win rate: ${(player.teamLast10WinPct * 100).toFixed(0)}%`,
    ],
    concerns: [
      player.stock.score >= 0
        ? "The model will watch whether the recent surge holds over the next daily refresh."
        : "Recent production is trailing the season baseline in one or more weighted categories.",
    ],
    outlook:
      "This report is generated from the latest stored NBA stats and can be replaced by OpenAI generation when ENABLE_AI_REPORTS is enabled.",
  };
}

function reportSectionsToText(report: ScoutReportSections) {
  return [
    report.summary,
    report.movement,
    `Strengths: ${report.strengths.join("; ")}`,
    `Concerns: ${report.concerns.join("; ")}`,
    `Outlook: ${report.outlook}`,
  ].join("\n\n");
}

function toMarketPlayer(player: IngestedPlayerMarket): PlayerMarket {
  const report = buildReportSections(player);

  return {
    id: player.slug,
    externalId: player.externalId,
    name: player.name,
    team: player.team,
    teamAbbreviation: player.teamAbbreviation,
    position: player.position,
    imageUrl: player.imageUrl,
    views: 0,
    seasonStats: player.seasonStats,
    last10Stats: player.last10Stats,
    teamLast10WinPct: player.teamLast10WinPct,
    stock: player.stock,
    stockHistory: [{ date: new Date().toISOString().slice(0, 10), score: player.stock.score }],
    last10Games: player.last10Games.map((game) => ({
      gameDate: game.gameDate,
      opponent: game.opponent,
      won: game.teamWon,
      points: game.points,
      rebounds: game.rebounds,
      assists: game.assists,
      tsPct: game.tsPct,
    })),
    report,
  };
}

export async function runDailyMarketRefresh(): Promise<DailyRefreshResult> {
  if (!isDatabaseConfigured()) {
    return {
      refreshedAt: new Date().toISOString(),
      provider: "OfficialNbaStatsProvider",
      playersConsidered: 0,
      playersUpdated: 0,
      gameLogsWritten: 0,
      reportsGenerated: 0,
      message: "DATABASE_URL is not configured, so the refresh did not write real NBA data.",
    };
  }

  const prisma = getPrismaClient();
  const provider = new OfficialNbaStatsProvider();
  const marketPlayers = await provider.getMarketPlayers();
  const refreshDate = startOfUtcDay();
  const sourceSeason = process.env.NBA_SEASON ?? "2025-26";
  const sourceSeasonType = provider.getSourceSeasonTypeLabel();
  const enableAiReports = process.env.ENABLE_AI_REPORTS === "true";
  const maxAiReports = Number(process.env.MAX_AI_REPORTS_PER_REFRESH ?? 10);
  let gameLogsWritten = 0;
  let reportsGenerated = 0;

  for (const player of marketPlayers) {
    const dbPlayer = await prisma.player.upsert({
      where: { externalId: player.externalId },
      update: {
        slug: player.slug,
        name: player.name,
        team: player.team,
        teamAbbreviation: player.teamAbbreviation,
        position: player.position,
        imageUrl: player.imageUrl,
      },
      create: {
        externalId: player.externalId,
        slug: player.slug,
        name: player.name,
        team: player.team,
        teamAbbreviation: player.teamAbbreviation,
        position: player.position,
        imageUrl: player.imageUrl,
      },
    });

    const createdStats = await prisma.playerStats.createMany({
      data: player.allGames.map((game) => ({
        playerId: dbPlayer.id,
        gameId: game.gameId,
        gameDate: new Date(`${game.gameDate}T00:00:00.000Z`),
        opponent: game.opponent,
        teamWon: game.teamWon,
        points: game.points,
        rebounds: game.rebounds,
        assists: game.assists,
        minutes: game.minutes,
        tsPct: game.tsPct,
      })),
      skipDuplicates: true,
    });

    gameLogsWritten += createdStats.count;

    await prisma.marketSnapshot.upsert({
      where: {
        playerId_date: {
          playerId: dbPlayer.id,
          date: refreshDate,
        },
      },
      update: {
        seasonPpg: player.seasonStats.ppg,
        seasonRpg: player.seasonStats.rpg,
        seasonApg: player.seasonStats.apg,
        seasonTsPct: player.seasonStats.tsPct,
        seasonMpg: player.seasonStats.mpg ?? 0,
        last10Ppg: player.last10Stats.ppg,
        last10Rpg: player.last10Stats.rpg,
        last10Apg: player.last10Stats.apg,
        last10TsPct: player.last10Stats.tsPct,
        last10Mpg: player.last10Stats.mpg ?? 0,
        teamLast10WinPct: player.teamLast10WinPct,
        gamesPlayed: player.gamesPlayed,
        recentGamesPlayed: player.last10Games.length,
        seasonsExperience: player.seasonsExperience,
        qualityScore: player.stock.qualityScore,
        trendScore: player.stock.trendScore,
        productionScore: player.stock.productionScore,
        roleScore: player.stock.roleScore,
        availabilityScore: player.stock.availabilityScore,
        consistencyScore: player.stock.consistencyScore,
        mainBoardEligible: player.stock.mainBoardEligible,
        breakoutEligible: player.stock.breakoutEligible,
        sourceSeason,
        sourceSeasonType,
      },
      create: {
        playerId: dbPlayer.id,
        date: refreshDate,
        seasonPpg: player.seasonStats.ppg,
        seasonRpg: player.seasonStats.rpg,
        seasonApg: player.seasonStats.apg,
        seasonTsPct: player.seasonStats.tsPct,
        seasonMpg: player.seasonStats.mpg ?? 0,
        last10Ppg: player.last10Stats.ppg,
        last10Rpg: player.last10Stats.rpg,
        last10Apg: player.last10Stats.apg,
        last10TsPct: player.last10Stats.tsPct,
        last10Mpg: player.last10Stats.mpg ?? 0,
        teamLast10WinPct: player.teamLast10WinPct,
        gamesPlayed: player.gamesPlayed,
        recentGamesPlayed: player.last10Games.length,
        seasonsExperience: player.seasonsExperience,
        qualityScore: player.stock.qualityScore,
        trendScore: player.stock.trendScore,
        productionScore: player.stock.productionScore,
        roleScore: player.stock.roleScore,
        availabilityScore: player.stock.availabilityScore,
        consistencyScore: player.stock.consistencyScore,
        mainBoardEligible: player.stock.mainBoardEligible,
        breakoutEligible: player.stock.breakoutEligible,
        sourceSeason,
        sourceSeasonType,
      },
    });

    await prisma.stockScore.upsert({
      where: {
        playerId_date: {
          playerId: dbPlayer.id,
          date: refreshDate,
        },
      },
      update: {
        score: player.stock.score,
        scoringTrend: player.stock.scoringTrend,
        efficiencyTrend: player.stock.efficiencyTrend,
        playmakingTrend: player.stock.playmakingTrend,
        teamSuccess: player.stock.teamSuccess,
      },
      create: {
        playerId: dbPlayer.id,
        date: refreshDate,
        score: player.stock.score,
        scoringTrend: player.stock.scoringTrend,
        efficiencyTrend: player.stock.efficiencyTrend,
        playmakingTrend: player.stock.playmakingTrend,
        teamSuccess: player.stock.teamSuccess,
      },
    });

    const latestReport = await prisma.scoutReport.findFirst({
      where: { playerId: dbPlayer.id },
      orderBy: { generatedAt: "desc" },
    });

    if (
      shouldRegenerateReport({
        lastGeneratedAt: latestReport?.generatedAt,
        previousScore: latestReport?.stockScoreAtGeneration,
        currentScore: player.stock.score,
      })
    ) {
      const marketPlayer = toMarketPlayer(player);
      const generated =
        enableAiReports && reportsGenerated < maxAiReports
          ? await generateScoutReport(marketPlayer)
          : {
              report: reportSectionsToText(marketPlayer.report),
              generatedAt: new Date(),
              stockScoreAtGeneration: player.stock.score,
            };

      await prisma.scoutReport.create({
        data: {
          playerId: dbPlayer.id,
          report: generated.report,
          generatedAt: generated.generatedAt,
          stockScoreAtGeneration: generated.stockScoreAtGeneration,
        },
      });

      reportsGenerated += 1;
    }
  }

  return {
    refreshedAt: new Date().toISOString(),
    provider: "OfficialNbaStatsProvider",
    playersConsidered: marketPlayers.length,
    playersUpdated: marketPlayers.length,
    gameLogsWritten,
    reportsGenerated,
    message: "Real NBA stats refresh completed and database-backed market data is ready.",
  };
}

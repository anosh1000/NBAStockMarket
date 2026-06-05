import { players as seededPlayers, type PlayerMarket, type ScoutReportSections } from "@/lib/mock-data";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";

type MarketSource = "database" | "seeded-fallback";

export type MarketDataset = {
  players: PlayerMarket[];
  source: MarketSource;
};

async function fetchDbMarketPlayers() {
  const prisma = getPrismaClient();

  return prisma.player.findMany({
    include: {
      marketSnapshots: {
        orderBy: { date: "desc" },
        take: 1,
      },
      stockScores: {
        orderBy: { date: "desc" },
        take: 90,
      },
      stats: {
        orderBy: { gameDate: "desc" },
        take: 10,
      },
      scoutReports: {
        orderBy: { generatedAt: "desc" },
        take: 1,
      },
    },
  });
}

type DbMarketPlayer = Awaited<ReturnType<typeof fetchDbMarketPlayers>>[number];

function parseList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .replace(/^Strengths:\s*/i, "")
    .replace(/^Concerns:\s*/i, "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseScoutReport(
  reportText: string | undefined,
  playerName: string,
  stockScore: number,
): ScoutReportSections {
  if (!reportText) {
    const direction = stockScore >= 0 ? "rising" : "falling";

    return {
      summary: `${playerName}'s current stock score is ${stockScore.toFixed(
        1,
      )}, putting the player in ${direction} territory based on recent production.`,
      movement:
        "The score is derived from real season and last-10-game inputs for scoring, efficiency, playmaking, and team success.",
      strengths: ["Recent production is now stored from the NBA stats ingestion pipeline"],
      concerns: ["AI report generation has not run for this player yet"],
      outlook:
        "The next daily refresh can generate a more detailed OpenAI scouting report if report generation is enabled.",
    };
  }

  const paragraphs = reportText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return {
    summary: paragraphs[0] ?? reportText,
    movement: paragraphs[1] ?? paragraphs[0] ?? reportText,
    strengths: parseList(paragraphs.find((paragraph) => /^Strengths:/i.test(paragraph))),
    concerns: parseList(paragraphs.find((paragraph) => /^Concerns:/i.test(paragraph))),
    outlook:
      paragraphs
        .find((paragraph) => /^Outlook:/i.test(paragraph))
        ?.replace(/^Outlook:\s*/i, "") ??
      paragraphs.at(-1) ??
      "Monitor the next daily refresh for updated trend confirmation.",
  };
}

function toPlayerMarket(player: DbMarketPlayer): PlayerMarket | null {
  const snapshot = player.marketSnapshots[0];
  const latestScore = player.stockScores[0];

  if (!snapshot || !latestScore) {
    return null;
  }

  return {
    id: player.slug,
    externalId: player.externalId,
    name: player.name,
    team: player.team,
    teamAbbreviation: player.teamAbbreviation,
    position: player.position,
    imageUrl: player.imageUrl,
    views: player.views,
    seasonStats: {
      ppg: snapshot.seasonPpg,
      rpg: snapshot.seasonRpg,
      apg: snapshot.seasonApg,
      tsPct: snapshot.seasonTsPct,
    },
    last10Stats: {
      ppg: snapshot.last10Ppg,
      rpg: snapshot.last10Rpg,
      apg: snapshot.last10Apg,
      tsPct: snapshot.last10TsPct,
    },
    teamLast10WinPct: snapshot.teamLast10WinPct,
    stock: {
      score: latestScore.score,
      scoringTrend: latestScore.scoringTrend,
      efficiencyTrend: latestScore.efficiencyTrend,
      playmakingTrend: latestScore.playmakingTrend,
      teamSuccess: latestScore.teamSuccess,
    },
    stockHistory: [...player.stockScores]
      .reverse()
      .map((score) => ({
        date: score.date.toISOString().slice(0, 10),
        score: score.score,
      })),
    last10Games: player.stats.map((game) => ({
      gameDate: game.gameDate.toISOString().slice(0, 10),
      opponent: game.opponent,
      won: game.teamWon,
      points: game.points,
      rebounds: game.rebounds,
      assists: game.assists,
      tsPct: game.tsPct,
    })),
    report: parseScoutReport(player.scoutReports[0]?.report, player.name, latestScore.score),
  };
}

export async function getMarketDataset(): Promise<MarketDataset> {
  if (!isDatabaseConfigured()) {
    return {
      players: seededPlayers,
      source: "seeded-fallback",
    };
  }

  try {
    const dbPlayers = await fetchDbMarketPlayers();
    const marketPlayers = dbPlayers
      .map(toPlayerMarket)
      .filter((player): player is PlayerMarket => Boolean(player));

    if (!marketPlayers.length) {
      return {
        players: seededPlayers,
        source: "seeded-fallback",
      };
    }

    return {
      players: marketPlayers,
      source: "database",
    };
  } catch (error) {
    console.warn("Falling back to seeded market data:", error);

    return {
      players: seededPlayers,
      source: "seeded-fallback",
    };
  }
}

export async function getMarketPlayer(playerId: string) {
  const dataset = await getMarketDataset();
  return dataset.players.find(
    (player) => player.id === playerId || player.externalId === playerId,
  );
}

export function buildMarketCollections(players: PlayerMarket[]) {
  const topRisers = [...players]
    .sort((a, b) => b.stock.score - a.stock.score)
    .slice(0, 10);
  const topFallers = [...players]
    .sort((a, b) => a.stock.score - b.stock.score)
    .slice(0, 10);
  const trendingPlayers = [...players]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);
  const averageScore = players.length
    ? Math.round((players.reduce((sum, player) => sum + player.stock.score, 0) / players.length) * 10) /
      10
    : 0;

  return {
    topRisers,
    topFallers,
    trendingPlayers,
    marketSummary: {
      playerCount: players.length,
      averageScore,
      strongestRiser: topRisers[0],
      steepestFaller: topFallers[0],
    },
  };
}

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

type SectionKey = "summary" | "movement" | "strengths" | "concerns" | "outlook";

function cleanReportText(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value
    .replace(/\*\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function stripSectionLabel(value: string, label: string) {
  return cleanReportText(value)
    .replace(new RegExp(`^\\s*(?:\\d+\\.\\s*)?${label}\\s*:?\\s*`, "i"), "")
    .trim();
}

function parseList(value: string | undefined, label: string) {
  const cleaned = stripSectionLabel(value ?? "", label);

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/\n|;|•/)
    .map((item) => item.trim())
    .map((item) => item.replace(/^[-*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

function parseJsonReport(reportText: string): ScoutReportSections | null {
  try {
    const parsed = JSON.parse(reportText) as Partial<ScoutReportSections>;

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
      summary: stripSectionLabel(parsed.summary, "Summary"),
      movement: stripSectionLabel(parsed.movement, "Why Stock Is Rising/Falling"),
      strengths: parsed.strengths
        .filter((item): item is string => typeof item === "string")
        .map((item) => cleanReportText(item))
        .filter(Boolean),
      concerns: parsed.concerns
        .filter((item): item is string => typeof item === "string")
        .map((item) => cleanReportText(item))
        .filter(Boolean),
      outlook: stripSectionLabel(parsed.outlook, "Outlook"),
    };
  } catch {
    return null;
  }
}

function normalizeHeading(value: string): SectionKey | null {
  const normalized = cleanReportText(value)
    .replace(/^\d+[.)]\s*/, "")
    .replace(/:$/, "")
    .toLowerCase();

  if (normalized === "summary") {
    return "summary";
  }

  if (
    normalized === "why stock is rising/falling" ||
    normalized === "why stock is rising" ||
    normalized === "why stock is falling" ||
    normalized === "movement"
  ) {
    return "movement";
  }

  if (normalized === "strengths") {
    return "strengths";
  }

  if (normalized === "concerns") {
    return "concerns";
  }

  if (normalized === "outlook") {
    return "outlook";
  }

  return null;
}

function parseMarkdownReport(reportText: string) {
  const sections: Partial<Record<SectionKey, string[]>> = {};
  let currentSection: SectionKey | null = null;

  cleanReportText(reportText)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const headingOnly = normalizeHeading(line);
      const inlineHeading = line.match(
        /^(?:\d+[.)]\s*)?(Summary|Why Stock Is Rising\/Falling|Strengths|Concerns|Outlook)\s*:\s*(.+)$/i,
      );

      if (headingOnly) {
        currentSection = headingOnly;
        sections[currentSection] = sections[currentSection] ?? [];
        return;
      }

      if (inlineHeading) {
        currentSection = normalizeHeading(inlineHeading[1]);
        if (currentSection) {
          sections[currentSection] = sections[currentSection] ?? [];
          sections[currentSection]?.push(inlineHeading[2]);
        }
        return;
      }

      if (!currentSection && line.startsWith("{")) {
        return;
      }

      if (currentSection) {
        sections[currentSection] = sections[currentSection] ?? [];
        sections[currentSection]?.push(line);
      }
    });

  return sections;
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

  const jsonReport = parseJsonReport(reportText);

  if (jsonReport) {
    return jsonReport;
  }

  const sections = parseMarkdownReport(reportText);
  const paragraphs = reportText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return {
    summary:
      stripSectionLabel(sections.summary?.join(" ") ?? paragraphs[0] ?? reportText, "Summary") ||
      reportText,
    movement:
      stripSectionLabel(
        sections.movement?.join(" ") ?? paragraphs[1] ?? paragraphs[0] ?? reportText,
        "Why Stock Is Rising/Falling",
      ) || reportText,
    strengths: parseList(sections.strengths?.join("\n"), "Strengths"),
    concerns: parseList(sections.concerns?.join("\n"), "Concerns"),
    outlook:
      stripSectionLabel(sections.outlook?.join(" ") ?? paragraphs.at(-1) ?? reportText, "Outlook") ||
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
      mpg: snapshot.seasonMpg,
    },
    last10Stats: {
      ppg: snapshot.last10Ppg,
      rpg: snapshot.last10Rpg,
      apg: snapshot.last10Apg,
      tsPct: snapshot.last10TsPct,
      mpg: snapshot.last10Mpg,
    },
    teamLast10WinPct: snapshot.teamLast10WinPct,
    stock: {
      score: latestScore.score,
      scoringTrend: latestScore.scoringTrend,
      efficiencyTrend: latestScore.efficiencyTrend,
      playmakingTrend: latestScore.playmakingTrend,
      roleTrend: snapshot.last10Mpg && snapshot.seasonMpg
        ? Math.round(((snapshot.last10Mpg - snapshot.seasonMpg) / snapshot.seasonMpg) * 250 * 10) / 10
        : 0,
      teamSuccess: latestScore.teamSuccess,
      qualityScore: snapshot.qualityScore,
      trendScore: snapshot.trendScore,
      productionScore: snapshot.productionScore,
      roleScore: snapshot.roleScore,
      efficiencyScore: Math.round((50 + (snapshot.seasonTsPct - 0.56) * 250) * 10) / 10,
      availabilityScore: snapshot.availabilityScore,
      consistencyScore: snapshot.consistencyScore,
      seasonsExperience: snapshot.seasonsExperience,
      mainBoardEligible: snapshot.mainBoardEligible,
      breakoutEligible: snapshot.breakoutEligible,
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
  const eligiblePlayers = players.filter((player) => player.stock.mainBoardEligible);
  const mainBoardPlayers = eligiblePlayers.length ? eligiblePlayers : players;
  const breakoutWatch = players
    .filter((player) => player.stock.breakoutEligible)
    .sort((a, b) => b.stock.trendScore - a.stock.trendScore)
    .slice(0, 6);
  const topRisers = [...mainBoardPlayers]
    .sort((a, b) => b.stock.score - a.stock.score)
    .slice(0, 10);
  const topFallers = [...mainBoardPlayers]
    .sort((a, b) => a.stock.score - b.stock.score)
    .slice(0, 10);
  const trendingPlayers = [...players]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);
  const averageScore = players.length
    ? Math.round((mainBoardPlayers.reduce((sum, player) => sum + player.stock.score, 0) / mainBoardPlayers.length) * 10) /
      10
    : 0;

  return {
    topRisers,
    topFallers,
    breakoutWatch,
    trendingPlayers,
    marketSummary: {
      playerCount: mainBoardPlayers.length,
      totalPlayerCount: players.length,
      averageScore,
      strongestRiser: topRisers[0],
      steepestFaller: topFallers[0],
    },
  };
}

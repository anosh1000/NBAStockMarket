import { PrismaClient } from "@prisma/client";
import { players } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  for (const player of players) {
    const dbPlayer = await prisma.player.upsert({
      where: { externalId: player.externalId },
      update: {
        slug: player.id,
        name: player.name,
        team: player.team,
        teamAbbreviation: player.teamAbbreviation,
        position: player.position,
        imageUrl: player.imageUrl,
        views: player.views,
      },
      create: {
        externalId: player.externalId,
        slug: player.id,
        name: player.name,
        team: player.team,
        teamAbbreviation: player.teamAbbreviation,
        position: player.position,
        imageUrl: player.imageUrl,
        views: player.views,
      },
    });

    await prisma.playerStats.deleteMany({ where: { playerId: dbPlayer.id } });
    await prisma.stockScore.deleteMany({ where: { playerId: dbPlayer.id } });
    await prisma.scoutReport.deleteMany({ where: { playerId: dbPlayer.id } });
    await prisma.marketSnapshot.deleteMany({ where: { playerId: dbPlayer.id } });

    await prisma.playerStats.createMany({
      data: player.last10Games.map((game, index) => ({
        playerId: dbPlayer.id,
        gameId: `seed-${player.externalId}-${index}`,
        gameDate: new Date(game.gameDate),
        opponent: game.opponent,
        teamWon: game.won,
        points: game.points,
        rebounds: game.rebounds,
        assists: game.assists,
        minutes: player.last10Stats.mpg ?? player.seasonStats.mpg ?? 28,
        tsPct: game.tsPct,
      })),
    });

    await prisma.marketSnapshot.create({
      data: {
        playerId: dbPlayer.id,
        date: new Date(),
        seasonPpg: player.seasonStats.ppg,
        seasonRpg: player.seasonStats.rpg,
        seasonApg: player.seasonStats.apg,
        seasonTsPct: player.seasonStats.tsPct,
        seasonMpg: player.seasonStats.mpg ?? 28,
        last10Ppg: player.last10Stats.ppg,
        last10Rpg: player.last10Stats.rpg,
        last10Apg: player.last10Stats.apg,
        last10TsPct: player.last10Stats.tsPct,
        last10Mpg: player.last10Stats.mpg ?? player.seasonStats.mpg ?? 28,
        teamLast10WinPct: player.teamLast10WinPct,
        gamesPlayed: player.last10Games.length,
        recentGamesPlayed: player.last10Games.length,
        seasonsExperience: player.stock.seasonsExperience,
        qualityScore: player.stock.qualityScore,
        trendScore: player.stock.trendScore,
        productionScore: player.stock.productionScore,
        roleScore: player.stock.roleScore,
        availabilityScore: player.stock.availabilityScore,
        consistencyScore: player.stock.consistencyScore,
        mainBoardEligible: player.stock.mainBoardEligible,
        breakoutEligible: player.stock.breakoutEligible,
        sourceSeason: "seeded",
        sourceSeasonType: "Regular Season",
      },
    });

    await prisma.stockScore.createMany({
      data: player.stockHistory.map((point) => ({
        playerId: dbPlayer.id,
        date: new Date(point.date),
        score: point.score,
        scoringTrend: player.stock.scoringTrend,
        efficiencyTrend: player.stock.efficiencyTrend,
        playmakingTrend: player.stock.playmakingTrend,
        teamSuccess: player.stock.teamSuccess,
      })),
    });

    await prisma.scoutReport.create({
      data: {
        playerId: dbPlayer.id,
        report: [
          player.report.summary,
          player.report.movement,
          `Strengths: ${player.report.strengths.join("; ")}`,
          `Concerns: ${player.report.concerns.join("; ")}`,
          `Outlook: ${player.report.outlook}`,
        ].join("\n\n"),
        stockScoreAtGeneration: player.stock.score,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

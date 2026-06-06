import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Trophy } from "lucide-react";
import { ComparisonChart } from "@/components/comparison-chart";
import { ScoutReportCard } from "@/components/scout-report-card";
import { StockScoreBadge } from "@/components/stock-score-badge";
import { StockTrendChart } from "@/components/stock-trend-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMarketPlayer } from "@/lib/market-repository";
import type { PlayerMarket } from "@/lib/mock-data";
import { formatPercent, formatSigned } from "@/lib/utils";

type PlayerPageProps = {
  params: Promise<{ playerId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { playerId } = await params;
  const player = await getMarketPlayer(playerId);

  if (!player) {
    return {
      title: "Player Not Found",
    };
  }

  return {
    title: player.name,
    description: `${player.name} stock score, recent stats, trend chart, and AI scouting report.`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const player = await getMarketPlayer(playerId);

  if (!player) {
    notFound();
  }

  return (
    <div className="container space-y-8 py-8 md:py-12">
      <Button asChild variant="ghost" className="pl-0">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden">
          <div className="relative min-h-[420px] bg-gradient-to-br from-secondary via-background to-card">
            <Image
              src={player.imageUrl}
              alt={player.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-contain object-bottom"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/82 to-transparent p-6">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
                {player.team}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{player.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                  {player.position}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                  {player.teamAbbreviation}
                </span>
                <StockScoreBadge score={player.stock.score} size="lg" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Stock Score</CardTitle>
              <CardDescription>
                Quality-heavy score: 65% current quality, 25% recent trend, 10% context.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ScoreComponent label="Player Quality" value={player.stock.qualityScore} signed={false} />
              <ScoreComponent label="Recent Trend" value={player.stock.trendScore} />
              <ScoreComponent label="Role Score" value={player.stock.roleScore} signed={false} />
              <ScoreComponent label="Team Success" value={player.stock.teamSuccess} />
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoTile
              icon={<Trophy className="h-5 w-5" />}
              label="Team Last 10"
              value={formatPercent(player.teamLast10WinPct)}
            />
            <InfoTile
              icon={<Eye className="h-5 w-5" />}
              label="Market Views"
              value={player.views.toLocaleString()}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Stock Trend Chart</CardTitle>
            <CardDescription>Last 30 days, last 90 days, or full stored season.</CardDescription>
          </CardHeader>
          <CardContent>
            <StockTrendChart history={player.stockHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Season vs Last 10</CardTitle>
            <CardDescription>Momentum view across core box-score indicators.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart seasonStats={player.seasonStats} last10Stats={player.last10Stats} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Comparison Table</CardTitle>
            <CardDescription>Season averages against the most recent 10 games.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonTable player={player} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 10 Games</CardTitle>
            <CardDescription>Most recent stored NBA game logs for this player.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 text-left">Date</th>
                    <th className="py-3 text-left">Opp</th>
                    <th className="py-3 text-left">Result</th>
                    <th className="py-3 text-right">PTS</th>
                    <th className="py-3 text-right">REB</th>
                    <th className="py-3 text-right">AST</th>
                    <th className="py-3 text-right">TS%</th>
                  </tr>
                </thead>
                <tbody>
                  {player.last10Games.map((game) => (
                    <tr key={`${game.gameDate}-${game.opponent}`} className="border-b border-border/60">
                      <td className="py-3 text-muted-foreground">{game.gameDate}</td>
                      <td className="py-3 font-mono">{game.opponent}</td>
                      <td className={game.won ? "py-3 text-gain" : "py-3 text-loss"}>
                        {game.won ? "W" : "L"}
                      </td>
                      <td className="py-3 text-right font-mono">{game.points}</td>
                      <td className="py-3 text-right font-mono">{game.rebounds}</td>
                      <td className="py-3 text-right font-mono">{game.assists}</td>
                      <td className="py-3 text-right font-mono">{formatPercent(game.tsPct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <ScoutReportCard report={player.report} />
    </div>
  );
}

function ScoreComponent({
  label,
  value,
  signed = true,
}: {
  label: string;
  value: number;
  signed?: boolean;
}) {
  const positive = value >= 0;

  return (
    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={positive ? "mt-2 font-mono text-2xl text-gain" : "mt-2 font-mono text-2xl text-loss"}>
        {signed ? formatSigned(value) : value.toFixed(1)}
      </p>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className="font-mono text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonTable({ player }: { player: PlayerMarket }) {
  const rows = [
    ["PPG", player.seasonStats.ppg, player.last10Stats.ppg],
    ["RPG", player.seasonStats.rpg, player.last10Stats.rpg],
    ["APG", player.seasonStats.apg, player.last10Stats.apg],
    ["TS%", player.seasonStats.tsPct * 100, player.last10Stats.tsPct * 100],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <tr>
            <th className="p-3 text-left">Metric</th>
            <th className="p-3 text-right">Season</th>
            <th className="p-3 text-right">Last 10</th>
            <th className="p-3 text-right">Delta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, season, last10]) => {
            const delta = Number(last10) - Number(season);
            return (
              <tr key={label} className="border-t border-border">
                <td className="p-3 font-semibold">{label}</td>
                <td className="p-3 text-right font-mono">{Number(season).toFixed(1)}</td>
                <td className="p-3 text-right font-mono">{Number(last10).toFixed(1)}</td>
                <td className={delta >= 0 ? "p-3 text-right font-mono text-gain" : "p-3 text-right font-mono text-loss"}>
                  {formatSigned(delta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, LineChart, Search, TrendingDown, TrendingUp } from "lucide-react";
import { PlayerCard } from "@/components/player-card";
import { PlayerSearch } from "@/components/player-search";
import { StockLeaderboard } from "@/components/stock-leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMarketCollections, getMarketDataset } from "@/lib/market-repository";
import { formatSigned } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dataset = await getMarketDataset();
  const { marketSummary, topFallers, topRisers, trendingPlayers } = buildMarketCollections(
    dataset.players,
  );
  const dataSourceLabel =
    dataset.source === "database" ? "Live NBA stats database" : "Seeded fallback data";

  return (
    <div className="container space-y-10 py-10 md:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-8 shadow-glow backdrop-blur md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Player Equities / {dataSourceLabel}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                NBA Stock Market
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Rank NBA players by performance momentum with a stock score that blends scoring,
                efficiency, playmaking, and recent team success.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={`/players/${marketSummary.strongestRiser.id}`}>
                  View Top Riser
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#leaderboards">
                  Scroll to Market
                  <ArrowDown className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <a
              href="#leaderboards"
              className="inline-flex items-center gap-2 pt-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:text-primary"
            >
              Scroll down for risers, fallers, search, and trending players
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </div>

        <Card className="bg-background/70">
          <CardContent className="grid h-full gap-4 p-6">
            <MarketStat
              icon={<LineChart className="h-5 w-5" />}
              label="Coverage Universe"
              value={`${marketSummary.playerCount} players`}
            />
            <MarketStat
              icon={<TrendingUp className="h-5 w-5" />}
              label="Highest Stock"
              value={`${marketSummary.strongestRiser.name} ${formatSigned(
                marketSummary.strongestRiser.stock.score,
              )}`}
            />
            <MarketStat
              icon={<TrendingDown className="h-5 w-5" />}
              label="Lowest Stock"
              value={`${marketSummary.steepestFaller.name} ${formatSigned(
                marketSummary.steepestFaller.stock.score,
              )}`}
            />
            <MarketStat
              icon={<Search className="h-5 w-5" />}
              label="Average Score"
              value={formatSigned(marketSummary.averageScore)}
            />
          </CardContent>
        </Card>
      </section>

      <section className="ticker-tape overflow-hidden rounded-2xl border border-border/80 bg-background/60 py-3">
        <div className="flex min-w-max animate-in slide-in-from-right-4 gap-8 px-4 font-mono text-sm">
          {topRisers.slice(0, 8).map((player) => (
            <span key={player.id} className="text-muted-foreground">
              {player.teamAbbreviation} {player.name}{" "}
              <span className="text-gain">{formatSigned(player.stock.score)}</span>
            </span>
          ))}
        </div>
      </section>

      <section id="leaderboards" className="scroll-mt-24 grid gap-6 lg:grid-cols-2">
        <StockLeaderboard
          title="Top Risers"
          description="Players with the strongest recent upward momentum."
          players={topRisers}
        />
        <StockLeaderboard
          title="Top Fallers"
          description="Players whose recent performance is under season baseline."
          players={topFallers}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
            Search Terminal
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Find any player</h2>
          <p className="text-muted-foreground">
            Search the market by player, team, abbreviation, or position. When Postgres is
            configured, this data comes from the real NBA stats ingestion pipeline.
          </p>
        </div>
        <PlayerSearch players={dataset.players} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Most Viewed
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Trending Players</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trendingPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MarketStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
      <div className="mb-3 flex text-primary">{icon}</div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
    </div>
  );
}

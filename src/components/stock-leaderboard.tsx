import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StockScoreBadge } from "@/components/stock-score-badge";
import type { PlayerMarket } from "@/lib/mock-data";

type StockLeaderboardProps = {
  title: string;
  description: string;
  players: PlayerMarket[];
};

export function StockLeaderboard({ title, description, players }: StockLeaderboardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {players.map((player, index) => (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            className="flex items-center gap-3 rounded-lg border border-transparent p-2 transition hover:border-border hover:bg-secondary/40"
          >
            <span className="w-6 text-center font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border bg-secondary">
              <Image
                src={player.imageUrl}
                alt={player.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{player.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {player.teamAbbreviation} / {player.position}
              </p>
            </div>
            <StockScoreBadge score={player.stock.score} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { StockScoreBadge } from "@/components/stock-score-badge";
import type { PlayerMarket } from "@/lib/mock-data";

type PlayerSearchProps = {
  players: PlayerMarket[];
};

export function PlayerSearch({ players }: PlayerSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return players.slice(0, 5);
    }

    return players
      .filter((player) =>
        [player.name, player.team, player.teamAbbreviation, player.position]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 6);
  }, [players, query]);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search any NBA player..."
          className="pl-10"
        />
      </div>

      <div className="mt-3 grid gap-2">
        {results.map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-secondary/60"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-secondary">
              <Image
                src={player.imageUrl}
                alt={player.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{player.name}</p>
              <p className="text-xs text-muted-foreground">{player.team}</p>
            </div>
            <StockScoreBadge score={player.stock.score} />
          </Link>
        ))}
      </div>
    </div>
  );
}

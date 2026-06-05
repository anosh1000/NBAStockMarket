import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StockScoreBadge } from "@/components/stock-score-badge";
import type { PlayerMarket } from "@/lib/mock-data";

type PlayerCardProps = {
  player: PlayerMarket;
};

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/players/${player.id}`} className="group block">
      <Card className="overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
        <CardContent className="p-0">
          <div className="relative min-h-44 bg-gradient-to-br from-secondary to-background p-5">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-80 transition group-hover:scale-105">
              <Image
                src={player.imageUrl}
                alt={player.name}
                fill
                sizes="(max-width: 768px) 50vw, 240px"
                className="object-contain object-bottom"
              />
            </div>
            <div className="relative z-10 flex max-w-[62%] flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                {player.teamAbbreviation} {player.position}
              </span>
              <h3 className="text-xl font-semibold tracking-tight">{player.name}</h3>
              <StockScoreBadge score={player.stock.score} />
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-border/70 text-center">
            <Stat label="PPG" value={player.last10Stats.ppg.toFixed(1)} />
            <Stat label="APG" value={player.last10Stats.apg.toFixed(1)} />
            <Stat label="TS%" value={(player.last10Stats.tsPct * 100).toFixed(1)} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border/70 p-3 last:border-r-0">
      <p className="font-mono text-sm font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

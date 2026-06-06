import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Database, LineChart, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How NBA Stock Market calculates player momentum and scout reports.",
};

const weights = [
  {
    label: "Current Quality",
    weight: "65%",
    description: "Blends production, role, efficiency, availability, and consistency.",
  },
  {
    label: "Recent Trend",
    weight: "25%",
    description: "Compares last 10 games against season baseline across scoring, efficiency, playmaking, and role.",
  },
  {
    label: "Team Context",
    weight: "10%",
    description: "Uses recent team win percentage so strong play on winning teams gets a modest lift.",
  },
];

export default function AboutPage() {
  return (
    <div className="container space-y-8 py-10 md:py-14">
      <section className="max-w-3xl space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          Methodology
        </p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
          A quality-adjusted market model
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          NBA Stock Market now prioritizes established stars and real rotation players. The score
          still tracks recent movement, but players must have meaningful role, production, and
          availability to dominate the main leaderboards.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {weights.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="font-mono text-primary">{item.weight}</span>
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ExplainerCard
          icon={<LineChart className="h-5 w-5" />}
          title="Stock Score"
          description="The final score is 65% current quality, 25% recent trend, and 10% team context. This prevents tiny-sample players from outranking proven high-impact players."
        />
        <ExplainerCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Leaderboard Eligibility"
          description="Main boards require enough games, minutes, production, and quality. Hot low-minute players move to Breakout Watch until their role stabilizes."
        />
        <ExplainerCard
          icon={<Database className="h-5 w-5" />}
          title="Data Sources"
          description="The app stores NBA Stats game logs in Postgres, uses regular season as the quality baseline, and includes playoffs for recent game tracking."
        />
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Refresh Plan</CardTitle>
              <CardDescription>How this UI-first build becomes a daily production workflow.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Step number="01" title="Ingest Stats" body="Fetch active players and game logs from the free NBA data provider." />
          <Step number="02" title="Calculate Scores" body="Persist logs, calculate quality and trend scores, and separate main-board players from Breakout Watch." />
          <Step number="03" title="Generate Reports" body="Regenerate OpenAI reports once daily or after significant score movement." />
        </CardContent>
      </Card>
    </div>
  );
}

function ExplainerCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">{number}</p>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

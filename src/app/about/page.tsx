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
    label: "Scoring Trend",
    weight: "40%",
    description: "Compares last 10 games PPG against season average PPG.",
  },
  {
    label: "Efficiency Trend",
    weight: "25%",
    description: "Compares last 10 games true shooting percentage against season average TS%.",
  },
  {
    label: "Playmaking Trend",
    weight: "20%",
    description: "Compares last 10 games APG against season average APG.",
  },
  {
    label: "Team Success",
    weight: "15%",
    description: "Uses recent team win percentage over the last 10 games.",
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
          A market model for NBA momentum
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          NBA Stock Market translates short-term player performance into a normalized score between
          -100 and +100. Positive scores indicate a rising stock, while negative scores indicate a
          player is underperforming against his season baseline.
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
          description="Each metric is normalized, clamped between -100 and +100, then blended using the model weights. This keeps different stat categories comparable."
        />
        <ExplainerCard
          icon={<Sparkles className="h-5 w-5" />}
          title="AI Reports"
          description="The first version uses realistic seeded reports. The service layer is ready for OpenAI generation once live stats and scheduled refreshes are enabled."
        />
        <ExplainerCard
          icon={<Database className="h-5 w-5" />}
          title="Data Sources"
          description="The project is structured for a free public NBA data provider and PostgreSQL persistence through Prisma, with Neon or Vercel Postgres as the recommended deployment target."
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
          <Step number="02" title="Calculate Scores" body="Persist game logs, calculate stock scores, and store daily score snapshots." />
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

import { BrainCircuit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoutReportSections } from "@/lib/mock-data";

type ScoutReportCardProps = {
  report: ScoutReportSections;
};

export function ScoutReportCard({ report }: ScoutReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>AI Scout Report</CardTitle>
            <CardDescription>Seeded report shaped for future OpenAI generation.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportSection title="Summary" body={report.summary} />
        <ReportSection title="Why Stock Is Rising/Falling" body={report.movement} />
        <ReportList title="Strengths" items={report.strengths} />
        <ReportList title="Concerns" items={report.concerns} />
        <ReportSection title="Outlook" body={report.outlook} />
      </CardContent>
    </Card>
  );
}

function ReportSection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        {title}
      </h3>
      <p className="leading-7 text-muted-foreground">{body}</p>
    </section>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        {title}
      </h3>
      <ul className="grid gap-2 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-border/70 bg-secondary/25 p-3">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
        Market Halted
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">Player not found</h1>
      <p className="max-w-md text-muted-foreground">
        This player is not in the current seeded market universe.
      </p>
      <Button asChild>
        <Link href="/">Return to dashboard</Link>
      </Button>
    </div>
  );
}

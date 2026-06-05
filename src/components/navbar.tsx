import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary shadow-glow">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              NBA Stock
            </p>
            <p className="text-xs text-muted-foreground">Market Intelligence</p>
          </div>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/about" className="transition hover:text-foreground">
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  );
}

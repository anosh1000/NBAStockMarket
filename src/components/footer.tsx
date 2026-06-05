export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/60">
      <div className="container flex flex-col gap-3 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>NBA Stock Market is a demo analytics product using seeded market data.</p>
        <p className="font-mono uppercase tracking-[0.2em]">Daily close: 10:00 UTC</p>
      </div>
    </footer>
  );
}

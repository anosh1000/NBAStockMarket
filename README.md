# NBA Stock Market

A production-polished, UI-first NBA player momentum dashboard built with Next.js 15, TypeScript, TailwindCSS, shadcn/ui-style components, Recharts, Prisma, and PostgreSQL.

## Features

- Bloomberg Terminal inspired dark dashboard
- Top risers and fallers based on a normalized stock score
- Player search and trending player cards
- Dynamic player pages with stock charts, comparison charts, game logs, and AI-style scout reports
- Prisma schema for `Player`, `PlayerStats`, `MarketSnapshot`, `StockScore`, and `ScoutReport`
- Real NBA Stats ingestion through server-side official NBA stats endpoints
- Vercel Cron refresh route for daily database updates

## Stock Score

The stock score is normalized between `-100` and `+100`.

- Scoring Trend: 40%
- Efficiency Trend: 25%
- Playmaking Trend: 20%
- Team Success: 15%

Positive scores indicate a rising stock. Negative scores indicate a falling stock.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the required variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/nba_stock_market?sslmode=require"
OPENAI_API_KEY="sk-proj-your-openai-key"
CRON_SECRET="replace-with-a-long-random-secret"
NBA_SEASON="2025-26"
NBA_SEASON_TYPE="Regular Season"
NBA_RECENT_SEASON_TYPES="Regular Season,Playoffs"
ENABLE_AI_REPORTS="false"
MAX_AI_REPORTS_PER_REFRESH="10"
```

Generate Prisma:

```bash
npm run prisma:generate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Push the Prisma schema to a Vercel-friendly Postgres provider such as Neon or Vercel Postgres:

```bash
npm run db:push
npm run db:seed
```

The UI reads from Postgres when `DATABASE_URL` is configured and real market snapshots exist. If no database is configured, it falls back to typed seeded data in `src/lib/mock-data.ts` so local UI development still works.

## Real NBA Data Refresh

`vercel.json` schedules `/api/cron/daily-refresh` once per day. The route:

1. Fetches active players from `stats.nba.com/stats/playerindex`.
2. Fetches regular-season game logs for the season-average baseline.
3. Fetches regular-season plus playoff game logs for true most-recent games and last-10 stock movement.
4. Persists players, combined game logs, daily market snapshots, and stock scores with Prisma.
5. Creates report text from the real stat deltas, or uses OpenAI when `ENABLE_AI_REPORTS="true"`.

Trigger a local refresh after `npm run dev` is running:

```bash
curl -X POST http://localhost:3000/api/cron/daily-refresh \
  -H "Authorization: Bearer replace-with-a-long-random-secret"
```

For production on Vercel, set the same environment variables and keep `CRON_SECRET` private. The scheduled cron request uses the route in `vercel.json`; manual requests should include the bearer token.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run prisma:generate
npm run db:push
npm run db:seed
```

import { NextResponse } from "next/server";
import { getMarketDataset } from "@/lib/market-repository";

export async function GET() {
  const dataset = await getMarketDataset();

  return NextResponse.json({
    data: dataset.players,
    meta: {
      source: dataset.source,
      count: dataset.players.length,
    },
  });
}

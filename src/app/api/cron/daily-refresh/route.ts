import { NextResponse } from "next/server";
import { runDailyMarketRefresh } from "@/lib/services/daily-refresh";

async function refresh(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDailyMarketRefresh();

  return NextResponse.json({
    ok: true,
    result,
  });
}

export async function GET(request: Request) {
  return refresh(request);
}

export async function POST(request: Request) {
  return refresh(request);
}

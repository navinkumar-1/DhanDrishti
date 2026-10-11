import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const apiKey = process.env.KITE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "KITE_API_KEY is not configured" }, { status: 500 });
  }

  const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(apiKey)}`;
  return NextResponse.redirect(loginUrl);
}

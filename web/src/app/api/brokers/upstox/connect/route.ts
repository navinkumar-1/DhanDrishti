import { NextResponse } from "next/server";
import { createUpstoxState, getUpstoxAuthorizationUrl } from "@/lib/brokers/upstox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    const state = createUpstoxState();
    const response = NextResponse.redirect(getUpstoxAuthorizationUrl(state));
    response.cookies.set("upstox_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Upstox is not configured" }, { status: 500 });
  }
}

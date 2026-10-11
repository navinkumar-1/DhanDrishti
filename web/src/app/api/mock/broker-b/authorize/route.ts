import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "";
  const redirectUri = url.searchParams.get("redirect_uri") ?? "";
  const next = new URL("/mock-broker/authorize", url.origin);
  next.searchParams.set("state", state);
  next.searchParams.set("redirect_uri", redirectUri);
  return NextResponse.redirect(next);
}

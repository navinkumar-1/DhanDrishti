import { NextResponse } from "next/server";
import { readSessionId } from "@/server/brokers/http";
import { completeCallback } from "@/server/brokers/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ broker: string }> }) {
  const { broker } = await context.params;
  const url = new URL(request.url);
  const sessionId = await readSessionId();
  const failed = new URL(`/connect/${broker}/callback`, url.origin);
  failed.searchParams.set("error", "state");
  if (!sessionId) return NextResponse.redirect(failed);
  const params = Object.fromEntries(url.searchParams.entries());
  try {
    const connectionId = await completeCallback(sessionId, broker, params, url.origin);
    const next = new URL(`/connect/${broker}/callback`, url.origin);
    next.searchParams.set("connection", connectionId);
    return NextResponse.redirect(next);
  } catch {
    return NextResponse.redirect(failed);
  }
}

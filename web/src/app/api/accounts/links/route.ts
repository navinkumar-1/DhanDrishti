import { NextResponse } from "next/server";
import { jsonError, readSessionId } from "@/server/brokers/http";
import { linkDecision, linkSuggestions, saveLink } from "@/server/brokers/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessionId = await readSessionId();
  const connectionId = new URL(request.url).searchParams.get("connection") ?? "";
  if (!sessionId || !connectionId) return NextResponse.json({ data: { suggestions: [], decision: null } });
  try {
    return NextResponse.json({ data: { suggestions: linkSuggestions(sessionId, connectionId), decision: linkDecision(sessionId, connectionId) } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const sessionId = await readSessionId();
  if (!sessionId) return NextResponse.json({ error: { code: "state_invalid", message: "This connection attempt expired. Please start again.", canRetry: true } }, { status: 401 });
  const body = (await request.json()) as { connectionId?: string; statementAccountId?: string; decision?: "same" | "different" };
  if (!body.connectionId || !body.statementAccountId || (body.decision !== "same" && body.decision !== "different")) {
    return NextResponse.json({ error: { code: "connect_failed", message: "Choose whether this is the same account.", canRetry: true } }, { status: 400 });
  }
  try {
    return NextResponse.json({ data: saveLink(sessionId, { connectionId: body.connectionId, statementAccountId: body.statementAccountId, decision: body.decision }) });
  } catch (error) {
    return jsonError(error);
  }
}

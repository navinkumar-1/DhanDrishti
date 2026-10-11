import { NextResponse } from "next/server";
import { jsonError, readSessionId } from "@/server/brokers/http";
import { listConnections } from "@/server/brokers/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionId = await readSessionId();
  if (!sessionId) return NextResponse.json({ data: [] });
  try {
    return NextResponse.json({ data: listConnections(sessionId) });
  } catch (error) {
    return jsonError(error);
  }
}

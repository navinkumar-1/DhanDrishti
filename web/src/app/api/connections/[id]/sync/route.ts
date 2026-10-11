import { NextResponse } from "next/server";
import { jsonError, readSessionId } from "@/server/brokers/http";
import { syncNow } from "@/server/brokers/service";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionId = await readSessionId();
  if (!sessionId) return NextResponse.json({ error: { code: "state_invalid", message: "This connection attempt expired. Please start again.", canRetry: true } }, { status: 401 });
  const { id } = await context.params;
  try {
    return NextResponse.json({ data: syncNow(sessionId, id) });
  } catch (error) {
    return jsonError(error);
  }
}

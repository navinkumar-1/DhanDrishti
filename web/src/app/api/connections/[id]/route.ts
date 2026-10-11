import { NextResponse } from "next/server";
import { jsonError, readSessionId } from "@/server/brokers/http";
import { disconnect } from "@/server/brokers/service";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionId = await readSessionId();
  if (!sessionId) return NextResponse.json({ error: { code: "state_invalid", message: "This connection attempt expired. Please start again.", canRetry: true } }, { status: 401 });
  const { id } = await context.params;
  try {
    disconnect(sessionId, id);
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return jsonError(error);
  }
}

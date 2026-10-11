import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { ensureSession, jsonError, readSessionId } from "@/server/brokers/http";
import { startConnection } from "@/server/brokers/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ broker: string }> }) {
  const { broker } = await context.params;
  const existing = await readSessionId();
  const origin = new URL(request.url).origin;
  try {
    const sessionId = existing ?? randomBytes(24).toString("base64url");
    const data = await startConnection(sessionId, broker, origin);
    const response = NextResponse.json({ data });
    return ensureSession(response, sessionId, Boolean(existing));
  } catch (error) {
    return jsonError(error);
  }
}

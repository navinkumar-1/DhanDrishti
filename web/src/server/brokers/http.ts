import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BrokerFlowError } from "@/server/brokers/core";

const COOKIE = "dd_sid";

export async function readSessionId() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export function ensureSession(response: NextResponse, sessionId: string, alreadySet: boolean) {
  if (!alreadySet) {
    response.cookies.set(COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}

export function jsonError(error: unknown) {
  if (error instanceof BrokerFlowError) {
    return NextResponse.json({ error: error.error }, { status: error.status });
  }
  return NextResponse.json({ error: { code: "connect_failed", message: "Couldn't connect right now.", canRetry: true } }, { status: 500 });
}

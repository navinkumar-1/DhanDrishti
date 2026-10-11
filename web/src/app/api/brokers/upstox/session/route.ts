import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decryptSecret } from "@/lib/security/token-encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const packed = (await cookies()).get("dd_upstox")?.value;
  if (!packed) return NextResponse.json({ data: { connected: false } });
  try {
    const stored = JSON.parse(Buffer.from(packed, "base64url").toString("utf8")) as { ciphertext: string; iv: string; authTag: string; expiresAt: string };
    if (!stored.expiresAt || Date.parse(stored.expiresAt) <= Date.now()) {
      return NextResponse.json({ data: { connected: false } });
    }
    decryptSecret(stored);
    return NextResponse.json({ data: { connected: true } });
  } catch {
    return NextResponse.json({ data: { connected: false } });
  }
}

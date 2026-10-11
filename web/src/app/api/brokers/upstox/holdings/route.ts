import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUpstoxEquityHoldings, getUpstoxMutualFundHoldings, normalizeUpstoxEquity, normalizeUpstoxMutualFund } from "@/lib/brokers/upstox";
import { decryptSecret } from "@/lib/security/token-encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface StoredUpstoxSession {
  ciphertext: string;
  iv: string;
  authTag: string;
  expiresAt: string;
}

async function readToken() {
  const packed = (await cookies()).get("dd_upstox")?.value;
  if (!packed) return null;
  try {
    const stored = JSON.parse(Buffer.from(packed, "base64url").toString("utf8")) as StoredUpstoxSession;
    if (!stored.expiresAt || Date.parse(stored.expiresAt) <= Date.now()) return null;
    return decryptSecret(stored);
  } catch {
    return null;
  }
}

export async function GET() {
  const accessToken = await readToken();
  if (!accessToken) return NextResponse.json({ data: { connected: false, equities: [], mutualFunds: [] } });

  try {
    const [equityResult, mutualFundResult] = await Promise.all([
      getUpstoxEquityHoldings(accessToken),
      getUpstoxMutualFundHoldings(accessToken),
    ]);
    return NextResponse.json({
      data: {
        connected: true,
        equities: (equityResult.data ?? []).map(normalizeUpstoxEquity),
        mutualFunds: (mutualFundResult.data ?? []).map(normalizeUpstoxMutualFund),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UPSTOX_TOKEN_EXPIRED") {
      return NextResponse.json({ error: "Upstox session expired. Reconnect to refresh." }, { status: 401 });
    }
    console.error("Upstox holdings request failed", message || "Unknown error");
    return NextResponse.json({ error: "Upstox didn't respond." }, { status: 502 });
  }
}

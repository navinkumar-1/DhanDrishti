import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decryptToken } from "@/server/brokers/core";

export const dynamic = "force-dynamic";

interface EquityRow {
  assetType: "equity";
  isin: string;
  tradingSymbol: string;
  exchange: string;
  quantity: number;
  t1Quantity: number;
  averagePrice: number | null;
  lastPrice: number | null;
  value: number | null;
}

interface MutualFundRow {
  assetType: "mutual_fund";
  isin: string;
  name: string;
  folio: string;
  quantity: number;
  averagePrice: number | null;
  lastPrice: number | null;
  value: number | null;
  source: "zerodha_coin";
}

export async function GET() {
  const jar = await cookies();
  const sealed = jar.get("dd_kite")?.value;
  if (!sealed) {
    return NextResponse.json({ data: { connected: false, equities: [], mutualFunds: [] } });
  }

  const [iv, ciphertext] = sealed.split(".");
  if (!iv || !ciphertext) {
    return NextResponse.json({ error: "Zerodha session expired. Reconnect to refresh." }, { status: 401 });
  }

  let accessToken = "";
  try {
    accessToken = decryptToken({ iv, ciphertext });
  } catch {
    return NextResponse.json({ error: "Zerodha session expired. Reconnect to refresh." }, { status: 401 });
  }

  const apiKey = process.env.KITE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Zerodha is not configured" }, { status: 500 });
  }

  const headers = {
    "X-Kite-Version": "3",
    Authorization: `token ${apiKey}:${accessToken}`,
  };

  const [equityRes, mfRes] = await Promise.all([
    fetch("https://api.kite.trade/portfolio/holdings", { headers, cache: "no-store" }),
    fetch("https://api.kite.trade/mf/holdings", { headers, cache: "no-store" }),
  ]);

  if ((equityRes.status === 401 || equityRes.status === 403) && (mfRes.status === 401 || mfRes.status === 403)) {
    return NextResponse.json({ error: "Zerodha session expired. Reconnect to refresh." }, { status: 401 });
  }

  const equities = equityRes.ok ? mapZerodhaEquityHoldings(await equityRes.json()) : [];
  const mutualFunds = mfRes.ok ? mapZerodhaMutualFundHoldings(await mfRes.json()) : [];

  if (!equityRes.ok && !mfRes.ok) {
    console.error("Zerodha holdings request failed", { equityStatus: equityRes.status, mutualFundStatus: mfRes.status });
    return NextResponse.json({ error: "Zerodha didn't respond." }, { status: 502 });
  }

  return NextResponse.json({
    data: {
      connected: true,
      equities,
      mutualFunds,
      equityError: equityRes.ok ? undefined : "Stocks and ETFs could not be read.",
      mutualFundError: mfRes.ok ? undefined : "Mutual funds could not be read.",
    },
  });
}

function mapZerodhaEquityHoldings(payload: unknown): EquityRow[] {
  const rows = Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: Record<string, unknown>[] }).data : [];
  return rows.map((row) => {
    const quantity = numberOrZero(row.quantity);
    const lastPrice = numberOrNull(row.last_price);
    return {
      assetType: "equity",
      isin: String(row.isin ?? ""),
      tradingSymbol: String(row.tradingsymbol ?? ""),
      exchange: String(row.exchange ?? ""),
      quantity,
      t1Quantity: numberOrZero(row.t1_quantity),
      averagePrice: numberOrNull(row.average_price),
      lastPrice,
      value: lastPrice === null ? null : Math.round(quantity * lastPrice),
    };
  });
}

function mapZerodhaMutualFundHoldings(payload: unknown): MutualFundRow[] {
  const rows = Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: Record<string, unknown>[] }).data : [];
  return rows.map((row) => {
    const quantity = numberOrZero(row.quantity);
    const lastPrice = numberOrNull(row.last_price);
    return {
      assetType: "mutual_fund",
      isin: String(row.tradingsymbol ?? ""),
      name: String(row.fund ?? ""),
      folio: String(row.folio ?? ""),
      quantity,
      averagePrice: numberOrNull(row.average_price),
      lastPrice,
      value: lastPrice === null ? null : Math.round(quantity * lastPrice),
      source: "zerodha_coin",
    };
  });
}

function numberOrZero(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOrNull(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

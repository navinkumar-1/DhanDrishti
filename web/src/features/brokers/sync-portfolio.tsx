"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { persistBrokerBook } from "@/lib/firebase/live-portfolio";
import type { AssetClass } from "@/types/domain";
import { isRealIsin, type BrokerBook, type LivePosition } from "@/lib/portfolio/model";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/providers/auth-provider";
import { useSession } from "@/store/session-store";
import { useUpstoxSession } from "@/features/brokers/upstox-holdings";
import { useZerodhaSession } from "@/features/brokers/zerodha-holdings";

export function useBrokerPortfolioSync() {
  const { user } = useAuth();
  const zerodha = useZerodhaSession();
  const upstox = useUpstoxSession();
  const client = useQueryClient();
  const loadBroker = useSession((state) => state.loadBroker);
  const connected = Boolean(zerodha.data || upstox.data);
  const ready = Boolean(user) && zerodha.isFetched && upstox.isFetched && connected;

  return useQuery({
    queryKey: ["portfolio-sync", user?.uid, Boolean(zerodha.data), Boolean(upstox.data)],
    enabled: ready,
    staleTime: 60_000,
    queryFn: async () => {
      const books: BrokerBook[] = [];
      if (zerodha.data) books.push(await fetchZerodhaBook());
      if (upstox.data) books.push(await fetchUpstoxBook());
      try {
        for (const book of books) {
          await persistBrokerBook(user!.uid, book);
        }
      } catch (error) {
        const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
        if (code === "permission-denied") {
          throw new Error("Firestore blocked saving these holdings. Publish the updated security rules, then reconnect.");
        }
        throw error instanceof Error ? error : new Error("Couldn't save broker holdings.");
      }
      const names = books.map((book) => book.brokerName);
      if (names.length > 0) loadBroker(names.join(", "));
      await Promise.all([
        client.invalidateQueries({ queryKey: qk.summary }),
        client.invalidateQueries({ queryKey: qk.holdings }),
        client.invalidateQueries({ queryKey: qk.accounts }),
        client.invalidateQueries({ queryKey: qk.issues }),
        client.invalidateQueries({ queryKey: ["concentration"] }),
        client.invalidateQueries({ queryKey: qk.risks }),
      ]);
      return { brokers: names };
    },
  });
}

async function fetchZerodhaBook(): Promise<BrokerBook> {
  const response = await fetch("/api/brokers/zerodha/holdings", { credentials: "include" });
  const body = (await response.json()) as {
    data?: {
      equities: ZerodhaEquity[];
      mutualFunds: ZerodhaFund[];
      equityError?: string;
      mutualFundError?: string;
    };
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Zerodha didn't respond.");
  const data = body.data;
  return {
    brokerId: "zerodha",
    brokerName: "Zerodha",
    demat: data?.equityError ? null : (data?.equities ?? []).map(zerodhaEquity),
    mutualFunds: data?.mutualFundError ? null : (data?.mutualFunds ?? []).map(zerodhaFund),
  };
}

async function fetchUpstoxBook(): Promise<BrokerBook> {
  const response = await fetch("/api/brokers/upstox/holdings", { credentials: "include" });
  const body = (await response.json()) as {
    data?: { equities: UpstoxEquity[]; mutualFunds: UpstoxFund[] };
    error?: string;
  };
  if (!response.ok) throw new Error(body.error ?? "Upstox didn't respond.");
  return {
    brokerId: "upstox",
    brokerName: "Upstox",
    demat: (body.data?.equities ?? []).map(upstoxEquity),
    mutualFunds: (body.data?.mutualFunds ?? []).map(upstoxFund),
  };
}

function zerodhaEquity(row: ZerodhaEquity): LivePosition {
  return position("zerodha", "demat", "equity", row.isin, row.tradingSymbol, row.tradingSymbol || row.isin, row.quantity, row.t1Quantity, row.lastPrice, row.averagePrice);
}

function zerodhaFund(row: ZerodhaFund): LivePosition {
  return position("zerodha", "mf_folio", "mutual_fund", row.isin, row.isin, row.name || row.isin, row.quantity, 0, row.lastPrice, row.averagePrice);
}

function upstoxEquity(row: UpstoxEquity): LivePosition {
  return position("upstox", "demat", "equity", row.isin, row.symbol, row.name || row.symbol || row.isin || "Unnamed security", row.quantity, row.pendingQuantity, row.lastPrice ?? null, row.averagePrice ?? null);
}

function upstoxFund(row: UpstoxFund): LivePosition {
  return position("upstox", "mf_folio", "mutual_fund", row.isin, row.folio, row.name || row.isin || "Mutual fund", row.quantity, 0, row.lastPrice ?? null, row.averagePrice ?? null);
}

interface ZerodhaEquity {
  isin: string;
  tradingSymbol: string;
  quantity: number;
  t1Quantity: number;
  lastPrice: number | null;
  averagePrice: number | null;
}

interface ZerodhaFund {
  isin: string;
  name: string;
  quantity: number;
  lastPrice: number | null;
  averagePrice: number | null;
}

interface UpstoxEquity {
  isin: string | null;
  symbol: string | null;
  name: string | null;
  quantity: number;
  pendingQuantity: number;
  lastPrice?: number | null;
  averagePrice?: number | null;
}

interface UpstoxFund {
  isin: string | null;
  name: string | null;
  folio: string | null;
  quantity: number;
  lastPrice?: number | null;
  averagePrice?: number | null;
}

function position(
  brokerId: LivePosition["brokerId"],
  accountKind: LivePosition["accountKind"],
  assetType: AssetClass,
  isin: string | null,
  symbol: string | null,
  name: string,
  settledQty: number,
  pendingQty: number,
  lastPriceRupees: number | null,
  averagePriceRupees: number | null,
): LivePosition {
  const cleanIsin = isin && isRealIsin(isin) ? isin.toUpperCase() : null;
  const resolvedType = assetType === "equity" && /ETF|BEES/i.test(`${name} ${symbol ?? ""}`) ? "etf" : assetType;
  return {
    brokerId,
    accountKind,
    isin: cleanIsin,
    symbol,
    name: name || symbol || cleanIsin || "Unnamed security",
    assetType: resolvedType,
    settledQty: finite(settledQty),
    pendingQty: finite(pendingQty),
    lastPriceRupees,
    averagePriceRupees,
  };
}

function finite(value: number) {
  return Number.isFinite(value) ? value : 0;
}

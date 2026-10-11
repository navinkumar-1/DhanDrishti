"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatInr } from "@/lib/format";

export interface ZerodhaEquityRow {
  assetType: "equity";
  isin: string;
  tradingSymbol: string;
  quantity: number;
  t1Quantity: number;
  value: number | null;
}

export interface ZerodhaMutualFundRow {
  assetType: "mutual_fund";
  isin: string;
  name: string;
  folio: string;
  quantity: number;
  value: number | null;
  source: "zerodha_coin";
}

export function useZerodhaSession() {
  return useQuery({
    queryKey: ["zerodha-session"],
    queryFn: async () => {
      const response = await fetch("/api/brokers/zerodha/session", { credentials: "include" });
      const body = (await response.json()) as { data?: { connected: boolean } };
      return Boolean(body.data?.connected);
    },
    staleTime: 30_000,
  });
}

export function ZerodhaHoldings() {
  const justConnected = useSearchParams().get("zerodha") === "connected";
  const holdings = useQuery({
    queryKey: ["zerodha-holdings"],
    queryFn: async () => {
      const response = await fetch("/api/brokers/zerodha/holdings", { credentials: "include" });
      const body = (await response.json()) as {
        data?: {
          connected: boolean;
          equities: ZerodhaEquityRow[];
          mutualFunds: ZerodhaMutualFundRow[];
          equityError?: string;
          mutualFundError?: string;
        };
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? "Zerodha didn't respond.");
      return body.data ?? { connected: false, equities: [], mutualFunds: [] };
    },
  });

  if (holdings.isLoading) {
    return <div className="skeleton mb-4 h-40 rounded-[14px]" />;
  }
  if (!holdings.data?.connected && !justConnected && !holdings.error) return null;

  return (
    <div className="mb-4 rounded-[14px] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Zerodha</p>
          <p className="text-[13px] text-text-secondary">Read-only holdings from your Zerodha login.</p>
        </div>
        <span className="rounded-full bg-positive-bg px-2.5 py-1 text-[12px] font-semibold text-positive">Connected</span>
      </div>
      {holdings.error ? <p className="mt-2 text-[14px] text-danger">{holdings.error.message}</p> : null}
      {holdings.data?.connected ? (
        <div className="mt-4 space-y-4">
          {(holdings.data.equities ?? []).length === 0 && (holdings.data.mutualFunds ?? []).length === 0 && !holdings.data.equityError && !holdings.data.mutualFundError ? (
            <p className="text-[14px] text-text-secondary">No holdings returned. Is this the right account?</p>
          ) : (
            <>
              <HoldingSection title="Stocks and ETFs" count={(holdings.data.equities ?? []).length} empty="No equity holdings" error={holdings.data.equityError}>
                {(holdings.data.equities ?? []).map((holding) => (
                  <li key={`${holding.isin}-${holding.tradingSymbol}`} className="flex justify-between gap-3 py-2">
                    <span>
                      <span className="block font-semibold">{holding.tradingSymbol || holding.isin}</span>
                      <span className="text-[12px] text-text-secondary">{holding.isin}</span>
                    </span>
                    <span className="text-right">
                      {formatUnits(holding.quantity)} settled
                      {holding.t1Quantity > 0 ? <span className="block text-[12px] text-warning">{formatUnits(holding.t1Quantity)} pending</span> : null}
                      {holding.value !== null ? <span className="block text-[12px] text-text-secondary">{formatInr(holding.value)}</span> : null}
                    </span>
                  </li>
                ))}
              </HoldingSection>
              <HoldingSection title="Mutual funds" count={(holdings.data.mutualFunds ?? []).length} empty="No mutual fund holdings" error={holdings.data.mutualFundError}>
                {(holdings.data.mutualFunds ?? []).map((holding) => (
                  <li key={`${holding.folio}-${holding.isin}`} className="flex justify-between gap-3 py-2">
                    <span>
                      <span className="block font-semibold">{holding.name || holding.isin}</span>
                      <span className="text-[12px] text-text-secondary">Units: {formatUnits(holding.quantity)} · {holding.isin}</span>
                    </span>
                    <span className="text-right font-semibold">{holding.value !== null ? formatInr(holding.value) : "Not valued"}</span>
                  </li>
                ))}
              </HoldingSection>
            </>
          )}
        </div>
      ) : null}
      <Link href="/api/brokers/zerodha/connect" className="mt-3 inline-block text-[14px] font-semibold text-primary">
        Reconnect
      </Link>
    </div>
  );
}

function HoldingSection({
  title,
  count,
  empty,
  error,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[13px] font-semibold text-text-secondary">
        {title}
        {count > 0 ? ` · ${count} holdings` : ""}
      </h2>
      {error ? <p className="mt-1 text-[14px] text-danger">{error}</p> : null}
      {count > 0 ? <ul className="mt-1 divide-y divide-border text-[14px]">{children}</ul> : !error ? <p className="mt-1 text-[14px] text-text-secondary">{empty}</p> : null}
    </section>
  );
}

function formatUnits(quantity: number) {
  return quantity.toLocaleString("en-IN", { maximumFractionDigits: 3 });
}

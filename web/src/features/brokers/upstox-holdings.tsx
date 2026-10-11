"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatInr } from "@/lib/format";

export function useUpstoxSession() {
  return useQuery({
    queryKey: ["upstox-session"],
    queryFn: async () => {
      const response = await fetch("/api/brokers/upstox/session", { credentials: "include" });
      const body = (await response.json()) as { data?: { connected: boolean } };
      return Boolean(body.data?.connected);
    },
    staleTime: 30_000,
  });
}

interface EquityRow {
  isin: string | null;
  symbol: string | null;
  name: string | null;
  quantity: number;
  pendingQuantity: number;
  value: number | null;
}

interface FundRow {
  isin: string | null;
  name: string | null;
  folio: string | null;
  quantity: number;
  value: number | null;
  pledgedQuantity: number;
}

export function UpstoxHoldings() {
  const justConnected = useSearchParams().get("upstox") === "connected";
  const holdings = useQuery({
    queryKey: ["upstox-holdings"],
    queryFn: async () => {
      const response = await fetch("/api/brokers/upstox/holdings", { credentials: "include" });
      const body = (await response.json()) as {
        data?: { connected: boolean; equities: EquityRow[]; mutualFunds: FundRow[] };
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? "Upstox didn't respond.");
      return body.data ?? { connected: false, equities: [], mutualFunds: [] };
    },
  });

  if (holdings.isLoading) return <div className="skeleton mb-4 h-40 rounded-[14px]" />;
  if (!holdings.data?.connected && !justConnected && !holdings.error) return null;

  const equities = holdings.data?.equities ?? [];
  const mutualFunds = holdings.data?.mutualFunds ?? [];

  return (
    <div className="mb-4 rounded-[14px] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Upstox</p>
          <p className="text-[13px] text-text-secondary">Read-only. Stocks and mutual funds are fetched separately.</p>
        </div>
        <span className="rounded-full bg-positive-bg px-2.5 py-1 text-[12px] font-semibold text-positive">Connected</span>
      </div>
      {holdings.error ? <p className="mt-2 text-[14px] text-danger">{holdings.error.message}</p> : null}
      {holdings.data?.connected ? (
        <div className="mt-4 space-y-4">
          {equities.length === 0 && mutualFunds.length === 0 ? (
            <p className="text-[14px] text-text-secondary">No holdings returned. Is this the right account?</p>
          ) : (
            <>
              <Section title="Stocks and ETFs" count={equities.length} empty="No equity holdings">
                {equities.map((holding) => (
                  <li key={`${holding.isin}-${holding.symbol}`} className="flex justify-between gap-3 py-2">
                    <span>
                      <span className="block font-semibold">{holding.name || holding.symbol || holding.isin}</span>
                      <span className="text-[12px] text-text-secondary">{holding.isin}</span>
                    </span>
                    <span className="text-right">
                      {formatUnits(holding.quantity)} settled
                      {holding.pendingQuantity > 0 ? <span className="block text-[12px] text-warning">{formatUnits(holding.pendingQuantity)} pending</span> : null}
                      {holding.value !== null ? <span className="block text-[12px] text-text-secondary">{formatInr(holding.value)}</span> : null}
                    </span>
                  </li>
                ))}
              </Section>
              <Section title="Mutual funds" count={mutualFunds.length} empty="No mutual fund holdings">
                {mutualFunds.map((holding) => (
                  <li key={`${holding.folio}-${holding.isin}`} className="flex justify-between gap-3 py-2">
                    <span>
                      <span className="block font-semibold">{holding.name || holding.isin}</span>
                      <span className="text-[12px] text-text-secondary">Units: {formatUnits(holding.quantity)} · {holding.isin}</span>
                    </span>
                    <span className="text-right font-semibold">{holding.value !== null ? formatInr(holding.value) : "Not valued"}</span>
                  </li>
                ))}
              </Section>
            </>
          )}
        </div>
      ) : null}
      <Link href="/api/brokers/upstox/connect" className="mt-3 inline-block text-[14px] font-semibold text-primary">
        Reconnect
      </Link>
    </div>
  );
}

function Section({ title, count, empty, children }: { title: string; count: number; empty: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[13px] font-semibold text-text-secondary">
        {title}
        {count > 0 ? ` · ${count} holdings` : ""}
      </h2>
      {count > 0 ? <ul className="mt-1 divide-y divide-border text-[14px]">{children}</ul> : <p className="mt-1 text-[14px] text-text-secondary">{empty}</p>}
    </section>
  );
}

function formatUnits(quantity: number) {
  return quantity.toLocaleString("en-IN", { maximumFractionDigits: 3 });
}

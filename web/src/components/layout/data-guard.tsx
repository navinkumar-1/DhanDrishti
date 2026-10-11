"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBrokerPortfolioSync } from "@/features/brokers/sync-portfolio";
import { useUpstoxSession } from "@/features/brokers/upstox-holdings";
import { useZerodhaSession } from "@/features/brokers/zerodha-holdings";
import { useSummary } from "@/lib/query/hooks";
import { useSession } from "@/store/session-store";

export function DataGuard({ children }: { children: React.ReactNode }) {
  const hydrated = useSession((state) => state.hydrated);
  const hasSessionData = useSession((state) => state.hasData);
  const zerodha = useZerodhaSession();
  const upstox = useUpstoxSession();
  const summary = useSummary();
  const sync = useBrokerPortfolioSync();
  const router = useRouter();
  const brokerConnected = zerodha.data === true || upstox.data === true;
  const brokerKnown = zerodha.isFetched && upstox.isFetched;
  const hasLive = (summary.data?.summary.holdingCount ?? 0) > 0 || (summary.data?.coverage.includedCount ?? 0) > 0;
  const waiting = !hydrated || !brokerKnown || summary.isPending || (brokerConnected && sync.isFetching && !hasLive);
  const allowed = hasLive || brokerConnected || hasSessionData || sync.isError;

  useEffect(() => {
    if (!waiting && !allowed) router.replace("/start");
  }, [allowed, router, waiting]);

  if (waiting || !allowed) {
    return (
      <div className="min-h-screen bg-canvas p-8">
        <div className="skeleton h-16 rounded-[14px]" />
        <div className="skeleton mt-4 h-64 rounded-[14px]" />
      </div>
    );
  }

  return children;
}

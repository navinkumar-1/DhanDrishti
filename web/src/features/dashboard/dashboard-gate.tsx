"use client";

import { PageHeader } from "@/components/ui/primitives";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { useBrokerPortfolioSync } from "@/features/brokers/sync-portfolio";
import { useSummary } from "@/lib/query/hooks";

export function DashboardGate() {
  const sync = useBrokerPortfolioSync();
  const summary = useSummary();
  const hasHoldings = (summary.data?.summary.holdingCount ?? 0) > 0;

  if (sync.isError && !hasHoldings) {
    const message = sync.error instanceof Error ? sync.error.message : "Couldn't save broker holdings.";
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="The broker responded, but the portfolio was not saved." />
        <p className="rounded-[14px] border border-danger-bg bg-danger-bg px-4 py-3 text-[14px] text-danger">{message}</p>
      </div>
    );
  }

  return <DashboardView />;
}

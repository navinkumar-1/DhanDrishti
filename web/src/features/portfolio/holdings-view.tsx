"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HoldingsTable } from "@/components/data/holdings-table";
import { PageHeader, PrimaryButton } from "@/components/ui/primitives";
import { formatInr } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { exportHoldings } from "@/lib/export";
import { useHoldings, useSummary } from "@/lib/query/hooks";
import type { AssetClass, ReconStatus } from "@/types/domain";

const classes: Array<AssetClass | "all" | "needs_review"> = [
  "all",
  "equity",
  "etf",
  "mutual_fund",
  "reit",
  "invit",
  "bond",
  "needs_review",
];

export function HoldingsView() {
  const { t } = useI18n();
  const params = useSearchParams();
  const initial = params.get("class") ?? (params.get("valued") === "no" ? "unvalued" : "all");
  const [filter, setFilter] = useState(initial);
  const [query, setQuery] = useState("");
  const holdings = useHoldings();
  const summary = useSummary();

  const rows = useMemo(() => {
    const list = holdings.data ?? [];
    return list
      .filter((holding) => {
        if (filter === "unvalued") return holding.value === undefined;
        if (filter === "needs_review") return holding.status === "needs_review";
        if (filter !== "all") return holding.assetClass === (filter as AssetClass);
        return true;
      })
      .filter((holding) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return holding.name.toLowerCase().includes(q) || holding.isin.toLowerCase().includes(q);
      })
      .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  }, [filter, holdings.data, query]);

  if (!holdings.data || !summary.data) return <div className="skeleton h-[480px] rounded-[14px]" />;

  return (
    <div>
      <PageHeader
        title={t("holdings.title")}
        subtitle={t("holdings.subtitle")}
        action={<PrimaryButton onClick={() => exportHoldings(holdings.data)}>{t("exportReport")}</PrimaryButton>}
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("search")}
        className="mb-4 h-10 w-full max-w-[280px] rounded-full bg-surface-muted px-4 text-[14px] outline-none"
      />
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {classes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`h-9 shrink-0 rounded-full px-3 text-[13px] ${filter === item ? "bg-primary-tint font-semibold text-primary" : "bg-surface text-text-secondary"}`}
          >
            {item === "all" ? "All" : item === "needs_review" ? t("needsReview") : t(`asset.${item}`)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFilter("unvalued")}
          className={`h-9 shrink-0 rounded-full px-3 text-[13px] ${filter === "unvalued" ? "bg-primary-tint font-semibold text-primary" : "bg-surface text-text-secondary"}`}
        >
          {t("notValued")}
        </button>
      </div>
      <p className="mb-3 text-[12px] text-text-secondary">
        {t("holdings.countLine", {
          count: summary.data.summary.holdingCount,
          value: formatInr(summary.data.summary.totalValue),
          missing: summary.data.summary.unvaluedCount,
        })}
      </p>
      {rows.length === 0 ? <p className="rounded-[14px] border border-border bg-surface p-10 text-center">{t("holdings.empty")}</p> : <HoldingsTable rows={rows} />}
      <p className="mt-3 text-[12px] text-text-tertiary">
        Quantity is the settled total across accounts.{" "}
        <Link href="/reconciliation" className="text-primary">
          Open issues
        </Link>
      </p>
    </div>
  );
}

export type { ReconStatus };

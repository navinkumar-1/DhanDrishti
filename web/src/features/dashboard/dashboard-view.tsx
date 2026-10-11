"use client";

import Link from "next/link";
import { Building2, ChevronRight, Info, Landmark, PieChart, TrendingUp } from "lucide-react";
import { useState } from "react";
import { SnapshotChart } from "@/components/charts/snapshot-chart";
import { ShareChip, StatusBadge, TrustChip } from "@/components/data/badges";
import { HoldingsTable } from "@/components/data/holdings-table";
import { MoneyText, PrivacyToggle } from "@/components/data/money";
import { Avatar } from "@/components/trust/drawers";
import { Card, PageHeader, PrimaryButton } from "@/components/ui/primitives";
import { formatDate, formatInr } from "@/lib/format";
import { tx, useI18n } from "@/lib/i18n";
import { exportHoldings } from "@/lib/export";
import { useHoldings, useSummary } from "@/lib/query/hooks";
import { useUi } from "@/store/ui-store";
import type { AssetClass, Holding } from "@/types/domain";

const iconColor: Record<string, string> = {
  equity: "#F2683C",
  etf: "#00A3C4",
  mutual_fund: "#7C5CFA",
  bond: "#EF6C8A",
  reit: "#F59E0B",
  invit: "#12B76A",
};

const cardIcon = {
  equity: TrendingUp,
  etf: PieChart,
  mutual_fund: PieChart,
  bond: Landmark,
  reit: Building2,
  invit: Building2,
};

export function DashboardView() {
  const { t, language } = useI18n();
  const openSource = useUi((state) => state.openSource);
  const summaryQuery = useSummary();
  const holdingsQuery = useHoldings();
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [lens, setLens] = useState<"class" | "company" | "sector" | "account">("class");

  if (!summaryQuery.data || !holdingsQuery.data) {
    return <div className="skeleton h-[640px] rounded-[14px]" />;
  }

  const { summary, coverage, totalSource } = summaryQuery.data;
  const ranked = [...holdingsQuery.data].sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  const largest = ranked.find((holding) => holding.value !== undefined);
  const classes = showAllClasses ? summary.assetClasses : summary.assetClasses.slice(0, 4);

  return (
    <div>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        action={
          <PrimaryButton onClick={() => exportHoldings(holdingsQuery.data)}>
            {t("exportReport")}
          </PrimaryButton>
        }
      />

      {summary.holdingCount === 0 ? (
        <Card className="mb-4">
          <p className="font-semibold">No holdings imported yet</p>
          <p className="mt-1 text-[14px] text-text-secondary">Connect Zerodha or Upstox and the read-only holdings will show up here.</p>
          <Link href="/connect" className="mt-3 inline-block text-[14px] font-semibold text-primary">Connect a broker</Link>
        </Card>
      ) : null}

      <Link href="/accounts" className="mb-4 flex items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-3 text-[13px] text-text-primary">
        <Info size={18} className="text-primary" />
        <span className="flex-1">{tx(language, coverage.headline)}</span>
        <ChevronRight size={16} className="text-text-tertiary" />
      </Link>

      <div className="grid gap-4 min-[1100px]:grid-cols-12">
        <Card className="min-[1100px]:col-span-8">
          <div className="grid gap-4 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <p className="text-[13px] text-text-secondary">{t("dashboard.total")}</p>
              <div className="mt-1 flex items-center gap-2">
                <MoneyText
                  amount={summary.totalValue}
                  className="text-[34px] leading-10 font-bold"
                  source={{
                    title: t("dashboard.total"),
                    valueLabel: formatInr(summary.totalValue),
                    asOf: formatDate(summary.asOf),
                    sourceLabel: totalSource.label,
                    note: totalSource.note,
                    href: "/portfolio",
                    hrefLabel: t("seeAll"),
                  }}
                />
                <PrivacyToggle />
              </div>
              <p className="mt-1 text-[13px] text-text-secondary">{t("dashboard.asOf", { date: formatDate(summary.asOf) })}</p>
              <div className="mt-2">
                <TrustChip
                  label={`${totalSource.label} · ${formatDate(summary.asOf)}`}
                  onClick={() =>
                    openSource({
                      title: t("dashboard.total"),
                      valueLabel: formatInr(summary.totalValue),
                      asOf: formatDate(summary.asOf),
                      sourceLabel: totalSource.label,
                      note: totalSource.note,
                    })
                  }
                />
              </div>
            </div>
            <div className="md:border-l md:border-border md:pl-4">
              <p className="text-[13px] text-text-secondary">{t("dashboard.valued")}</p>
              <p className="mt-1 text-[26px] leading-8 font-bold">
                {summary.valuedCount} of {summary.holdingCount}
              </p>
              <Link href="/portfolio?valued=no" className="mt-1 block text-[13px] text-primary">
                {t("dashboard.notValued", { count: summary.unvaluedCount })}
              </Link>
            </div>
            {largest ? (
              <div className="md:border-l md:border-border md:pl-4">
                <p className="text-[13px] text-text-secondary">{t("dashboard.largest")}</p>
                <Link href={`/portfolio/${largest.isin}`} className="mt-2 flex items-center gap-2">
                  <Avatar name={largest.name} />
                  <span>
                    <span className="block text-[15px] font-semibold">{largest.name}</span>
                    <span className="text-[13px] text-text-secondary">
                      {t(`asset.${largest.assetClass}`)} · {largest.share?.toFixed(1)} % {t("ofTotal")}
                    </span>
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
          <div className="mt-4">
            {summary.snapshots.length < 2 ? (
              <p className="py-16 text-center text-[14px] text-text-secondary">{t("dashboard.timelineEmpty")}</p>
            ) : (
              <SnapshotChart points={summary.snapshots} />
            )}
          </div>
        </Card>

        <Card className="min-[1100px]:col-span-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">{t("dashboard.largestList")}</h2>
            <Link href="/portfolio" className="text-[13px] text-text-secondary">
              {t("seeAll")}
            </Link>
          </div>
          <ul>
            {ranked.slice(0, 5).map((holding) => (
              <li key={holding.isin}>
                <LargestRow holding={holding} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-border">
        {(
          [
            ["class", "By asset class"],
            ["company", "By company"],
            ["sector", "By sector"],
            ["account", "By account"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setLens(id)}
            className={`h-10 rounded-t-lg px-3 text-[14px] ${lens === id ? "bg-primary-tint font-semibold text-primary underline decoration-2 underline-offset-[10px]" : "text-text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {lens === "class" ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {classes.map((slice) => (
              <AssetCard key={slice.assetClass} assetClass={slice.assetClass} holdings={slice.holdings} value={slice.value} share={slice.share} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-text-tertiary">
            <p>{t("dashboard.footnote", { date: formatDate(summary.asOf) })}</p>
            <button type="button" className="font-semibold text-primary" onClick={() => setShowAllClasses((open) => !open)}>
              {showAllClasses ? "Show less" : "See all"}
            </button>
          </div>
        </>
      ) : (
        <Card className="mt-4">
          <p className="text-[14px] text-text-secondary">
            This lens is on the concentration map.{" "}
            <Link href={`/concentration?view=${lens === "company" ? "company" : lens === "sector" ? "sector" : "account"}`} className="font-semibold text-primary">
              Open {lens}
            </Link>
          </p>
        </Card>
      )}

      <Link href="/reconciliation" className="mt-4 flex items-center gap-3 rounded-[14px] border border-danger-bg bg-danger-bg px-4 py-4 text-danger">
        <span className="text-[15px] font-semibold">{t("dashboard.attention", { count: summary.openIssues })}</span>
        <span className="flex-1 text-[13px]">{tx(language, summary.issueLine)}</span>
        <ChevronRight size={18} />
      </Link>

      <div className="mt-4">
        <HoldingsTable rows={ranked.slice(0, 8)} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Link href="/concentration" className="rounded-[14px] border border-border bg-surface p-5">
          <p className="text-[15px] font-semibold">{t("dashboard.banking", { share: summary.bankingShare })}</p>
          <p className="mt-1 text-[13px] text-text-secondary">Threshold shown: {summary.bankingThreshold} % (descriptive, not a judgement)</p>
        </Link>
        <Link href="/risk" className="rounded-[14px] border border-border bg-surface p-5">
          <p className="text-[15px] font-semibold">{t("dashboard.risk", { count: 3 })}</p>
          <p className="mt-1 text-[13px] text-text-secondary">Scenario-based, not a prediction</p>
        </Link>
      </div>

      <Card className="mt-4">
        <p className="text-[15px] font-semibold">{t("dashboard.learn")}</p>
        <Link href="/learn" className="mt-2 inline-block text-[14px] font-semibold text-primary">
          {t("dashboard.learnCta")}
        </Link>
      </Card>
    </div>
  );
}

function LargestRow({ holding }: { holding: Holding }) {
  const { t } = useI18n();
  const accountLabel = holding.accounts.map((slice) => slice.label ?? slice.source.label).join(" + ");
  return (
    <Link href={`/portfolio/${holding.isin}`} className="flex h-16 items-center gap-3">
      <Avatar name={holding.name} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">{holding.name}</span>
        <span className="block truncate text-[13px] text-text-secondary">
          {t(`asset.${holding.assetClass}`)} · {accountLabel}
        </span>
      </span>
      <span className="text-right">
        <MoneyText amount={holding.value} className="block text-[15px] font-semibold" />
        {holding.status === "needs_review" ? <StatusBadge status="needs_review" /> : holding.share !== undefined ? <ShareChip share={holding.share} /> : null}
      </span>
    </Link>
  );
}

function AssetCard({
  assetClass,
  holdings,
  value,
  share,
}: {
  assetClass: AssetClass;
  holdings: number;
  value: number;
  share: number;
}) {
  const { t } = useI18n();
  const Icon = cardIcon[assetClass as keyof typeof cardIcon] ?? PieChart;
  return (
    <Link href={`/portfolio?class=${assetClass}`} className="block min-h-[124px] rounded-[14px] border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: iconColor[assetClass] }}>
          <Icon size={18} />
        </span>
        <span className="text-[18px] font-semibold">{t(`asset.${assetClass}`)}</span>
      </div>
      <p className="mt-2 text-[13px] text-text-secondary">
        {holdings} {holdings === 1 ? "holding" : "holdings"}
      </p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <span className="text-[22px] font-bold">{formatInr(value)}</span>
        <ShareChip share={share} />
      </div>
    </Link>
  );
}

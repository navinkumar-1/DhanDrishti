"use client";

import Link from "next/link";
import { useState } from "react";
import { IllustrativeBadge, TrustChip } from "@/components/data/badges";
import { Card, PageHeader, PrimaryButton } from "@/components/ui/primitives";
import { formatDate, formatInr } from "@/lib/format";
import { tx, useI18n } from "@/lib/i18n";
import { useAccounts, useCashflows, useLab, useRisks } from "@/lib/query/hooks";
import type { CashflowStatus } from "@/types/domain";

const cashLabel: Record<CashflowStatus, string> = {
  scheduled: "Scheduled",
  announced: "Announced",
  estimated: "Estimated",
  confirmed_received: "Confirmed received",
};

export function RiskView() {
  const { language } = useI18n();
  const risks = useRisks();
  const [percent, setPercent] = useState(10);
  const stress = useLab({ mode: "portfolio", virtualAmount: 0, scenario: "equity_fall", percent, language });

  return (
    <div>
      <PageHeader title="Risk insights" subtitle="What could go wrong" action={<span className="rounded-full bg-surface-muted px-3 py-1 text-[12px]">Scenario-based, not a prediction</span>} />
      <div className="space-y-3">
        {(risks.data ?? []).map((risk) => (
          <article key={risk.id} className="rounded-[14px] border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={risk.href} className="font-semibold text-primary">
                  {tx(language, risk.title)}
                </Link>
                <p className="mt-1 text-[14px]">{tx(language, risk.observation)}</p>
                <p className="mt-1 text-[12px] text-text-secondary">{tx(language, risk.threshold)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-surface-muted px-2 py-1 text-[12px]">{tx(language, risk.level)}</span>
            </div>
            <div className="mt-2">
              <TrustChip label={`${risk.source} · ${formatDate(risk.asOf)}`} />
            </div>
          </article>
        ))}
      </div>
      <Card className="mt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold">Try a stress test</h2>
          <IllustrativeBadge />
        </div>
        <p className="mt-1 text-[13px] text-text-secondary">Assumed fall in the equity sleeve. Other holdings stay at the last imported value.</p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" className="grid h-7 w-7 place-items-center rounded-lg border" onClick={() => setPercent((value) => Math.max(0, value - 5))}>−</button>
          <span className="font-bold">{percent} %</span>
          <button type="button" className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-white" onClick={() => setPercent((value) => Math.min(100, value + 5))}>+</button>
        </div>
        {stress.data ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[13px] text-text-secondary">Original</p>
              <p className="text-[22px] font-bold">{formatInr(stress.data.originalValue)}</p>
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">Under these assumptions</p>
              <p className="text-[22px] font-bold">{formatInr(stress.data.scenarioValue)}</p>
            </div>
          </div>
        ) : null}
        <PrimaryButton href="/lab?mode=portfolio" className="mt-4">
          Open in What-if lab
        </PrimaryButton>
      </Card>
    </div>
  );
}

export function CashflowView() {
  const rows = useCashflows();
  const accounts = useAccounts();
  const [historical, setHistorical] = useState(true);
  if (!rows.data || !accounts.data) return <div className="skeleton h-64 rounded-[14px]" />;
  const visible = rows.data.filter((row) => (historical ? true : row.date >= "2026-10-01"));
  return (
    <div>
      <PageHeader title="Cash-flow calendar" subtitle="An announced distribution is not shown as received." />
      <label className="mb-4 flex items-center gap-2 text-[14px]">
        <input type="checkbox" checked={historical} onChange={(event) => setHistorical(event.target.checked)} />
        Historical
      </label>
      <div className="space-y-2">
        {visible.length === 0 ? <p className="text-[14px] text-text-secondary">Broker holdings do not include a cash-flow calendar. Nothing here is marked as received.</p> : null}
        {visible.map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-[14px] border border-border bg-surface px-4 py-3">
            <span>
              <span className="block font-semibold">{row.name}</span>
              <span className="text-[13px] text-text-secondary">{accounts.data.find((account) => account.id === row.accountId)?.label} · {formatDate(row.date)}</span>
            </span>
            <span className="text-right">
              <span className="block font-semibold">{formatInr(row.amount)}</span>
              <span className="text-[12px] text-text-secondary">{cashLabel[row.status]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

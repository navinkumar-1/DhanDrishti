"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, PageHeader } from "@/components/ui/primitives";
import { formatDate, formatInr } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useConcentration, useSummary } from "@/lib/query/hooks";

const views = ["company", "sector", "assetClass", "account"] as const;
const colors = ["#1A6DFF", "#00A3C4", "#7C5CFA", "#EF6C8A", "#F59E0B", "#12B76A", "#F2683C", "#5B6B82", "#9CA3AF", "#1252D6", "#B7791F"];

export function ConcentrationView() {
  const params = useSearchParams();
  const initial = views.find((view) => view === params.get("view")) ?? "company";
  const [view, setView] = useState<(typeof views)[number]>(initial);
  const query = useConcentration(view);
  const { t } = useI18n();
  const portfolio = useSummary();

  return (
    <div>
      <PageHeader title="Concentration" subtitle={portfolio.data ? t("common.basis", { date: formatDate(portfolio.data.summary.asOf) }) : "Imported broker holdings"} />
      <div className="mb-4 rounded-[12px] bg-warning-bg px-4 py-3 text-[13px] text-warning">
        Excluded: {portfolio.data?.summary.unvaluedCount ?? 0} not valued. Sector is unclassified until a reference file is linked.
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-border">
        {[
          ["company", "By company"],
          ["sector", "By sector"],
          ["assetClass", "By asset class"],
          ["account", "By account"],
        ].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setView(id as (typeof views)[number])} className={`h-10 shrink-0 px-3 text-[14px] ${view === id ? "border-b-2 border-primary font-semibold text-primary" : "text-text-secondary"}`}>
            {label}
          </button>
        ))}
      </div>
      {!query.data ? <div className="skeleton h-64 rounded-[14px]" /> : (
        <div className="grid gap-4 min-[1100px]:grid-cols-12">
          <Card className="h-[320px] min-[1100px]:col-span-5">
            {view === "assetClass" || view === "account" ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={query.data.filter((row) => row.value > 0)} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} stroke="#fff">
                    {query.data.filter((row) => row.value > 0).map((row, index) => (
                      <Cell key={row.id} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatInr(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ul className="space-y-3">
                {query.data.map((row, index) => (
                  <li key={row.id}>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span>{row.name}</span>
                      <span>{row.share.toFixed(1)} %</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-muted">
                      <div className="h-2 rounded-full" style={{ width: `${row.share}%`, background: colors[index % colors.length] }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="min-[1100px]:col-span-7">
            <ul className="divide-y divide-border">
              {query.data.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block font-semibold">{row.name}</span>
                    {row.lookThroughUnavailable ? <span className="text-[12px] text-text-secondary">Look-through unavailable</span> : null}
                    {row.unclassified ? <span className="text-[12px] text-text-secondary">Unclassified</span> : null}
                  </span>
                  <span className="text-right">
                    <span className="block font-semibold">{row.value > 0 ? formatInr(row.value) : "—"}</span>
                    <span className="text-[12px] text-text-secondary">{row.share.toFixed(1)} %</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      <Card className="mt-4">
        <p className="text-[16px] font-semibold">{portfolio.data?.summary.bankingShare ?? 0} % of your imported, valued portfolio is in banking</p>
        <p className="mt-1 text-[13px] text-text-secondary">Threshold shown: 30 % (descriptive, not a judgement)</p>
        <div className="mt-3 flex gap-4 text-[14px] font-semibold text-primary">
          <Link href="/assistant?q=Why%20is%20my%20portfolio%20concentrated%3F">Why is this concentrated?</Link>
          <Link href="/connections">See Hidden Connections</Link>
        </div>
      </Card>
    </div>
  );
}

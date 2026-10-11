"use client";

import Link from "next/link";
import { Download, SlidersHorizontal } from "lucide-react";
import { ShareChip, StatusBadge } from "@/components/data/badges";
import { MoneyText } from "@/components/data/money";
import { Avatar } from "@/components/trust/drawers";
import { OutlineButton } from "@/components/ui/primitives";
import { useI18n } from "@/lib/i18n";
import { exportHoldings } from "@/lib/export";
import type { Holding } from "@/types/domain";

export function HoldingsTable({ rows }: { rows: Holding[] }) {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-[18px] leading-[26px] font-semibold">{t("dashboard.mine")}</h2>
        <div className="flex gap-2">
          <OutlineButton onClick={() => exportHoldings(rows)}>
            <Download size={14} /> {t("export")}
          </OutlineButton>
          <OutlineButton>
            <SlidersHorizontal size={14} /> {t("filter")}
          </OutlineButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-surface-muted text-[13px] text-text-secondary">
            <tr>
              {["Holding", "Account", "Units", "Status", "Value", "Share"].map((column) => (
                <th key={column} className="px-5 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((holding) => {
              const accounts = holding.accounts.map((slice) => slice.label ?? slice.source.label).join(" + ");
              return (
                <tr key={holding.isin} className="border-t border-border">
                  <td className="px-5 py-3">
                    <Link href={`/portfolio/${holding.isin}`} className="flex items-center gap-3">
                      <Avatar name={holding.name} />
                      <span>
                        <span className="block text-[15px] font-semibold">{holding.name}</span>
                        <span className="text-[13px] text-text-secondary">{t(`asset.${holding.assetClass}`)}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 text-[14px]">{accounts}</td>
                  <td className="px-5 text-[14px]">
                    {holding.totalQuantity}
                    {holding.pendingQuantity > 0 ? <span className="block text-[12px] text-warning">{holding.pendingQuantity} pending</span> : null}
                  </td>
                  <td className="px-5">
                    <StatusBadge status={holding.status} />
                  </td>
                  <td className="px-5 text-[15px] font-semibold">
                    {holding.value === undefined ? (
                      <span>{t("notValued")}</span>
                    ) : (
                      <MoneyText
                        amount={holding.value}
                        source={{
                          title: holding.name,
                          valueLabel: "",
                          asOf: holding.price?.priceDate ?? "2026-09-29",
                          sourceLabel: holding.price?.source.label ?? "Sample",
                          note: holding.price?.source.note,
                          href: `/portfolio/${holding.isin}`,
                          hrefLabel: t("showEvidence"),
                        }}
                      />
                    )}
                  </td>
                  <td className="px-5">{holding.share !== undefined ? <ShareChip share={holding.share} /> : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

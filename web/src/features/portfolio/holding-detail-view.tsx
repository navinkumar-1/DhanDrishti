"use client";

import Link from "next/link";
import { UnitsChart } from "@/components/charts/snapshot-chart";
import { AssetClassChip, StatusBadge, TrustChip } from "@/components/data/badges";
import { MoneyText } from "@/components/data/money";
import { Avatar } from "@/components/trust/drawers";
import { Card, PageHeader, PrimaryButton } from "@/components/ui/primitives";
import { formatDate, formatInr } from "@/lib/format";
import { tx, useI18n } from "@/lib/i18n";
import { useHolding } from "@/lib/query/hooks";
import { useUi } from "@/store/ui-store";

export function HoldingDetailView({ isin }: { isin: string }) {
  const { t, language, setLanguage } = useI18n();
  const openEvidence = useUi((state) => state.openEvidence);
  const openSource = useUi((state) => state.openSource);
  const query = useHolding(isin);

  if (query.isLoading) return <div className="skeleton h-[520px] rounded-[14px]" />;
  const holding = query.data;
  if (!holding) {
    return (
      <Card>
        <p>This ISIN is not in the imported data.</p>
        <Link href="/portfolio" className="mt-3 inline-block text-primary">
          Back to holdings
        </Link>
      </Card>
    );
  }

  const learnType = holding.assetClass === "reit" || holding.assetClass === "invit" || holding.assetClass === "bond" ? holding.assetClass : "stock";

  return (
    <div>
      <PageHeader
        back={
          <Link href="/portfolio" className="mb-1 block text-[13px] text-text-secondary">
            ‹ {t("nav.holdings")}
          </Link>
        }
        title="Holding detail"
        action={
          <PrimaryButton onClick={() => openEvidence(holding.isin)}>{t("showEvidence")}</PrimaryButton>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={holding.name} size={48} />
            <div>
              <h2 className="text-[18px] font-semibold">{holding.name}</h2>
              <p className="text-[13px] text-text-secondary">
                {t(`asset.${holding.assetClass}`)} · {holding.isin}
              </p>
            </div>
          </div>
          <StatusBadge status={holding.status} />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 min-[1100px]:grid-cols-12">
        <Card className="min-[1100px]:col-span-8">
          <p className="text-[13px] text-text-secondary">Total units</p>
          <p className="text-[26px] leading-8 font-bold">{holding.totalQuantity} units</p>
          {holding.pendingQuantity > 0 ? (
            <p className="mt-1 text-[13px] font-semibold text-warning">{holding.pendingQuantity} pending settlement</p>
          ) : null}
          <p className="mt-1 text-[13px] text-text-secondary">
            {holding.value !== undefined && holding.price ? (
              <>
                Value <MoneyText amount={holding.value} className="font-semibold text-text-primary" /> at {formatInr(holding.price.value)} per unit (price as of {formatDate(holding.price.priceDate)})
              </>
            ) : (
              tx(language, holding.unvaluedReason ?? { en: "No dependable market price available", hi: "भरोसेमंद बाज़ार मूल्य उपलब्ध नहीं" })
            )}
          </p>
          <div className="mt-2">
            <TrustChip
              label={`${holding.price?.source.label ?? holding.accounts[0]?.source.label} · ${formatDate(holding.price?.priceDate ?? holding.accounts[0]?.source.asOf ?? "2026-09-29")}`}
              onClick={() =>
                openSource({
                  title: holding.name,
                  valueLabel: holding.value !== undefined ? formatInr(holding.value) : t("notValued"),
                  asOf: formatDate(holding.price?.priceDate ?? holding.accounts[0].source.asOf),
                  sourceLabel: holding.price?.source.label ?? holding.accounts[0].source.label,
                  note: holding.price?.source.note ?? holding.accounts[0].source.note,
                })
              }
            />
          </div>
          {holding.timeline.length < 2 ? (
            <p className="py-16 text-center text-[14px] text-text-secondary">Only one source reported this holding</p>
          ) : (
            <UnitsChart points={holding.timeline} />
          )}
        </Card>
        <Card className="min-[1100px]:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Key facts</h2>
            <button type="button" className="text-[13px] text-text-secondary" onClick={() => openEvidence(holding.isin)}>
              {t("showEvidence")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Fact label="Settled units" value={String(holding.totalQuantity)} />
            <Fact label="Pending units" value={String(holding.pendingQuantity)} />
            <Fact label="Accounts" value={String(holding.accounts.length)} />
            <Fact label="Value" value={holding.value !== undefined ? formatInr(holding.value) : t("notValued")} />
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="text-[15px] font-semibold">
          {`You own ${holding.totalQuantity} units in total${
            holding.accounts.length > 1
              ? `: ${holding.accounts
                  .map((slice) => `${slice.quantity} in ${slice.label ?? slice.source.label}`)
                  .join(", ")}`
              : ""
          }`}
        </p>
        <ul className="mt-3 divide-y divide-border">
          {holding.accounts.map((slice) => {
            const label = slice.label ?? slice.source.label;
            return (
              <li key={slice.accountId}>
                <Link href={`/accounts/${slice.accountId}`} className="flex items-center gap-3 py-3">
                  <Avatar name={label} />
                  <span className="flex-1">
                    <span className="block font-semibold">{label}</span>
                    <span className="text-[13px] text-text-secondary">{slice.maskedId ?? slice.accountId}</span>
                  </span>
                  <span className="font-semibold">{slice.quantity} units</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="mt-4">
        <h2 className="text-[18px] font-semibold">Understand this holding</h2>
        <div className="mt-2 divide-y divide-border text-[14px]">
          <Link className="block py-3" href={`/learn/${learnType}`}>
            How {t(`asset.${holding.assetClass}`).toLowerCase()} works
          </Link>
          <Link className="block py-3" href={`/follow-money/${holding.isin}`}>
            Follow my money
          </Link>
          {holding.issuer === "Aster Industries" ? (
            <Link className="block py-3" href="/connections">
              Hidden Connections: Aster Industries
            </Link>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2">
          <Link href={`/assistant?q=${encodeURIComponent(`Explain ${holding.name}`)}`} onClick={() => setLanguage("en")} className="rounded-full border border-border px-3 py-1.5 text-[13px]">
            Ask in English
          </Link>
          <Link href={`/assistant?q=${encodeURIComponent(`Explain ${holding.name} in Hindi`)}`} onClick={() => setLanguage("hi")} className="rounded-full border border-border px-3 py-1.5 text-[13px]">
            हिंदी में पूछें
          </Link>
        </div>
      </Card>

      <Card className="mt-4">
        <p className="font-semibold">Cost basis unavailable or incomplete</p>
        <p className="mt-1 text-[13px] text-text-secondary">{tx(language, holding.costBasisNote)}</p>
        <div className="mt-3">
          <AssetClassChip assetClass={holding.assetClass} />
        </div>
      </Card>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-surface-muted p-3">
      <p className="text-[12px] text-text-secondary">{label}</p>
      <p className="mt-1 text-[16px] font-semibold">{value}</p>
    </div>
  );
}

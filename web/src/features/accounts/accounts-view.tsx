"use client";

import Link from "next/link";
import { Card, PageHeader, SecondaryButton } from "@/components/ui/primitives";
import { MoneyText } from "@/components/data/money";
import { Avatar } from "@/components/trust/drawers";
import { formatDate, formatInr } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useUpstoxSession } from "@/features/brokers/upstox-holdings";
import { useZerodhaSession } from "@/features/brokers/zerodha-holdings";
import { useAccounts, useHoldings } from "@/lib/query/hooks";

const stateLabel = {
  fresh: "Fresh",
  aging: "Aging",
  stale: "Stale",
  not_connected: "Not connected",
  error: "Error",
};

export function AccountsView() {
  const { t } = useI18n();
  const accounts = useAccounts();
  const zerodha = useZerodhaSession();
  const upstox = useUpstoxSession();
  if (!accounts.data) return <div className="skeleton h-64 rounded-[14px]" />;
  const included = accounts.data.filter((account) => !account.missing);
  const missing = accounts.data.filter((account) => account.missing);
  const aging = included.filter((account) => account.state === "aging" || account.state === "stale").length;

  return (
    <div>
      <PageHeader title={t("accounts.title")} subtitle="Each source has its own as-of date." action={<Link href="/start"><SecondaryButton>{t("accounts.add")}</SecondaryButton></Link>} />
      <div className="mb-4 flex flex-wrap gap-3 text-[14px] font-semibold text-primary">
        {zerodha.data ? <Link href="/api/brokers/zerodha/connect">Reconnect Zerodha</Link> : null}
        {upstox.data ? <Link href="/api/brokers/upstox/connect">Reconnect Upstox</Link> : null}
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label={t("accounts.included")} value={String(included.length)} />
        <Stat label={t("accounts.aging")} value={String(aging)} />
        <Stat label={t("accounts.missing")} value={String(missing.length)} />
      </div>
      <div className="space-y-3">
        {included.map((account) => (
          <Link key={account.id} href={`/accounts/${account.id}`} className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-4">
            <Avatar name={account.label} />
            <span className="flex-1">
              <span className="block font-semibold">{account.label}</span>
              <span className="text-[13px] text-text-secondary">
                {account.maskedId} · {account.depository ?? account.kind}
                {account.lastUpdated ? ` · Updated ${formatDate(account.lastUpdated)}` : ""}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-semibold">{account.valuedHoldings !== undefined ? formatInr(account.valuedHoldings) : "—"}</span>
              <span className="text-[12px] text-text-secondary">{stateLabel[account.state]}</span>
            </span>
          </Link>
        ))}
      </div>
      <h2 className="mt-6 text-[18px] font-semibold">{t("accounts.flagged")}</h2>
      {missing.map((account) => (
        <div key={account.id} className="mt-3 rounded-[14px] border border-dashed border-border bg-surface p-4">
          <p className="font-semibold">{account.label} not connected</p>
          <p className="text-[13px] text-text-secondary">Live authorization depends on confirmed partner access.</p>
        </div>
      ))}
    </div>
  );
}

export function AccountDetailView({ accountId }: { accountId: string }) {
  const { t } = useI18n();
  const accounts = useAccounts();
  const holdings = useHoldings();
  const account = accounts.data?.find((item) => item.id === accountId);
  if (!accounts.data || !holdings.data) return <div className="skeleton h-64 rounded-[14px]" />;
  if (!account) return <Card>This account is not in the imported sources.</Card>;

  const rows = holdings.data.filter((holding) => holding.accounts.some((slice) => slice.accountId === accountId));

  return (
    <div>
      <PageHeader
        back={<Link href="/accounts" className="mb-1 block text-[13px] text-text-secondary">‹ {t("accounts.title")}</Link>}
        title={account.label}
      />
      <Card>
        <div className="flex items-center gap-3">
          <Avatar name={account.label} size={48} />
          <div>
            <p className="font-semibold">{account.maskedId}{account.depository ? ` · ${account.depository}` : ""}</p>
            <p className="text-[13px] text-text-secondary">{account.sourceLabel}{account.lastUpdated ? ` · Updated ${formatDate(account.lastUpdated)}` : ""}</p>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-text-secondary">{t("accounts.valuedInAccount")}</p>
        <p className="text-[28px] font-bold">{account.valuedHoldings !== undefined ? <MoneyText amount={account.valuedHoldings} /> : "—"}</p>
      </Card>
      <div className="mt-4 space-y-2">
        {rows.map((holding) => {
          const slice = holding.accounts.find((item) => item.accountId === accountId);
          return (
            <Link key={holding.isin} href={`/portfolio/${holding.isin}`} className="flex items-center justify-between rounded-[14px] border border-border bg-surface px-4 py-3">
              <span>
                <span className="block font-semibold">{holding.name}</span>
                <span className="text-[13px] text-text-secondary">{slice?.quantity} units in this account</span>
              </span>
              <span className="font-semibold">{slice?.value !== undefined ? formatInr(slice.value) : t("notValued")}</span>
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-[12px] text-text-tertiary">Figures on this page are for {account.label} only. They are not added to another account. Source record: {account.sourceLabel}.</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4">
      <p className="text-[13px] text-text-secondary">{label}</p>
      <p className="text-[26px] font-bold">{value}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, PageHeader } from "@/components/ui/primitives";
import { formatInr } from "@/lib/format";
import { useHolding, useHoldings } from "@/lib/query/hooks";

export function FollowPicker() {
  const holdings = useHoldings();
  if (!holdings.data) return <div className="skeleton h-64 rounded-[14px]" />;
  const valued = holdings.data.filter((holding) => holding.value !== undefined);
  return (
    <div>
      <PageHeader title="Follow my money" subtitle="Pick a holding. Underlying assets explain it. They are not added to portfolio value." />
      {valued.length === 0 ? <p className="text-[14px] text-text-secondary">Connect a broker to choose a holding.</p> : null}
      <div className="grid gap-3">
        {valued.map((holding) => (
          <Link key={holding.isin} href={`/follow-money/${holding.isin}`} className="rounded-[14px] border border-border bg-surface px-4 py-3">
            <span className="font-semibold">{holding.name}</span>
            <span className="mt-1 block text-[13px] text-text-secondary">{holding.isin}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function FollowMoneyView({ isin }: { isin: string }) {
  const [tab, setTab] = useState<"accounts" | "assets" | "cash">("accounts");
  const query = useHolding(isin);
  const holding = query.data;

  if (query.isLoading) return <div className="skeleton h-64 rounded-[14px]" />;
  if (!holding) return <Card>This holding is not in the imported data.</Card>;

  return (
    <div>
      <PageHeader
        back={<Link href="/follow-money" className="mb-1 block text-[13px] text-text-secondary">‹ Follow my money</Link>}
        title={holding.name}
        subtitle={holding.isin}
      />
      <div className="mb-4 flex gap-2">
        {(
          [
            ["accounts", "Accounts"],
            ["assets", "Assets and issuers"],
            ["cash", "Cash flows"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`h-10 rounded-full px-3 text-[14px] ${tab === id ? "bg-primary text-white" : "bg-surface text-text-secondary"}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === "accounts" ? (
        <Card>
          <ul className="space-y-3">
            {holding.accounts.map((slice) => (
              <li key={slice.accountId} className="flex justify-between">
                <span>{slice.label ?? slice.source.label}</span>
                <span className="font-semibold">{slice.quantity} units{slice.value !== undefined ? ` · ${formatInr(slice.value)}` : ""}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {tab === "assets" ? (
        <Card>
          <p>The broker feed names this holding and its asset class. It does not include a look-through of underlying assets, so those assets are not added to portfolio value.</p>
        </Card>
      ) : null}
      {tab === "cash" ? (
        <Card>
          <p>Not disclosed in the broker holdings feed.</p>
        </Card>
      ) : null}
      <Card className="mt-4 text-[13px] leading-5 text-text-secondary">
        A company&apos;s stock and its bond are different rights. Underlying assets explain a holding and are not added to your portfolio value.
      </Card>
    </div>
  );
}

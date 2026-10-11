"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, PrimaryButton } from "@/components/ui/primitives";
import { OnboardingFrame } from "@/features/onboarding/start-view";
import { useBrokers } from "@/lib/query/hooks";
import type { BrokerInfo } from "@/types/broker";

const chipLabel: Record<BrokerInfo["availability"], string> = {
  live: "Live",
  mock: "Demo",
  requires_partner_access: "Requires partner access",
  fixture_only: "Fixture only",
};

export function BrokerList() {
  const brokers = useBrokers();
  return (
    <OnboardingFrame wide>
      <h1 className="text-[28px] font-bold">Choose a broker</h1>
      <p className="mt-2 text-[14px] text-text-secondary">Read-only. Login, if needed, happens on the broker&apos;s own page.</p>
      <div className="mt-6 grid gap-3">
        {(brokers.data ?? []).map((broker) => (
          <Link key={broker.id} href={`/connect/${broker.id}`} className="flex items-center justify-between gap-3 rounded-[14px] border border-border bg-surface p-4">
            <span>
              <span className="block font-semibold">{broker.displayName}</span>
              <span className="text-[13px] text-text-secondary">{broker.note ?? broker.tokenLifetimeNote}</span>
            </span>
            <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[12px] text-text-secondary">{chipLabel[broker.availability]}</span>
          </Link>
        ))}
      </div>
    </OnboardingFrame>
  );
}

export function BrokerConsent({ broker }: { broker: string }) {
  const brokers = useBrokers();
  const record = brokers.data?.find((item) => item.id === broker);
  const name = record?.displayName ?? broker;
  const blocked = record?.availability === "requires_partner_access" || record?.availability === "fixture_only" || record?.availability === "mock";
  const params = useSearchParams();
  const [error, setError] = useState(
    params.get("error") === "auth" || params.get("error") === "upstox" ? "The connection was not completed. Nothing was imported." : "",
  );
  const [pending, setPending] = useState(false);

  async function begin() {
    setError("");
    setPending(true);
    try {
      const response = await fetch(`/api/connect/${broker}/start`, { credentials: "include" });
      const body = (await response.json()) as { data?: { authorizationUrl: string }; error?: { message: string } };
      if (!response.ok || !body.data?.authorizationUrl) {
        setError(body.error?.message ?? "Couldn't connect right now.");
        setPending(false);
        return;
      }
      window.location.assign(body.data.authorizationUrl);
    } catch {
      setError("Couldn't connect right now.");
      setPending(false);
    }
  }

  return (
    <OnboardingFrame>
      <Card>
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-[14px] bg-primary-tint text-[18px] font-bold text-primary">{name.slice(0, 1)}</div>
        <h1 className="text-[28px] font-bold">{name}</h1>
        {record ? <p className="mt-2 text-[13px] text-text-secondary">{chipLabel[record.availability]} · {record.tokenLifetimeNote}</p> : null}
        {record?.note ? <p className="mt-2 text-[13px] text-text-secondary">{record.note}</p> : null}
        <div className="mt-4 space-y-3">
          <div className="rounded-[12px] bg-surface-muted p-4 text-[14px]">What we will read: holdings, quantities, and average price.</div>
          <div className="rounded-[12px] bg-surface-muted p-4 text-[14px]">What we will never do: place orders, move money, or see your password or OTP.</div>
        </div>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-[14px] text-text-secondary">
          <li>Redirect to {name}</li>
          <li>You log in on the broker&apos;s site</li>
          <li>The broker sends a short-lived code to our server</li>
          <li>We fetch your holdings</li>
        </ol>
        {blocked ? <div className="mt-4 rounded-[12px] bg-warning-bg p-3 text-[13px] text-warning">Live authorization is not available for {name}. Upload a statement instead.</div> : null}
        {error ? <p className="mt-3 text-[14px] text-danger">{error}</p> : null}
        <div className="mt-5 flex flex-col gap-2">
          {blocked ? <PrimaryButton href="/upload" className="w-full">Upload statement</PrimaryButton> : broker === "zerodha" && record?.availability === "live" ? (
            <PrimaryButton href="/api/brokers/zerodha/connect" className="w-full">Continue to Zerodha</PrimaryButton>
          ) : broker === "upstox" && record?.availability === "live" ? (
            <PrimaryButton href="/api/brokers/upstox/connect" className="w-full">Continue to Upstox</PrimaryButton>
          ) : (
            <PrimaryButton className="w-full" disabled={pending} onClick={() => void begin()}>
              {pending ? "Please wait…" : `Continue to ${name}`}
            </PrimaryButton>
          )}
          <Link href="/connect" className="text-center text-[14px] text-text-secondary">Go back</Link>
        </div>
      </Card>
    </OnboardingFrame>
  );
}

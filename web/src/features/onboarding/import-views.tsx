"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { OnboardingFrame } from "@/features/onboarding/start-view";
import { Card, PrimaryButton, SecondaryButton } from "@/components/ui/primitives";
import { useSession } from "@/store/session-store";
import type { ConnectionStatus } from "@/types/broker";

const steps = ["Verifying", "Fetching holdings", "Matching securities", "Checking overlaps"];

const stepOrder = ["verifying", "fetching", "normalizing", "reconciling"] as const;

export function CallbackView({ broker }: { broker: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const connectionId = params.get("connection");
  const expired = params.get("error") === "state";
  const loadBroker = useSession((state) => state.loadBroker);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);

  useEffect(() => {
    if (!connectionId) return;
    let stopped = false;
    async function poll() {
      const response = await fetch(`/api/connections/${connectionId}/status`, { credentials: "include" });
      if (!response.ok || stopped) return;
      const body = (await response.json()) as { data: ConnectionStatus };
      if (stopped) return;
      setStatus(body.data);
      if (body.data.state === "failed" || body.data.state === "expired") stopped = true;
      if (body.data.state === "synced") {
        loadBroker(body.data.displayName);
        router.push(`/import-summary?connection=${connectionId}`);
      }
    }
    void poll();
    const timer = window.setInterval(() => void poll(), 800);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [connectionId, loadBroker, router]);

  const failed = expired || status?.state === "failed";
  const activeIndex = status?.step ? stepOrder.indexOf(status.step) : status?.state === "synced" ? stepOrder.length : 0;

  return (
    <OnboardingFrame>
      <Card>
        {failed ? (
          <>
            <h1 className="text-[22px] font-bold">We couldn&apos;t complete the connection</h1>
            <p className="mt-2 text-[14px] text-text-secondary">{status?.error?.message ?? "This connection attempt expired. Please start again."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PrimaryButton href={`/connect/${broker}`}>Try again</PrimaryButton>
              <SecondaryButton href="/upload">Upload a statement instead</SecondaryButton>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-bold">Connecting</h1>
            <ul className="mt-4 space-y-3">
              {steps.map((step, stepIndex) => (
                <li key={step} className="flex items-center gap-2 text-[14px]">
                  {stepIndex < activeIndex || status?.state === "synced" ? <CheckCircle2 size={18} className="text-positive" /> : <LoaderCircle size={18} className="text-primary" />}
                  {step}
                </li>
              ))}
            </ul>
            <button type="button" className="mt-4 text-[14px] text-text-secondary" onClick={() => router.push("/connect")}>
              Cancel
            </button>
          </>
        )}
      </Card>
    </OnboardingFrame>
  );
}

export function UploadView() {
  const [passwordNote, setPasswordNote] = useState(false);

  return (
    <OnboardingFrame wide>
      <h1 className="text-[28px] font-bold">Upload statement</h1>
      <p className="mt-2 text-[14px] text-text-secondary">The file is read once. Only the normalized result is kept. A PDF password, if needed, is used in memory and never stored.</p>
      <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed border-primary bg-primary-tint text-center">
        <span className="font-semibold text-primary">Choose file</span>
        <span className="text-[13px] text-text-secondary">or drag and drop · CAS-like PDF or CSV</span>
        <input
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.name.toLowerCase().includes("protected")) setPasswordNote(true);
          }}
        />
      </label>
      <p className="mt-4 text-[14px] text-text-secondary">Statement parsing is not connected yet. Connect Zerodha or Upstox to import the holdings those brokers return.</p>
      <Link href="/connect" className="mt-3 inline-block text-[14px] font-semibold text-primary">Connect a broker</Link>
      {passwordNote ? (
        <label className="mt-4 block text-[13px]">
          Enter PDF password (used once, never stored)
          <input type="password" autoComplete="off" className="mt-1 h-11 w-full rounded-[12px] bg-surface-muted px-3" />
        </label>
      ) : null}
    </OnboardingFrame>
  );
}

export function ImportSummaryView() {
  return (
    <OnboardingFrame wide>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-positive-bg text-positive">
          <CheckCircle2 size={20} />
        </span>
        <div>
          <h1 className="text-[28px] font-bold">Holdings sync</h1>
          <p className="text-[13px] text-text-secondary">Saved from the broker you connected</p>
        </div>
      </div>
      <Card>
        <p className="text-[14px] leading-6">Zerodha and Upstox holdings are written to your account and shown on the dashboard. Statement upload does not create rows yet.</p>
      </Card>
      <div className="mt-4 flex gap-2">
        <Link href="/dashboard" className="inline-flex h-11 items-center rounded-[10px] bg-primary px-4 text-[15px] font-semibold text-white">
          View dashboard
        </Link>
        <Link href="/connect" className="inline-flex h-11 items-center rounded-[10px] border border-border bg-surface px-4 text-[15px] font-semibold">
          Connect a broker
        </Link>
      </div>
    </OnboardingFrame>
  );
}

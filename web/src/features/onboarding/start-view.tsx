"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUp, Link2, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { useSummary } from "@/lib/query/hooks";
import { useSession } from "@/store/session-store";
import { tx, useI18n } from "@/lib/i18n";

export function OnboardingFrame({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const hasSessionData = useSession((state) => state.hasData);
  const summary = useSummary();
  const hasLive = (summary.data?.summary.holdingCount ?? 0) > 0 || (summary.data?.coverage.includedCount ?? 0) > 0;
  const hasData = hasSessionData || hasLive;

  return (
    <div className="min-h-screen bg-canvas px-4 py-10">
      <div className={`mx-auto ${wide ? "max-w-4xl" : "max-w-[480px]"}`}>
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <LogoMark />
            DhanDrishti
          </Link>
          {hasData ? (
            <Link href="/dashboard" className="text-[14px] font-semibold text-primary">
              Dashboard
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function StartView() {
  const router = useRouter();
  const hasSessionData = useSession((state) => state.hasData);
  const loadSample = useSession((state) => state.loadSample);
  const summary = useSummary();
  const hasLive = (summary.data?.summary.holdingCount ?? 0) > 0 || (summary.data?.coverage.includedCount ?? 0) > 0;
  const hasData = hasSessionData || hasLive;
  const { language } = useI18n();

  function onExploreSample() {
    loadSample();
    router.push("/dashboard");
  }

  return (
    <OnboardingFrame wide>
      <h1 className="text-[28px] leading-9 font-bold">{hasData ? "Add more accounts" : "Bring your holdings together"}</h1>
      <p className="mt-2 text-[14px] text-text-secondary">Read-only. Nothing here places an order or moves money.</p>
      {hasData ? (
        <Link href="/dashboard" className="mt-4 block rounded-[12px] border border-border bg-surface px-4 py-3 text-[14px] font-medium text-primary hover:underline">
          &larr; Continue to dashboard
        </Link>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/connect" className="rounded-[14px] border border-border bg-surface p-5 hover:border-primary/50 transition-colors">
          <Link2 className="text-primary" />
          <h2 className="mt-3 text-[18px] font-semibold">Connect broker</h2>
          <p className="mt-1 text-[14px] text-text-secondary">Live Zerodha or Upstox holdings, read-only</p>
        </Link>
        <Link href="/upload" className="rounded-[14px] border border-border bg-surface p-5 hover:border-primary/50 transition-colors">
          <FileUp className="text-primary" />
          <h2 className="mt-3 text-[18px] font-semibold">Upload statement</h2>
          <p className="mt-1 text-[14px] text-text-secondary">CAS or CSV</p>
        </Link>
        <button
          type="button"
          onClick={onExploreSample}
          className="rounded-[14px] border border-border bg-surface p-5 text-left hover:border-primary/50 transition-colors cursor-pointer"
        >
          <Sparkles className="text-primary" />
          <h2 className="mt-3 text-[18px] font-semibold">
            {tx(language, {
              en: "Explore sample data",
              hi: "नमूना डेटा देखें",
            })}
          </h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            {tx(language, {
              en: "Try with pre-loaded demo portfolio",
              hi: "पूर्व-लोड किए गए नमूना पोर्टफोलियो को देखें",
            })}
          </p>
        </button>
      </div>
      <p className="mt-6 text-[13px] text-text-secondary">
        {tx(language, {
          en: "What stays private: we never see your broker password or OTP. CAS passwords are not stored.",
          hi: "निजी रहता है: हम आपका ब्रोकर पासवर्ड या OTP नहीं देखते। CAS पासवर्ड सहेजा नहीं जाता।",
        })}
      </p>
    </OnboardingFrame>
  );
}

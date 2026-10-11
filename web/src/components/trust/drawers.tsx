"use client";

import Link from "next/link";
import { Lock, X } from "lucide-react";
import { StatusBadge } from "@/components/data/badges";
import { SecondaryButton } from "@/components/ui/primitives";
import { tx, useI18n } from "@/lib/i18n";
import { useHolding } from "@/lib/query/hooks";
import type { Holding } from "@/types/domain";
import { initials } from "@/lib/utils";
import { useSession } from "@/store/session-store";
import { useUi } from "@/store/ui-store";

export function SourceDrawer() {
  const source = useUi((state) => state.source);
  const close = useUi((state) => state.closeSource);
  if (!source) return null;

  return (
    <Drawer title="Source" onClose={close}>
      <p className="text-[13px] text-text-secondary">{source.sourceLabel}</p>
      <p className="mt-3 text-[26px] leading-8 font-bold">{source.valueLabel}</p>
      <p className="mt-1 text-[13px] text-text-secondary">As of {source.asOf}</p>
      {source.note ? <p className="mt-4 text-[14px] leading-5 text-text-primary">{source.note}</p> : null}
      {source.href ? (
        <Link href={source.href} onClick={close} className="mt-4 inline-block text-[14px] font-semibold text-primary">
          {source.hrefLabel ?? "Open"}
        </Link>
      ) : null}
    </Drawer>
  );
}

export function EvidenceDrawer() {
  const isin = useUi((state) => state.evidenceIsin);
  const close = useUi((state) => state.closeEvidence);
  const { language } = useI18n();
  const markReviewed = useSession((state) => state.markReviewed);
  const reviewed = useSession((state) => state.reviewedIssueIds);
  const holdingQuery = useHolding(isin ?? "");

  if (!isin) return null;
  const holding = holdingQuery.data;
  const evidence = holding ? evidenceFromHolding(holding) : null;
  const loading = holdingQuery.isLoading;

  return (
    <Drawer title="Evidence" onClose={close} wide>
      {loading ? (
        <div className="skeleton h-40 rounded-[12px]" />
      ) : !evidence || !holding ? (
        <p className="text-[14px] text-text-secondary">
          {holding
            ? tx(language, {
                en: "No separate evidence panel for this holding. The quantity comes from the source on the row.",
                hi: "इस होल्डिंग के लिए अलग प्रमाण पैनल नहीं है। मात्रा पंक्ति के स्रोत से है।",
              })
            : "…"}
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={holding.name} />
              <div>
                <p className="font-semibold">{holding.name}</p>
                <p className="text-[13px] text-text-secondary">{holding.isin}</p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={holding.status} />
              <p className="mt-1 text-[12px] text-text-secondary">{evidence.countedUnits} units counted</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <LockedFact label={tx(language, evidence.left.label)} value={evidence.left.value} detail={evidence.left.detail} />
            <LockedFact label={tx(language, evidence.right.label)} value={evidence.right.value} detail={evidence.right.detail} />
          </div>
          <div className="flex items-center justify-between rounded-[12px] bg-surface-muted px-4 py-3">
            <span className="text-[14px] font-semibold">{tx(language, evidence.countedLabel)}</span>
            <span className="text-[15px] font-semibold">{evidence.countedUnits} units</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <EvidenceTable title="Source | Units" rows={evidence.left.rows} total={evidence.left.total} />
            <EvidenceTable title="Units | Source" rows={evidence.right.rows} total={evidence.right.total} flip />
          </div>
          <div className="rounded-[14px] border border-border p-4 text-[14px] leading-5">{tx(language, evidence.why)}</div>
          {evidence.canMarkChecked ? (
            <button
              type="button"
              onClick={() => markReviewed(holding.isin)}
              className="text-[14px] font-semibold text-primary"
            >
              {reviewed.includes(holding.isin) ? "Checked. The issue stays visible." : "I've checked this"}
            </button>
          ) : null}
        </div>
      )}
      <div className="mt-6">
        <SecondaryButton onClick={close} className="w-full">
          Done
        </SecondaryButton>
      </div>
    </Drawer>
  );
}

function evidenceFromHolding(holding: Holding) {
  const rows = holding.accounts.map((slice) => ({
    source: slice.label ?? slice.source.label,
    units: slice.quantity,
  }));
  return {
    countedUnits: holding.totalQuantity,
    countedLabel: { en: "Counted once across accounts", hi: "खातों में एक बार गिना गया" },
    left: {
      label: { en: "Broker accounts", hi: "ब्रोकर खाते" },
      value: `${holding.totalQuantity} units`,
      detail: "Each connected account is listed separately.",
      rows,
      total: holding.totalQuantity,
    },
    right: {
      label: { en: "Portfolio total", hi: "पोर्टफोलियो कुल" },
      value: `${holding.totalQuantity} units`,
      detail: "Pending units stay inside this holding.",
      rows,
      total: holding.totalQuantity,
    },
    why: {
      en: "Units from each broker account are added once. The same feed is not counted twice.",
      hi: "हर ब्रोकर खाते की इकाइयाँ एक बार जोड़ी जाती हैं। वही फ़ीड दो बार नहीं गिनी जाती।",
    },
    canMarkChecked: false,
  };
}

function Drawer({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#111827]/30" role="presentation" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={title}
        className={`h-full overflow-y-auto bg-surface p-5 shadow-none ${wide ? "w-full max-w-[560px]" : "w-full max-w-[400px]"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border border-border">
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function LockedFact({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[12px] bg-surface-muted p-4">
      <div className="flex items-center justify-between text-[13px] text-text-secondary">
        <span>{label}</span>
        <Lock size={14} />
      </div>
      <p className="mt-2 text-[26px] leading-8 font-bold">{value}</p>
      <span className="mt-2 inline-flex rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] text-text-secondary">{detail}</span>
    </div>
  );
}

function EvidenceTable({
  title,
  rows,
  total,
  flip = false,
}: {
  title: string;
  rows: { source: string; units: number }[];
  total: number;
  flip?: boolean;
}) {
  return (
    <div className="rounded-[12px] bg-surface-muted p-3.5">
      <p className="text-[12px] font-semibold tracking-wide text-text-secondary uppercase">{title}</p>
      <ul className="mt-2">
        {rows.map((row) => (
          <li key={row.source} className="flex items-center justify-between border-b border-border py-1.5 text-[13px] last:border-0">
            {flip ? (
              <>
                <span className="font-semibold">{row.units}</span>
                <span className="text-right text-text-secondary">{row.source}</span>
              </>
            ) : (
              <>
                <span className="text-text-secondary">{row.source}</span>
                <span className="font-semibold">{row.units}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-right text-[15px] font-semibold">{total}</p>
    </div>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-surface-muted font-semibold text-text-primary"
      style={{ width: size, height: size, fontSize: size > 40 ? 18 : 14 }}
    >
      {initials(name)}
    </span>
  );
}

export function DisclaimerFooter() {
  const { t } = useI18n();
  return (
    <p className="py-8 text-center text-[12px] leading-4 text-text-tertiary">
      <Link href="/trust" className="hover:text-text-secondary">
        {t("disclaimer")}
      </Link>
    </p>
  );
}

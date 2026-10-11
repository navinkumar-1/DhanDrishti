"use client";

import Link from "next/link";
import { useState } from "react";
import { IllustrativeBadge } from "@/components/data/badges";
import { Card, PageHeader, PrimaryButton, SecondaryButton } from "@/components/ui/primitives";
import { tx, useI18n } from "@/lib/i18n";
import { useConnections } from "@/lib/query/hooks";

export function ConnectionsView() {
  const { language } = useI18n();
  const query = useConnections();
  const [revealed, setRevealed] = useState(false);
  const [simulated, setSimulated] = useState(false);
  if (!query.data) return <div className="skeleton h-80 rounded-[14px]" />;
  const { edges, event } = query.data;
  if (edges.length === 0) {
    return (
      <div>
        <PageHeader title="Hidden Connections" subtitle="Which of your investments depend on the same company?" action={<Link href="/connections/learn" className="text-[14px] font-semibold text-primary">Learn view</Link>} />
        <Card>
          <p className="text-[14px] leading-6">Connected broker holdings do not include disclosed relationships between issuers. This view stays empty until that reference data is linked to your ISINs.</p>
          <Link href="/connections/learn" className="mt-3 inline-block text-[14px] font-semibold text-primary">See the reference example</Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Hidden Connections" subtitle="Which of your investments depend on the same company?" action={<Link href="/connections/learn" className="text-[14px] font-semibold text-primary">Learn view</Link>} />
      {!revealed ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {edges.map((edge) => (
              <Card key={edge.id}>
                <p className="font-semibold">{edge.holdingName}</p>
                <p className="text-[13px] text-text-secondary">{edge.accountLabel}</p>
              </Card>
            ))}
          </div>
          <PrimaryButton className="mt-4" onClick={() => setRevealed(true)}>
            Reveal hidden connections
          </PrimaryButton>
        </>
      ) : (
        <>
          <Card>
            <Graph language={language} verbs={edges.map((edge) => tx(language, edge.verb))} />
          </Card>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {edges.map((edge) => (
              <Card key={edge.id}>
                <p className="text-[13px] text-text-secondary">{tx(language, edge.verb)}</p>
                <p className="font-semibold">{edge.holdingName}</p>
                <p className="text-[13px] text-text-secondary">{edge.accountLabel}</p>
                {edge.disclosed ? <p className="mt-2 text-[14px]">{tx(language, edge.disclosed)}</p> : null}
                {edge.caution ? <p className="mt-2 rounded-[12px] bg-warning-bg p-3 text-[13px] text-warning">{tx(language, edge.caution)}</p> : null}
                <p className="mt-2 text-[12px] text-text-tertiary">{edge.sourceDocument} · {edge.disclosureDate}</p>
                <Link href={`/follow-money/${edge.holdingIsin}`} className="mt-2 inline-block text-[14px] font-semibold text-primary">
                  Show the connection
                </Link>
              </Card>
            ))}
          </div>
          <PrimaryButton className="mt-4" onClick={() => setSimulated(true)}>
            See simulated announcement
          </PrimaryButton>
        </>
      )}

      {simulated && event ? (
        <Card className="mt-4">
          <div className="flex items-center gap-2">
            <IllustrativeBadge />
            <span className="text-[12px] font-semibold text-text-secondary">Simulated</span>
          </div>
          <p className="mt-3 text-[16px] font-semibold">{tx(language, event.title)}</p>
          <ul className="mt-4 space-y-3">
            {event.impacts.map((impact) => (
              <li key={impact.isin} className="flex items-start justify-between gap-3 rounded-[12px] bg-surface-muted p-3">
                <span>
                  <span className="block font-semibold">{impact.holdingName}</span>
                  <span className="text-[14px]">{tx(language, impact.explanation)}</span>
                </span>
                <Level level={impact.level} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-text-tertiary">No predicted loss is shown. A connection is not a forecast.</p>
        </Card>
      ) : null}
    </div>
  );
}

function Level({ level }: { level: "confirmed" | "relevant" | "connected" }) {
  if (level === "confirmed") return <span className="rounded-full bg-positive px-2 py-1 text-[12px] font-semibold text-white">Confirmed</span>;
  if (level === "relevant") return <span className="rounded-full bg-single-bg px-2 py-1 text-[12px] font-semibold text-single">Relevant</span>;
  return <span className="rounded-full border border-dashed border-single bg-single-bg px-2 py-1 text-[12px] font-semibold text-single">Connected</span>;
}

function Graph({ verbs }: { language: string; verbs: string[] }) {
  return (
    <svg viewBox="0 0 640 280" className="h-auto w-full">
      <line x1="320" y1="140" x2="110" y2="56" stroke="#1A6DFF" strokeWidth="2" className="origin-center animate-[dash_600ms_ease]" />
      <line x1="320" y1="140" x2="530" y2="56" stroke="#1A6DFF" strokeWidth="2" />
      <line x1="320" y1="140" x2="110" y2="224" stroke="#1A6DFF" strokeWidth="2" />
      <line x1="320" y1="140" x2="530" y2="224" stroke="#1A6DFF" strokeWidth="2" />
      <circle cx="320" cy="140" r="46" fill="#1A6DFF" />
      <text x="320" y="136" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">Aster</text>
      <text x="320" y="154" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">Industries</text>
      {[
        [110, 56, verbs[0]],
        [530, 56, verbs[1]],
        [110, 224, verbs[2]],
        [530, 224, verbs[3]],
      ].map(([x, y, label]) => (
        <g key={String(label)}>
          <rect x={Number(x) - 78} y={Number(y) - 18} width="156" height="36" rx="12" fill="white" stroke="#E8EBF0" />
          <text x={Number(x)} y={Number(y) + 4} textAnchor="middle" fontSize="11" fill="#6B7280">{label}</text>
        </g>
      ))}
    </svg>
  );
}

export function ConnectionsLearnView() {
  return (
    <div>
      <PageHeader title="Connections, as a reference" subtitle="Reference example, not your holdings" action={<SecondaryButton>Reference example</SecondaryButton>} />
      <Card>
        <p className="inline-flex rounded-full bg-illustrative-bg px-2.5 py-1 text-[12px] font-semibold text-illustrative">Reference example, not your holdings</p>
        <p className="mt-3 text-[14px] leading-6">
          A company can show up as a share you own, a bond you lent against, a tenant in a REIT, or a customer of an InvIT. Those are different rights. The sample graph uses Aster Industries so the pattern is visible even if you only hold shares.
        </p>
        <div className="mt-4 flex gap-3 text-[14px] font-semibold text-primary">
          <Link href="/learn/reit">REIT</Link>
          <Link href="/learn/invit">InvIT</Link>
          <Link href="/learn/bond">Bond</Link>
        </div>
      </Card>
    </div>
  );
}

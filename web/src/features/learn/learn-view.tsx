"use client";

import Link from "next/link";
import { useState } from "react";
import { IllustrativeBadge } from "@/components/data/badges";
import { Card, PageHeader } from "@/components/ui/primitives";
import { compareRows, education, lessons } from "@/fixtures/sample";
import { tx, useI18n } from "@/lib/i18n";
import type { EducationTopic } from "@/types/domain";

export function LearnHome() {
  const { language, setLanguage } = useI18n();
  return (
    <div>
      <PageHeader
        title="Learn"
        action={
          <button type="button" onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="rounded-full border border-border px-3 py-1.5 text-[13px]">
            {language === "en" ? "EN" : "हिं"}
          </button>
        }
      />
      <div className="rounded-[14px] bg-primary p-5 text-white">
        <p className="text-[18px] font-bold">Most valued holdings are equity</p>
        <p className="mt-1 text-[14px] text-white/85">See how REITs, InvITs and bonds work</p>
        <Link href="/learn/reit" className="mt-4 inline-flex h-11 items-center rounded-[10px] bg-white px-4 font-semibold text-primary">
          Start
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {education.map((topic) => (
          <Link key={topic.type} href={`/learn/${topic.type}`} className="rounded-[14px] border border-border bg-surface p-5">
            <h2 className="text-[18px] font-semibold">{tx(language, topic.name)}</h2>
            <p className="mt-1 text-[14px] text-text-secondary">{tx(language, topic.summary)}</p>
          </Link>
        ))}
      </div>
      <div className="mt-4 grid gap-2 text-[14px] font-semibold text-primary">
        <Link href="/learn/compare">Compare side by side</Link>
        <Link href="/lab/lessons/bond-yield">Try a guided simulation</Link>
        <Link href="/lab">What if? lab</Link>
      </div>
    </div>
  );
}

export function ExplainerView({ type }: { type: string }) {
  const { language } = useI18n();
  const topic = education.find((item) => item.type === type);
  const [price, setPrice] = useState(1000);
  if (!topic) return <Card>This explainer is not in the reviewed set.</Card>;
  const yieldDirection = price > 1000 ? "Yield falls when price rises" : price < 1000 ? "Yield rises when price falls" : "At face value, coupon and a simple yield can match";

  return (
    <div>
      <PageHeader title={tx(language, topic.name)} subtitle={tx(language, topic.summary)} />
      {topic.prompt ? <Card className="mb-4 text-[14px]">{tx(language, topic.prompt)}</Card> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">How returns arise</h2>
          <p className="mt-2 text-[14px] leading-6">{tx(language, topic.returns)}</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Benefits and risks</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <ul className="text-[14px] leading-6">{topic.benefits.map((item) => <li key={item.en}>{tx(language, item)}</li>)}</ul>
            <ul className="text-[14px] leading-6">{topic.risks.map((item) => <li key={item.en}>{tx(language, item)}</li>)}</ul>
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <h2 className="font-semibold">Liquidity</h2>
        <p className="mt-2 text-[14px]">{tx(language, topic.liquidity)}</p>
      </Card>
      <Card className="mt-4">
        <h2 className="font-semibold">What to inspect</h2>
        <table className="mt-2 w-full text-left text-[14px]">
          <tbody>
            {topic.inspect.map((row) => (
              <tr key={row.label.en} className="border-t border-border">
                <th className="py-2 pr-3 font-semibold">{tx(language, row.label)}</th>
                <td className="py-2 text-text-secondary">{tx(language, row.detail)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[12px] text-text-tertiary">View source · reviewed {topic.source.date} · {topic.source.name}</p>
      </Card>
      {topic.type === "bond" ? (
        <Card className="mt-4">
          <div className="flex items-center gap-2">
            <IllustrativeBadge />
            <h2 className="font-semibold">If the price of a fixed-coupon bond rises, what happens to its yield?</h2>
          </div>
          <input className="mt-4 w-full accent-primary" type="range" min={800} max={1200} value={price} onChange={(event) => setPrice(Number(event.target.value))} />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Tile label="Coupon" value="₹85 (fixed)" />
            <Tile label="Price" value={`₹${price.toLocaleString("en-IN")}`} />
            <Tile label="Yield direction" value={yieldDirection} />
          </div>
          <p className="mt-3 text-[13px] text-text-secondary">Coupon rate and yield to maturity are different concepts. This slider does not price a real bond.</p>
        </Card>
      ) : null}
      <Link href={`/assistant?q=${encodeURIComponent(`Explain this ${topic.type}`)}`} className="mt-4 inline-block font-semibold text-primary">
        Ask about this
      </Link>
    </div>
  );
}

export function CompareView() {
  const { language } = useI18n();
  const [note, setNote] = useState<string | null>(null);
  const columns = ["stock", "reit", "invit", "bond"] as const;
  return (
    <div>
      <PageHeader title="Compare" subtitle="Benefits and risks stay together. Nothing here is a recommendation." />
      <div className="overflow-x-auto rounded-[14px] border border-border bg-surface">
        <table className="min-w-[760px] w-full text-left text-[14px]">
          <thead className="bg-surface-muted text-[13px] text-text-secondary">
            <tr>
              <th className="px-4 py-3" />
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold capitalize">{column === "stock" ? "Stock" : column.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row) => (
              <tr key={row.topic.en} className="border-t border-border">
                <th className="px-4 py-3 font-semibold">{tx(language, row.topic)}</th>
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3">
                    <button type="button" className="text-left" onClick={() => setNote(tx(language, row.cells[column]))}>
                      {tx(language, row.cells[column])}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note ? <p className="mt-3 text-[14px] text-text-secondary">{note}</p> : null}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-surface-muted p-3">
      <p className="text-[12px] text-text-secondary">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

export function lessonList() {
  return lessons;
}

export type { EducationTopic };

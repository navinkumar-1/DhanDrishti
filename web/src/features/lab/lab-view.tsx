"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IllustrativeBadge } from "@/components/data/badges";
import { Card, PageHeader, PrimaryButton } from "@/components/ui/primitives";
import { formatInr } from "@/lib/format";
import { tx, useI18n } from "@/lib/i18n";
import { useLab } from "@/lib/query/hooks";
import { lessons } from "@/fixtures/sample";
import type { ScenarioId } from "@/lib/lab/engine";

const scenarios: { id: ScenarioId; label: string }[] = [
  { id: "equity_fall", label: "Equity fall" },
  { id: "yield_rise", label: "Yield rise" },
  { id: "distribution_cut", label: "Distribution cut" },
  { id: "payment_delay", label: "Payment delay" },
  { id: "early_exit", label: "Earlier exit" },
];

export function LabHome() {
  const [amount, setAmount] = useState(10000);
  return (
    <div>
      <PageHeader title="What if? lab" subtitle="Nothing here is real investing" action={<IllustrativeBadge />} />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/lab?mode=portfolio" className="rounded-[14px] border border-border bg-surface p-5">
          <h2 className="text-[18px] font-semibold">Copy my imported portfolio</h2>
          <p className="mt-1 text-[14px] text-text-secondary">Uses the valued total from your connected brokers. No order is created.</p>
        </Link>
        <Link href={`/lab?mode=virtual&amount=${amount}`} className="rounded-[14px] border border-border bg-surface p-5">
          <h2 className="text-[18px] font-semibold">Start with a virtual amount</h2>
          <p className="mt-2 text-[26px] font-bold">{formatInr(amount)}</p>
        </Link>
      </div>
      <label className="mt-4 block text-[13px] text-text-secondary">
        Virtual amount
        <input className="mt-1 h-11 w-full max-w-xs rounded-[12px] bg-surface px-3 text-[16px] font-semibold" inputMode="numeric" value={amount} onChange={(event) => setAmount(Number(event.target.value.replace(/[^\d]/g, "")) || 0)} />
      </label>
      <h2 className="mt-6 text-[18px] font-semibold">Guided simulations</h2>
      <div className="mt-3 grid gap-3">
        {lessons.map((lesson) => (
          <Link key={lesson.id} href={`/lab/lessons/${lesson.id}`} className="rounded-[14px] border border-border bg-surface p-4">
            <IllustrativeBadge />
            <p className="mt-2 font-semibold">{lesson.title.en}</p>
            <p className="text-[13px] text-text-secondary">You will learn: {lesson.learn.en}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LabWorkspace({ mode, initialAmount }: { mode: "portfolio" | "virtual"; initialAmount: number }) {
  const { language } = useI18n();
  const [scenario, setScenario] = useState<ScenarioId>("equity_fall");
  const [percent, setPercent] = useState(10);
  const [amount, setAmount] = useState(initialAmount);
  const input = useMemo(
    () => ({ mode, virtualAmount: amount, scenario, percent, language }),
    [amount, language, mode, percent, scenario],
  );
  const result = useLab(input);

  return (
    <div>
      <PageHeader title={mode === "portfolio" ? "Imported portfolio, virtual only" : "Virtual allocation"} subtitle="Illustrative. No buy or sell." action={<IllustrativeBadge />} />
      {mode === "virtual" ? (
        <Card>
          <label className="text-[13px] text-text-secondary">
            Virtual amount
            <input className="mt-1 block h-11 w-40 rounded-[12px] bg-surface-muted px-3 text-[20px] font-bold" value={amount} onChange={(event) => setAmount(Number(event.target.value) || 0)} />
          </label>
        </Card>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {scenarios.map((item) => (
          <button key={item.id} type="button" onClick={() => setScenario(item.id)} className={`h-9 rounded-full px-3 text-[13px] ${scenario === item.id ? "bg-primary text-white" : "bg-surface text-text-secondary"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <Card className="mt-4">
        <div className="flex items-center gap-3">
          <button type="button" className="grid h-7 w-7 place-items-center rounded-lg border border-border" onClick={() => setPercent((value) => Math.max(0, value - 1))}>−</button>
          <span className="text-[20px] font-bold">{percent} %</span>
          <button type="button" className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-white" onClick={() => setPercent((value) => Math.min(100, value + 1))}>+</button>
        </div>
      </Card>
      {result.data ? (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Card>
              <p className="text-[13px] text-text-secondary">Original</p>
              <p className="text-[26px] font-bold">{formatInr(result.data.originalValue)}</p>
            </Card>
            <Card>
              <p className="text-[13px] text-text-secondary">Under these assumptions</p>
              <p className="text-[26px] font-bold">{formatInr(result.data.scenarioValue)}</p>
              <p className="text-[13px] text-text-secondary">Cash in the illustration {formatInr(result.data.cashReceived)} · Combined {formatInr(result.data.combinedEnding)}</p>
            </Card>
          </div>
          <Card className="mt-4">
            <p className="text-[14px] leading-6">{tx(language, result.data.explanation)}</p>
            <h3 className="mt-3 font-semibold">Assumptions and what is excluded</h3>
            <ul className="mt-2 list-disc pl-5 text-[14px]">
              {result.data.assumptions.map((item) => (
                <li key={item.en}>{tx(language, item)}</li>
              ))}
            </ul>
          </Card>
        </>
      ) : (
        <div className="skeleton mt-4 h-32 rounded-[14px]" />
      )}
    </div>
  );
}

export function LessonView({ lessonId }: { lessonId: string }) {
  const { language } = useI18n();
  const lesson = lessons.find((item) => item.id === lessonId);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  if (!lesson) return <Card>This lesson is not in the set.</Card>;

  return (
    <div>
      <PageHeader title={tx(language, lesson.title)} subtitle={tx(language, lesson.learn)} action={<IllustrativeBadge />} />
      <Card>
        <p className="text-[13px] text-text-secondary">Worked example</p>
        <ul className="mt-2 space-y-1 text-[15px]">
          <li>Starting value <strong>{formatInr(lesson.start)}</strong></li>
          <li>Ending market value <strong>{formatInr(lesson.endingMarket)}</strong></li>
          <li>Distributions received <strong>{formatInr(lesson.distributions)}</strong></li>
          <li>Combined ending value <strong>{formatInr(lesson.combined)}</strong></li>
        </ul>
        <p className="mt-3 font-semibold">{tx(language, lesson.teaching)}</p>
        <p className="mt-1 text-[13px] text-text-secondary">{tx(language, lesson.note)}</p>
      </Card>
      <Card className="mt-4">
        <h2 className="font-semibold">Check your understanding</h2>
        <p className="mt-1 text-[14px]">Explain the result in your own words.</p>
        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} className="mt-3 min-h-24 w-full rounded-[12px] bg-surface-muted p-3 text-[14px]" />
        <PrimaryButton
          className="mt-3"
          onClick={() => {
            const text = answer.toLowerCase();
            if (text.includes("profit") || text.includes("gain") || text.includes("लाभ")) {
              setFeedback(`${tx(language, lesson.teaching)} Combined ending value is ${formatInr(lesson.combined)}, while ending market value is ${formatInr(lesson.endingMarket)}.`);
            } else if (answer.trim().length < 8) {
              setFeedback("Add a sentence about the market value and the cash.");
            } else {
              setFeedback("This check only looks at the lesson. It does not judge a real portfolio.");
            }
          }}
        >
          Submit
        </PrimaryButton>
        {feedback ? <p className="mt-3 text-[14px]">{feedback}</p> : null}
      </Card>
      <Link href="/lab?mode=virtual&amount=10000" className="mt-4 inline-block font-semibold text-primary">
        Open in What-if lab
      </Link>
    </div>
  );
}

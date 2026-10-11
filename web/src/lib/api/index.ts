import {
  accountById,
  accounts,
  assistantReplies,
  cashflows,
  concentration,
  connectionEdges,
  coverage,
  education,
  evidenceByIsin,
  followMoney,
  holdingByIsin,
  holdings,
  issues,
  lessons,
  risks,
  simulatedAnnouncement,
  summary,
  totalSource,
  uploadPreview,
} from "@/fixtures/sample";
import { runScenario, type LabInput } from "@/lib/lab/engine";
import type { Lang } from "@/types/domain";
import type { BrokerInfo } from "@/types/broker";

const dataMode = process.env.NEXT_PUBLIC_DATA_MODE ?? "fixtures";

function ready<T>(data: T): Promise<T> {
  if (dataMode !== "fixtures") {
    return Promise.reject(new Error("API mode is not connected yet. Set NEXT_PUBLIC_DATA_MODE=fixtures."));
  }
  return Promise.resolve(data);
}

export const api = {
  summary: () => ready({ summary, coverage, totalSource }),
  holdings: () => ready(holdings),
  holding: (isin: string) => ready(holdingByIsin(isin) ?? null),
  accounts: () => ready(accounts),
  account: (id: string) => ready(accountById(id) ?? null),
  coverage: () => ready(coverage),
  issues: () => ready(issues),
  evidence: (isin: string) => ready(evidenceByIsin[isin] ?? null),
  concentration: (view: "company" | "sector" | "assetClass" | "account") => ready(concentration[view]),
  connections: () => ready({ edges: connectionEdges, event: simulatedAnnouncement }),
  followMoney: (isin: string) => ready(followMoney[isin] ?? null),
  education: () => ready(education),
  educationTopic: (type: string) => ready(education.find((topic) => topic.type === type) ?? null),
  lessons: () => ready(lessons),
  lesson: (id: string) => ready(lessons.find((lesson) => lesson.id === id) ?? null),
  risks: () => ready(risks),
  cashflows: () => ready(cashflows),
  brokers: async () => {
    const response = await fetch("/api/brokers", { credentials: "include" });
    if (!response.ok) throw new Error("Could not load brokers");
    const body = (await response.json()) as { data: BrokerInfo[] };
    return body.data;
  },
  uploadPreview: () => ready(uploadPreview),
  runLab: (input: LabInput) => ready(runScenario(input)),
  ask: (question: string, language: Lang) => ready(matchReply(question, language)),
};

function matchReply(question: string, language: Lang) {
  const text = question.toLowerCase();
  if (text.includes("concentrat") || text.includes("banking") || text.includes("केंद्र") || text.includes("बैंकिंग")) {
    return assistantReplies.concentration;
  }
  if (text.includes("bond") || text.includes("coupon") || text.includes("बॉन्ड") || text.includes("कूपन")) {
    return assistantReplies.bond;
  }
  if (text.includes("reit") || text.includes("which of my accounts")) {
    return assistantReplies.reit;
  }
  if (text.includes("invit") || text.includes("go wrong")) {
    return assistantReplies.invit;
  }
  return language === "hi" || language === "en" ? assistantReplies.unknown : assistantReplies.unknown;
}

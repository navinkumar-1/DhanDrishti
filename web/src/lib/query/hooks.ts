"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  readAccounts,
  readCashflows,
  readConcentration,
  readHolding,
  readHoldings,
  readIssues,
  readRisks,
  readSummary,
} from "@/lib/firebase/live-portfolio";
import { runScenario, type LabInput } from "@/lib/lab/engine";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/providers/auth-provider";
import { useSession } from "@/store/session-store";
import type { CashflowItem, ConnectionEdge, Copy, Holding, ImpactRow, Lang } from "@/types/domain";

function useUid() {
  const { user } = useAuth();
  return user?.uid ?? null;
}

export function useSummary() {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.summary, uid, source],
    queryFn: () => (source === "sample" ? api.summary() : readSummary(uid!)),
    enabled: Boolean(uid) || source === "sample",
  });
}

export function useHoldings() {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.holdings, uid, source],
    queryFn: () => (source === "sample" ? api.holdings() : readHoldings(uid!)),
    enabled: Boolean(uid) || source === "sample",
  });
}

export function useHolding(isin: string) {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.holding(isin), uid, source],
    queryFn: () => (source === "sample" ? api.holding(isin) : readHolding(uid!, isin)),
    enabled: (Boolean(uid) || source === "sample") && Boolean(isin),
  });
}

export function useAccounts() {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.accounts, uid, source],
    queryFn: () => (source === "sample" ? api.accounts() : readAccounts(uid!)),
    enabled: Boolean(uid) || source === "sample",
  });
}

export function useIssues() {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.issues, uid, source],
    queryFn: () => (source === "sample" ? api.issues() : readIssues(uid!)),
    enabled: Boolean(uid) || source === "sample",
  });
}

export function useConcentration(view: "company" | "sector" | "assetClass" | "account") {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.concentration(view), uid, source],
    queryFn: () => (source === "sample" ? api.concentration(view) : readConcentration(uid!, view)),
    enabled: Boolean(uid) || source === "sample",
  });
}

export function useConnections() {
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.connections, source],
    queryFn: async (): Promise<{ edges: ConnectionEdge[]; event: { title: Copy; impacts: ImpactRow[] } }> => {
      if (source === "sample") {
        return api.connections();
      }
      return {
        edges: [],
        event: {
          title: {
            en: "No issuer relationship has been disclosed for these holdings.",
            hi: "इन होल्डिंग्स के लिए कोई जारीकर्ता संबंध घोषित नहीं है।",
          },
          impacts: [],
        },
      };
    },
  });
}

export function useEducation() {
  return useQuery({ queryKey: qk.education, queryFn: () => api.education() });
}

export function useRisks() {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.risks, uid, source],
    queryFn: () => (source === "sample" ? api.risks() : readRisks(uid!)),
    enabled: Boolean(uid) || source === "sample",
  });
}

export function useCashflows() {
  const uid = useUid();
  const source = useSession((state) => state.source);
  return useQuery({
    queryKey: [...qk.cashflows, uid, source],
    queryFn: () => (source === "sample" ? api.cashflows() : readCashflows(uid!)),
    enabled: Boolean(uid) || source === "sample",
  });
}

export function useBrokers() {
  return useQuery({ queryKey: qk.brokers, queryFn: () => api.brokers() });
}

export function useLab(input: LabInput, enabled = true) {
  const holdings = useHoldings();
  const portfolio = mixFrom(holdings.data);
  return useQuery({
    queryKey: ["lab", input, portfolio],
    queryFn: () => runScenario({ ...input, portfolio }),
    enabled: enabled && holdings.isSuccess,
  });
}

export function useAsk(question: string, language: Lang, enabled: boolean) {
  return useQuery({
    queryKey: ["ask", question, language],
    queryFn: () => api.ask(question, language),
    enabled,
  });
}

function mixFrom(holdings: Holding[] | undefined) {
  const valued = (holdings ?? []).filter((holding) => holding.value !== undefined);
  const total = valued.reduce((sum, holding) => sum + (holding.value ?? 0), 0);
  const equity = valued
    .filter((holding) => holding.assetClass === "equity" || holding.assetClass === "etf")
    .reduce((sum, holding) => sum + (holding.value ?? 0), 0);
  const bond = valued.filter((holding) => holding.assetClass === "bond").reduce((sum, holding) => sum + (holding.value ?? 0), 0);
  return { total, equity, bond, distributions: 0 };
}

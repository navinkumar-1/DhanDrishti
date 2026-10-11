export type Lang = "en" | "hi";

export type Copy = { en: string; hi: string };

export type AssetClass =
  | "equity"
  | "etf"
  | "mutual_fund"
  | "reit"
  | "invit"
  | "bond"
  | "unknown";

export type ReconStatus =
  | "matched"
  | "single_source"
  | "pending_settlement"
  | "needs_review";

export type AccountState = "fresh" | "aging" | "stale" | "not_connected" | "error";

export type SourceType = "broker_api" | "statement" | "sample" | "manual";

export type CashflowStatus =
  | "scheduled"
  | "announced"
  | "estimated"
  | "confirmed_received";

export type IssueType =
  | "mismatch"
  | "unrecognized"
  | "missing_price"
  | "pending_settlement";

export type BrokerAccess = "live" | "mock" | "requires_partner_access";

export interface SourceRef {
  sourceId: string;
  type: SourceType;
  label: string;
  asOf: string;
  note?: string;
}

export interface AccountSlice {
  accountId: string;
  label?: string;
  maskedId?: string;
  quantity: number;
  pending?: number;
  value?: number;
  source: SourceRef;
}

export interface Price {
  value: number;
  currency: "INR";
  priceDate: string;
  source: SourceRef;
}

export interface TimelinePoint {
  date: string;
  units: number;
  label: string;
}

export interface Holding {
  isin: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  issuer: string;
  totalQuantity: number;
  pendingQuantity: number;
  accounts: AccountSlice[];
  price?: Price;
  /** Rupees. Absent when the holding cannot be valued. */
  value?: number;
  /** Engine-rounded share of imported valued portfolio. */
  share?: number;
  status: ReconStatus;
  unvaluedReason?: Copy;
  costBasisNote: Copy;
  timeline: TimelinePoint[];
}

export interface Account {
  id: string;
  label: string;
  kind: string;
  depository?: "CDSL" | "NSDL";
  maskedId: string;
  sourceType: SourceType;
  sourceLabel: string;
  broker?: string;
  lastUpdated?: string;
  state: AccountState;
  holdingCount: number;
  /** Precomputed valued holdings that sit in this account only. */
  valuedHoldings?: number;
  missing?: boolean;
}

export interface Coverage {
  includedCount: number;
  missingCount: number;
  headline: Copy;
  oldestAsOf: string;
  missingLabel: Copy;
}

export interface Snapshot {
  date: string;
  value: number;
  label: string;
}

export interface AssetClassSlice {
  assetClass: AssetClass;
  holdings: number;
  value: number;
  share: number;
}

export interface PortfolioSummary {
  totalValue: number;
  valuedCount: number;
  holdingCount: number;
  unvaluedCount: number;
  asOf: string;
  snapshots: Snapshot[];
  assetClasses: AssetClassSlice[];
  bankingShare: number;
  bankingThreshold: number;
  openIssues: number;
  issueLine: Copy;
}

export interface EvidenceSide {
  label: Copy;
  value: string;
  detail: string;
  rows: { source: string; units: number }[];
  total: number;
}

export interface Evidence {
  isin: string;
  countedLabel: Copy;
  countedUnits: number;
  left: EvidenceSide;
  right: EvidenceSide;
  why: Copy;
  canMarkChecked: boolean;
}

export interface Issue {
  id: string;
  isin?: string;
  name: string;
  type: IssueType;
  status?: ReconStatus;
  sourcesLine: string;
  explanation: Copy;
}

export interface ConcentrationRow {
  id: string;
  name: string;
  value: number;
  share: number;
  lookThroughUnavailable?: boolean;
  unclassified?: boolean;
  holdingIsins: string[];
}

export interface ConnectionEdge {
  id: string;
  holdingIsin: string;
  holdingName: string;
  accountLabel: string;
  verb: Copy;
  disclosed?: Copy;
  sourceDocument: string;
  disclosureDate: string;
  caution?: Copy;
}

export interface ImpactRow {
  holdingName: string;
  isin: string;
  level: "confirmed" | "relevant" | "connected";
  explanation: Copy;
}

export interface FollowMoney {
  isin: string;
  structure: Copy[];
  cashflows: { label: Copy; status: CashflowStatus; amount?: number }[];
  documents: { name: string; date: string }[];
}

export interface CashflowItem {
  id: string;
  date: string;
  name: string;
  accountId: string;
  amount: number;
  status: CashflowStatus;
  kind: "interest" | "dividend" | "distribution" | "repayment";
}

export interface Broker {
  id: string;
  name: string;
  access: BrokerAccess;
  connection: "not_connected" | "connected" | "expired";
  note?: Copy;
}

export interface EducationTopic {
  type: "reit" | "invit" | "bond" | "stock";
  name: Copy;
  summary: Copy;
  returns: Copy;
  benefits: Copy[];
  risks: Copy[];
  liquidity: Copy;
  inspect: { label: Copy; detail: Copy }[];
  source: { name: string; date: string };
  prompt?: Copy;
}

export interface Lesson {
  id: string;
  title: Copy;
  learn: Copy;
  variableLabel: Copy;
  start: number;
  endingMarket: number;
  distributions: number;
  combined: number;
  teaching: Copy;
  note: Copy;
}

export interface RiskCard {
  id: string;
  title: Copy;
  observation: Copy;
  level: Copy;
  threshold: Copy;
  href: string;
  source: string;
  asOf: string;
}

export interface AssistantReply {
  text: Copy;
  sources: string[];
}

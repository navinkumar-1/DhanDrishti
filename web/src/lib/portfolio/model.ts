import type {
  Account,
  AssetClass,
  ConcentrationRow,
  Coverage,
  Holding,
  Issue,
  PortfolioSummary,
  RiskCard,
  SourceRef,
} from "@/types/domain";

const ISIN = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
export const SCHEMA_VERSION = 1;

export type LiveBrokerId = "zerodha" | "upstox";
export type AccountKind = "demat" | "mf_folio";

export interface LivePosition {
  brokerId: LiveBrokerId;
  accountKind: AccountKind;
  isin: string | null;
  symbol: string | null;
  name: string;
  assetType: AssetClass;
  settledQty: number;
  pendingQty: number;
  lastPriceRupees: number | null;
  averagePriceRupees: number | null;
}

export interface BrokerBook {
  brokerId: LiveBrokerId;
  brokerName: string;
  /** null means this book was not fetched, so existing rows stay. */
  demat: LivePosition[] | null;
  mutualFunds: LivePosition[] | null;
}

export interface StoredAccountSlice {
  accountId: string;
  label: string;
  brokerName: string;
  depository: null;
  maskedAccountId: string;
  settledQty: number;
  pendingQty: number;
  asOfDate: string;
  authoritativeSourceId: string;
  avgPricePaise: number | null;
}

export interface StoredEvidence {
  sourceId: string;
  sourceType: "broker_api";
  accountId: string;
  quantity: number;
  settlement: "settled" | "pending";
  asOfDate: string;
  isAuthoritative: true;
  verification: "verified";
}

export interface StoredHolding {
  isin: string;
  name: string;
  assetType: AssetClass;
  assetSubType: null;
  sector: string;
  issuerEntityId: null;
  issuerName: string;
  totalQty: number;
  settledQty: number;
  pendingQty: number;
  accounts: StoredAccountSlice[];
  pricePaise: number | null;
  priceDate: string | null;
  priceSource: string | null;
  valuePaise: number | null;
  valuationStatus: "valued" | "unpriced";
  weightBps: number | null;
  costStatus: "available" | "incomplete" | "unavailable";
  avgCostPaise: number | null;
  investedPaise: number | null;
  reconStatus: "matched" | "single_source" | "pending_settlement" | "needs_review";
  openIssueIds: string[];
  evidence: StoredEvidence[];
  corporateActionNote: null;
  lookThroughStatus: "unavailable";
  isSample: false;
  computeVersion: 1;
  schemaVersion: 1;
}

export interface StoredAccount {
  accountType: AccountKind;
  brokerId: LiveBrokerId;
  brokerName: string;
  depository: null;
  maskedAccountId: string;
  label: string;
  status: "active";
  connectionId: string;
  sourceTypes: ["broker_api"];
  latestAsOfDate: string;
  holdingsCount: number;
  valuePaise: number;
  isSample: false;
  schemaVersion: 1;
}

export interface StoredSummary {
  computeState: { status: "idle" };
  totals: {
    valuedPaise: number;
    valuedCount: number;
    excludedCount: number;
    excludedReasons: { unpriced: number; stale: number; notValuable: number };
  };
  asOf: { oldestPriceDate: string | null; newestPriceDate: string | null };
  assetClassSplit: { assetType: AssetClass; valuePaise: number; bps: number; count: number }[];
  accounts: {
    accountId: string;
    label: string;
    brokerName: string;
    depository: null;
    maskedAccountId: string;
    status: "active";
    latestAsOfDate: string;
    valuePaise: number;
    holdingsCount: number;
  }[];
  coverage: {
    connectedCount: number;
    staleAccountIds: string[];
    knownMissing: [];
    notConnectedBrokers: string[];
    brokerNames: string[];
  };
  issues: { openCount: number; needsReviewCount: number; unrecognizedCount: number; missingPriceCount: number };
  topRisks: { riskId: string; riskType: string; titleKey: string; descriptor: string; dataDate: string }[];
  counts: { holdings: number; accounts: number };
  basisLabel: { en: string; hi: string };
  bankingBps: number;
  isSample: false;
  computeVersion: 1;
  schemaVersion: 1;
}

export interface StoredIssue {
  isin: string | null;
  instrumentName: string;
  issueType: "missing_price" | "unrecognized_security";
  status: "open";
  sourcesInvolved: { sourceId: string; sourceType: "broker_api"; accountId: string; quantity: number; asOfDate: string }[];
  calculation: { steps: { label: string; value: string }[]; explainKey: string };
  aiExplanation: null;
  resolution: null;
  isSample: false;
  schemaVersion: 1;
}

export interface SyncPlan {
  asOfDate: string;
  holdings: { id: string; data: StoredHolding }[];
  deleteHoldingIds: string[];
  accounts: { id: string; data: StoredAccount }[];
  connection: {
    id: string;
    brokerId: LiveBrokerId;
    status: "active";
    accountIds: string[];
    consentScopes: ["holdings:read"];
    lastSyncStatus: "complete" | "partial";
    lastErrorCode: null;
    isSample: false;
    schemaVersion: 1;
  };
  source: {
    id: string;
    sourceType: "broker_api";
    lineageKey: string;
    isCurrent: true;
    supersededBySourceId: null;
    verification: "verified";
    accountIds: string[];
    label: string;
    statementDate: null;
    asOfDate: string;
    status: "complete" | "partial";
    parser: null;
    stats: { positions: number; transactions: number; warnings: string[] };
    fileRef: null;
    isSample: false;
    schemaVersion: 1;
  };
  snapshots: { id: string; data: Record<string, unknown> }[];
  deleteSnapshotIds: string[];
  summary: StoredSummary;
  concentration: Record<string, unknown>;
  risk: Record<string, unknown>;
  issues: { id: string; data: StoredIssue }[];
  deleteIssueIds: string[];
}

export function istDate(from = new Date()) {
  const shifted = new Date(from.getTime() + 5.5 * 60 * 60 * 1000);
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${month}-${day}`;
}

export function rupeesToPaise(rupees: number) {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number) {
  return paise / 100;
}

export function accountIdFor(brokerId: LiveBrokerId, kind: AccountKind) {
  return kind === "demat" ? `acc_${brokerId}_demat` : `acc_${brokerId}_mf`;
}

export function isRealIsin(value: string | null | undefined) {
  return Boolean(value && ISIN.test(value.toUpperCase()));
}

export function positionKey(position: Pick<LivePosition, "isin" | "symbol" | "name">) {
  if (isRealIsin(position.isin)) return position.isin!.toUpperCase();
  const raw = (position.symbol || position.name || "unknown").toUpperCase();
  const slug = raw.replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 80);
  return `SYM_${slug || "UNKNOWN"}`;
}

export function planBrokerSync(input: {
  existing: StoredHolding[];
  snapshotIds: { id: string; accountId: string }[];
  issueIds: string[];
  book: BrokerBook;
  asOfDate?: string;
}): SyncPlan {
  const asOfDate = input.asOfDate ?? istDate();
  const sourceId = `src_${input.book.brokerId}`;
  const replaced = new Set<string>();
  if (input.book.demat) replaced.add(accountIdFor(input.book.brokerId, "demat"));
  if (input.book.mutualFunds) replaced.add(accountIdFor(input.book.brokerId, "mf_folio"));

  const byId = new Map<string, StoredHolding>();
  for (const holding of input.existing) {
    if (holding.isSample) continue;
    const accounts = holding.accounts.filter((slice) => !replaced.has(slice.accountId));
    if (accounts.length === 0) continue;
    byId.set(holding.isin, { ...holding, accounts });
  }

  const positions = [...(input.book.demat ?? []), ...(input.book.mutualFunds ?? [])].filter(
    (position) => position.settledQty + position.pendingQty > 0,
  );

  for (const position of positions) {
    const id = positionKey(position);
    const slice = toSlice(position, input.book.brokerName, sourceId, asOfDate);
    const current = byId.get(id);
    const accounts = (current?.accounts ?? []).filter((item) => item.accountId !== slice.accountId);
    accounts.push(slice);
    const pricePaise = position.lastPriceRupees === null ? (current?.pricePaise ?? null) : rupeesToPaise(position.lastPriceRupees);
    byId.set(id, draftHolding(id, position, accounts, pricePaise, asOfDate, input.book.brokerName, current));
  }

  const drafts = [...byId.values()].map((holding) => finalizeHolding(holding, asOfDate));
  applyWeights(drafts);

  const issues = drafts.flatMap((holding) => issuesFor(holding));
  for (const holding of drafts) {
    holding.openIssueIds = issues.filter((issue) => issue.data.isin === holding.isin).map((issue) => issue.id).slice(0, 5);
    if (holding.openIssueIds.some((id) => id.endsWith("_unrecognized_security"))) holding.reconStatus = "needs_review";
  }

  const accounts = accountDocs(input.book, drafts, asOfDate);
  const summary = buildSummary(drafts, accountsFromHoldings(drafts), issues.map((issue) => issue.data), asOfDate);
  const keptIds = new Set(drafts.map((holding) => holding.isin));
  const snapshots = positions.flatMap((position) => snapshotDocs(position, input.book.brokerName, sourceId, asOfDate));
  const snapshotIdSet = new Set(snapshots.map((snapshot) => snapshot.id));

  return {
    asOfDate,
    holdings: drafts.map((holding) => ({ id: holding.isin, data: holding })),
    deleteHoldingIds: input.existing.map((holding) => holding.isin).filter((id) => !keptIds.has(id)),
    accounts,
    connection: {
      id: `con_${input.book.brokerId}`,
      brokerId: input.book.brokerId,
      status: "active",
      accountIds: accounts.map((account) => account.id),
      consentScopes: ["holdings:read"],
      lastSyncStatus: input.book.demat && input.book.mutualFunds ? "complete" : "partial",
      lastErrorCode: null,
      isSample: false,
      schemaVersion: SCHEMA_VERSION,
    },
    source: {
      id: sourceId,
      sourceType: "broker_api",
      lineageKey: `broker_api:con_${input.book.brokerId}`,
      isCurrent: true,
      supersededBySourceId: null,
      verification: "verified",
      accountIds: accounts.map((account) => account.id),
      label: `${input.book.brokerName} holdings`,
      statementDate: null,
      asOfDate,
      status: input.book.demat && input.book.mutualFunds ? "complete" : "partial",
      parser: null,
      stats: { positions: positions.length, transactions: 0, warnings: [] },
      fileRef: null,
      isSample: false,
      schemaVersion: SCHEMA_VERSION,
    },
    snapshots,
    deleteSnapshotIds: input.snapshotIds
      .filter((snapshot) => replaced.has(snapshot.accountId) && !snapshotIdSet.has(snapshot.id))
      .map((snapshot) => snapshot.id),
    summary,
    concentration: buildConcentration(drafts, summary),
    risk: buildRisk(drafts, summary, input.book.brokerName),
    issues,
    deleteIssueIds: input.issueIds.filter((id) => !issues.some((issue) => issue.id === id)),
  };
}

function toSlice(position: LivePosition, brokerName: string, sourceId: string, asOfDate: string): StoredAccountSlice {
  const kind = position.accountKind;
  return {
    accountId: accountIdFor(position.brokerId, kind),
    label: kind === "demat" ? `${brokerName} demat` : `${brokerName} mutual funds`,
    brokerName,
    depository: null,
    maskedAccountId: "••••",
    settledQty: position.settledQty,
    pendingQty: position.pendingQty,
    asOfDate,
    authoritativeSourceId: sourceId,
    avgPricePaise: position.averagePriceRupees === null ? null : rupeesToPaise(position.averagePriceRupees),
  };
}

function draftHolding(
  id: string,
  position: LivePosition,
  accounts: StoredAccountSlice[],
  pricePaise: number | null,
  asOfDate: string,
  brokerName: string,
  previous: StoredHolding | undefined,
): StoredHolding {
  const name = position.name || previous?.name || position.symbol || id;
  return finalizeHolding(
    {
      isin: id,
      name,
      assetType: position.assetType,
      assetSubType: null,
      sector: previous?.sector && previous.sector !== "Unclassified" ? previous.sector : "Unclassified",
      issuerEntityId: null,
      issuerName: name,
      totalQty: 0,
      settledQty: 0,
      pendingQty: 0,
      accounts,
      pricePaise,
      priceDate: pricePaise === null ? null : asOfDate,
      priceSource: pricePaise === null ? previous?.priceSource ?? null : brokerName,
      valuePaise: null,
      valuationStatus: "unpriced",
      weightBps: null,
      costStatus: "unavailable",
      avgCostPaise: null,
      investedPaise: null,
      reconStatus: "single_source",
      openIssueIds: [],
      evidence: [],
      corporateActionNote: null,
      lookThroughStatus: "unavailable",
      isSample: false,
      computeVersion: 1,
      schemaVersion: SCHEMA_VERSION,
    },
    asOfDate,
  );
}

function finalizeHolding(holding: StoredHolding, asOfDate: string): StoredHolding {
  const settledQty = sum(holding.accounts.map((slice) => slice.settledQty));
  const pendingQty = sum(holding.accounts.map((slice) => slice.pendingQty));
  const totalQty = settledQty + pendingQty;
  const pricePaise = holding.pricePaise;
  const valuePaise = pricePaise === null ? null : Math.round(totalQty * pricePaise);
  const avgs = holding.accounts.map((slice) => slice.avgPricePaise);
  const known = avgs.filter((avg): avg is number => avg !== null);
  let costStatus: StoredHolding["costStatus"] = "unavailable";
  let avgCostPaise: number | null = null;
  let investedPaise: number | null = null;
  if (known.length === holding.accounts.length && known.length > 0 && totalQty > 0) {
    const invested = holding.accounts.reduce((total, slice) => total + (slice.settledQty + slice.pendingQty) * (slice.avgPricePaise ?? 0), 0);
    costStatus = "available";
    investedPaise = Math.round(invested);
    avgCostPaise = Math.round(invested / totalQty);
  } else if (known.length > 0) {
    costStatus = "incomplete";
  }
  const realIsin = isRealIsin(holding.isin);
  let reconStatus: StoredHolding["reconStatus"] = holding.accounts.length > 1 ? "matched" : "single_source";
  if (pendingQty > 0) reconStatus = "pending_settlement";
  if (!realIsin) reconStatus = "needs_review";

  return {
    ...holding,
    totalQty,
    settledQty,
    pendingQty,
    valuePaise,
    valuationStatus: valuePaise === null ? "unpriced" : "valued",
    priceDate: pricePaise === null ? null : holding.priceDate ?? asOfDate,
    costStatus,
    avgCostPaise,
    investedPaise,
    reconStatus,
    evidence: holding.accounts.flatMap((slice) => {
      const rows: StoredEvidence[] = [];
      if (slice.settledQty > 0) {
        rows.push({
          sourceId: slice.authoritativeSourceId,
          sourceType: "broker_api",
          accountId: slice.accountId,
          quantity: slice.settledQty,
          settlement: "settled",
          asOfDate: slice.asOfDate,
          isAuthoritative: true,
          verification: "verified",
        });
      }
      if (slice.pendingQty > 0) {
        rows.push({
          sourceId: slice.authoritativeSourceId,
          sourceType: "broker_api",
          accountId: slice.accountId,
          quantity: slice.pendingQty,
          settlement: "pending",
          asOfDate: slice.asOfDate,
          isAuthoritative: true,
          verification: "verified",
        });
      }
      return rows;
    }),
  };
}

function applyWeights(holdings: StoredHolding[]) {
  const total = holdings.reduce((sum, holding) => sum + (holding.valuePaise ?? 0), 0);
  for (const holding of holdings) {
    holding.weightBps = holding.valuePaise === null || total === 0 ? null : Math.round((holding.valuePaise / total) * 10000);
  }
}

function issuesFor(holding: StoredHolding): { id: string; data: StoredIssue }[] {
  const issues: { id: string; data: StoredIssue }[] = [];
  if (holding.valuationStatus === "unpriced") {
    const id = `${holding.isin}_missing_price`;
    issues.push({
      id,
      data: {
        isin: holding.isin,
        instrumentName: holding.name,
        issueType: "missing_price",
        status: "open",
        sourcesInvolved: holding.accounts.map((slice) => ({
          sourceId: slice.authoritativeSourceId,
          sourceType: "broker_api",
          accountId: slice.accountId,
          quantity: slice.settledQty + slice.pendingQty,
          asOfDate: slice.asOfDate,
        })),
        calculation: {
          steps: [{ label: "Last price", value: "Not returned by the broker" }],
          explainKey: "missing_price",
        },
        aiExplanation: null,
        resolution: null,
        isSample: false,
        schemaVersion: SCHEMA_VERSION,
      },
    });
  }
  if (!isRealIsin(holding.isin)) {
    issues.push({
      id: `${holding.isin}_unrecognized_security`,
      data: {
        isin: holding.isin,
        instrumentName: holding.name,
        issueType: "unrecognized_security",
        status: "open",
        sourcesInvolved: holding.accounts.map((slice) => ({
          sourceId: slice.authoritativeSourceId,
          sourceType: "broker_api",
          accountId: slice.accountId,
          quantity: slice.settledQty + slice.pendingQty,
          asOfDate: slice.asOfDate,
        })),
        calculation: {
          steps: [{ label: "Identifier", value: holding.isin }],
          explainKey: "unrecognized_security",
        },
        aiExplanation: null,
        resolution: null,
        isSample: false,
        schemaVersion: SCHEMA_VERSION,
      },
    });
  }
  return issues;
}

function accountDocs(book: BrokerBook, holdings: StoredHolding[], asOfDate: string) {
  const kinds: AccountKind[] = [];
  if (book.demat) kinds.push("demat");
  if (book.mutualFunds) kinds.push("mf_folio");
  return kinds.map((kind) => {
    const id = accountIdFor(book.brokerId, kind);
    const slices = holdings.flatMap((holding) => holding.accounts.filter((slice) => slice.accountId === id).map((slice) => ({ holding, slice })));
    const valuePaise = slices.reduce((total, item) => {
      if (item.holding.pricePaise === null) return total;
      return total + Math.round((item.slice.settledQty + item.slice.pendingQty) * item.holding.pricePaise);
    }, 0);
    const data: StoredAccount = {
      accountType: kind,
      brokerId: book.brokerId,
      brokerName: book.brokerName,
      depository: null,
      maskedAccountId: "••••",
      label: kind === "demat" ? `${book.brokerName} demat` : `${book.brokerName} mutual funds`,
      status: "active",
      connectionId: `con_${book.brokerId}`,
      sourceTypes: ["broker_api"],
      latestAsOfDate: asOfDate,
      holdingsCount: slices.length,
      valuePaise,
      isSample: false,
      schemaVersion: SCHEMA_VERSION,
    };
    return { id, data };
  });
}

function snapshotDocs(position: LivePosition, brokerName: string, sourceId: string, asOfDate: string) {
  const key = positionKey(position);
  const accountId = accountIdFor(position.brokerId, position.accountKind);
  const rows: { qty: number; settlement: "settled" | "pending" }[] = [];
  if (position.settledQty > 0) rows.push({ qty: position.settledQty, settlement: "settled" });
  if (position.pendingQty > 0) rows.push({ qty: position.pendingQty, settlement: "pending" });
  return rows.map((row) => ({
    id: `${sourceId}_${accountId}_${key}_${row.settlement}`,
    data: {
      sourceId,
      accountId,
      isin: isRealIsin(position.isin) ? position.isin!.toUpperCase() : null,
      rawName: position.name,
      rawSymbol: position.symbol ?? "",
      matchMethod: isRealIsin(position.isin) ? "isin_exact" : position.symbol ? "symbol_match" : "unresolved",
      quantity: row.qty,
      settlement: row.settlement,
      asOfDate,
      avgPricePaise: position.averagePriceRupees === null ? null : rupeesToPaise(position.averagePriceRupees),
      expiresAt: null,
      isSample: false,
      schemaVersion: SCHEMA_VERSION,
      brokerName,
    },
  }));
}

function accountsFromHoldings(holdings: StoredHolding[]) {
  const map = new Map<string, StoredSummary["accounts"][number]>();
  for (const holding of holdings) {
    for (const slice of holding.accounts) {
      const current = map.get(slice.accountId) ?? {
        accountId: slice.accountId,
        label: slice.label,
        brokerName: slice.brokerName,
        depository: null,
        maskedAccountId: slice.maskedAccountId,
        status: "active" as const,
        latestAsOfDate: slice.asOfDate,
        valuePaise: 0,
        holdingsCount: 0,
      };
      current.holdingsCount += 1;
      if (holding.pricePaise !== null) {
        current.valuePaise += Math.round((slice.settledQty + slice.pendingQty) * holding.pricePaise);
      }
      if (slice.asOfDate > current.latestAsOfDate) current.latestAsOfDate = slice.asOfDate;
      map.set(slice.accountId, current);
    }
  }
  return [...map.values()];
}

function buildSummary(holdings: StoredHolding[], accounts: StoredSummary["accounts"], issues: StoredIssue[], asOfDate: string): StoredSummary {
  const valued = holdings.filter((holding) => holding.valuePaise !== null);
  const valuedPaise = valued.reduce((total, holding) => total + (holding.valuePaise ?? 0), 0);
  const unpriced = holdings.filter((holding) => holding.valuationStatus === "unpriced").length;
  const dates = holdings.map((holding) => holding.priceDate).filter((date): date is string => Boolean(date)).sort();
  const byClass = new Map<AssetClass, { valuePaise: number; count: number }>();
  for (const holding of valued) {
    const current = byClass.get(holding.assetType) ?? { valuePaise: 0, count: 0 };
    current.valuePaise += holding.valuePaise ?? 0;
    current.count += 1;
    byClass.set(holding.assetType, current);
  }
  const bankingPaise = valued.filter((holding) => holding.sector === "Banking").reduce((total, holding) => total + (holding.valuePaise ?? 0), 0);
  const brokerNames = [...new Set(accounts.map((account) => account.brokerName))];
  return {
    computeState: { status: "idle" },
    totals: {
      valuedPaise,
      valuedCount: valued.length,
      excludedCount: unpriced,
      excludedReasons: { unpriced, stale: 0, notValuable: 0 },
    },
    asOf: { oldestPriceDate: dates[0] ?? null, newestPriceDate: dates[dates.length - 1] ?? asOfDate },
    assetClassSplit: [...byClass.entries()].map(([assetType, row]) => ({
      assetType,
      valuePaise: row.valuePaise,
      bps: valuedPaise === 0 ? 0 : Math.round((row.valuePaise / valuedPaise) * 10000),
      count: row.count,
    })),
    accounts,
    coverage: {
      connectedCount: brokerNames.length,
      staleAccountIds: [],
      knownMissing: [],
      notConnectedBrokers: [],
      brokerNames,
    },
    issues: {
      openCount: issues.length,
      needsReviewCount: holdings.filter((holding) => holding.reconStatus === "needs_review").length,
      unrecognizedCount: issues.filter((issue) => issue.issueType === "unrecognized_security").length,
      missingPriceCount: issues.filter((issue) => issue.issueType === "missing_price").length,
    },
    topRisks: [],
    counts: { holdings: holdings.length, accounts: accounts.length },
    basisLabel: {
      en: `Share of imported, valued portfolio as of ${asOfDate}`,
      hi: `${asOfDate} तक आयातित, मूल्यांकित पोर्टफोलियो का हिस्सा`,
    },
    bankingBps: valuedPaise === 0 ? 0 : Math.round((bankingPaise / valuedPaise) * 10000),
    isSample: false,
    computeVersion: 1,
    schemaVersion: SCHEMA_VERSION,
  };
}

function buildConcentration(holdings: StoredHolding[], summary: StoredSummary) {
  const valuedPaise = summary.totals.valuedPaise;
  const companies = bucket(holdings, (holding) => holding.issuerName || holding.name);
  const sectors = bucket(holdings, (holding) => holding.sector || "Unclassified");
  return {
    basis: {
      valuedPaise,
      asOf: summary.asOf.newestPriceDate,
      excluded: { unpricedCount: summary.totals.excludedReasons.unpriced, unclassifiedCount: sectors.filter((row) => row.name === "Unclassified").length, lookThroughUnavailableCount: holdings.length },
    },
    byCompany: companies.slice(0, 20).map((row) => ({ entityId: row.id, name: row.name, valuePaise: row.valuePaise, bps: bps(row.valuePaise, valuedPaise), viaIsins: row.ids })),
    bySector: sectors.map((row) => ({ sector: row.name, valuePaise: row.valuePaise, bps: bps(row.valuePaise, valuedPaise) })),
    byAssetClass: summary.assetClassSplit,
    byAccount: accountBuckets(holdings, valuedPaise),
    flags: companies.filter((row) => bps(row.valuePaise, valuedPaise) >= 2500).slice(0, 10).map((row) => ({
      dimension: "company",
      key: row.name,
      observedBps: bps(row.valuePaise, valuedPaise),
      thresholdBps: 2500,
      descriptor: "Share of valued portfolio",
    })),
    isSample: false,
    schemaVersion: SCHEMA_VERSION,
    computeVersion: 1,
  };
}

function buildRisk(holdings: StoredHolding[], summary: StoredSummary, brokerName: string) {
  const asOf = summary.asOf.newestPriceDate ?? istDate();
  const observations: Record<string, unknown>[] = [
    {
      riskId: "broker_prices",
      riskType: "data_coverage",
      descriptor: "broker_last_price",
      titleKey: "broker_prices",
      title: { en: "Prices come from the connected broker", hi: "कीमत जुड़े ब्रोकर से आई है" },
      observation: {
        en: "Each value uses the last price that broker returned. This is not a separate exchange feed.",
        hi: "हर मूल्य उस आखिरी कीमत से है जो ब्रोकर ने भेजी। यह अलग एक्सचेंज फ़ीड नहीं है।",
      },
      level: { en: "Coverage", hi: "कवरेज" },
      threshold: { en: "No suitability threshold is applied.", hi: "कोई उपयुक्तता सीमा नहीं लगाई गई।" },
      href: "/accounts",
      source: brokerName,
      evidenceRefs: [],
      thresholds: {},
      dataDate: asOf,
      assumptions: ["Last price can be missing or delayed."],
    },
  ];
  const flags = (buildConcentration(holdings, summary).flags as { key: string; observedBps: number }[]) ?? [];
  for (const flag of flags.slice(0, 3)) {
    observations.push({
      riskId: `concentration_${flag.key}`,
      riskType: "concentration",
      descriptor: "company_weight",
      titleKey: "concentration",
      title: { en: `${flag.key} is a large share`, hi: `${flag.key} बड़ा हिस्सा है` },
      observation: {
        en: `${flag.key} is ${(flag.observedBps / 100).toFixed(1)}% of the valued portfolio. This describes the mix. It is not a judgement.`,
        hi: `${flag.key} मूल्यांकित पोर्टफोलियो का ${(flag.observedBps / 100).toFixed(1)}% है। यह मिश्रण बताता है, निर्णय नहीं।`,
      },
      level: { en: "Observed", hi: "देखा गया" },
      threshold: { en: "Shown when one company is at least 25% of valued holdings.", hi: "दिखाया जाता है जब एक कंपनी मूल्यांकित होल्डिंग्स का कम से कम 25% हो।" },
      href: "/concentration?view=company",
      source: brokerName,
      evidenceRefs: [{ kind: "insight", refId: "concentration" }],
      thresholds: { thresholdBps: 2500 },
      dataDate: asOf,
      assumptions: ["Weights use broker last prices only."],
    });
  }
  return { observations, disclaimerVersion: "1", isSample: false, schemaVersion: SCHEMA_VERSION, computeVersion: 1 };
}

function bucket(holdings: StoredHolding[], keyOf: (holding: StoredHolding) => string) {
  const map = new Map<string, { name: string; valuePaise: number; ids: string[] }>();
  for (const holding of holdings) {
    if (holding.valuePaise === null) continue;
    const name = keyOf(holding);
    const current = map.get(name) ?? { name, valuePaise: 0, ids: [] };
    current.valuePaise += holding.valuePaise;
    current.ids.push(holding.isin);
    map.set(name, current);
  }
  return [...map.values()]
    .sort((a, b) => b.valuePaise - a.valuePaise)
    .map((row) => ({ ...row, id: row.name }));
}

function accountBuckets(holdings: StoredHolding[], valuedPaise: number) {
  const map = new Map<string, { accountId: string; label: string; valuePaise: number }>();
  for (const holding of holdings) {
    if (holding.pricePaise === null) continue;
    for (const slice of holding.accounts) {
      const valuePaise = Math.round((slice.settledQty + slice.pendingQty) * holding.pricePaise);
      const current = map.get(slice.accountId) ?? { accountId: slice.accountId, label: slice.label, valuePaise: 0 };
      current.valuePaise += valuePaise;
      map.set(slice.accountId, current);
    }
  }
  return [...map.values()].map((row) => ({ ...row, bps: bps(row.valuePaise, valuedPaise) }));
}

function bps(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 10000);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function holdingFromStored(holding: StoredHolding): Holding {
  const price = holding.pricePaise === null || !holding.priceDate ? undefined : {
    value: paiseToRupees(holding.pricePaise),
    currency: "INR" as const,
    priceDate: holding.priceDate,
    source: sourceFor(holding.priceSource ?? holding.accounts[0]?.brokerName ?? "Broker", holding.priceDate),
  };
  return {
    isin: holding.isin,
    name: holding.name,
    assetClass: holding.assetType,
    sector: holding.sector,
    issuer: holding.issuerName,
    totalQuantity: holding.totalQty,
    pendingQuantity: holding.pendingQty,
    accounts: holding.accounts.map((slice) => ({
      accountId: slice.accountId,
      label: slice.label,
      maskedId: slice.maskedAccountId,
      quantity: slice.settledQty + slice.pendingQty,
      pending: slice.pendingQty,
      value: holding.pricePaise === null ? undefined : paiseToRupees(Math.round((slice.settledQty + slice.pendingQty) * holding.pricePaise)),
      source: sourceFor(slice.label, slice.asOfDate),
    })),
    price,
    value: holding.valuePaise === null ? undefined : paiseToRupees(holding.valuePaise),
    share: holding.weightBps === null ? undefined : holding.weightBps / 100,
    status: holding.reconStatus,
    unvaluedReason: holding.valuePaise === null
      ? { en: "The broker did not return a last price for this holding.", hi: "ब्रोकर ने इस होल्डिंग की आखिरी कीमत नहीं भेजी।" }
      : undefined,
    costBasisNote: costNote(holding.costStatus),
    timeline: timeline(holding),
  };
}

function sourceFor(label: string, asOf: string): SourceRef {
  return {
    sourceId: label,
    type: "broker_api",
    label,
    asOf,
    note: "Read-only holdings from the connected broker. Quantities are summed across accounts.",
  };
}

function costNote(status: StoredHolding["costStatus"]) {
  if (status === "available") {
    return {
      en: "Average price is the broker-reported average, not a full cost-basis proof.",
      hi: "औसत कीमत ब्रोकर की बताई औसत है, पूरी लागत का प्रमाण नहीं।",
    };
  }
  if (status === "incomplete") {
    return {
      en: "Cost basis is incomplete because every account did not report an average price.",
      hi: "लागत अधूरी है क्योंकि हर खाते ने औसत कीमत नहीं भेजी।",
    };
  }
  return {
    en: "Cost basis is unavailable. The broker did not report an average price.",
    hi: "लागत उपलब्ध नहीं है। ब्रोकर ने औसत कीमत नहीं भेजी।",
  };
}

function timeline(holding: StoredHolding) {
  const points = new Map<string, { date: string; units: number; label: string }>();
  for (const row of holding.evidence) {
    const key = `${row.asOfDate}_${row.accountId}`;
    const current = points.get(key) ?? { date: row.asOfDate, units: 0, label: `${row.accountId} · ${row.asOfDate}` };
    const account = holding.accounts.find((slice) => slice.accountId === row.accountId);
    current.units += row.quantity;
    current.label = `${account?.label ?? row.accountId} · ${row.asOfDate}`;
    points.set(key, current);
  }
  return [...points.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function summaryFromStored(doc: StoredSummary | null, accountCount: number): { summary: PortfolioSummary; coverage: Coverage; totalSource: SourceRef } {
  if (!doc) {
    const asOf = istDate();
    return {
      summary: {
        totalValue: 0,
        valuedCount: 0,
        holdingCount: 0,
        unvaluedCount: 0,
        asOf,
        snapshots: [],
        assetClasses: [],
        bankingShare: 0,
        bankingThreshold: 30,
        openIssues: 0,
        issueLine: { en: "No broker holdings imported yet.", hi: "अभी कोई ब्रोकर होल्डिंग आयात नहीं हुई।" },
      },
      coverage: {
        includedCount: 0,
        missingCount: 0,
        headline: { en: "Connect a broker to import read-only holdings.", hi: "रीड-ओनली होल्डिंग्स के लिए ब्रोकर जोड़ें।" },
        oldestAsOf: asOf,
        missingLabel: { en: "No account is connected.", hi: "कोई खाता जुड़ा नहीं है।" },
      },
      totalSource: sourceFor("No broker", asOf),
    };
  }
  const asOf = doc.asOf.newestPriceDate ?? istDate();
  const names = doc.coverage.brokerNames ?? [];
  const label = names.length > 0 ? names.join(", ") : "Connected broker";
  return {
    summary: {
      totalValue: paiseToRupees(doc.totals.valuedPaise),
      valuedCount: doc.totals.valuedCount,
      holdingCount: doc.counts.holdings,
      unvaluedCount: doc.totals.excludedCount,
      asOf,
      snapshots: [],
      assetClasses: doc.assetClassSplit.map((row) => ({
        assetClass: row.assetType,
        holdings: row.count,
        value: paiseToRupees(row.valuePaise),
        share: row.bps / 100,
      })),
      bankingShare: doc.bankingBps / 100,
      bankingThreshold: 30,
      openIssues: doc.issues.openCount,
      issueLine: issueLine(doc),
    },
    coverage: {
      includedCount: accountCount || doc.counts.accounts,
      missingCount: doc.coverage.knownMissing.length,
      headline: {
        en: names.length > 0 ? `Holdings from ${label}. Each broker account is kept separate.` : "Imported broker holdings.",
        hi: names.length > 0 ? `${label} से होल्डिंग्स। हर ब्रोकर खाता अलग रखा गया है।` : "आयातित ब्रोकर होल्डिंग्स।",
      },
      oldestAsOf: doc.asOf.oldestPriceDate ?? asOf,
      missingLabel: { en: "Accounts that are not connected are not included.", hi: "जो खाते जुड़े नहीं हैं वे शामिल नहीं हैं।" },
    },
    totalSource: sourceFor(label, asOf),
  };
}

function issueLine(doc: StoredSummary) {
  if (doc.issues.openCount === 0) {
    return { en: "No open reconciliation issues.", hi: "कोई खुला मिलान मुद्दा नहीं।" };
  }
  return {
    en: `${doc.issues.missingPriceCount} missing price, ${doc.issues.unrecognizedCount} unrecognized`,
    hi: `${doc.issues.missingPriceCount} कीमत नहीं, ${doc.issues.unrecognizedCount} अपरिचित`,
  };
}

export function accountFromStored(id: string, data: StoredAccount): Account {
  return {
    id,
    label: data.label,
    kind: data.accountType === "mf_folio" ? "Mutual fund folio" : "Demat",
    maskedId: data.maskedAccountId,
    sourceType: "broker_api",
    sourceLabel: `${data.brokerName} holdings`,
    broker: data.brokerName,
    lastUpdated: data.latestAsOfDate,
    state: "fresh",
    holdingCount: data.holdingsCount,
    valuedHoldings: paiseToRupees(data.valuePaise),
  };
}

export function rowsFromConcentration(doc: Record<string, unknown> | null, view: "company" | "sector" | "assetClass" | "account"): ConcentrationRow[] {
  if (!doc) return [];
  if (view === "company") return mapRows(doc.byCompany, "name", "entityId");
  if (view === "sector") return mapRows(doc.bySector, "sector", "sector");
  if (view === "assetClass") return mapRows(doc.byAssetClass, "assetType", "assetType");
  return mapRows(doc.byAccount, "label", "accountId");
}

function mapRows(value: unknown, nameKey: string, idKey: string): ConcentrationRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const record = row as Record<string, unknown>;
    const valuePaise = Number(record.valuePaise ?? 0);
    const shareBps = Number(record.bps ?? 0);
    return {
      id: String(record[idKey] ?? record[nameKey] ?? "row"),
      name: String(record[nameKey] ?? "Unknown"),
      value: paiseToRupees(valuePaise),
      share: shareBps / 100,
      unclassified: record[nameKey] === "Unclassified" || record[nameKey] === "unknown",
      lookThroughUnavailable: true,
      holdingIsins: Array.isArray(record.viaIsins) ? record.viaIsins.map(String) : [],
    };
  });
}

export function risksFromStored(doc: Record<string, unknown> | null): RiskCard[] {
  const observations = Array.isArray(doc?.observations) ? doc.observations : [];
  return observations.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.riskId ?? "risk"),
      title: copyField(row.title, "Risk"),
      observation: copyField(row.observation, String(row.descriptor ?? "")),
      level: copyField(row.level, "Observed"),
      threshold: copyField(row.threshold, "Descriptive only."),
      href: String(row.href ?? "/risk"),
      source: String(row.source ?? "Broker"),
      asOf: String(row.dataDate ?? istDate()),
    };
  });
}

export function issuesFromStored(docs: StoredIssue[], holdings: StoredHolding[]): Issue[] {
  const stored = docs.map((issue) => ({
    id: `${issue.isin ?? issue.instrumentName}_${issue.issueType}`,
    isin: issue.isin ?? undefined,
    name: issue.instrumentName,
    type: issue.issueType === "unrecognized_security" ? "unrecognized" as const : "missing_price" as const,
    sourcesLine: issue.sourcesInvolved.map((source) => source.sourceId).join(", "),
    explanation: {
      en: issue.issueType === "missing_price" ? "No last price was returned, so this holding is not in the total." : "This row has no ISIN, so it stays out of automatic matching.",
      hi: issue.issueType === "missing_price" ? "आखिरी कीमत नहीं मिली, इसलिए यह कुल में नहीं है।" : "इस पंक्ति में ISIN नहीं है, इसलिए यह अपने आप नहीं मिलती।",
    },
  }));
  const pending = holdings
    .filter((holding) => holding.pendingQty > 0)
    .map((holding) => ({
      id: `${holding.isin}_pending_settlement`,
      isin: holding.isin,
      name: holding.name,
      type: "pending_settlement" as const,
      status: holding.reconStatus,
      sourcesLine: holding.accounts.map((slice) => slice.label).join(", "),
      explanation: {
        en: `${holding.pendingQty} units are still pending settlement and are not treated as a second holding.`,
        hi: `${holding.pendingQty} इकाइयाँ निपटान के लिए लंबित हैं और दूसरी होल्डिंग नहीं मानी गईं।`,
      },
    }));
  return [...stored, ...pending];
}

function copyField(value: unknown, fallback: string) {
  if (value && typeof value === "object" && "en" in value && "hi" in value) {
    const copy = value as { en: unknown; hi: unknown };
    return { en: String(copy.en), hi: String(copy.hi) };
  }
  return { en: fallback, hi: fallback };
}

export function coerceHolding(id: string, data: Record<string, unknown>): StoredHolding {
  const accounts = Array.isArray(data.accounts) ? data.accounts.map((slice) => coerceSlice(slice as Record<string, unknown>)) : [];
  return finalizeHolding(
    {
      isin: String(data.isin ?? id),
      name: String(data.name ?? id),
      assetType: (data.assetType as AssetClass) || "unknown",
      assetSubType: null,
      sector: String(data.sector ?? "Unclassified"),
      issuerEntityId: null,
      issuerName: String(data.issuerName ?? data.name ?? id),
      totalQty: 0,
      settledQty: 0,
      pendingQty: 0,
      accounts,
      pricePaise: numberOrNull(data.pricePaise),
      priceDate: typeof data.priceDate === "string" ? data.priceDate : null,
      priceSource: typeof data.priceSource === "string" ? data.priceSource : null,
      valuePaise: null,
      valuationStatus: "unpriced",
      weightBps: numberOrNull(data.weightBps),
      costStatus: "unavailable",
      avgCostPaise: null,
      investedPaise: null,
      reconStatus: "single_source",
      openIssueIds: Array.isArray(data.openIssueIds) ? data.openIssueIds.map(String).slice(0, 5) : [],
      evidence: [],
      corporateActionNote: null,
      lookThroughStatus: "unavailable",
      isSample: false,
      computeVersion: 1,
      schemaVersion: SCHEMA_VERSION,
    },
    typeof data.priceDate === "string" ? data.priceDate : istDate(),
  );
}

function coerceSlice(data: Record<string, unknown>): StoredAccountSlice {
  return {
    accountId: String(data.accountId ?? ""),
    label: String(data.label ?? data.accountId ?? "Account"),
    brokerName: String(data.brokerName ?? ""),
    depository: null,
    maskedAccountId: String(data.maskedAccountId ?? "••••"),
    settledQty: Number(data.settledQty ?? 0),
    pendingQty: Number(data.pendingQty ?? 0),
    asOfDate: String(data.asOfDate ?? istDate()),
    authoritativeSourceId: String(data.authoritativeSourceId ?? ""),
    avgPricePaise: numberOrNull(data.avgPricePaise),
  };
}

function numberOrNull(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

import type {
  Account,
  AssistantReply,
  Broker,
  CashflowItem,
  ConcentrationRow,
  ConnectionEdge,
  Copy,
  Coverage,
  EducationTopic,
  Evidence,
  FollowMoney,
  Holding,
  ImpactRow,
  Issue,
  Lesson,
  PortfolioSummary,
  RiskCard,
  SourceRef,
} from "@/types/domain";

const priceSource: SourceRef = {
  sourceId: "sample-prices",
  type: "sample",
  label: "Sample price file",
  asOf: "2026-09-29",
  note: "Synthetic prices for the demo portfolio. Not a live market feed.",
};

const brokerA: SourceRef = {
  sourceId: "broker-a",
  type: "broker_api",
  label: "Broker A holdings",
  asOf: "2026-09-29",
  note: "Read-only holdings fetch. Sample data.",
};

const brokerB: SourceRef = {
  sourceId: "broker-b",
  type: "broker_api",
  label: "Broker B holdings",
  asOf: "2026-09-29",
  note: "Read-only holdings fetch for Demat B. Sample data.",
};

const cas: SourceRef = {
  sourceId: "cas",
  type: "statement",
  label: "CAS statement",
  asOf: "2026-08-31",
  note: "Consolidated account statement. A statement is a snapshot, not every account you may have.",
};

const folioSource: SourceRef = {
  sourceId: "folio-statement",
  type: "statement",
  label: "Mutual fund statement",
  asOf: "2026-09-15",
  note: "Folio statement. Look-through of underlying holdings is not in this file.",
};

const noCost = {
  en: "Cost basis unavailable or incomplete. Average price was not available for every account.",
  hi: "लागत आधार अधूरा है। हर खाते का औसत मूल्य उपलब्ध नहीं था।",
};

export const holdings: Holding[] = [
  {
    isin: "INESYN000001",
    name: "Meridian Bank",
    assetClass: "equity",
    sector: "Banking",
    issuer: "Meridian Bank",
    totalQuantity: 100,
    pendingQuantity: 0,
    value: 140000,
    share: 16.7,
    status: "matched",
    costBasisNote: noCost,
    price: { value: 1400, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-a", quantity: 100, value: 140000, source: brokerA }],
    timeline: [
      { date: "2026-08-31", units: 100, label: "CAS · 31 Aug 2026" },
      { date: "2026-09-29", units: 100, label: "Broker A · 29 Sep 2026" },
    ],
  },
  {
    isin: "INESYN000002",
    name: "Coastal Bank",
    assetClass: "equity",
    sector: "Banking",
    issuer: "Coastal Bank",
    totalQuantity: 40,
    pendingQuantity: 0,
    value: 112800,
    share: 13.4,
    status: "needs_review",
    costBasisNote: noCost,
    price: { value: 2820, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-a", quantity: 40, value: 112800, source: brokerA }],
    timeline: [
      { date: "2026-08-31", units: 35, label: "CAS · 31 Aug 2026" },
      { date: "2026-09-29", units: 40, label: "Broker A · 29 Sep 2026" },
    ],
  },
  {
    isin: "INESYN000003",
    name: "Harbour Bank",
    assetClass: "equity",
    sector: "Banking",
    issuer: "Harbour Bank",
    totalQuantity: 40,
    pendingQuantity: 0,
    value: 100000,
    share: 11.9,
    status: "single_source",
    costBasisNote: noCost,
    price: { value: 2500, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-b", quantity: 40, value: 100000, source: brokerB }],
    timeline: [{ date: "2026-09-29", units: 40, label: "Broker B · 29 Sep 2026" }],
  },
  {
    isin: "INESYN000004",
    name: "Broad Market ETF",
    assetClass: "etf",
    sector: "Funds",
    issuer: "Broad Market ETF",
    totalQuantity: 100,
    pendingQuantity: 0,
    value: 100000,
    share: 11.9,
    status: "single_source",
    costBasisNote: noCost,
    price: { value: 1000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-a", quantity: 100, value: 100000, source: brokerA }],
    timeline: [{ date: "2026-09-29", units: 100, label: "Broker A · 29 Sep 2026" }],
  },
  {
    isin: "INESYN000005",
    name: "Summit Textiles",
    assetClass: "equity",
    sector: "Consumer",
    issuer: "Summit Textiles",
    totalQuantity: 75,
    pendingQuantity: 0,
    value: 75000,
    share: 8.9,
    status: "matched",
    costBasisNote: noCost,
    price: { value: 1000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-a", quantity: 75, value: 75000, source: brokerA }],
    timeline: [
      { date: "2026-08-31", units: 75, label: "CAS · 31 Aug 2026" },
      { date: "2026-09-29", units: 75, label: "Broker A · 29 Sep 2026" },
    ],
  },
  {
    isin: "INFSYN000011",
    name: "Balanced Growth Fund",
    assetClass: "mutual_fund",
    sector: "Funds",
    issuer: "Balanced Growth Fund",
    totalQuantity: 80,
    pendingQuantity: 0,
    value: 67200,
    share: 8.0,
    status: "single_source",
    costBasisNote: noCost,
    price: { value: 840, currency: "INR", priceDate: "2026-09-15", source: folioSource },
    accounts: [{ accountId: "folio-1", quantity: 80, value: 67200, source: folioSource }],
    timeline: [{ date: "2026-09-15", units: 80, label: "Folio statement · 15 Sep 2026" }],
  },
  {
    isin: "INESYN000006",
    name: "Aster Industries",
    assetClass: "equity",
    sector: "Industrials",
    issuer: "Aster Industries",
    totalQuantity: 20,
    pendingQuantity: 0,
    value: 60000,
    share: 7.1,
    status: "matched",
    costBasisNote: noCost,
    price: { value: 3000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [
      { accountId: "demat-a", quantity: 12, value: 36000, source: brokerA },
      { accountId: "demat-b", quantity: 8, value: 24000, source: brokerB },
    ],
    timeline: [
      { date: "2026-08-31", units: 20, label: "CAS · 31 Aug 2026" },
      { date: "2026-09-29", units: 20, label: "Brokers · 12 + 8" },
    ],
  },
  {
    isin: "INESYN000007",
    name: "Aster 8.5% 2029 bond",
    assetClass: "bond",
    sector: "Industrials",
    issuer: "Aster Industries",
    totalQuantity: 50,
    pendingQuantity: 0,
    value: 50000,
    share: 6.0,
    status: "matched",
    costBasisNote: noCost,
    price: { value: 1000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-a", quantity: 50, value: 50000, source: brokerA }],
    timeline: [
      { date: "2026-08-31", units: 50, label: "CAS · 31 Aug 2026" },
      { date: "2026-09-29", units: 50, label: "Broker A · 29 Sep 2026" },
    ],
  },
  {
    isin: "INESYN000008",
    name: "City Offices REIT",
    assetClass: "reit",
    sector: "Real estate",
    issuer: "City Offices REIT",
    totalQuantity: 40,
    pendingQuantity: 0,
    value: 40000,
    share: 4.8,
    status: "single_source",
    costBasisNote: noCost,
    price: { value: 1000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-b", quantity: 40, value: 40000, source: brokerB }],
    timeline: [{ date: "2026-09-29", units: 40, label: "Broker B · 29 Sep 2026" }],
  },
  {
    isin: "INESYN000009",
    name: "Northern Steel",
    assetClass: "equity",
    sector: "Materials",
    issuer: "Northern Steel",
    totalQuantity: 40,
    pendingQuantity: 0,
    value: 40000,
    share: 4.8,
    status: "single_source",
    costBasisNote: noCost,
    price: { value: 1000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-b", quantity: 40, value: 40000, source: brokerB }],
    timeline: [{ date: "2026-09-29", units: 40, label: "Broker B · 29 Sep 2026" }],
  },
  {
    isin: "INESYN000010",
    name: "Energy Infrastructure InvIT",
    assetClass: "invit",
    sector: "Infrastructure",
    issuer: "Energy Infrastructure InvIT",
    totalQuantity: 30,
    pendingQuantity: 0,
    value: 30000,
    share: 3.6,
    status: "single_source",
    costBasisNote: noCost,
    price: { value: 1000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-b", quantity: 30, value: 30000, source: brokerB }],
    timeline: [{ date: "2026-09-29", units: 30, label: "Broker B · 29 Sep 2026" }],
  },
  {
    isin: "INESYN000012",
    name: "Peninsula Cement",
    assetClass: "equity",
    sector: "Materials",
    issuer: "Peninsula Cement",
    totalQuantity: 25,
    pendingQuantity: 5,
    value: 25000,
    share: 3.0,
    status: "pending_settlement",
    costBasisNote: noCost,
    price: { value: 1000, currency: "INR", priceDate: "2026-09-29", source: priceSource },
    accounts: [{ accountId: "demat-b", quantity: 25, pending: 5, value: 25000, source: brokerB }],
    timeline: [{ date: "2026-09-29", units: 25, label: "Broker B · 25 settled, 5 pending" }],
  },
  {
    isin: "INESYN000013",
    name: "Hillside Debenture 2028",
    assetClass: "bond",
    sector: "Industrials",
    issuer: "Hillside Industries",
    totalQuantity: 20,
    pendingQuantity: 0,
    status: "single_source",
    unvaluedReason: {
      en: "No dependable market price",
      hi: "भरोसेमंद बाज़ार मूल्य नहीं",
    },
    costBasisNote: noCost,
    accounts: [{ accountId: "demat-a", quantity: 20, source: cas }],
    timeline: [{ date: "2026-08-31", units: 20, label: "CAS · 31 Aug 2026" }],
  },
  {
    isin: "INESYN000014",
    name: "Unclassified Series A",
    assetClass: "unknown",
    sector: "Unclassified",
    issuer: "Unclassified",
    totalQuantity: 10,
    pendingQuantity: 0,
    status: "needs_review",
    unvaluedReason: {
      en: "Unclassified",
      hi: "अवर्गीकृत",
    },
    costBasisNote: noCost,
    accounts: [{ accountId: "demat-b", quantity: 10, source: cas }],
    timeline: [{ date: "2026-08-31", units: 10, label: "CAS · 31 Aug 2026" }],
  },
];

export const summary: PortfolioSummary = {
  totalValue: 840000,
  valuedCount: 12,
  holdingCount: 14,
  unvaluedCount: 2,
  asOf: "2026-09-29",
  bankingShare: 42,
  bankingThreshold: 30,
  openIssues: 3,
  issueLine: {
    en: "1 mismatch, 1 unrecognized security, 1 missing price",
    hi: "1 बेमेल, 1 अपरिचित प्रतिभूति, 1 मूल्य नहीं",
  },
  snapshots: [
    { date: "2026-08-31", value: 780000, label: "CAS statement import" },
    { date: "2026-09-29", value: 840000, label: "Broker holdings sync" },
  ],
  assetClasses: [
    { assetClass: "equity", holdings: 7, value: 552800, share: 65.8 },
    { assetClass: "etf", holdings: 1, value: 100000, share: 11.9 },
    { assetClass: "mutual_fund", holdings: 1, value: 67200, share: 8.0 },
    { assetClass: "bond", holdings: 1, value: 50000, share: 6.0 },
    { assetClass: "reit", holdings: 1, value: 40000, share: 4.8 },
    { assetClass: "invit", holdings: 1, value: 30000, share: 3.6 },
  ],
};

export const accounts: Account[] = [
  {
    id: "demat-a",
    label: "Demat A",
    kind: "Demat",
    depository: "CDSL",
    maskedId: "XXXX-1201",
    sourceType: "broker_api",
    sourceLabel: "Upstox · Broker A",
    broker: "Upstox",
    lastUpdated: "2026-09-29",
    state: "fresh",
    holdingCount: 7,
    valuedHoldings: 513800,
  },
  {
    id: "demat-b",
    label: "Demat B",
    kind: "Demat",
    depository: "NSDL",
    maskedId: "XXXX-8842",
    sourceType: "statement",
    sourceLabel: "CAS statement · Broker B",
    lastUpdated: "2026-08-31",
    state: "aging",
    holdingCount: 7,
    valuedHoldings: 259000,
  },
  {
    id: "folio-1",
    label: "Folio 1",
    kind: "Mutual fund folio",
    maskedId: "XXXX-4410",
    sourceType: "statement",
    sourceLabel: "Mutual fund statement",
    lastUpdated: "2026-09-15",
    state: "fresh",
    holdingCount: 1,
    valuedHoldings: 67200,
  },
  {
    id: "groww",
    label: "Groww account",
    kind: "Broker",
    maskedId: "Not connected",
    sourceType: "manual",
    sourceLabel: "Flagged by you",
    broker: "Groww",
    state: "not_connected",
    holdingCount: 0,
    missing: true,
  },
];

export const coverage: Coverage = {
  includedCount: 3,
  missingCount: 1,
  oldestAsOf: "2026-08-31",
  missingLabel: {
    en: "Groww account not connected",
    hi: "Groww खाता जुड़ा नहीं है",
  },
  headline: {
    en: "3 accounts included · 1 flagged as missing: Groww account not connected",
    hi: "3 खाते शामिल · 1 छूटा हुआ: Groww खाता जुड़ा नहीं है",
  },
};

export const totalSource: SourceRef = {
  sourceId: "portfolio-summary",
  type: "sample",
  label: "3 sources",
  asOf: "2026-09-29",
  note: "Total of imported, valued holdings. Unpriced and unclassified rows are excluded. Sample data.",
};

export const evidenceByIsin: Record<string, Evidence> = {
  INESYN000006: {
    isin: "INESYN000006",
    countedUnits: 20,
    countedLabel: {
      en: "Counted once (no double count)",
      hi: "एक बार गिना गया (दोहराव नहीं)",
    },
    canMarkChecked: false,
    why: {
      en: "12 + 8 across two accounts. The statement describes the same 20 units, so they are counted once.",
      hi: "दो खातों में 12 + 8। स्टेटमेंट उन्हीं 20 इकाइयों का है, इसलिए इन्हें एक बार गिना गया है।",
    },
    left: {
      label: { en: "Reported by brokers", hi: "ब्रोकरों की रिपोर्ट" },
      value: "12 + 8",
      detail: "Demat A + Demat B",
      total: 20,
      rows: [
        { source: "Broker A · Demat A · 29 Sep", units: 12 },
        { source: "Broker B · Demat B · 29 Sep", units: 8 },
      ],
    },
    right: {
      label: { en: "Reported by statement (CAS)", hi: "स्टेटमेंट (CAS)" },
      value: "20",
      detail: "31 Aug 2026",
      total: 20,
      rows: [{ source: "CAS · Demat A + B · 31 Aug", units: 20 }],
    },
  },
  INESYN000002: {
    isin: "INESYN000002",
    countedUnits: 40,
    countedLabel: {
      en: "Counted on latest source",
      hi: "नवीनतम स्रोत पर गिना गया",
    },
    canMarkChecked: true,
    why: {
      en: "No transaction explains the 5-unit difference. Please check your statement.",
      hi: "5 इकाइयों का अंतर किसी लेनदेन से नहीं समझा जा सका। कृपया अपना स्टेटमेंट जाँचें।",
    },
    left: {
      label: { en: "Broker A says", hi: "ब्रोकर A कहता है" },
      value: "40",
      detail: "29 Sep 2026",
      total: 40,
      rows: [{ source: "Broker A · Demat A · 29 Sep", units: 40 }],
    },
    right: {
      label: { en: "CAS says", hi: "CAS कहता है" },
      value: "35",
      detail: "31 Aug 2026",
      total: 35,
      rows: [{ source: "CAS · Demat A · 31 Aug", units: 35 }],
    },
  },
};

export const issues: Issue[] = [
  {
    id: "issue-coastal",
    isin: "INESYN000002",
    name: "Coastal Bank",
    type: "mismatch",
    status: "needs_review",
    sourcesLine: "Broker A 40 vs CAS 35",
    explanation: evidenceByIsin.INESYN000002.why,
  },
  {
    id: "issue-unknown",
    isin: "INESYN000014",
    name: "Unclassified Series A",
    type: "unrecognized",
    status: "needs_review",
    sourcesLine: "CAS · 31 Aug 2026",
    explanation: {
      en: "This row was read from the statement but does not match a known security. It is listed, not dropped.",
      hi: "यह पंक्ति स्टेटमेंट में थी, पर किसी ज्ञात प्रतिभूति से नहीं मिली। इसे हटाया नहीं गया है।",
    },
  },
  {
    id: "issue-price",
    isin: "INESYN000013",
    name: "Hillside Debenture 2028",
    type: "missing_price",
    status: "single_source",
    sourcesLine: "CAS · 20 units · no dependable price",
    explanation: {
      en: "Units are shown. No value is shown because there is no dependable market price.",
      hi: "इकाइयाँ दिखाई गई हैं। भरोसेमंद बाज़ार मूल्य न होने से राशि नहीं दिखाई गई।",
    },
  },
  {
    id: "issue-pending",
    isin: "INESYN000012",
    name: "Peninsula Cement",
    type: "pending_settlement",
    status: "pending_settlement",
    sourcesLine: "Broker B · 25 settled · 5 pending",
    explanation: {
      en: "5 units are still settling. They are not added to the settled quantity of 25.",
      hi: "5 इकाइयाँ अभी निपटान में हैं। इन्हें 25 निपटाई इकाइयों में नहीं जोड़ा गया।",
    },
  },
];

export const concentration: Record<"company" | "sector" | "assetClass" | "account", ConcentrationRow[]> = {
  company: [
    { id: "meridian", name: "Meridian Bank", value: 140000, share: 16.7, holdingIsins: ["INESYN000001"] },
    { id: "coastal", name: "Coastal Bank", value: 112800, share: 13.4, holdingIsins: ["INESYN000002"] },
    { id: "aster", name: "Aster Industries", value: 110000, share: 13.1, holdingIsins: ["INESYN000006", "INESYN000007"] },
    { id: "harbour", name: "Harbour Bank", value: 100000, share: 11.9, holdingIsins: ["INESYN000003"] },
    { id: "etf", name: "Broad Market ETF", value: 100000, share: 11.9, lookThroughUnavailable: true, holdingIsins: ["INESYN000004"] },
    { id: "summit", name: "Summit Textiles", value: 75000, share: 8.9, holdingIsins: ["INESYN000005"] },
    { id: "mf", name: "Balanced Growth Fund", value: 67200, share: 8.0, lookThroughUnavailable: true, holdingIsins: ["INFSYN000011"] },
    { id: "reit", name: "City Offices REIT", value: 40000, share: 4.8, holdingIsins: ["INESYN000008"] },
    { id: "steel", name: "Northern Steel", value: 40000, share: 4.8, holdingIsins: ["INESYN000009"] },
    { id: "invit", name: "Energy Infrastructure InvIT", value: 30000, share: 3.6, holdingIsins: ["INESYN000010"] },
    { id: "cement", name: "Peninsula Cement", value: 25000, share: 3.0, holdingIsins: ["INESYN000012"] },
  ],
  sector: [
    { id: "banking", name: "Banking", value: 352800, share: 42.0, holdingIsins: ["INESYN000001", "INESYN000002", "INESYN000003"] },
    { id: "funds", name: "Funds", value: 167200, share: 19.9, lookThroughUnavailable: true, holdingIsins: ["INESYN000004", "INFSYN000011"] },
    { id: "industrials", name: "Industrials", value: 110000, share: 13.1, holdingIsins: ["INESYN000006", "INESYN000007"] },
    { id: "consumer", name: "Consumer", value: 75000, share: 8.9, holdingIsins: ["INESYN000005"] },
    { id: "materials", name: "Materials", value: 65000, share: 7.7, holdingIsins: ["INESYN000009", "INESYN000012"] },
    { id: "real-estate", name: "Real estate", value: 40000, share: 4.8, holdingIsins: ["INESYN000008"] },
    { id: "infrastructure", name: "Infrastructure", value: 30000, share: 3.6, holdingIsins: ["INESYN000010"] },
  ],
  assetClass: [
    { id: "equity", name: "Equity", value: 552800, share: 65.8, holdingIsins: [] },
    { id: "etf", name: "ETF", value: 100000, share: 11.9, holdingIsins: ["INESYN000004"] },
    { id: "mutual_fund", name: "Mutual fund", value: 67200, share: 8.0, lookThroughUnavailable: true, holdingIsins: ["INFSYN000011"] },
    { id: "bond", name: "Bond", value: 50000, share: 6.0, holdingIsins: ["INESYN000007"] },
    { id: "reit", name: "REIT", value: 40000, share: 4.8, holdingIsins: ["INESYN000008"] },
    { id: "invit", name: "InvIT", value: 30000, share: 3.6, holdingIsins: ["INESYN000010"] },
    { id: "unknown", name: "Unclassified", value: 0, share: 0, unclassified: true, holdingIsins: ["INESYN000014"] },
  ],
  account: [
    { id: "demat-a", name: "Demat A", value: 513800, share: 61.2, holdingIsins: [] },
    { id: "demat-b", name: "Demat B", value: 259000, share: 30.8, holdingIsins: [] },
    { id: "folio-1", name: "Folio 1", value: 67200, share: 8.0, holdingIsins: ["INFSYN000011"] },
  ],
};

export const connectionEdges: ConnectionEdge[] = [
  {
    id: "shares",
    holdingIsin: "INESYN000006",
    holdingName: "Aster Industries shares",
    accountLabel: "Demat A + B",
    verb: { en: "Issues shares", hi: "शेयर जारी करती है" },
    sourceDocument: "Sample issuer profile",
    disclosureDate: "2026-03-31",
  },
  {
    id: "bond",
    holdingIsin: "INESYN000007",
    holdingName: "Aster 8.5% bond",
    accountLabel: "Demat A",
    verb: { en: "Owes payments on", hi: "इस पर भुगतान देती है" },
    sourceDocument: "Sample bond terms",
    disclosureDate: "2024-06-15",
  },
  {
    id: "reit",
    holdingIsin: "INESYN000008",
    holdingName: "City Offices REIT",
    accountLabel: "Demat B",
    verb: { en: "Pays rent to", hi: "किराया देती है" },
    disclosed: { en: "10 % of rental revenue", hi: "किराये की आय का 10 %" },
    sourceDocument: "City Offices REIT annual report (sample)",
    disclosureDate: "2026-03-31",
    caution: {
      en: "A tenant contributing 10 % of rent does not mean 10 % of your money is in that tenant.",
      hi: "किराये का 10 % देने वाले किरायेदार का मतलब यह नहीं कि आपके पैसे का 10 % उस किरायेदार में है।",
    },
  },
  {
    id: "invit",
    holdingIsin: "INESYN000010",
    holdingName: "Energy Infrastructure InvIT",
    accountLabel: "Demat B",
    verb: { en: "Purchases power from", hi: "बिजली खरीदती है" },
    sourceDocument: "Energy Infrastructure InvIT disclosure (sample)",
    disclosureDate: "2026-03-31",
  },
];

export const simulatedAnnouncement = {
  title: {
    en: "Aster Industries announces a delay in the interest payment on the bond held in this portfolio.",
    hi: "Aster Industries इस पोर्टफोलियो के बॉन्ड पर ब्याज भुगतान में देरी की घोषणा करती है।",
  },
  impacts: [
    {
      holdingName: "Aster 8.5% bond",
      isin: "INESYN000007",
      level: "confirmed",
      explanation: {
        en: "Directly concerns your bond's payment",
        hi: "सीधे आपके बॉन्ड के भुगतान से जुड़ा है",
      },
    },
    {
      holdingName: "Aster Industries shares",
      isin: "INESYN000006",
      level: "relevant",
      explanation: {
        en: "You also own equity in the issuer",
        hi: "आपके पास जारीकर्ता की इक्विटी भी है",
      },
    },
    {
      holdingName: "City Offices REIT",
      isin: "INESYN000008",
      level: "connected",
      explanation: {
        en: "Disclosed tenant. No evidence here that rent is delayed",
        hi: "घोषित किरायेदार। यहाँ किराया देरी का प्रमाण नहीं है",
      },
    },
    {
      holdingName: "Energy Infrastructure InvIT",
      isin: "INESYN000010",
      level: "connected",
      explanation: {
        en: "Disclosed power purchaser. No infrastructure payment delay established",
        hi: "घोषित बिजली खरीदार। इन्फ्रा भुगतान की देरी यहाँ स्थापित नहीं है",
      },
    },
  ] satisfies ImpactRow[],
};

export const followMoney: Record<string, FollowMoney> = {
  INESYN000006: {
    isin: "INESYN000006",
    structure: [
      { en: "You hold shares of Aster Industries, an operating company.", hi: "आप Aster Industries के शेयर रखते हैं, जो एक कंपनी है।" },
      { en: "A share is an ownership interest. It is not the same as the company's bond.", hi: "शेयर स्वामित्व का हिस्सा है। यह कंपनी के बॉन्ड जैसा नहीं है।" },
    ],
    cashflows: [
      { label: { en: "Dividend, if the company declares one", hi: "लाभांश, यदि कंपनी घोषित करे" }, status: "estimated" },
    ],
    documents: [{ name: "Sample issuer profile", date: "2026-03-31" }],
  },
  INESYN000007: {
    isin: "INESYN000007",
    structure: [
      { en: "This bond is a loan to Aster Industries.", hi: "यह बॉन्ड Aster Industries को दिया गया ऋण है।" },
      { en: "Face value in the sample terms is ₹1,000. The coupon is 8.5 % of face value.", hi: "नमूना शर्तों में अंकित मूल्य ₹1,000 है। कूपन अंकित मूल्य का 8.5 % है।" },
      { en: "Maturity in the sample terms is 2029. You are a lender, not an owner.", hi: "नमूना शर्तों में परिपक्वता 2029 है। आप ऋणदाता हैं, मालिक नहीं।" },
    ],
    cashflows: [
      { label: { en: "Half-yearly interest from the stated coupon", hi: "कथित कूपन से अर्धवार्षिक ब्याज" }, status: "scheduled", amount: 2125 },
      { label: { en: "Principal at maturity, if paid", hi: "परिपक्वता पर मूलधन, यदि चुकाया जाए" }, status: "scheduled" },
    ],
    documents: [{ name: "Sample bond terms", date: "2024-06-15" }],
  },
  INESYN000008: {
    isin: "INESYN000008",
    structure: [
      { en: "REIT units give exposure through the trust. You do not directly own a particular office.", hi: "REIT इकाइयाँ ट्रस्ट के ज़रिए जोखिम देती हैं। आप किसी खास दफ्तर के सीधे मालिक नहीं हैं।" },
      { en: "City Offices REIT holds income-generating offices. Aster Industries is a disclosed tenant.", hi: "City Offices REIT के पास किराये वाले दफ्तर हैं। Aster Industries एक घोषित किरायेदार है।" },
      { en: "Underlying buildings explain the holding. They are not added again to portfolio value.", hi: "इमारतें होल्डिंग को समझाती हैं। इन्हें पोर्टफोलियो मूल्य में दोबारा नहीं जोड़ा जाता।" },
    ],
    cashflows: [
      { label: { en: "Distribution announced for this quarter (sample)", hi: "इस तिमाही का घोषित वितरण (नमूना)" }, status: "announced", amount: 800 },
    ],
    documents: [{ name: "City Offices REIT annual report (sample)", date: "2026-03-31" }],
  },
  INESYN000010: {
    isin: "INESYN000010",
    structure: [
      { en: "InvIT units are linked to infrastructure assets, here a power project in the sample documents.", hi: "InvIT इकाइयाँ इन्फ्रा संपत्तियों से जुड़ी हैं। नमूना दस्तावेज़ों में यह एक बिजली परियोजना है।" },
      { en: "Aster Industries is a disclosed power purchaser. That is a contract link, not extra portfolio value.", hi: "Aster Industries घोषित बिजली खरीदार है। यह अनुबंध का संबंध है, अतिरिक्त पोर्टफोलियो मूल्य नहीं।" },
    ],
    cashflows: [
      { label: { en: "Distribution estimated from past sample disclosures", hi: "पिछले नमूना खुलासों से अनुमानित वितरण" }, status: "estimated", amount: 450 },
    ],
    documents: [{ name: "Energy Infrastructure InvIT disclosure (sample)", date: "2026-03-31" }],
  },
};

export const cashflows: CashflowItem[] = [
  {
    id: "cf-bond",
    date: "2026-10-15",
    name: "Aster 8.5% bond interest",
    accountId: "demat-a",
    amount: 2125,
    status: "scheduled",
    kind: "interest",
  },
  {
    id: "cf-reit",
    date: "2026-10-20",
    name: "City Offices REIT distribution",
    accountId: "demat-b",
    amount: 800,
    status: "announced",
    kind: "distribution",
  },
  {
    id: "cf-invit",
    date: "2026-10-22",
    name: "Energy Infrastructure InvIT distribution",
    accountId: "demat-b",
    amount: 450,
    status: "estimated",
    kind: "distribution",
  },
  {
    id: "cf-etf",
    date: "2026-09-10",
    name: "Broad Market ETF dividend",
    accountId: "demat-a",
    amount: 200,
    status: "confirmed_received",
    kind: "dividend",
  },
];

export const brokers: Broker[] = [
  {
    id: "zerodha",
    name: "Zerodha",
    access: "requires_partner_access",
    connection: "not_connected",
    note: { en: "Live authorization depends on confirmed partner access", hi: "लाइव अनुमति पुष्ट पार्टनर एक्सेस पर निर्भर है" },
  },
  { id: "upstox", name: "Upstox", access: "live", connection: "not_connected" },
  {
    id: "groww",
    name: "Groww",
    access: "requires_partner_access",
    connection: "not_connected",
    note: { en: "Live authorization depends on confirmed partner access", hi: "लाइव अनुमति पुष्ट पार्टनर एक्सेस पर निर्भर है" },
  },
  { id: "dhan", name: "Dhan", access: "mock", connection: "not_connected" },
  { id: "mock-broker", name: "Mock Broker B", access: "mock", connection: "not_connected" },
];

export const education: EducationTopic[] = [
  {
    type: "reit",
    name: { en: "REIT", hi: "REIT" },
    summary: {
      en: "Units linked to a portfolio of income-generating real estate.",
      hi: "किराये से आय देने वाली संपत्तियों के पोर्टफोलियो से जुड़ी इकाइयाँ।",
    },
    returns: {
      en: "Returns can come from distributions and from changes in the unit price. Distributions are not guaranteed.",
      hi: "रिटर्न वितरण और इकाई की कीमत में बदलाव से आ सकता है। वितरण की गारंटी नहीं है।",
    },
    benefits: [
      { en: "Access to a property portfolio through listed units.", hi: "सूचीबद्ध इकाइयों से संपत्ति पोर्टफोलियो तक पहुँच।" },
      { en: "Distributions, when declared, are a visible cash flow.", hi: "घोषित होने पर वितरण एक दिखने वाला नकदी प्रवाह है।" },
    ],
    risks: [
      { en: "Unit prices move. Occupancy and rent can fall.", hi: "इकाई की कीमत बदलती है। अधिभोग और किराया घट सकता है।" },
      { en: "You do not own a specific building.", hi: "आप किसी खास इमारत के मालिक नहीं होते।" },
    ],
    liquidity: {
      en: "Listed units can be sold on the exchange when there is a buyer. Trading can be thin.",
      hi: "खरीदार होने पर इकाइयाँ एक्सचेंज पर बिक सकती हैं। कारोबार कम हो सकता है।",
    },
    inspect: [
      { label: { en: "Properties", hi: "संपत्तियाँ" }, detail: { en: "What the trust holds and where.", hi: "ट्रस्ट के पास क्या है और कहाँ।" } },
      { label: { en: "Distributions", hi: "वितरण" }, detail: { en: "History and what the payment is made of.", hi: "इतिहास और भुगतान किससे बना है।" } },
      { label: { en: "Price and liquidity", hi: "कीमत और तरलता" }, detail: { en: "Market price, not just the last distribution.", hi: "बाज़ार कीमत, सिर्फ पिछला वितरण नहीं।" } },
    ],
    source: { name: "Reviewed sample explainer, based on public investor-education themes", date: "2026-09-01" },
    prompt: {
      en: "You hold City Offices REIT in Demat B.",
      hi: "आपके पास Demat B में City Offices REIT है।",
    },
  },
  {
    type: "invit",
    name: { en: "InvIT", hi: "InvIT" },
    summary: {
      en: "Units linked to infrastructure assets such as roads or transmission projects.",
      hi: "सड़क या ट्रांसमिशन जैसी इन्फ्रा संपत्तियों से जुड़ी इकाइयाँ।",
    },
    returns: {
      en: "Cash can come from project cash flows distributed by the trust, and from the unit price. Both can change.",
      hi: "नकदी परियोजना के प्रवाह और इकाई की कीमत से आ सकती है। दोनों बदल सकते हैं।",
    },
    benefits: [
      { en: "Exposure to infrastructure cash flows through units.", hi: "इकाइयों के ज़रिए इन्फ्रा नकदी प्रवाह का जोखिम।" },
    ],
    risks: [
      { en: "Project revenue, debt and traffic or offtake can differ from what was described.", hi: "परियोजना की आय, ऋण और उपयोग वर्णन से अलग हो सकते हैं।" },
      { en: "Distributions can be reduced or skipped.", hi: "वितरण घट सकता है या रुक सकता है।" },
    ],
    liquidity: {
      en: "Listed InvIT units trade on the exchange. A listed price is not a promise you can exit at that price.",
      hi: "सूचीबद्ध InvIT इकाइयाँ एक्सचेंज पर कारोबार करती हैं। सूचीबद्ध कीमत निकास की गारंटी नहीं है।",
    },
    inspect: [
      { label: { en: "Assets", hi: "संपत्तियाँ" }, detail: { en: "Which projects sit under the trust.", hi: "ट्रस्ट के अंतर्गत कौन सी परियोजनाएँ हैं।" } },
      { label: { en: "Debt", hi: "ऋण" }, detail: { en: "Borrowing at the trust or project.", hi: "ट्रस्ट या परियोजना पर उधार।" } },
      { label: { en: "Distributions", hi: "वितरण" }, detail: { en: "What was paid, and what was only estimated.", hi: "क्या चुकाया गया और क्या केवल अनुमान था।" } },
    ],
    source: { name: "Reviewed sample explainer, based on public investor-education themes", date: "2026-09-01" },
    prompt: {
      en: "You hold Energy Infrastructure InvIT in Demat B.",
      hi: "आपके पास Demat B में Energy Infrastructure InvIT है।",
    },
  },
  {
    type: "bond",
    name: { en: "Bond", hi: "बॉन्ड" },
    summary: {
      en: "Lending to an issuer under specified payment terms.",
      hi: "निर्धारित भुगतान शर्तों पर जारीकर्ता को ऋण देना।",
    },
    returns: {
      en: "The coupon describes payments relative to face value. Your return if you buy at today's price can differ.",
      hi: "कूपन अंकित मूल्य के मुकाबले भुगतान बताता है। आज की कीमत पर खरीदने पर रिटर्न अलग हो सकता है।",
    },
    benefits: [
      { en: "A stated schedule of interest and repayment.", hi: "ब्याज और पुनर्भुगतान की लिखी हुई समय-सारणी।" },
    ],
    risks: [
      { en: "The issuer can delay or miss a payment.", hi: "जारीकर्ता भुगतान में देरी कर सकता है या चूक सकता है।" },
      { en: "If yields rise, the market price of a fixed coupon can fall.", hi: "यदि यील्ड बढ़े, तो निश्चित कूपन की बाज़ार कीमत गिर सकती है।" },
    ],
    liquidity: {
      en: "Some bonds rarely trade. A missing price means we show units, not an invented value.",
      hi: "कुछ बॉन्ड कम बिकते हैं। कीमत न हो तो हम इकाइयाँ दिखाते हैं, काल्पनिक मूल्य नहीं।",
    },
    inspect: [
      { label: { en: "Issuer", hi: "जारीकर्ता" }, detail: { en: "Who owes the payments.", hi: "भुगतान कौन देता है।" } },
      { label: { en: "Coupon vs yield", hi: "कूपन बनाम यील्ड" }, detail: { en: "Coupon is on face value. Yield depends on price.", hi: "कूपन अंकित मूल्य पर है। यील्ड कीमत पर निर्भर है।" } },
      { label: { en: "Maturity", hi: "परिपक्वता" }, detail: { en: "When principal is due, if the terms are met.", hi: "शर्तें पूरी हों तो मूलधन कब देय है।" } },
    ],
    source: { name: "Reviewed sample explainer, based on public investor-education themes", date: "2026-09-01" },
    prompt: {
      en: "An 8 % coupon describes payments relative to face value. Your return if you buy at today's price can differ. The Aster bond in this sample states 8.5 %.",
      hi: "8 % कूपन अंकित मूल्य के मुकाबले भुगतान बताता है। आज की कीमत पर रिटर्न अलग हो सकता है। इस नमूने का Aster बॉन्ड 8.5 % बताता है।",
    },
  },
  {
    type: "stock",
    name: { en: "Stock", hi: "शेयर" },
    summary: {
      en: "A share is part-ownership of a company. Price and dividends can both change.",
      hi: "शेयर कंपनी के स्वामित्व का हिस्सा है। कीमत और लाभांश दोनों बदल सकते हैं।",
    },
    returns: {
      en: "Returns can come from the share price and from dividends, if declared. Neither is fixed.",
      hi: "रिटर्न शेयर की कीमत और घोषित लाभांश से आ सकता है। कोई भी तय नहीं है।",
    },
    benefits: [
      { en: "Ownership that can be sold when the market is open and a buyer exists.", hi: "बाज़ार खुला हो और खरीदार हो तो बेचा जा सकने वाला स्वामित्व।" },
    ],
    risks: [
      { en: "The price can fall. A company can stop dividends.", hi: "कीमत गिर सकती है। कंपनी लाभांश रोक सकती है।" },
    ],
    liquidity: {
      en: "Listed shares usually trade more often than REITs, InvITs or bonds, but that is not a rule for every name.",
      hi: "सूचीबद्ध शेयर अक्सर REIT, InvIT या बॉन्ड से अधिक बिकते हैं, पर यह हर नाम पर लागू नहीं।",
    },
    inspect: [
      { label: { en: "Business", hi: "कारोबार" }, detail: { en: "What the company sells.", hi: "कंपनी क्या बेचती है।" } },
      { label: { en: "Accounts that hold it", hi: "खाते" }, detail: { en: "The same ISIN in two demat accounts is still one holding.", hi: "दो डीमैट खातों में एक ही ISIN फिर भी एक होल्डिंग है।" } },
    ],
    source: { name: "Reviewed sample explainer", date: "2026-09-01" },
  },
];

export const compareRows: { topic: Copy; cells: Record<"stock" | "reit" | "invit" | "bond", Copy> }[] = [
  {
    topic: { en: "Income", hi: "आय" },
    cells: {
      stock: { en: "Dividends, if declared", hi: "लाभांश, यदि घोषित हो" },
      reit: { en: "Distributions from property cash flow, if paid", hi: "संपत्ति के नकदी प्रवाह से वितरण, यदि चुकाया जाए" },
      invit: { en: "Distributions from project cash flow, if paid", hi: "परियोजना के नकदी प्रवाह से वितरण, यदि चुकाया जाए" },
      bond: { en: "Coupon on a stated schedule", hi: "लिखी समय-सारणी पर कूपन" },
    },
  },
  {
    topic: { en: "Price changes", hi: "कीमत में बदलाव" },
    cells: {
      stock: { en: "Market price can move every session", hi: "बाज़ार कीमत हर सत्र बदल सकती है" },
      reit: { en: "Unit price can move with property and rate expectations", hi: "इकाई कीमत संपत्ति और दर की उम्मीदों से बदल सकती है" },
      invit: { en: "Unit price can move with project and rate expectations", hi: "इकाई कीमत परियोजना और दर की उम्मीदों से बदल सकती है" },
      bond: { en: "Price can fall when yields rise, even if the coupon stays the same", hi: "कूपन वही रहे तब भी यील्ड बढ़ने पर कीमत गिर सकती है" },
    },
  },
  {
    topic: { en: "Liquidity", hi: "तरलता" },
    cells: {
      stock: { en: "Often easier to sell, not always", hi: "अक्सर बेचना आसान, हमेशा नहीं" },
      reit: { en: "Listed, but trading can be thin", hi: "सूचीबद्ध, पर कारोबार कम हो सकता है" },
      invit: { en: "Listed, but trading can be thin", hi: "सूचीबद्ध, पर कारोबार कम हो सकता है" },
      bond: { en: "Some bonds rarely trade", hi: "कुछ बॉन्ड कम बिकते हैं" },
    },
  },
  {
    topic: { en: "Risk", hi: "जोखिम" },
    cells: {
      stock: { en: "Business and price risk. You are an owner.", hi: "कारोबार और कीमत का जोखिम। आप मालिक हैं।" },
      reit: { en: "Property, rate and distribution risk. You own units, not a building.", hi: "संपत्ति, दर और वितरण का जोखिम। आपके पास इकाइयाँ हैं, इमारत नहीं।" },
      invit: { en: "Project, debt and distribution risk.", hi: "परियोजना, ऋण और वितरण का जोखिम।" },
      bond: { en: "Credit, delay and interest-rate risk. You are a lender.", hi: "ऋण, देरी और ब्याज-दर का जोखिम। आप ऋणदाता हैं।" },
    },
  },
];

export const lessons: Lesson[] = [
  {
    id: "bond-yield",
    title: { en: "Change a bond's market yield", hi: "बॉन्ड की बाज़ार यील्ड बदलें" },
    learn: { en: "Price and coupon are different things.", hi: "कीमत और कूपन अलग बातें हैं।" },
    variableLabel: { en: "Assumed price change", hi: "मानी गई कीमत में बदलाव" },
    start: 10000,
    endingMarket: 9000,
    distributions: 600,
    combined: 9600,
    teaching: {
      en: "Receiving cash does not mean the investment made a profit.",
      hi: "नकद मिलने का मतलब यह नहीं कि निवेश में लाभ हुआ।",
    },
    note: { en: "Simplified: no other cash flows, fees or taxes.", hi: "सरलीकृत: अन्य नकदी प्रवाह, शुल्क या कर नहीं।" },
  },
  {
    id: "reit-distribution",
    title: { en: "Reduce a REIT's assumed distribution", hi: "REIT का माना वितरण घटाएँ" },
    learn: { en: "Distributions vary. They are not guaranteed.", hi: "वितरण बदलता है। इसकी गारंटी नहीं है।" },
    variableLabel: { en: "Assumed distribution cut", hi: "मानी गई वितरण कटौती" },
    start: 10000,
    endingMarket: 9000,
    distributions: 600,
    combined: 9600,
    teaching: {
      en: "Receiving cash does not mean the investment made a profit.",
      hi: "नकद मिलने का मतलब यह नहीं कि निवेश में लाभ हुआ।",
    },
    note: { en: "Simplified: no other cash flows, fees or taxes.", hi: "सरलीकृत: अन्य नकदी प्रवाह, शुल्क या कर नहीं।" },
  },
  {
    id: "payment-delay",
    title: { en: "Delay a bond payment", hi: "बॉन्ड भुगतान में देरी" },
    learn: { en: "A schedule is not a receipt.", hi: "समय-सारणी रसीद नहीं है।" },
    variableLabel: { en: "Assumed delay", hi: "मानी गई देरी" },
    start: 10000,
    endingMarket: 9000,
    distributions: 600,
    combined: 9600,
    teaching: {
      en: "Receiving cash does not mean the investment made a profit.",
      hi: "नकद मिलने का मतलब यह नहीं कि निवेश में लाभ हुआ।",
    },
    note: { en: "Simplified: no other cash flows, fees or taxes.", hi: "सरलीकृत: अन्य नकदी प्रवाह, शुल्क या कर नहीं।" },
  },
  {
    id: "invit-distribution",
    title: { en: "Reduce an InvIT's assumed distribution", hi: "InvIT का माना वितरण घटाएँ" },
    learn: { en: "An InvIT distribution can be cut.", hi: "InvIT का वितरण कट सकता है।" },
    variableLabel: { en: "Assumed distribution cut", hi: "मानी गई वितरण कटौती" },
    start: 10000,
    endingMarket: 9000,
    distributions: 600,
    combined: 9600,
    teaching: {
      en: "Receiving cash does not mean the investment made a profit.",
      hi: "नकद मिलने का मतलब यह नहीं कि निवेश में लाभ हुआ।",
    },
    note: { en: "Simplified: no other cash flows, fees or taxes.", hi: "सरलीकृत: अन्य नकदी प्रवाह, शुल्क या कर नहीं।" },
  },
  {
    id: "early-exit",
    title: { en: "Choose an earlier exit date", hi: "पहले निकलने की तारीख चुनें" },
    learn: { en: "Exit timing and liquidity matter.", hi: "निकास का समय और तरलता मायने रखते हैं।" },
    variableLabel: { en: "Assumed exit haircut", hi: "मानी गई निकास कटौती" },
    start: 10000,
    endingMarket: 9000,
    distributions: 600,
    combined: 9600,
    teaching: {
      en: "Receiving cash does not mean the investment made a profit.",
      hi: "नकद मिलने का मतलब यह नहीं कि निवेश में लाभ हुआ।",
    },
    note: { en: "Simplified: no other cash flows, fees or taxes.", hi: "सरलीकृत: अन्य नकदी प्रवाह, शुल्क या कर नहीं।" },
  },
];

export const risks: RiskCard[] = [
  {
    id: "concentration",
    title: { en: "Concentration", hi: "संकेंद्रण" },
    observation: {
      en: "42 % of your imported, valued portfolio is in banking.",
      hi: "आपके आयातित, मूल्यांकित पोर्टफोलियो का 42 % बैंकिंग में है।",
    },
    level: { en: "Above 30 % threshold", hi: "30 % सीमा से ऊपर" },
    threshold: { en: "Threshold shown: 30 % (descriptive, not a judgement)", hi: "दिखाई सीमा: 30 % (वर्णन, निर्णय नहीं)" },
    href: "/concentration",
    source: "Concentration engine · sample",
    asOf: "2026-09-29",
  },
  {
    id: "shared",
    title: { en: "Shared dependency", hi: "साझा निर्भरता" },
    observation: {
      en: "4 holdings link to Aster Industries in the sample documents.",
      hi: "नमूना दस्तावेज़ों में 4 होल्डिंग्स Aster Industries से जुड़ी हैं।",
    },
    level: { en: "Documented link", hi: "दस्तावेज़ी संबंध" },
    threshold: { en: "Shown when a disclosed relationship exists. Not a prediction.", hi: "घोषित संबंध होने पर दिखाया जाता है। यह भविष्यवाणी नहीं है।" },
    href: "/connections",
    source: "Relationship graph · sample documents",
    asOf: "2026-03-31",
  },
  {
    id: "rates",
    title: { en: "Interest rate", hi: "ब्याज दर" },
    observation: {
      en: "You hold a fixed-coupon bond. If yields rise, its market price can fall while the coupon stays 8.5 %.",
      hi: "आपके पास निश्चित कूपन वाला बॉन्ड है। यील्ड बढ़े तो कूपन 8.5 % रहते हुए बाज़ार कीमत गिर सकती है।",
    },
    level: { en: "Bond sleeve", hi: "बॉन्ड हिस्सा" },
    threshold: { en: "Describes the bond you hold. Not a forecast.", hi: "आपके बॉन्ड का वर्णन है। पूर्वानुमान नहीं।" },
    href: "/lab",
    source: "Sample bond terms",
    asOf: "2024-06-15",
  },
  {
    id: "credit",
    title: { en: "Credit or default", hi: "साख या चूक" },
    observation: {
      en: "The Aster bond depends on Aster Industries making payments. A delay is a credit event for that bond.",
      hi: "Aster बॉन्ड Aster Industries के भुगतान पर निर्भर है। देरी उस बॉन्ड के लिए साख की घटना है।",
    },
    level: { en: "Issuer obligation", hi: "जारीकर्ता का दायित्व" },
    threshold: { en: "No rating is invented here.", hi: "यहाँ कोई रेटिंग गढ़ी नहीं गई है।" },
    href: "/portfolio/INESYN000007",
    source: "Sample bond terms",
    asOf: "2024-06-15",
  },
  {
    id: "liquidity",
    title: { en: "Liquidity", hi: "तरलता" },
    observation: {
      en: "The REIT, InvIT and unpriced debenture may be harder to sell than the listed shares.",
      hi: "REIT, InvIT और बिना कीमत वाला डिबेंचर शेयरों से बेचना कठिन हो सकता है।",
    },
    level: { en: "Trading may be thin", hi: "कारोबार कम हो सकता है" },
    threshold: { en: "Based on instrument type, not a quote.", hi: "उपकरण के प्रकार पर आधारित, भाव नहीं।" },
    href: "/learn/reit",
    source: "Education notes · sample",
    asOf: "2026-09-01",
  },
  {
    id: "distribution",
    title: { en: "Distribution", hi: "वितरण" },
    observation: {
      en: "REIT and InvIT distributions in this sample are announced or estimated. They are not marked received.",
      hi: "इस नमूने में REIT और InvIT वितरण घोषित या अनुमानित हैं। इन्हें प्राप्त नहीं चिह्नित किया गया।",
    },
    level: { en: "Not a receipt", hi: "रसीद नहीं" },
    threshold: { en: "Status tag is shown on every cash-flow row.", hi: "हर नकदी पंक्ति पर स्थिति टैग है।" },
    href: "/cashflow",
    source: "Cash-flow calendar · sample",
    asOf: "2026-09-29",
  },
  {
    id: "coverage",
    title: { en: "Data and coverage", hi: "डेटा और कवरेज" },
    observation: {
      en: "Groww is flagged as not connected. Coastal Bank still needs review. Oldest statement is 31 Aug 2026.",
      hi: "Groww जुड़ा नहीं है। Coastal Bank की समीक्षा बाकी है। सबसे पुराना स्टेटमेंट 31 Aug 2026 का है।",
    },
    level: { en: "Partial coverage", hi: "आंशिक कवरेज" },
    threshold: { en: "Totals use only the sources you imported.", hi: "योग केवल आपके आयातित स्रोतों का है।" },
    href: "/accounts",
    source: "Coverage checklist",
    asOf: "2026-09-29",
  },
];

export const assistantReplies: Record<string, AssistantReply> = {
  concentration: {
    text: {
      en: "42 % of your imported, valued portfolio is in banking, as of 29 Sep 2026. The descriptive threshold on this screen is 30 %. That label is not a judgement and it is not a recommendation. Meridian Bank, Coastal Bank and Harbour Bank make up that 42 %.",
      hi: "29 Sep 2026 तक आपके आयातित, मूल्यांकित पोर्टफोलियो का 42 % बैंकिंग में है। इस स्क्रीन की वर्णनात्मक सीमा 30 % है। यह लेबल निर्णय या सिफारिश नहीं है। Meridian Bank, Coastal Bank और Harbour Bank मिलकर यह 42 % बनाते हैं।",
    },
    sources: ["Concentration engine", "Portfolio summary · 29 Sep 2026"],
  },
  bond: {
    text: {
      en: "The Aster 8.5 % 2029 bond is a loan to Aster Industries. You hold 50 units in Demat A, valued at ₹50,000 because the sample price is ₹1,000. The 8.5 % coupon is a payment relative to face value. It is not the same as your return at today's price. A schedule is not a receipt.",
      hi: "Aster 8.5 % 2029 बॉन्ड Aster Industries को दिया गया ऋण है। आपके पास Demat A में 50 इकाइयाँ हैं, नमूना कीमत ₹1,000 होने से मूल्य ₹50,000 है। 8.5 % कूपन अंकित मूल्य के मुकाबले भुगतान है। यह आज की कीमत पर आपके रिटर्न के बराबर नहीं है। समय-सारणी रसीद नहीं है।",
    },
    sources: ["Sample bond terms · 15 Jun 2024", "Holding INESYN000007"],
  },
  reit: {
    text: {
      en: "City Offices REIT is in Demat B (NSDL, XXXX-8842), 40 units, sample value ₹40,000, as of 29 Sep 2026. It is not in Demat A or Folio 1.",
      hi: "City Offices REIT Demat B (NSDL, XXXX-8842) में है, 40 इकाइयाँ, नमूना मूल्य ₹40,000, 29 Sep 2026 तक। यह Demat A या Folio 1 में नहीं है।",
    },
    sources: ["Broker B holdings", "Holding INESYN000008"],
  },
  invit: {
    text: {
      en: "Energy Infrastructure InvIT units give exposure through the trust, not direct ownership of a power plant. In the sample documents Aster Industries is a disclosed power purchaser. That link does not add the plant's value to your portfolio. Distributions can be reduced. The upcoming row is marked Estimated, not received.",
      hi: "Energy Infrastructure InvIT की इकाइयाँ ट्रस्ट के ज़रिए जोखिम देती हैं, बिजली संयंत्र का सीधा स्वामित्व नहीं। नमूना दस्तावेज़ों में Aster Industries घोषित बिजली खरीदार है। यह संबंध संयंत्र का मूल्य आपके पोर्टफोलियो में नहीं जोड़ता। वितरण घट सकता है। आने वाली पंक्ति अनुमानित है, प्राप्त नहीं।",
    },
    sources: ["InvIT disclosure · 31 Mar 2026", "Cash-flow calendar"],
  },
  unknown: {
    text: {
      en: "I don't have that in your data or documents.",
      hi: "यह आपकी डेटा या दस्तावेज़ों में नहीं है।",
    },
    sources: [],
  },
};

export const uploadPreview = {
  fileLabel: "sample-cas.csv",
  statementDate: "2026-08-31",
  accountsFound: ["Demat A", "Demat B", "Folio 1"],
  recognized: 13,
  unrecognized: [{ row: 14, text: "Unclassified Series A · 10 units · no ISIN match" }],
};

export const portfolioMix = {
  total: 840000,
  equity: 552800,
  bond: 50000,
  reit: 40000,
  invit: 30000,
  illustrativeDistributions: 4200,
  scheduledCoupon: 4250,
};

export function holdingByIsin(isin: string) {
  return holdings.find((holding) => holding.isin === isin);
}

export function accountById(id: string) {
  return accounts.find((account) => account.id === id);
}

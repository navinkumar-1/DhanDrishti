import type { Copy, Lang } from "@/types/domain";

/**
 * Illustrative scenario math. It uses the caller's imported mix and does not place an order.
 */
export type ScenarioId =
  | "equity_fall"
  | "yield_rise"
  | "distribution_cut"
  | "payment_delay"
  | "early_exit";

export interface LabInput {
  mode: "portfolio" | "virtual";
  virtualAmount: number;
  scenario: ScenarioId;
  percent: number;
  language: Lang;
  portfolio?: { total: number; equity: number; bond: number; distributions: number };
}

export interface LabResult {
  originalValue: number;
  scenarioValue: number;
  cashReceived: number;
  combinedEnding: number;
  explanation: Copy;
  assumptions: Copy[];
}

export function runScenario(input: LabInput): LabResult {
  const mix = input.portfolio ?? { total: 0, equity: 0, bond: 0, distributions: 0 };
  const base = input.mode === "portfolio" ? mix.total : Math.max(0, Math.round(input.virtualAmount));
  const scale = mix.total === 0 ? 0 : base / mix.total;
  const equity = mix.total === 0 && input.mode === "virtual" ? base : Math.round(mix.equity * scale);
  const bond = Math.round(mix.bond * scale);
  const distributions = Math.round(mix.distributions * scale);
  const percent = clamp(input.percent);

  let scenarioValue = base;
  let cashReceived = 0;

  if (input.scenario === "equity_fall") {
    scenarioValue = base - Math.round((equity * percent) / 100);
  } else if (input.scenario === "yield_rise") {
    scenarioValue = base - Math.round((bond * percent) / 100);
  } else if (input.scenario === "distribution_cut") {
    cashReceived = Math.round(distributions * (1 - percent / 100));
  } else if (input.scenario === "payment_delay") {
    cashReceived = 0;
  } else {
    scenarioValue = base - Math.round((base * percent) / 100);
  }

  const combinedEnding = scenarioValue + cashReceived;

  return {
    originalValue: base,
    scenarioValue,
    cashReceived,
    combinedEnding,
    explanation: explain(input.scenario, percent, input.language, {
      originalValue: base,
      scenarioValue,
      cashReceived,
    }),
    assumptions: assumptions(input.scenario),
  };
}

function clamp(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function explain(
  scenario: ScenarioId,
  percent: number,
  _language: Lang,
  result: { originalValue: number; scenarioValue: number; cashReceived: number },
): Copy {
  const en: Record<ScenarioId, string> = {
    equity_fall: `Under these assumptions, a ${percent} % fall applies only to the equity portion. Original valued amount ₹${result.originalValue.toLocaleString("en-IN")} becomes ₹${result.scenarioValue.toLocaleString("en-IN")}. This is not a forecast.`,
    yield_rise: `Under these assumptions, a ${percent} % price fall applies only to the bond portion. Coupon terms are unchanged. Original ₹${result.originalValue.toLocaleString("en-IN")} becomes ₹${result.scenarioValue.toLocaleString("en-IN")}.`,
    distribution_cut: `Under these assumptions, market value stays ₹${result.scenarioValue.toLocaleString("en-IN")} and illustrative distributions received are ₹${result.cashReceived.toLocaleString("en-IN")}. A cut is not a prediction.`,
    payment_delay: `Under these assumptions, the scheduled bond payment is not treated as received. Market value stays ₹${result.scenarioValue.toLocaleString("en-IN")}. A schedule is not a receipt.`,
    early_exit: `Under these assumptions, an exit haircut of ${percent} % changes ₹${result.originalValue.toLocaleString("en-IN")} to ₹${result.scenarioValue.toLocaleString("en-IN")}. This is not a quote.`,
  };
  const hi: Record<ScenarioId, string> = {
    equity_fall: `इन मान्यताओं में ${percent} % गिरावट केवल इक्विटी हिस्से पर है। ₹${result.originalValue.toLocaleString("en-IN")} से ₹${result.scenarioValue.toLocaleString("en-IN")} होता है। यह पूर्वानुमान नहीं है।`,
    yield_rise: `इन मान्यताओं में ${percent} % कीमत गिरावट केवल बॉन्ड हिस्से पर है। कूपन नहीं बदलता। ₹${result.originalValue.toLocaleString("en-IN")} से ₹${result.scenarioValue.toLocaleString("en-IN")} होता है।`,
    distribution_cut: `इन मान्यताओं में बाज़ार मूल्य ₹${result.scenarioValue.toLocaleString("en-IN")} रहता है और उदाहरण वितरण ₹${result.cashReceived.toLocaleString("en-IN")} है। यह भविष्यवाणी नहीं है।`,
    payment_delay: `इन मान्यताओं में निर्धारित बॉन्ड भुगतान को प्राप्त नहीं माना गया। बाज़ार मूल्य ₹${result.scenarioValue.toLocaleString("en-IN")} रहता है। समय-सारणी रसीद नहीं है।`,
    early_exit: `इन मान्यताओं में ${percent} % निकास कटौती ₹${result.originalValue.toLocaleString("en-IN")} को ₹${result.scenarioValue.toLocaleString("en-IN")} करती है। यह भाव नहीं है।`,
  };
  return { en: en[scenario], hi: hi[scenario] };
}

function assumptions(scenario: ScenarioId): Copy[] {
  const common: Copy = {
    en: "Excluded: fees, taxes, other cash flows.",
    hi: "बाहर: शुल्क, कर, अन्य नकदी प्रवाह।",
  };
  const specific: Record<ScenarioId, Copy> = {
    equity_fall: {
      en: "Only the imported equity sleeve changes. Other holdings stay at the last imported value.",
      hi: "केवल आयातित इक्विटी हिस्सा बदलता है। बाकी होल्डिंग्स पिछले मूल्य पर रहती हैं।",
    },
    yield_rise: {
      en: "The percent is an assumed bond price change, not a yield forecast. Coupon rate stays as stated.",
      hi: "प्रतिशत मानी गई बॉन्ड कीमत है, यील्ड का पूर्वानुमान नहीं। कूपन दर वही रहती है।",
    },
    distribution_cut: {
      en: "Illustrative REIT and InvIT distributions are reduced. Market value is left unchanged.",
      hi: "उदाहरण REIT और InvIT वितरण घटता है। बाज़ार मूल्य वही रहता है।",
    },
    payment_delay: {
      en: "The scheduled coupon is excluded from cash received. No loss amount is predicted.",
      hi: "निर्धारित कूपन प्राप्त नकदी में नहीं है। किसी हानि की भविष्यवाणी नहीं है।",
    },
    early_exit: {
      en: "The haircut is an assumption about exit price, not a market quote.",
      hi: "कटौती निकास कीमत की मान्यता है, बाज़ार भाव नहीं।",
    },
  };
  return [specific[scenario], common];
}

import crypto from "crypto";

const AUTHORIZE_URL = "https://api.upstox.com/v2/login/authorization/dialog";
const TOKEN_URL = "https://api.upstox.com/v2/login/authorization/token";
const EQUITY_HOLDINGS_URL = "https://api.upstox.com/v2/portfolio/long-term-holdings";
const MF_HOLDINGS_URL = "https://api.upstox.com/v2/mf/holdings";

export interface UpstoxEquityHolding {
  isin?: string;
  trading_symbol?: string;
  company_name?: string;
  quantity?: number;
  t1_quantity?: number;
  average_price?: number;
  last_price?: number;
  exchange?: string;
}

export interface UpstoxMutualFundHolding {
  instrument_key?: string;
  folio?: string;
  fund?: string;
  quantity?: number;
  average_price?: number;
  last_price?: number;
  last_price_date?: string;
  pledged_quantity?: number;
}

function getEnv() {
  const clientId = process.env.UPSTOX_CLIENT_ID;
  const clientSecret = process.env.UPSTOX_CLIENT_SECRET;
  const redirectUri = process.env.UPSTOX_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Upstox environment variables");
  }
  return { clientId, clientSecret, redirectUri };
}

export function createUpstoxState() {
  const nonce = crypto.randomBytes(32).toString("hex");
  const secret = process.env.UPSTOX_STATE_SECRET;
  if (!secret) return nonce;
  const signature = crypto.createHmac("sha256", secret).update(nonce).digest("hex");
  return `${nonce}.${signature}`;
}

export function isValidUpstoxState(state: string) {
  const secret = process.env.UPSTOX_STATE_SECRET;
  if (!secret) return true;
  const [nonce, signature] = state.split(".");
  if (!nonce || !signature || signature.length !== 64) return false;
  const expected = crypto.createHmac("sha256", secret).update(nonce).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function getUpstoxAuthorizationUrl(state: string) {
  const { clientId, redirectUri } = getEnv();
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeUpstoxCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getEnv();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = (await response.json()) as { access_token?: string; user_id?: string; user_name?: string; errors?: { errorCode?: string }[] };
  if (!response.ok) {
    console.error("Upstox token exchange failed", { status: response.status, errorCode: data.errors?.[0]?.errorCode });
    throw new Error("UPSTOX_TOKEN_EXCHANGE_FAILED");
  }
  if (!data.access_token) throw new Error("UPSTOX_ACCESS_TOKEN_MISSING");
  return { accessToken: data.access_token, userId: data.user_id, userName: data.user_name };
}

async function upstoxGet<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = (await response.json()) as T;
  if (response.status === 401) throw new Error("UPSTOX_TOKEN_EXPIRED");
  if (!response.ok) {
    console.error("Upstox API error", { status: response.status, endpoint: new URL(url).pathname });
    throw new Error("UPSTOX_API_FAILED");
  }
  return data;
}

export function getUpstoxEquityHoldings(accessToken: string) {
  return upstoxGet<{ status: string; data: UpstoxEquityHolding[] }>(EQUITY_HOLDINGS_URL, accessToken);
}

export function getUpstoxMutualFundHoldings(accessToken: string) {
  return upstoxGet<{ status: string; data: UpstoxMutualFundHolding[] }>(MF_HOLDINGS_URL, accessToken);
}

/** Access tokens expire at 3:30 AM Asia/Kolkata the following day. */
export function nextUpstoxExpiry(from = new Date()) {
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(from.getTime() + offsetMs);
  let target = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 3, 30, 0) - offsetMs;
  if (from.getTime() >= target) target += 24 * 60 * 60 * 1000;
  return new Date(target).toISOString();
}

export function normalizeUpstoxEquity(row: UpstoxEquityHolding) {
  const quantity = Number(row.quantity ?? 0);
  const lastPrice = row.last_price ?? null;
  return {
    assetType: "equity" as const,
    isin: row.isin ?? null,
    symbol: row.trading_symbol ?? null,
    name: row.company_name ?? null,
    quantity,
    pendingQuantity: Number(row.t1_quantity ?? 0),
    averagePrice: row.average_price ?? null,
    lastPrice,
    exchange: row.exchange ?? null,
    value: lastPrice === null ? null : Math.round(quantity * lastPrice),
    source: "upstox" as const,
  };
}

export function normalizeUpstoxMutualFund(row: UpstoxMutualFundHolding) {
  const quantity = Number(row.quantity ?? 0);
  const lastPrice = row.last_price ?? null;
  return {
    assetType: "mutual_fund" as const,
    isin: row.instrument_key ?? null,
    name: row.fund ?? null,
    folio: row.folio ?? null,
    quantity,
    averagePrice: row.average_price ?? null,
    lastPrice,
    navDate: row.last_price_date ?? null,
    pledgedQuantity: Number(row.pledged_quantity ?? 0),
    value: lastPrice === null ? null : Math.round(quantity * lastPrice),
    source: "upstox" as const,
  };
}

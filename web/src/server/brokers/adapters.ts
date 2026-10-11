import { brokerUserHash, mapHoldingRows, maskRef, nextSixAmIst, rowsFromPayload, userMessage, BrokerFlowError } from "@/server/brokers/core";
import type { BrokerAvailability, BrokerId, BrokerInfo, BrokerSession, HoldingsResult } from "@/types/broker";

interface AuthContext {
  state: string;
  redirectUri: string;
}

export interface BrokerAdapter {
  readonly id: BrokerId;
  readonly info: Omit<BrokerInfo, "availability"> & { availability: BrokerAvailability };
  getAuthorizationUrl(ctx: AuthContext): Promise<string>;
  completeAuthorization(params: Record<string, string>, ctx: AuthContext): Promise<BrokerSession>;
  fetchHoldings(session: BrokerSession): Promise<HoldingsResult>;
}

const readScope = ["Holdings", "Quantities", "Average price"];

const upstoxFixture = {
  data: [
    {
      isin: "INESYN000006",
      trading_symbol: "ASTR",
      company_name: "Aster Industries",
      quantity: 12,
      t1_quantity: 0,
      average_price: 3000,
      last_price: 3000,
    },
  ],
};

const zerodhaFixture = {
  data: [
    {
      isin: "INESYN000012",
      tradingsymbol: "PENCEM",
      exchange: "NSE",
      quantity: 25,
      t1_quantity: 5,
      average_price: 1000,
      last_price: 1000,
    },
  ],
};

const growwFixture = {
  status: "SUCCESS",
  payload: {
    holdings: [
      {
        isin: "INESYN000008",
        trading_symbol: "CITYREIT",
        quantity: 40,
        t1_quantity: 0,
        average_price: 1000,
        pledge_quantity: 0,
      },
    ],
  },
};

const mockFixture = {
  status: "SUCCESS",
  payload: {
    holdings: [
      {
        isin: "INESYN000006",
        trading_symbol: "ASTR",
        company_name: "Aster Industries",
        quantity: 8,
        t1_quantity: 0,
        average_price: 3000,
      },
    ],
  },
};

function fixtureResult(payload: unknown, paths: string[][]): HoldingsResult {
  const warnings: string[] = [];
  const holdings = mapHoldingRows(rowsFromPayload(payload, paths), warnings);
  if (holdings.length === 0) warnings.push("No holdings returned. Is this the right account?");
  return { holdings, fetchedAt: new Date().toISOString(), warnings };
}

function fixtureSession(brokerId: BrokerId): BrokerSession {
  return { accessToken: `fixture:${brokerId}`, expiresAt: nextSixAmIst(), brokerUserId: `${brokerId}-fixture` };
}

async function readJson(url: string, init: RequestInit) {
  const response = await fetch(url, { ...init, redirect: "manual" });
  if (response.status === 429) throw new BrokerFlowError(429, userMessage("broker_busy", "The broker"));
  if (response.status === 401) throw new BrokerFlowError(401, userMessage("expired", "The broker"));
  if (!response.ok) throw new BrokerFlowError(502, userMessage(response.status >= 500 ? "broker_down" : "token_timeout", "The broker"));
  return response.json() as Promise<unknown>;
}

const upstox: BrokerAdapter = {
  id: "upstox",
  info: {
    id: "upstox",
    displayName: "Upstox",
    availability: "live",
    authMode: "oauth_redirect",
    tokenLifetimeNote: "Reconnect needed daily",
    readScope,
    docsUrl: "https://upstox.com/developer/api-documentation/",
  },
  async getAuthorizationUrl({ state, redirectUri }) {
    const url = new URL("https://api.upstox.com/v2/login/authorization/dialog");
    url.searchParams.set("client_id", process.env.UPSTOX_CLIENT_ID ?? "");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    return url.toString();
  },
  async completeAuthorization(params, ctx) {
    if (params.error) throw new BrokerFlowError(400, userMessage("consent_denied", "Upstox"));
    if (params.code === "fixture") return fixtureSession("upstox");
    if (!params.code) throw new BrokerFlowError(400, userMessage("token_timeout", "Upstox"));
    const body = new URLSearchParams({
      code: params.code,
      client_id: process.env.UPSTOX_CLIENT_ID ?? "",
      client_secret: process.env.UPSTOX_CLIENT_SECRET ?? "",
      redirect_uri: ctx.redirectUri,
      grant_type: "authorization_code",
    });
    const payload = await readJson("https://api.upstox.com/v2/login/authorization/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    const token = payload as { access_token?: string; user_id?: string };
    if (!token.access_token) throw new BrokerFlowError(502, userMessage("schema", "Upstox"));
    return { accessToken: token.access_token, expiresAt: nextSixAmIst(), brokerUserId: token.user_id };
  },
  async fetchHoldings(session) {
    if (session.accessToken.startsWith("fixture:")) return fixtureResult(upstoxFixture, [["data"]]);
    const payload = await readJson("https://api.upstox.com/v2/portfolio/long-term-holdings", {
      headers: { Authorization: `Bearer ${session.accessToken}`, Accept: "application/json" },
    });
    return fixtureResult(payload, [["data"], ["data", "holdings"]]);
  },
};

const zerodha: BrokerAdapter = {
  id: "zerodha",
  info: {
    id: "zerodha",
    displayName: "Zerodha",
    availability: "live",
    authMode: "oauth_redirect",
    tokenLifetimeNote: "Session expires around 6 AM IST",
    readScope,
    docsUrl: "https://kite.trade/docs/connect/v3/",
  },
  async getAuthorizationUrl({ state }) {
    const url = new URL("https://kite.zerodha.com/connect/login");
    url.searchParams.set("v", "3");
    url.searchParams.set("api_key", process.env.KITE_API_KEY ?? "");
    url.searchParams.set("redirect_params", `state=${state}`);
    return url.toString();
  },
  async completeAuthorization(params) {
    if (params.status && params.status !== "success") throw new BrokerFlowError(400, userMessage("consent_denied", "Zerodha"));
    if (params.request_token === "fixture" || params.code === "fixture") return fixtureSession("zerodha");
    const requestToken = params.request_token;
    if (!requestToken) throw new BrokerFlowError(400, userMessage("token_timeout", "Zerodha"));
    const { createHash } = await import("crypto");
    const checksum = createHash("sha256")
      .update(`${process.env.KITE_API_KEY ?? ""}${requestToken}${process.env.KITE_API_SECRET ?? ""}`)
      .digest("hex");
    const payload = await readJson("https://api.kite.trade/session/token", {
      method: "POST",
      headers: { "X-Kite-Version": "3", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ api_key: process.env.KITE_API_KEY ?? "", request_token: requestToken, checksum }),
    });
    const data = (payload as { data?: { access_token?: string; user_id?: string } }).data;
    if (!data?.access_token) throw new BrokerFlowError(502, userMessage("schema", "Zerodha"));
    return { accessToken: data.access_token, expiresAt: nextSixAmIst(), brokerUserId: data.user_id };
  },
  async fetchHoldings(session) {
    if (session.accessToken.startsWith("fixture:")) return fixtureResult(zerodhaFixture, [["data"]]);
    const payload = await readJson("https://api.kite.trade/portfolio/holdings", {
      headers: {
        "X-Kite-Version": "3",
        Authorization: `token ${process.env.KITE_API_KEY}:${session.accessToken}`,
      },
    });
    return fixtureResult(payload, [["data"]]);
  },
};

const dhan: BrokerAdapter = {
  id: "dhan",
  info: {
    id: "dhan",
    displayName: "Dhan",
    availability: "requires_partner_access",
    authMode: "partner_consent",
    tokenLifetimeNote: "About 24 hours",
    readScope,
    docsUrl: "https://dhanhq.co/docs/v2/",
    note: "Live authorization needs Dhan partner credentials.",
  },
  async getAuthorizationUrl() {
    const response = await fetch("https://auth.dhan.co/partner/generate-consent", {
      method: "POST",
      headers: {
        partner_id: process.env.DHAN_PARTNER_ID ?? "",
        partner_secret: process.env.DHAN_PARTNER_SECRET ?? "",
      },
    });
    if (!response.ok) throw new BrokerFlowError(502, userMessage("broker_down", "Dhan"));
    const payload = (await response.json()) as { consentId?: string; data?: { consentId?: string } };
    const consentId = payload.consentId ?? payload.data?.consentId;
    if (!consentId) throw new BrokerFlowError(502, userMessage("schema", "Dhan"));
    return `https://auth.dhan.co/consent-login?consentId=${encodeURIComponent(consentId)}`;
  },
  async completeAuthorization(params) {
    if (!params.tokenId) throw new BrokerFlowError(400, userMessage("token_timeout", "Dhan"));
    const response = await fetch(`https://auth.dhan.co/partner/consume-consent?tokenId=${encodeURIComponent(params.tokenId)}`, {
      method: "POST",
      headers: {
        partner_id: process.env.DHAN_PARTNER_ID ?? "",
        partner_secret: process.env.DHAN_PARTNER_SECRET ?? "",
      },
    });
    if (!response.ok) throw new BrokerFlowError(400, userMessage("token_timeout", "Dhan"));
    const payload = (await response.json()) as { accessToken?: string; dhanClientId?: string };
    if (!payload.accessToken) throw new BrokerFlowError(502, userMessage("schema", "Dhan"));
    return { accessToken: payload.accessToken, expiresAt: nextSixAmIst(), brokerUserId: payload.dhanClientId };
  },
  async fetchHoldings(session) {
    const payload = await readJson("https://api.dhan.co/v2/holdings", { headers: { "access-token": session.accessToken } });
    return fixtureResult(payload, [["data"], ["holdings"]]);
  },
};

const groww: BrokerAdapter = {
  id: "groww",
  info: {
    id: "groww",
    displayName: "Groww",
    availability: "fixture_only",
    authMode: "user_token",
    tokenLifetimeNote: "A live token expires daily",
    readScope,
    docsUrl: "https://groww.in/trade-api/docs",
    note: "Fixture only. Live authorization depends on confirmed access.",
  },
  async getAuthorizationUrl() {
    return "";
  },
  async completeAuthorization(params) {
    if (params.code !== "fixture") throw new BrokerFlowError(400, userMessage("partner_access", "Groww"));
    return fixtureSession("groww");
  },
  async fetchHoldings() {
    return fixtureResult(growwFixture, [["payload", "holdings"]]);
  },
};

const mockBroker: BrokerAdapter = {
  id: "mock_b",
  info: {
    id: "mock_b",
    displayName: "Demo Broker B",
    availability: "mock",
    authMode: "mock_redirect",
    tokenLifetimeNote: "Demo session. No real broker login.",
    readScope,
    docsUrl: "",
    note: "Synthetic second broker for the overlap demo.",
  },
  async getAuthorizationUrl({ state, redirectUri }) {
    const url = new URL("/api/mock/broker-b/authorize", "http://localhost");
    url.searchParams.set("state", state);
    url.searchParams.set("redirect_uri", redirectUri);
    return `${url.pathname}${url.search}`;
  },
  async completeAuthorization(params) {
    if (params.error) throw new BrokerFlowError(400, userMessage("consent_denied", "Demo Broker B"));
    if (params.code !== "mock_code") throw new BrokerFlowError(400, userMessage("token_timeout", "Demo Broker B"));
    return { accessToken: "mock-session", expiresAt: nextSixAmIst(), brokerUserId: "mock-b-demo" };
  },
  async fetchHoldings() {
    return fixtureResult(mockFixture, [["payload", "holdings"]]);
  },
};

const adapters: Record<BrokerId, BrokerAdapter> = { upstox, zerodha, dhan, groww, mock_b: mockBroker };

function envSet(name: string) {
  return Boolean(process.env[name]?.trim());
}

export function resolveAvailability(adapter: BrokerAdapter): BrokerAvailability {
  if (adapter.id === "upstox" && !(envSet("UPSTOX_CLIENT_ID") && envSet("UPSTOX_CLIENT_SECRET"))) return "fixture_only";
  if (adapter.id === "zerodha" && !(envSet("KITE_API_KEY") && envSet("KITE_API_SECRET"))) return "fixture_only";
  if (adapter.id === "dhan" && !(envSet("DHAN_PARTNER_ID") && envSet("DHAN_PARTNER_SECRET"))) return "requires_partner_access";
  if (adapter.id === "groww") return "fixture_only";
  return adapter.info.availability;
}

export function listBrokerInfo(): BrokerInfo[] {
  return Object.values(adapters)
    .filter((adapter) => adapter.id !== "mock_b" && adapter.id !== "groww")
    .map((adapter) => ({ ...adapter.info, availability: resolveAvailability(adapter) }));
}

export function getAdapter(id: string) {
  if (!(id in adapters)) throw new BrokerFlowError(404, { code: "unknown_broker", message: "That broker is not available.", canRetry: false });
  return adapters[id as BrokerId];
}

export function publicBrokerRef(session: BrokerSession, brokerId: BrokerId) {
  const id = session.brokerUserId ?? brokerId;
  return { maskedUserRef: maskRef(id), brokerUserRef: brokerUserHash(brokerId, id) };
}

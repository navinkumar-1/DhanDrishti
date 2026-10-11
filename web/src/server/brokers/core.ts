import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "crypto";
import type { BrokerId, ConnectionError, ConnectionHolding, ConnectionState, NormalizedHolding, SyncStep } from "@/types/broker";

export class BrokerFlowError extends Error {
  constructor(
    readonly status: number,
    readonly error: ConnectionError,
  ) {
    super(error.message);
  }
}

export function userMessage(code: string, brokerName: string): ConnectionError {
  switch (code) {
    case "consent_denied":
      return { code, message: `You chose not to share access with ${brokerName}. Nothing was imported.`, canRetry: true };
    case "state_invalid":
      return { code, message: "This connection attempt expired. Please start again.", canRetry: true };
    case "token_timeout":
      return { code, message: "The login step timed out. Please try again.", canRetry: true };
    case "broker_busy":
      return { code, message: `${brokerName} is busy. Try again in a minute.`, canRetry: true };
    case "broker_down":
      return { code, message: `${brokerName} didn't respond.`, canRetry: true };
    case "schema":
      return { code, message: `${brokerName} returned data in an unexpected format.`, canRetry: false };
    case "expired":
      return { code, message: `${brokerName} session expired. Reconnect to refresh. Last imported data is kept.`, canRetry: true };
    case "partner_access":
      return { code, message: `${brokerName} needs partner access that is not set up. Upload a statement instead.`, canRetry: false };
    case "throttled":
      return { code, message: "Wait a minute before syncing this broker again.", canRetry: true };
    default:
      return { code: "connect_failed", message: "Couldn't connect right now.", canRetry: true };
  }
}

const ISIN = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

export function mapHoldingRows(rows: unknown[], warnings: string[]): NormalizedHolding[] {
  const holdings: NormalizedHolding[] = [];
  let skipped = 0;
  for (const row of rows) {
    if (!row || typeof row !== "object") {
      skipped += 1;
      continue;
    }
    const record = row as Record<string, unknown>;
    const isin = String(record.isin ?? "").toUpperCase();
    if (!ISIN.test(isin)) {
      skipped += 1;
      continue;
    }
    const pending = numberOrZero(record.t1_quantity ?? record.t1Qty);
    const settled = numberOrZero(record.quantity ?? record.totalQty);
    holdings.push({
      isin,
      tradingSymbol: stringOrUndefined(record.trading_symbol ?? record.tradingsymbol ?? record.tradingSymbol),
      name: stringOrUndefined(record.company_name ?? record.companyName),
      exchange: stringOrUndefined(record.exchange),
      settledQuantity: settled,
      pendingQuantity: pending,
      averagePrice: numberOrUndefined(record.average_price ?? record.avgCostPrice),
      lastPrice: numberOrUndefined(record.last_price ?? record.lastPrice),
      quantityUnconfirmed: true,
    });
    if (numberOrZero(record.pledge_quantity) > 0) {
      warnings.push(`${isin}: pledged units are still owned and were not added again.`);
    }
  }
  if (skipped > 0) warnings.push(`${skipped} securities could not be identified.`);
  warnings.push("Settled and pending quantities for this broker are not confirmed yet, so overlaps stay Needs review.");
  return holdings;
}

function numberOrZero(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOrUndefined(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function rowsFromPayload(payload: unknown, paths: string[][]): unknown[] {
  for (const path of paths) {
    let cursor: unknown = payload;
    for (const key of path) {
      if (!cursor || typeof cursor !== "object" || !(key in cursor)) {
        cursor = undefined;
        break;
      }
      cursor = (cursor as Record<string, unknown>)[key];
    }
    if (Array.isArray(cursor)) return cursor;
  }
  throw new BrokerFlowError(502, userMessage("schema", "The broker"));
}

function vaultKey() {
  const secret = process.env.BROKER_TOKEN_KEY || "dev-only-broker-token-key";
  return createHash("sha256").update(secret).digest();
}

export function encryptToken(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", vaultKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final(), cipher.getAuthTag()]);
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64") };
}

export function decryptToken(payload: { ciphertext: string; iv: string }) {
  const buffer = Buffer.from(payload.ciphertext, "base64");
  const tag = buffer.subarray(buffer.length - 16);
  const data = buffer.subarray(0, buffer.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", vaultKey(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function hashState(state: string) {
  return createHash("sha256").update(state).digest("hex");
}

export function maskRef(value: string) {
  const tail = value.slice(-4);
  return `••${tail || "0000"}`;
}

export function brokerUserHash(brokerId: BrokerId, brokerUserId: string) {
  return createHmac("sha256", vaultKey()).update(`${brokerId}:${brokerUserId}`).digest("hex");
}

export function nextSixAmIst(from = new Date()) {
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(from.getTime() + offsetMs);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth();
  const day = ist.getUTCDate();
  let target = Date.UTC(year, month, day, 6, 0, 0) - offsetMs;
  if (from.getTime() >= target) target += 24 * 60 * 60 * 1000;
  return new Date(target).toISOString();
}

export interface StoredConnection {
  id: string;
  sessionId: string;
  brokerId: BrokerId;
  state: ConnectionState;
  step?: SyncStep;
  token?: { ciphertext: string; iv: string };
  expiresAt?: string;
  maskedUserRef?: string;
  brokerUserRef?: string;
  lastSyncedAt?: string;
  lastSyncStartedAt?: number;
  holdings: ConnectionHolding[];
  warnings: string[];
  rowsReceived?: number;
  error?: ConnectionError;
}

export interface StoredState {
  hash: string;
  sessionId: string;
  brokerId: BrokerId;
  connectionId: string;
  expiresAt: number;
  usedAt?: number;
}

export interface StoredLink {
  connectionId: string;
  statementAccountId: string;
  decision: "same" | "different";
  note: string;
}

interface BrokerMemory {
  connections: Map<string, StoredConnection>;
  states: Map<string, StoredState>;
  links: Map<string, StoredLink>;
}

const memory: BrokerMemory = ((globalThis as { __ddBrokers?: BrokerMemory }).__ddBrokers ??= {
  connections: new Map(),
  states: new Map(),
  links: new Map(),
});

export const brokerMemory = memory;

import { randomBytes, randomUUID } from "crypto";
import {
  brokerMemory,
  decryptToken,
  encryptToken,
  hashState,
  userMessage,
  BrokerFlowError,
  type StoredConnection,
} from "@/server/brokers/core";
import { getAdapter, listBrokerInfo, publicBrokerRef, resolveAvailability } from "@/server/brokers/adapters";
import type { BrokerId, ConnectionStatus, LinkSuggestion } from "@/types/broker";

const STATE_TTL_MS = 10 * 60 * 1000;
const SYNC_GAP_MS = 60 * 1000;

const statementBook = [
  { id: "demat-a", label: "Demat A (CDSL, statement dated 31 Aug)", isin: "INESYN000006", name: "Aster Industries", quantity: 12 },
  { id: "demat-b", label: "Demat B (NSDL, statement dated 31 Aug)", isin: "INESYN000006", name: "Aster Industries", quantity: 8 },
];

export function listBrokers() {
  return listBrokerInfo();
}

export async function startConnection(sessionId: string, brokerId: string, origin: string) {
  const adapter = getAdapter(brokerId);
  if (adapter.id === "mock_b") {
    throw new BrokerFlowError(404, { code: "unknown_broker", message: "That broker is not available.", canRetry: false });
  }
  const availability = resolveAvailability(adapter);
  if (availability === "requires_partner_access" || availability === "fixture_only" || availability === "mock") {
    throw new BrokerFlowError(409, userMessage("partner_access", adapter.info.displayName));
  }

  const existing = [...brokerMemory.connections.values()].find(
    (connection) => connection.sessionId === sessionId && connection.brokerId === adapter.id && connection.state !== "disconnected",
  );
  const connection: StoredConnection = existing ?? {
    id: randomUUID(),
    sessionId,
    brokerId: adapter.id,
    state: "pending_auth",
    holdings: [],
    warnings: [],
  };
  connection.state = "pending_auth";
  connection.error = undefined;
  connection.step = undefined;
  brokerMemory.connections.set(connection.id, connection);

  const state = randomBytes(24).toString("base64url");
  brokerMemory.states.set(hashState(state), {
    hash: hashState(state),
    sessionId,
    brokerId: adapter.id,
    connectionId: connection.id,
    expiresAt: Date.now() + STATE_TTL_MS,
  });
  const redirectUri = `${origin}/api/connect/${adapter.id}/callback`;
  const authorizationUrl = await adapter.getAuthorizationUrl({ state, redirectUri });
  return { authorizationUrl, connectionId: connection.id };
}

export async function completeCallback(sessionId: string, brokerId: string, params: Record<string, string>, origin: string) {
  const adapter = getAdapter(brokerId);
  let stateConnectionId = "";
  try {
    stateConnectionId = consumeState(sessionId, adapter.id, params.state)?.connectionId ?? pendingConnectionId(sessionId, adapter.id);
  } catch (error) {
    const pending = pendingConnectionId(sessionId, adapter.id);
    if (pending) failConnection(pending, error, adapter.info.displayName);
    throw error;
  }
  const connection = brokerMemory.connections.get(stateConnectionId);
  if (!connection || connection.sessionId !== sessionId) {
    throw new BrokerFlowError(400, userMessage("state_invalid", adapter.info.displayName));
  }
  try {
    const brokerSession = await adapter.completeAuthorization(params, {
      state: params.state ?? "",
      redirectUri: `${origin}/api/connect/${adapter.id}/callback`,
    });
    const refs = publicBrokerRef(brokerSession, adapter.id);
    connection.token = encryptToken(brokerSession.accessToken);
    connection.expiresAt = brokerSession.expiresAt;
    connection.maskedUserRef = refs.maskedUserRef;
    connection.brokerUserRef = refs.brokerUserRef;
    connection.state = "syncing";
    connection.step = "verifying";
    void runSync(connection.id, brokerSession);
    return connection.id;
  } catch (error) {
    connection.state = "failed";
    connection.error = error instanceof BrokerFlowError ? error.error : userMessage("connect_failed", adapter.info.displayName);
    return connection.id;
  }
}

function consumeState(sessionId: string, brokerId: BrokerId, state: string | undefined) {
  if (!state) return undefined;
  const stored = brokerMemory.states.get(hashState(state));
  if (!stored || stored.usedAt || stored.expiresAt < Date.now() || stored.sessionId !== sessionId || stored.brokerId !== brokerId) {
    throw new BrokerFlowError(400, userMessage("state_invalid", "This broker"));
  }
  stored.usedAt = Date.now();
  return stored;
}

function pendingConnectionId(sessionId: string, brokerId: BrokerId) {
  return [...brokerMemory.connections.values()].find(
    (connection) => connection.sessionId === sessionId && connection.brokerId === brokerId && connection.state === "pending_auth",
  )?.id ?? "";
}

async function runSync(connectionId: string, session: { accessToken: string; expiresAt: string }) {
  const connection = brokerMemory.connections.get(connectionId);
  if (!connection) return;
  const adapter = getAdapter(connection.brokerId);
  const steps = ["verifying", "fetching", "normalizing", "reconciling"] as const;
  try {
    if (connection.expiresAt && Date.parse(connection.expiresAt) <= Date.now() && !session.accessToken.startsWith("fixture:")) {
      connection.state = "expired";
      connection.error = userMessage("expired", adapter.info.displayName);
      return;
    }
    for (const step of steps) {
      connection.state = "syncing";
      connection.step = step;
      await delay(450);
    }
    const result = await adapter.fetchHoldings({ accessToken: session.accessToken, expiresAt: session.expiresAt });
    connection.holdings = result.holdings.map((holding) => ({
      isin: holding.isin,
      name: holding.name,
      tradingSymbol: holding.tradingSymbol,
      settledQuantity: holding.settledQuantity,
      pendingQuantity: holding.pendingQuantity,
    }));
    connection.warnings = result.warnings;
    connection.rowsReceived = result.holdings.length;
    connection.lastSyncedAt = result.fetchedAt;
    connection.expiresAt = session.expiresAt;
    connection.state = "synced";
    connection.step = undefined;
    connection.error = undefined;
    connection.lastSyncStartedAt = Date.now();
  } catch (error) {
    connection.state = error instanceof BrokerFlowError && error.error.code === "expired" ? "expired" : "failed";
    connection.step = undefined;
    connection.error = error instanceof BrokerFlowError ? error.error : userMessage("broker_down", adapter.info.displayName);
  }
}

export function connectionStatus(sessionId: string, connectionId: string): ConnectionStatus {
  const connection = requireOwn(sessionId, connectionId);
  if (connection.expiresAt && Date.parse(connection.expiresAt) <= Date.now() && connection.state === "synced") {
    connection.state = "expired";
    connection.error = userMessage("expired", getAdapter(connection.brokerId).info.displayName);
  }
  return toStatus(connection);
}

export function listConnections(sessionId: string) {
  return [...brokerMemory.connections.values()].filter((connection) => connection.sessionId === sessionId && connection.state !== "disconnected").map(toStatus);
}

export function syncNow(sessionId: string, connectionId: string) {
  const connection = requireOwn(sessionId, connectionId);
  if (!connection.token) throw new BrokerFlowError(409, userMessage("expired", getAdapter(connection.brokerId).info.displayName));
  if (connection.lastSyncStartedAt && Date.now() - connection.lastSyncStartedAt < SYNC_GAP_MS) {
    throw new BrokerFlowError(429, userMessage("throttled", getAdapter(connection.brokerId).info.displayName));
  }
  const accessToken = decryptToken(connection.token);
  connection.lastSyncStartedAt = Date.now();
  void runSync(connection.id, { accessToken, expiresAt: connection.expiresAt ?? new Date().toISOString() });
  return toStatus(connection);
}

export function disconnect(sessionId: string, connectionId: string) {
  const connection = requireOwn(sessionId, connectionId);
  connection.state = "disconnected";
  connection.token = undefined;
  connection.holdings = [];
  connection.warnings = [];
  brokerMemory.links.delete(connection.id);
}

export function linkSuggestions(sessionId: string, connectionId: string): LinkSuggestion[] {
  const connection = requireOwn(sessionId, connectionId);
  return statementBook.flatMap((account) => {
    const holding = connection.holdings.find((item) => item.isin === account.isin);
    if (!holding || holding.settledQuantity !== account.quantity) return [];
    return [{
      connectionId: connection.id,
      statementAccountId: account.id,
      statementLabel: account.label,
      isin: account.isin,
      name: account.name,
      brokerQuantity: holding.settledQuantity,
      statementQuantity: account.quantity,
      prompt: `Does this look like the same account as ${account.label}?`,
    }];
  });
}

export function saveLink(sessionId: string, input: { connectionId: string; statementAccountId: string; decision: "same" | "different" }) {
  const connection = requireOwn(sessionId, input.connectionId);
  const suggestion = linkSuggestions(sessionId, connection.id).find((item) => item.statementAccountId === input.statementAccountId);
  const statementTotal = statementBook.reduce((sum, account) => sum + account.quantity, 0);
  const note = input.decision === "same"
    ? `These ${suggestion?.brokerQuantity ?? ""} units match ${suggestion?.statementLabel ?? "the statement account"}. They are not added again. Aster Industries stays ${statementTotal} units across Demat A and Demat B.`
    : "Kept as a separate account. The overlap is marked Needs review so it is not added twice by accident.";
  brokerMemory.links.set(connection.id, { connectionId: connection.id, statementAccountId: input.statementAccountId, decision: input.decision, note });
  return { decision: input.decision, note };
}

export function linkDecision(sessionId: string, connectionId: string) {
  requireOwn(sessionId, connectionId);
  return brokerMemory.links.get(connectionId) ?? null;
}

function failConnection(connectionId: string, error: unknown, brokerName: string) {
  const connection = brokerMemory.connections.get(connectionId);
  if (!connection) return;
  connection.state = "failed";
  connection.error = error instanceof BrokerFlowError ? error.error : userMessage("state_invalid", brokerName);
}

function requireOwn(sessionId: string, connectionId: string) {
  const connection = brokerMemory.connections.get(connectionId);
  if (!connection || connection.sessionId !== sessionId) {
    throw new BrokerFlowError(404, { code: "not_found", message: "That connection is not in this session.", canRetry: true });
  }
  return connection;
}

function toStatus(connection: StoredConnection): ConnectionStatus {
  return {
    id: connection.id,
    brokerId: connection.brokerId,
    displayName: getAdapter(connection.brokerId).info.displayName,
    state: connection.state,
    step: connection.step,
    lastSyncedAt: connection.lastSyncedAt,
    expiresAt: connection.expiresAt,
    maskedUserRef: connection.maskedUserRef,
    rowsReceived: connection.rowsReceived,
    warnings: connection.warnings,
    holdings: connection.holdings,
    error: connection.error,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

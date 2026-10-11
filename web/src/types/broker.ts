export type BrokerId = "upstox" | "zerodha" | "dhan" | "groww" | "mock_b";

export type BrokerAvailability = "live" | "mock" | "requires_partner_access" | "fixture_only";

export type BrokerAuthMode = "oauth_redirect" | "partner_consent" | "user_token" | "mock_redirect";

export type ConnectionState = "pending_auth" | "syncing" | "synced" | "expired" | "failed" | "disconnected";

export type SyncStep = "verifying" | "fetching" | "normalizing" | "reconciling";

export interface BrokerInfo {
  id: BrokerId;
  displayName: string;
  availability: BrokerAvailability;
  authMode: BrokerAuthMode;
  tokenLifetimeNote: string;
  readScope: string[];
  docsUrl: string;
  note?: string;
}

export interface ConnectionHolding {
  isin: string;
  name?: string;
  tradingSymbol?: string;
  settledQuantity: number;
  pendingQuantity: number;
}

export interface ConnectionError {
  code: string;
  message: string;
  canRetry: boolean;
}

export interface ConnectionStatus {
  id: string;
  brokerId: BrokerId;
  displayName: string;
  state: ConnectionState;
  step?: SyncStep;
  lastSyncedAt?: string;
  expiresAt?: string;
  maskedUserRef?: string;
  rowsReceived?: number;
  warnings?: string[];
  holdings?: ConnectionHolding[];
  error?: ConnectionError;
}

export interface LinkSuggestion {
  connectionId: string;
  statementAccountId: string;
  statementLabel: string;
  isin: string;
  name: string;
  brokerQuantity: number;
  statementQuantity: number;
  prompt: string;
}

export interface NormalizedHolding {
  isin: string;
  tradingSymbol?: string;
  name?: string;
  exchange?: string;
  settledQuantity: number;
  pendingQuantity: number;
  averagePrice?: number;
  lastPrice?: number;
  quantityUnconfirmed: boolean;
}

export interface HoldingsResult {
  holdings: NormalizedHolding[];
  fetchedAt: string;
  warnings: string[];
}

export interface BrokerSession {
  accessToken: string;
  expiresAt: string;
  brokerUserId?: string;
}

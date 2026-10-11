import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import {
  accountFromStored,
  coerceHolding,
  holdingFromStored,
  issuesFromStored,
  planBrokerSync,
  risksFromStored,
  rowsFromConcentration,
  SCHEMA_VERSION,
  summaryFromStored,
  type BrokerBook,
  type StoredAccount,
  type StoredHolding,
  type StoredIssue,
  type StoredSummary,
} from "@/lib/portfolio/model";

const BATCH_LIMIT = 400;

export async function readSummary(uid: string) {
  const [summarySnap, accountsSnap] = await Promise.all([
    getDoc(doc(firebaseDb(), "users", uid, "portfolio", "summary")),
    getDocs(collection(firebaseDb(), "users", uid, "accounts")),
  ]);
  const stored = summarySnap.exists() ? (summarySnap.data() as StoredSummary) : null;
  return summaryFromStored(stored, accountsSnap.size);
}

export async function readHoldings(uid: string) {
  const snap = await getDocs(collection(firebaseDb(), "users", uid, "holdings"));
  return snap.docs
    .map((item) => holdingFromStored(coerceHolding(item.id, item.data())))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
}

export async function readHolding(uid: string, isin: string) {
  const snap = await getDoc(doc(firebaseDb(), "users", uid, "holdings", isin));
  if (!snap.exists()) return null;
  return holdingFromStored(coerceHolding(snap.id, snap.data()));
}

export async function readAccounts(uid: string) {
  const snap = await getDocs(collection(firebaseDb(), "users", uid, "accounts"));
  return snap.docs
    .filter((item) => item.data().isSample !== true)
    .map((item) => accountFromStored(item.id, item.data() as StoredAccount));
}

export async function readIssues(uid: string) {
  const [issueSnap, holdingSnap] = await Promise.all([
    getDocs(collection(firebaseDb(), "users", uid, "reconciliationIssues")),
    getDocs(collection(firebaseDb(), "users", uid, "holdings")),
  ]);
  const holdings = holdingSnap.docs.map((item) => coerceHolding(item.id, item.data()));
  const issues = issueSnap.docs.map((item) => item.data() as StoredIssue);
  return issuesFromStored(issues, holdings);
}

export async function readConcentration(uid: string, view: "company" | "sector" | "assetClass" | "account") {
  const snap = await getDoc(doc(firebaseDb(), "users", uid, "insights", "concentration"));
  return rowsFromConcentration(snap.exists() ? snap.data() : null, view);
}

export async function readRisks(uid: string) {
  const snap = await getDoc(doc(firebaseDb(), "users", uid, "insights", "risk"));
  return risksFromStored(snap.exists() ? snap.data() : null);
}

export async function readCashflows(uid: string) {
  const snap = await getDocs(collection(firebaseDb(), "users", uid, "cashFlows"));
  if (snap.empty) return [];
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      date: (d.dueDate ?? d.date ?? "2026-10-15") as string,
      name: (d.instrumentName ?? d.name ?? "Cashflow") as string,
      accountId: (d.accountId ?? "demat-a") as string,
      amount: typeof d.amountPaise === "number" ? d.amountPaise / 100 : Number(d.amount ?? 0),
      status: (d.status ?? "scheduled") as "scheduled" | "announced" | "estimated" | "confirmed_received",
      kind: (d.flowType ?? d.kind ?? "distribution") as "interest" | "dividend" | "distribution" | "repayment",
    };
  });
}

export async function persistBrokerBook(uid: string, book: BrokerBook) {
  const db = firebaseDb();
  const sourceId = `src_${book.brokerId}`;
  const [holdingSnap, snapshotSnap, issueSnap] = await Promise.all([
    getDocs(collection(db, "users", uid, "holdings")),
    getDocs(query(collection(db, "users", uid, "holdingSnapshots"), where("sourceId", "==", sourceId))),
    getDocs(collection(db, "users", uid, "reconciliationIssues")),
  ]);

  const plan = planBrokerSync({
    existing: holdingSnap.docs
      .filter((item) => item.data().isSample !== true)
      .map((item) => coerceHolding(item.id, { ...item.data(), isin: item.id })),
    snapshotIds: snapshotSnap.docs.map((item) => ({
      id: item.id,
      accountId: String(item.data().accountId ?? ""),
    })),
    issueIds: issueSnap.docs.map((item) => item.id),
    book,
  });

  const ops: Array<{ kind: "set"; path: string[]; data: DocumentData } | { kind: "delete"; path: string[] }> = [];
  const base = ["users", uid];

  for (const holding of plan.holdings) {
    ops.push({ kind: "set", path: [...base, "holdings", holding.id], data: withStamp(holding.data) });
  }
  for (const id of plan.deleteHoldingIds) ops.push({ kind: "delete", path: [...base, "holdings", id] });
  for (const item of holdingSnap.docs) {
    if (item.data().isSample === true) ops.push({ kind: "delete", path: [...base, "holdings", item.id] });
  }
  for (const account of plan.accounts) {
    ops.push({ kind: "set", path: [...base, "accounts", account.id], data: withStamp(account.data) });
  }
  ops.push({
    kind: "set",
    path: [...base, "connections", plan.connection.id],
    data: withStamp({
      ...plan.connection,
      connectedAt: serverTimestamp(),
      lastSyncAt: serverTimestamp(),
    }),
  });
  ops.push({
    kind: "set",
    path: [...base, "sources", plan.source.id],
    data: withStamp({ ...plan.source, importedAt: serverTimestamp() }),
  });
  for (const snapshot of plan.snapshots) {
    ops.push({
      kind: "set",
      path: [...base, "holdingSnapshots", snapshot.id],
      data: withStamp({ ...snapshot.data, importedAt: serverTimestamp() }),
    });
  }
  for (const id of plan.deleteSnapshotIds) ops.push({ kind: "delete", path: [...base, "holdingSnapshots", id] });
  ops.push({ kind: "set", path: [...base, "portfolio", "summary"], data: withStamp(plan.summary) });
  ops.push({ kind: "set", path: [...base, "insights", "concentration"], data: withStamp(plan.concentration) });
  ops.push({ kind: "set", path: [...base, "insights", "risk"], data: withStamp(plan.risk) });
  for (const issue of plan.issues) {
    ops.push({ kind: "set", path: [...base, "reconciliationIssues", issue.id], data: withStamp(issue.data) });
  }
  for (const id of plan.deleteIssueIds) ops.push({ kind: "delete", path: [...base, "reconciliationIssues", id] });

  for (let index = 0; index < ops.length; index += BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const op of ops.slice(index, index + BATCH_LIMIT)) {
      const ref = doc(db, op.path[0], ...op.path.slice(1));
      if (op.kind === "delete") batch.delete(ref);
      else batch.set(ref, op.data);
    }
    await batch.commit();
  }

  try {
    await updateDoc(doc(db, "users", uid), { dataMode: "live", updatedAt: serverTimestamp() });
  } catch {
    // The profile document is created at sign-up. Holdings still save if that update is rejected.
  }

  return plan.summary.counts;
}

export async function deleteImportedPortfolio(uid: string) {
  const db = firebaseDb();
  const groups = ["holdings", "accounts", "sources", "holdingSnapshots", "connections", "insights", "reconciliationIssues", "portfolio"];
  for (const group of groups) {
    const snap = await getDocs(collection(db, "users", uid, group));
    for (let index = 0; index < snap.docs.length; index += BATCH_LIMIT) {
      const batch = writeBatch(db);
      for (const item of snap.docs.slice(index, index + BATCH_LIMIT)) batch.delete(item.ref);
      await batch.commit();
    }
  }
  try {
    await updateDoc(doc(db, "users", uid), { dataMode: "empty", updatedAt: serverTimestamp() });
  } catch {
    // Profile update is optional if the user document was never created.
  }
}

function withStamp(data: DocumentData) {
  return {
    ...data,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: serverTimestamp(),
  };
}

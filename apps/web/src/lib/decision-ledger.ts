/**
 * Decision Ledger — enterprise-grade governance layer for decision traceability.
 *
 * Logs every analysis run with full reproducibility metadata:
 * - Natural language query and classified intent
 * - Execution plan (CLI commands)
 * - Dataset snapshot hash and CLI output hash
 * - Narrative summary and numeric breakdown
 * - Engine version for drift detection
 *
 * Persistence: IndexedDB (primary) with localStorage fallback.
 * Works entirely client-side in demo mode.
 */

import { sha256, hashDataset } from './hash';
import { sampleA } from './sample-data';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DecisionRecord {
  id: string;
  timestamp: string;
  naturalLanguageQuery: string;
  intent: string;
  executionPlan: { command: string; description: string }[];
  datasetHash: string;
  cliOutputHash: string;
  narrativeSummary: string;
  numericBreakdown: Record<string, string>;
  engineVersion: string;
  keyDrivers: string[];
  recommendedAction: string;
  confidenceNote: string;
  cliOutputRaw: string;
}

export interface ReplayResult {
  record: DecisionRecord;
  replayOutputHash: string;
  datasetHashCurrent: string;
  match: boolean;
  dataDrift: boolean;
  engineDrift: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DB_NAME = 'zeo-decision-ledger';
const DB_VERSION = 1;
const STORE_NAME = 'records';
const LS_KEY = 'zeo-decision-ledger-fallback';
const ENGINE_VERSION = '2.0.0';

export { ENGINE_VERSION };

/* ------------------------------------------------------------------ */
/*  IndexedDB helpers                                                  */
/* ------------------------------------------------------------------ */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

/* ------------------------------------------------------------------ */
/*  localStorage fallback                                              */
/* ------------------------------------------------------------------ */

function lsGetAll(): DecisionRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DecisionRecord[]) : [];
  } catch {
    return [];
  }
}

function lsSave(records: DecisionRecord[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(records));
  } catch {
    // Storage full — silently drop oldest
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Generate a unique record ID (timestamp + random suffix).
 */
export function generateRecordId(): string {
  const ts = Date.now().toString(36);
  const r = Math.floor(Math.random() * 0xffff).toString(36).padStart(3, '0');
  return `dr_${ts}_${r}`;
}

/**
 * Save a decision record to the ledger.
 */
export async function saveRecord(record: DecisionRecord): Promise<void> {
  if (idbAvailable()) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Fall through to localStorage
    }
  }
  const all = lsGetAll();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  lsSave(all);
}

/**
 * List all decision records, newest first.
 */
export async function listRecords(): Promise<DecisionRecord[]> {
  if (idbAvailable()) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => {
          const records = req.result as DecisionRecord[];
          records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          resolve(records);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fall through
    }
  }
  return lsGetAll().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Get a single record by ID.
 */
export async function getRecord(id: string): Promise<DecisionRecord | null> {
  if (idbAvailable()) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(id);
        req.onsuccess = () => resolve((req.result as DecisionRecord) ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fall through
    }
  }
  return lsGetAll().find((r) => r.id === id) ?? null;
}

/**
 * Delete a record by ID.
 */
export async function deleteRecord(id: string): Promise<void> {
  if (idbAvailable()) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Fall through
    }
  }
  const all = lsGetAll().filter((r) => r.id !== id);
  lsSave(all);
}

/**
 * Replay a decision record: re-run the execution plan and compare hashes.
 * Returns match status and drift flags.
 */
export async function replayRecord(
  record: DecisionRecord,
  executeCommands: (commands: { command: string }[]) => string,
): Promise<ReplayResult> {
  // Re-run execution plan
  const replayOutput = executeCommands(record.executionPlan);
  const replayOutputHash = await sha256(replayOutput);

  // Check dataset drift
  const currentDatasetHash = await hashDataset(sampleA);
  const dataDrift = currentDatasetHash !== record.datasetHash;

  // Check engine drift
  const engineDrift = record.engineVersion !== ENGINE_VERSION;

  return {
    record,
    replayOutputHash,
    datasetHashCurrent: currentDatasetHash,
    match: replayOutputHash === record.cliOutputHash,
    dataDrift,
    engineDrift,
  };
}

/**
 * Compare two decision records for version diffing.
 */
export function compareRecords(
  a: DecisionRecord,
  b: DecisionRecord,
): {
  queryChanged: boolean;
  intentChanged: boolean;
  planChanged: boolean;
  outputChanged: boolean;
  dataChanged: boolean;
  engineChanged: boolean;
} {
  return {
    queryChanged: a.naturalLanguageQuery !== b.naturalLanguageQuery,
    intentChanged: a.intent !== b.intent,
    planChanged: JSON.stringify(a.executionPlan) !== JSON.stringify(b.executionPlan),
    outputChanged: a.cliOutputHash !== b.cliOutputHash,
    dataChanged: a.datasetHash !== b.datasetHash,
    engineChanged: a.engineVersion !== b.engineVersion,
  };
}

/**
 * Create a DecisionRecord from analysis results.
 */
export async function createRecord(params: {
  query: string;
  intent: string;
  executionPlan: { command: string; description: string }[];
  cliOutputRaw: string;
  narrativeSummary: string;
  numericBreakdown: Record<string, string>;
  keyDrivers: string[];
  recommendedAction: string;
  confidenceNote: string;
}): Promise<DecisionRecord> {
  const datasetHash = await hashDataset(sampleA);
  const cliOutputHash = await sha256(params.cliOutputRaw);

  return {
    id: generateRecordId(),
    timestamp: new Date().toISOString(),
    naturalLanguageQuery: params.query,
    intent: params.intent,
    executionPlan: params.executionPlan,
    datasetHash,
    cliOutputHash,
    narrativeSummary: params.narrativeSummary,
    numericBreakdown: params.numericBreakdown,
    keyDrivers: params.keyDrivers,
    recommendedAction: params.recommendedAction,
    confidenceNote: params.confidenceNote,
    engineVersion: ENGINE_VERSION,
    cliOutputRaw: params.cliOutputRaw,
  };
}

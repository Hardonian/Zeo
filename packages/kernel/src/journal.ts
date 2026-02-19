/**
 * Zeo Execution Journal - Append-only deterministic execution log
 * 
 * The journal provides an immutable, replay-safe record of all Zeo executions.
 * Each entry is append-only and never mutated after writing.
 */

import { createHash, randomUUID } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ZeoJournalEntry, ZeoJournalConfig, ZeoExecutionEnvelope } from "@zeo/contracts";

/** Default journal configuration */
const DEFAULT_CONFIG: ZeoJournalConfig = {
  journalDir: join(".", ".zeo", "journal"),
  maxEntriesPerFile: 1000,
  compress: false,
  retentionDays: 90,
};

/** Current configuration */
let currentConfig: ZeoJournalConfig = { ...DEFAULT_CONFIG };

/** In-memory cache of today's entries */
let todayEntries: ZeoJournalEntry[] = [];
let todayDate: string = "";

/**
 * Initialize the journal with configuration
 */
export function initializeJournal(config?: Partial<ZeoJournalConfig>): void {
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    enterpriseSync: config?.enterpriseSync ?? DEFAULT_CONFIG.enterpriseSync,
  };

  // Ensure journal directory exists
  if (!existsSync(currentConfig.journalDir)) {
    mkdirSync(currentConfig.journalDir, { recursive: true });
  }
}

/**
 * Get the journal directory path
 */
export function getJournalDir(): string {
  return currentConfig.journalDir;
}

/**
 * Get today's journal file path
 */
function getTodayJournalPath(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return join(currentConfig.journalDir, `${date}.jsonl`);
}

/**
 * Format a journal entry as a JSON line
 */
function formatJournalEntry(entry: ZeoJournalEntry): string {
  // Canonical JSON formatting for determinism
  return JSON.stringify(entry, Object.keys(entry).sort()) + "\n";
}

/**
 * Generate a journal ID
 */
function generateJournalId(): string {
  return `journal_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

/**
 * Append an entry to the journal
 * 
 * This is the core journaling function - all Zeo executions must call this.
 */
export function appendToJournal(
  envelope: ZeoExecutionEnvelope,
  outputHash: string,
  durationMs: number,
  status: 'success' | 'error' | 'degraded',
  options?: {
    resources?: ZeoJournalEntry['resources'];
    modelLatency?: ZeoJournalEntry['modelLatency'];
    error?: ZeoJournalEntry['error'];
    snapshotHash?: string;
  }
): ZeoJournalEntry {
  // Initialize if needed
  if (!existsSync(currentConfig.journalDir)) {
    initializeJournal();
  }

  const entry: ZeoJournalEntry = {
    journalId: generateJournalId(),
    envelope,
    outputHash,
    durationMs,
    resources: options?.resources,
    modelLatency: options?.modelLatency ?? { totalMs: durationMs },
    status,
    error: options?.error,
    replayMeta: {
      snapshotHash: options?.snapshotHash ?? computeSnapshotHash(envelope),
      replayEngineVersion: envelope.version,
      compatibleModels: [envelope.modelSpec.model],
    },
  };

  // Append to JSONL file
  const journalPath = getTodayJournalPath();
  const line = formatJournalEntry(entry);
  appendFileSync(journalPath, line, "utf8");

  // Update in-memory cache
  const today = new Date().toISOString().slice(0, 10);
  if (today !== todayDate) {
    todayDate = today;
    todayEntries = [];
  }
  todayEntries.push(entry);

  // Trigger enterprise sync if configured (async, non-blocking)
  if (currentConfig.enterpriseSync?.supabaseUrl) {
    syncToEnterprise(entry).catch(() => {
      // Silent failure - journal entry is already written locally
    });
  }

  return entry;
}

/**
 * Compute a hash of the executable snapshot
 */
function computeSnapshotHash(envelope: ZeoExecutionEnvelope): string {
  const snapshotData = {
    version: envelope.version,
    workflowId: envelope.workflowId,
    modelSpec: envelope.modelSpec,
    depth: envelope.depth,
  };
  return createHash("sha256")
    .update(JSON.stringify(snapshotData))
    .digest("hex");
}

/**
 * Read all entries from the journal
 */
export function readJournalEntries(
  options?: {
    startDate?: string;
    endDate?: string;
    workflowId?: string;
    status?: 'success' | 'error' | 'degraded';
  }
): ZeoJournalEntry[] {
  const entries: ZeoJournalEntry[] = [];

  // Get list of journal files
  const journalDir = currentConfig.journalDir;
  if (!existsSync(journalDir)) {
    return entries;
  }

  // Filter files by date range
  const files = getJournalFiles(options?.startDate, options?.endDate);

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const lines = content.trim().split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const entry: ZeoJournalEntry = JSON.parse(line);

        // Apply filters
        if (options?.workflowId && entry.envelope.workflowId !== options.workflowId) {
          continue;
        }
        if (options?.status && entry.status !== options.status) {
          continue;
        }

        entries.push(entry);
      } catch {
        // Skip malformed entries
        continue;
      }
    }
  }

  return entries.sort((a, b) => 
    new Date(a.envelope.timestamp).getTime() - new Date(b.envelope.timestamp).getTime()
  );
}

/**
 * Get a specific journal entry by run ID
 */
export function getJournalEntry(runId: string): ZeoJournalEntry | undefined {
  const entries = readJournalEntries();
  return entries.find(e => e.envelope.runId === runId);
}

/**
 * Get journal files within date range
 */
function getJournalFiles(startDate?: string, endDate?: string): string[] {
  const journalDir = currentConfig.journalDir;

  if (!existsSync(journalDir)) {
    return [];
  }

  const files = readdirSync(journalDir)
    .filter((f: string) => f.endsWith(".jsonl"))
    .map((f: string) => join(journalDir, f))
    .sort();

  if (!startDate && !endDate) {
    return files;
  }

  return files.filter((file: string) => {
    const basename = file.split("/").pop() || file.split("\\").pop() || "";
    const date = basename.replace(".jsonl", "");
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });
}

/**
 * Sync entry to enterprise (Supabase)
 * 
 * This is idempotent - same entry can be synced multiple times safely.
 */
async function syncToEnterprise(entry: ZeoJournalEntry): Promise<void> {
  const sync = currentConfig.enterpriseSync;
  if (!sync?.supabaseUrl) return;

  // API key must be provided in config (caller reads from env)
  const apiKey = sync.apiKey;
  if (!apiKey) {
    console.warn(`Enterprise sync skipped: apiKey not provided in config`);
    return;
  }

  try {
    // Prepare sync payload (excludes raw output, just envelope + hash)
    const payload = {
      journal_id: entry.journalId,
      run_id: entry.envelope.runId,
      workflow_id: entry.envelope.workflowId,
      tenant_id: entry.envelope.tenantId || 'default',
      version: entry.envelope.version,
      input_hash: entry.envelope.inputHash,
      output_hash: entry.outputHash,
      model_spec_hash: entry.envelope.modelSpecHash,
      timestamp: entry.envelope.timestamp,
      status: entry.status,
      duration_ms: entry.durationMs,
      deterministic_seed: entry.envelope.deterministicSeed,
      policy_hash: entry.envelope.policyHash,
      dek_version: entry.envelope.dek.kernelVersion,
      // Don't include full model output - just hashes
    };

    const response = await fetch(`${sync.supabaseUrl}/rest/v1/${sync.tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': 'resolution=merge-duplicates', // Idempotent insert
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok && response.status !== 409) { // 409 = duplicate (expected for idempotency)
      console.warn(`Enterprise sync failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // Silent failure - journal is already written locally
    console.warn(`Enterprise sync error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get journal statistics
 */
export function getJournalStats(): {
  totalEntries: number;
  totalSizeBytes: number;
  dateRange: { start: string; end: string };
  statusCounts: Record<string, number>;
} {
  const entries = readJournalEntries();
  
  const statusCounts: Record<string, number> = {
    success: 0,
    error: 0,
    degraded: 0,
  };

  for (const entry of entries) {
    statusCounts[entry.status]++;
  }

  const files = getJournalFiles();
  let totalSize = 0;
  for (const file of files) {
    const stats = require("node:fs").statSync(file);
    totalSize += stats.size;
  }

  return {
    totalEntries: entries.length,
    totalSizeBytes: totalSize,
    dateRange: entries.length > 0 ? {
      start: entries[0].envelope.timestamp,
      end: entries[entries.length - 1].envelope.timestamp,
    } : { start: '', end: '' },
    statusCounts,
  };
}

/**
 * Compress old journal files
 */
export function compressJournal(): void {
  const { gzipSync } = require("node:zlib");
  const files = getJournalFiles();

  for (const file of files) {
    if (file.endsWith(".gz")) continue;

    const content = readFileSync(file);
    const compressed = gzipSync(content);
    const compressedPath = `${file}.gz`;

    writeFileSync(compressedPath, compressed);
    // Don't delete original - just compress for archive
  }
}

// Auto-initialize on module load
initializeJournal();

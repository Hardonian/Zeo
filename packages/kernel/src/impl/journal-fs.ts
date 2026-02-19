import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { gzipSync } from "node:zlib";
import type { ZeoJournalEntry, ZeoJournalConfig, ZeoExecutionEnvelope } from "@zeo/contracts";

const DEFAULT_CONFIG: ZeoJournalConfig = {
  journalDir: join(homedir(), ".zeo", "journal"),
  maxEntriesPerFile: 1000,
  compress: false,
  retentionDays: 90,
  enterpriseSync: undefined,
};

let currentConfig: ZeoJournalConfig = { ...DEFAULT_CONFIG };
let todayEntries: ZeoJournalEntry[] = [];
let todayDate = "";

export function initializeJournal(config?: Partial<ZeoJournalConfig>): void {
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  if (!existsSync(currentConfig.journalDir)) {
    mkdirSync(currentConfig.journalDir, { recursive: true });
  }
}

export function getJournalDir(): string {
  return currentConfig.journalDir;
}

function getTodayJournalPath(): string {
  const date = new Date().toISOString().slice(0, 10);
  return join(currentConfig.journalDir, `${date}.jsonl`);
}

function formatJournalEntry(entry: ZeoJournalEntry): string {
  return JSON.stringify(entry, Object.keys(entry).sort()) + "\n";
}

function generateJournalId(): string {
  return `journal_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

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

  const journalPath = getTodayJournalPath();
  appendFileSync(journalPath, formatJournalEntry(entry), 'utf8');

  const date = new Date().toISOString().slice(0, 10);
  if (date !== todayDate) {
    todayDate = date;
    todayEntries = [];
  }
  todayEntries.push(entry);

  if (currentConfig.enterpriseSync?.supabaseUrl) {
    syncToEnterprise(entry).catch(() => {});
  }

  return entry;
}

function computeSnapshotHash(envelope: ZeoExecutionEnvelope): string {
  const snapshotData = {
    version: envelope.version,
    workflowId: envelope.workflowId,
    modelSpec: envelope.modelSpec,
    depth: envelope.depth,
  };
  return createHash('sha256')
    .update(JSON.stringify(snapshotData))
    .digest('hex');
}

export function readJournalEntries(options?: {
  startDate?: string;
  endDate?: string;
  workflowId?: string;
  status?: 'success' | 'error' | 'degraded';
}): ZeoJournalEntry[] {
  const entries: ZeoJournalEntry[] = [];
  if (!existsSync(currentConfig.journalDir)) return entries;
  const files = getJournalFiles(options?.startDate, options?.endDate);
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const line of content.trim().split('\n').filter(Boolean)) {
      try {
        const entry: ZeoJournalEntry = JSON.parse(line);
        if (options?.workflowId && entry.envelope.workflowId !== options.workflowId) continue;
        if (options?.status && entry.status !== options.status) continue;
        entries.push(entry);
      } catch {}
    }
  }
  return entries.sort((a, b) => 
    new Date(a.envelope.timestamp).getTime() - new Date(b.envelope.timestamp).getTime()
  );
}

function getJournalFiles(startDate?: string, endDate?: string): string[] {
  if (!existsSync(currentConfig.journalDir)) return [];
  const files = readdirSync(currentConfig.journalDir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => join(currentConfig.journalDir, f))
    .sort();
  if (!startDate && !endDate) return files;
  return files.filter((file) => {
    const base = file.split(/[\\/]/).pop()!.replace('.jsonl', '');
    if (startDate && base < startDate) return false;
    if (endDate && base > endDate) return false;
    return true;
  });
}

export function getJournalEntry(runId: string): ZeoJournalEntry | undefined {
  return readJournalEntries().find((e) => e.envelope.runId === runId);
}

export function getJournalStats(): {
  totalEntries: number;
  totalSizeBytes: number;
  dateRange: { start: string; end: string };
  statusCounts: Record<string, number>;
} {
  const entries = readJournalEntries();
  const statusCounts: Record<string, number> = { success: 0, error: 0, degraded: 0 };
  for (const e of entries) statusCounts[e.status]++;
  const files = getJournalFiles();
  let totalSize = 0;
  for (const file of files) totalSize += statSync(file).size;
  return {
    totalEntries: entries.length,
    totalSizeBytes: totalSize,
    dateRange: entries.length
      ? { start: entries[0].envelope.timestamp, end: entries.at(-1)!.envelope.timestamp }
      : { start: '', end: '' },
    statusCounts,
  };
}

export function compressJournal(): void {
  const files = getJournalFiles();
  for (const file of files) {
    if (file.endsWith('.gz')) continue;
    const content = readFileSync(file);
    const compressed = gzipSync(content);
    writeFileSync(`${file}.gz`, compressed);
  }
}

async function syncToEnterprise(entry: ZeoJournalEntry): Promise<void> {
  const sync = currentConfig.enterpriseSync;
  if (!sync?.supabaseUrl) return;
  const apiKey = sync.serviceKeyEnvVar ? process.env[sync.serviceKeyEnvVar] : undefined;
  if (!apiKey) return;
  try {
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
    };
    await fetch(`${sync.supabaseUrl}/rest/v1/${sync.tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });
  } catch {}
}

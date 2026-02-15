import type { DecisionRecord } from '@/lib/decision-ledger';

export interface DecisionTraceEvent {
  id: string;
  runId: string;
  orderIndex: number;
  eventType: string;
  timestamp: string;
  role?: string | null;
  toolName?: string | null;
  scope?: string | null;
  correlationId?: string | null;
  payload: Record<string, unknown>;
}

export interface ApprovalRecord {
  id: string;
  runId: string;
  status: 'pending' | 'approved' | 'denied' | 'canceled';
  requestedAt: string;
  resolvedAt?: string | null;
  requestedByRole?: string | null;
  toolName?: string | null;
  scope?: string | null;
  argsDigest?: string | null;
  summary?: string | null;
  reason?: string | null;
}

export interface JobRecord {
  id: string;
  userId?: string;
  status: 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'canceled';
  workflowName: string;
  workflowSpec: Record<string, unknown>;
  contextDigest: string;
  budgets?: Record<string, unknown> | null;
  attempts: number;
  nextRunAt?: string | null;
  lastError?: string | null;
  runId?: string | null;
  createdAt?: string;
}

export interface DecisionStore {
  saveRun(record: DecisionRecord): Promise<void>;
  listRuns(): Promise<DecisionRecord[]>;
  getRun(id: string): Promise<DecisionRecord | null>;
  deleteRun(id: string): Promise<void>;
  saveTraceEvents(runId: string, events: DecisionTraceEvent[]): Promise<void>;
  listTraceEvents(runId: string): Promise<DecisionTraceEvent[]>;
  saveApproval(approval: ApprovalRecord): Promise<void>;
  listApprovals(status?: ApprovalRecord['status']): Promise<ApprovalRecord[]>;
  saveJob(job: JobRecord): Promise<void>;
  listJobs(): Promise<JobRecord[]>;
}

const LS_KEY = 'zeo-decision-ledger-fallback';
const TRACE_KEY = 'zeo-decision-traces-fallback';
const APPROVAL_KEY = 'zeo-approvals-fallback';
const JOBS_KEY = 'zeo-jobs-fallback';

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

export class LocalDecisionStore implements DecisionStore {
  async saveRun(record: DecisionRecord): Promise<void> {
    const all = readLocal<DecisionRecord[]>(LS_KEY, []);
    const idx = all.findIndex((item) => item.id === record.id);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    writeLocal(LS_KEY, all);
  }

  async listRuns(): Promise<DecisionRecord[]> {
    return readLocal<DecisionRecord[]>(LS_KEY, []).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async getRun(id: string): Promise<DecisionRecord | null> {
    return readLocal<DecisionRecord[]>(LS_KEY, []).find((item) => item.id === id) ?? null;
  }

  async deleteRun(id: string): Promise<void> {
    const all = readLocal<DecisionRecord[]>(LS_KEY, []).filter((item) => item.id !== id);
    writeLocal(LS_KEY, all);
  }

  async saveTraceEvents(runId: string, events: DecisionTraceEvent[]): Promise<void> {
    const all = readLocal<Record<string, DecisionTraceEvent[]>>(TRACE_KEY, {});
    const existing = all[runId] ?? [];
    const merged = [...existing];
    for (const event of events) {
      const idx = merged.findIndex((entry) => entry.id === event.id || entry.orderIndex === event.orderIndex);
      if (idx >= 0) merged[idx] = event;
      else merged.push(event);
    }
    merged.sort((a, b) => a.orderIndex - b.orderIndex);
    all[runId] = merged;
    writeLocal(TRACE_KEY, all);
  }

  async listTraceEvents(runId: string): Promise<DecisionTraceEvent[]> {
    const all = readLocal<Record<string, DecisionTraceEvent[]>>(TRACE_KEY, {});
    return [...(all[runId] ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async saveApproval(approval: ApprovalRecord): Promise<void> {
    const all = readLocal<ApprovalRecord[]>(APPROVAL_KEY, []);
    const idx = all.findIndex((item) => item.id === approval.id);
    if (idx >= 0) all[idx] = approval;
    else all.push(approval);
    writeLocal(APPROVAL_KEY, all);
  }

  async listApprovals(status?: ApprovalRecord['status']): Promise<ApprovalRecord[]> {
    const all = readLocal<ApprovalRecord[]>(APPROVAL_KEY, []);
    const filtered = status ? all.filter((entry) => entry.status === status) : all;
    return filtered.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  }

  async saveJob(job: JobRecord): Promise<void> {
    const all = readLocal<JobRecord[]>(JOBS_KEY, []);
    const idx = all.findIndex((item) => item.id === job.id);
    if (idx >= 0) all[idx] = job;
    else all.push(job);
    writeLocal(JOBS_KEY, all);
  }

  async listJobs(): Promise<JobRecord[]> {
    return readLocal<JobRecord[]>(JOBS_KEY, []).sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }
}

async function requestJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export class SupabaseDecisionStore implements DecisionStore {
  async saveRun(record: DecisionRecord): Promise<void> {
    await requestJSON('/api/decision-runs', { method: 'POST', body: JSON.stringify({ record }) });
  }

  async listRuns(): Promise<DecisionRecord[]> {
    const data = await requestJSON<{ ok: boolean; runs: DecisionRecord[] }>('/api/decision-runs');
    return data.runs;
  }

  async getRun(id: string): Promise<DecisionRecord | null> {
    const data = await requestJSON<{ ok: boolean; run: DecisionRecord | null }>(`/api/decision-runs/${id}`);
    return data.run;
  }

  async deleteRun(_id: string): Promise<void> {
    throw new Error('Delete is not supported on SupabaseDecisionStore.');
  }

  async saveTraceEvents(runId: string, events: DecisionTraceEvent[]): Promise<void> {
    await requestJSON(`/api/decision-runs/${runId}/trace`, { method: 'POST', body: JSON.stringify({ events }) });
  }

  async listTraceEvents(runId: string): Promise<DecisionTraceEvent[]> {
    const data = await requestJSON<{ ok: boolean; events: DecisionTraceEvent[] }>(`/api/decision-runs/${runId}/trace`);
    return data.events;
  }

  async saveApproval(approval: ApprovalRecord): Promise<void> {
    await requestJSON('/api/approvals', { method: 'POST', body: JSON.stringify({ approval }) });
  }

  async listApprovals(status?: ApprovalRecord['status']): Promise<ApprovalRecord[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await requestJSON<{ ok: boolean; approvals: ApprovalRecord[] }>(`/api/approvals${query}`);
    return data.approvals;
  }

  async saveJob(job: JobRecord): Promise<void> {
    await requestJSON('/api/jobs', { method: 'POST', body: JSON.stringify({ job }) });
  }

  async listJobs(): Promise<JobRecord[]> {
    const data = await requestJSON<{ ok: boolean; jobs: JobRecord[] }>('/api/jobs');
    return data.jobs;
  }
}

export class HybridDecisionStore implements DecisionStore {
  constructor(
    private readonly remote: DecisionStore,
    private readonly local: DecisionStore,
  ) {}

  private async withFallback<T>(remoteOp: () => Promise<T>, localOp: () => Promise<T>): Promise<T> {
    try {
      return await remoteOp();
    } catch {
      return await localOp();
    }
  }

  async saveRun(record: DecisionRecord): Promise<void> {
    await this.withFallback(async () => {
      await this.remote.saveRun(record);
      await this.local.saveRun(record);
    }, () => this.local.saveRun(record));
  }

  async listRuns(): Promise<DecisionRecord[]> {
    return this.withFallback(async () => {
      const remoteRuns = await this.remote.listRuns();
      const localRuns = await this.local.listRuns();
      for (const run of localRuns) {
        if (!remoteRuns.some((existing) => existing.id === run.id)) {
          await this.remote.saveRun(run);
        }
      }
      return remoteRuns;
    }, () => this.local.listRuns());
  }

  async getRun(id: string): Promise<DecisionRecord | null> {
    return this.withFallback(() => this.remote.getRun(id), () => this.local.getRun(id));
  }

  async deleteRun(id: string): Promise<void> {
    await this.local.deleteRun(id);
  }

  async saveTraceEvents(runId: string, events: DecisionTraceEvent[]): Promise<void> {
    await this.withFallback(async () => {
      await this.remote.saveTraceEvents(runId, events);
      await this.local.saveTraceEvents(runId, events);
    }, () => this.local.saveTraceEvents(runId, events));
  }

  async listTraceEvents(runId: string): Promise<DecisionTraceEvent[]> {
    return this.withFallback(() => this.remote.listTraceEvents(runId), () => this.local.listTraceEvents(runId));
  }

  async saveApproval(approval: ApprovalRecord): Promise<void> {
    await this.withFallback(async () => {
      await this.remote.saveApproval(approval);
      await this.local.saveApproval(approval);
    }, () => this.local.saveApproval(approval));
  }

  async listApprovals(status?: ApprovalRecord['status']): Promise<ApprovalRecord[]> {
    return this.withFallback(() => this.remote.listApprovals(status), () => this.local.listApprovals(status));
  }

  async saveJob(job: JobRecord): Promise<void> {
    await this.withFallback(async () => {
      await this.remote.saveJob(job);
      await this.local.saveJob(job);
    }, () => this.local.saveJob(job));
  }

  async listJobs(): Promise<JobRecord[]> {
    return this.withFallback(() => this.remote.listJobs(), () => this.local.listJobs());
  }
}

let cachedStore: DecisionStore | null = null;

export function getDecisionStore(): DecisionStore {
  if (!cachedStore) {
    cachedStore = new HybridDecisionStore(new SupabaseDecisionStore(), new LocalDecisionStore());
  }
  return cachedStore;
}

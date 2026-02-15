/**
 * @zeo/sdk — Typed TypeScript SDK for the Zeo Decision Platform API.
 *
 * Usage:
 *   import { ZeoClient } from '@zeo/sdk';
 *   const zeo = new ZeoClient({ apiKey: 'zeo_...', orgId: '...' });
 *   const result = await zeo.analyze({ query: 'Should we expand to APAC?' });
 */

export interface ZeoClientConfig {
  /** API base URL. Defaults to https://app.zeo.dev */
  baseUrl?: string;
  /** API key (starts with zeo_) */
  apiKey: string;
  /** Organization ID */
  orgId: string;
  /** Optional default project ID */
  projectId?: string;
}

export interface AnalyzeRequest {
  query: string;
  dataset?: unknown;
  projectId?: string;
}

export interface AnalyzeResponse {
  ok: boolean;
  runId: string;
  result: {
    query: string;
    narrative: string;
    intent: string;
  };
  hashes: {
    dataset: string;
    output: string;
  };
  engineVersion: string;
  warning?: string;
}

export interface StressTestRequest {
  query: string;
  scenarios?: unknown[];
  projectId?: string;
}

export interface StressTestResponse {
  ok: boolean;
  runId: string;
  result: {
    query: string;
    scenariosEvaluated: number;
    narrative: string;
  };
  hashes: { output: string };
  engineVersion: string;
  warning?: string;
}

export interface ImproveRequest {
  runId: string;
  feedback?: string;
  projectId?: string;
}

export interface ImproveResponse {
  ok: boolean;
  runId: string;
  parentRunId: string;
  result: { narrative: string };
  hashes: { output: string };
  engineVersion: string;
  warning?: string;
}

export interface RunWorkflowRequest {
  workflowName: string;
  workflowSpec?: Record<string, unknown>;
  context?: Record<string, unknown>;
  projectId?: string;
}

export interface RunWorkflowResponse {
  ok: boolean;
  runId: string;
  jobId: string;
  result: {
    workflowName: string;
    narrative: string;
  };
  hashes: { context: string; output: string };
  engineVersion: string;
  warning?: string;
}

export interface SearchCheckpointsRequest {
  intent?: string;
  datasetHash?: string;
  projectId?: string;
  limit?: number;
}

export interface CheckpointSummary {
  id: string;
  timestamp: string;
  intent: string;
  query: string;
  datasetHash: string;
  outputHash: string;
  engineVersion: string;
  narrativeSummary: string;
}

export interface SearchCheckpointsResponse {
  ok: boolean;
  runs: CheckpointSummary[];
  count: number;
}

export interface ExportAuditRequest {
  runId: string;
}

export interface AuditExport {
  version: string;
  exportedAt: string;
  record: Record<string, unknown>;
  traces: Record<string, unknown>[];
  orgId: string;
  projectId: string | null;
  engineVersion: string;
  replayProof: {
    datasetHash: string;
    outputHash: string;
    engineVersion: string;
    traceChainHash: string | null;
  };
  auditHash: string;
  signature: string | null;
}

export interface ExportAuditResponse {
  ok: boolean;
  export: AuditExport;
}

export interface VerifyAuditResponse {
  ok: boolean;
  valid: boolean;
  recomputedHash: string;
  providedHash: string;
  traceChainValid: boolean;
}

export class ZeoApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'ZeoApiError';
  }
}

export class ZeoClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly orgId: string;
  private readonly projectId?: string;

  constructor(config: ZeoClientConfig) {
    this.baseUrl = (config.baseUrl ?? 'https://app.zeo.dev').replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.orgId = config.orgId;
    this.projectId = config.projectId;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (method === 'GET' && !url.searchParams.has('org_id')) {
      url.searchParams.set('org_id', this.orgId);
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Zeo-Org-Id': this.orgId,
      'Content-Type': 'application/json',
    };

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new ZeoApiError(
        data?.error ?? `HTTP ${res.status}`,
        res.status,
        data,
      );
    }

    return data as T;
  }

  /** Run an analysis query. */
  async analyze(req: AnalyzeRequest): Promise<AnalyzeResponse> {
    return this.request<AnalyzeResponse>('POST', '/api/v1/analyze', {
      query: req.query,
      dataset: req.dataset,
      projectId: req.projectId ?? this.projectId,
    });
  }

  /** Run a stress test with multiple scenarios. */
  async stressTest(req: StressTestRequest): Promise<StressTestResponse> {
    return this.request<StressTestResponse>('POST', '/api/v1/stress-test', {
      query: req.query,
      scenarios: req.scenarios,
      projectId: req.projectId ?? this.projectId,
    });
  }

  /** Improve a previous analysis run. */
  async improve(req: ImproveRequest): Promise<ImproveResponse> {
    return this.request<ImproveResponse>('POST', '/api/v1/improve', {
      runId: req.runId,
      feedback: req.feedback,
      projectId: req.projectId ?? this.projectId,
    });
  }

  /** Run a named workflow. */
  async runWorkflow(req: RunWorkflowRequest): Promise<RunWorkflowResponse> {
    return this.request<RunWorkflowResponse>('POST', '/api/v1/run-workflow', {
      workflowName: req.workflowName,
      workflowSpec: req.workflowSpec,
      context: req.context,
      projectId: req.projectId ?? this.projectId,
    });
  }

  /** Search decision checkpoints. */
  async searchCheckpoints(req?: SearchCheckpointsRequest): Promise<SearchCheckpointsResponse> {
    const params = new URLSearchParams();
    params.set('org_id', this.orgId);
    if (req?.intent) params.set('intent', req.intent);
    if (req?.datasetHash) params.set('dataset_hash', req.datasetHash);
    if (req?.projectId) params.set('project_id', req.projectId);
    if (req?.limit) params.set('limit', String(req.limit));

    return this.request<SearchCheckpointsResponse>('GET', `/api/v1/checkpoints/search?${params}`);
  }

  /** Export an audit report for a decision run. */
  async exportAudit(req: ExportAuditRequest): Promise<ExportAuditResponse> {
    const params = new URLSearchParams();
    params.set('org_id', this.orgId);
    params.set('run_id', req.runId);

    return this.request<ExportAuditResponse>('GET', `/api/v1/checkpoints/export?${params}`);
  }

  /** Verify an audit export payload. */
  async verifyAudit(exportPayload: AuditExport): Promise<VerifyAuditResponse> {
    return this.request<VerifyAuditResponse>('POST', '/api/v1/verify-audit', {
      export: exportPayload,
    });
  }
}

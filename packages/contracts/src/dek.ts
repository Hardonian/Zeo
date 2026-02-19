/**
 * Zeo Deterministic Execution Kernel (DEK) Contracts
 * 
 * These types define the strict execution envelope for all Zeo workflows,
 * ensuring reproducibility, verifiability, and model-agnostic execution.
 */

/**
 * Model specification for execution envelope
 * Captures all parameters needed to reconstruct model behavior
 */
export interface ZeoModelSpec {
  /** Provider identifier (e.g., 'openai', 'anthropic', 'local') */
  provider: string;
  /** Model identifier (e.g., 'gpt-4', 'claude-3-opus') */
  model: string;
  /** Provider-specific parameters */
  parameters: Record<string, unknown>;
  /** Optional capability overrides */
  capabilities?: {
    supportsStreaming?: boolean;
    maxTokens?: number;
    contextWindow?: number;
    supportsToolCalling?: boolean;
    supportsVision?: boolean;
  };
}

/**
 * Execution envelope - immutable contract for every Zeo run
 * This is the core deterministic execution guarantee
 */
export interface ZeoExecutionEnvelope {
  /** DEK version for compatibility */
  version: string;
  /** Unique workflow identifier */
  workflowId: string;
  /** Run identifier (unique per execution) */
  runId: string;
  /** SHA-256 hash of canonicalized input */
  inputHash: string;
  /** SHA-256 hash of canonicalized model spec */
  modelSpecHash: string;
  /** Model specification for reconstruction */
  modelSpec: ZeoModelSpec;
  /** SHA-256 hash of policy/configuration */
  policyHash: string;
  /** ISO 8601 timestamp of execution start */
  timestamp: string;
  /** Deterministic seed for reproducibility */
  deterministicSeed: string;
  /** Execution depth/branching factor */
  depth: number;
  /** Optional tenant identifier (enterprise mode) */
  tenantId?: string;
  /** DEK metadata */
  dek: {
    /** Kernel version */
    kernelVersion: string;
    /** Contract version */
    contractVersion: string;
    /** Build hash */
    buildHash: string;
  };
}

/**
 * Journal entry - append-only record of execution
 */
export interface ZeoJournalEntry {
  /** Sequential journal ID */
  journalId: string;
  /** Execution envelope */
  envelope: ZeoExecutionEnvelope;
  /** SHA-256 hash of output */
  outputHash: string;
  /** Execution duration in milliseconds */
  durationMs: number;
  /** Resource usage metrics (if available) */
  resources?: {
    /** Peak memory usage in bytes */
    peakMemoryBytes?: number;
    /** CPU time in milliseconds */
    cpuTimeMs?: number;
    /** Token usage (if applicable) */
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
  };
  /** Model latency metrics */
  modelLatency: {
    /** Time to first token (if streaming) */
    ttftMs?: number;
    /** Total generation time */
    totalMs: number;
    /** Tokens per second */
    tps?: number;
  };
  /** Execution status */
  status: 'success' | 'error' | 'degraded';
  /** Error details (if status is error) */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  /** Replay metadata for verification */
  replayMeta: {
    /** Hash of executable snapshot */
    snapshotHash: string;
    /** Version of replay engine */
    replayEngineVersion: string;
    /** Compatible model versions */
    compatibleModels: string[];
  };
}

/**
 * Replay result - output of replay verification
 */
export interface ZeoReplayResult {
  /** Original run ID */
  originalRunId: string;
  /** Replay run ID */
  replayRunId: string;
  /** Replay status */
  status: 'MATCH' | 'MISMATCH' | 'DEGRADED' | 'UNAVAILABLE';
  /** Detailed comparison */
  comparison: {
    /** Original output hash */
    originalHash: string;
    /** Replayed output hash */
    replayHash: string;
    /** Hashes match exactly */
    exactMatch: boolean;
    /** Semantic equivalence (if not exact) */
    semanticMatch?: boolean;
  };
  /** Differences (if status is MISMATCH) */
  differences?: Array<{
    /** Field path */
    path: string;
    /** Original value */
    original: unknown;
    /** Replayed value */
    replayed: unknown;
    /** Difference type */
    type: 'added' | 'removed' | 'changed' | 'order';
  }>;
  /** Timing comparison */
  timing: {
    /** Original duration */
    originalMs: number;
    /** Replay duration */
    replayMs: number;
    /** Overhead percentage */
    overheadPercent: number;
  };
  /** Model availability */
  modelAvailability: {
    /** Original model available */
    available: boolean;
    /** Model used for replay */
    replayModel?: string;
    /** Closest compatible model (if original unavailable) */
    suggestedModel?: string;
  };
  /** Degradation notice (if applicable) */
  degradationNotice?: string;
}

/**
 * Model adapter interface - provider-agnostic model execution
 */
export interface ZeoModelAdapter {
  /** Adapter identifier */
  id: string;
  /** Provider name */
  provider: string;
  /** Model name */
  model: string;
  /** Capabilities */
  capabilities: {
    supportsStreaming: boolean;
    maxTokens: number;
    contextWindow: number;
    supportsToolCalling: boolean;
    supportsVision: boolean;
  };
  /** Execute model with input */
  execute(
    input: ZeoModelInput,
    params?: Record<string, unknown>
  ): Promise<ZeoModelResult>;
  /** Check if this adapter can handle a model spec */
  canHandle(spec: ZeoModelSpec): boolean;
  /** Get hash of adapter configuration (for determinism) */
  getConfigHash(): string;
}

/**
 * Model input - normalized input for any model
 */
export interface ZeoModelInput {
  /** Input messages/prompts */
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    /** Optional tool calls */
    toolCalls?: unknown[];
    /** Optional tool results */
    toolResults?: unknown[];
  }>;
  /** Optional tools schema */
  tools?: unknown[];
  /** Generation parameters */
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    seed?: number;
  };
}

/**
 * Model result - normalized output from any model
 */
export interface ZeoModelResult {
  /** Generated content */
  content: string;
  /** Token usage */
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  /** Finish reason */
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  /** Tool calls (if applicable) */
  toolCalls?: unknown[];
  /** Model metadata */
  meta: {
    provider: string;
    model: string;
    /** Provider-specific metadata */
    raw?: unknown;
  };
  /** Timing */
  timing: {
    startedAt: string;
    finishedAt: string;
    totalMs: number;
  };
  /** Hash of output content (for determinism verification) */
  contentHash: string;
}

/**
 * Execution journal configuration
 */
export interface ZeoJournalConfig {
  /** Journal directory path */
  journalDir: string;
  /** Max entries per file before rotation */
  maxEntriesPerFile: number;
  /** Compression enabled */
  compress: boolean;
  /** Retention days (0 = forever) */
  retentionDays: number;
  /** Enterprise sync configuration */
  enterpriseSync?: {
    /** Supabase URL */
    supabaseUrl?: string;
    /** Supabase service key (from env) */
    serviceKeyEnvVar?: string;
    /** API key for authentication (passed directly, not from env) */
    apiKey?: string;
    /** Table name for journal entries */
    tableName: string;
    /** Sync interval ms (0 = immediate) */
    syncIntervalMs: number;
  };
}

/**
 * Doctor verification result
 */
export interface ZeoDoctorResult {
  /** Overall health status */
  status: 'healthy' | 'warning' | 'critical';
  /** Individual checks */
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
    details?: unknown;
  }>;
  /** Version information */
  versions: {
    node: string;
    dekVersion: string;
    kernelVersion: string;
    contractVersion: string;
  };
  /** Adapter status */
  adapters: Array<{
    id: string;
    provider: string;
    status: 'available' | 'unavailable' | 'degraded';
    message: string;
  }>;
  /** Journal status */
  journal: {
    status: 'healthy' | 'warning' | 'critical';
    entries: number;
    sizeBytes: number;
    lastWrite: string;
  };
  /** Policy schema version */
  policySchema: {
    current: string;
    latest: string;
    compatible: boolean;
  };
  /** Enterprise connectivity (if configured) */
  enterprise?: {
    status: 'connected' | 'disconnected' | 'unconfigured';
    latencyMs?: number;
    message: string;
  };
}

/**
 * Determinism test fixture
 */
export interface ZeoDeterminismFixture {
  /** Fixture name */
  name: string;
  /** Input specification */
  input: unknown;
  /** Model spec */
  modelSpec: ZeoModelSpec;
  /** Deterministic seed */
  seed: string;
  /** Expected output hash */
  expectedOutputHash: string;
  /** Expected envelope hash */
  expectedEnvelopeHash: string;
  /** Tolerance for semantic drift (0 = exact) */
  tolerancePercent: number;
}

/**
 * Determinism test result
 */
export interface ZeoDeterminismTestResult {
  /** Fixture name */
  fixture: string;
  /** Test passed */
  passed: boolean;
  /** Number of runs executed */
  runs: number;
  /** Results per run */
  results: Array<{
    run: number;
    outputHash: string;
    envelopeHash: string;
    durationMs: number;
    match: boolean;
  }>;
  /** Drift detected */
  drift: boolean;
  /** Drift details (if drift detected) */
  driftDetails?: {
    /** First run that drifted */
    firstDriftRun: number;
    /** Hash that differed */
    driftHash: string;
    /** Expected hash */
    expectedHash: string;
  };
  /** Overall statistics */
  stats: {
    avgDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    hashConsistency: number; // 0-1
  };
}

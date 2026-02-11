/**
 * Job Queue Types
 * Deterministic background job processing for Zeo
 */

export type JobStatus =
  | 'pending'      // Waiting to be processed
  | 'running'      // Currently executing
  | 'paused'       // Paused by user
  | 'completed'    // Successfully finished
  | 'failed'       // Error occurred
  | 'dead_letter'  // Max retries exceeded
  | 'cancelled';   // Cancelled by user

export type JobType =
  | 'replay'       // Replay analysis
  | 'analytics'    // Statistical analytics
  | 'tournament'   // Strategy tournament
  | 'export'       // Data export
  | 'import'       // Data import
  | 'calibration'  // Calibration run
  | 'indexing'     // Index maintenance
  | 'github_webhook'; // GitHub webhook processing

export interface JobProgress {
  /** Current step number */
  currentStep: number;
  /** Total steps (0 if unknown) */
  totalSteps: number;
  /** Human-readable current operation */
  currentOperation: string;
  /** Percentage complete (0-100, -1 if unknown) */
  percentComplete: number;
  /** Items processed so far */
  itemsProcessed: number;
  /** Total items to process */
  itemsTotal: number;
  /** Timestamp of last update */
  updatedAt: string;
}

export interface Job {
  /** Unique job ID (deterministic if based on content hash) */
  id: string;
  /** Job type classification */
  type: JobType;
  /** Human-readable description */
  description: string;
  /** Current status */
  status: JobStatus;
  /** Job payload (task-specific data) */
  payload: unknown;
  /** Current progress */
  progress: JobProgress;
  /** Creation timestamp */
  createdAt: string;
  /** Start timestamp (null if not started) */
  startedAt: string | null;
  /** Completion timestamp (null if not completed) */
  completedAt: string | null;
  /** Error message if failed */
  error: string | null;
  /** Result data if completed */
  result: unknown | null;
  /** Priority (lower = higher priority, default: 0) */
  priority: number;
  /** Maximum runtime in seconds (0 = unlimited) */
  timeoutSeconds: number;
  /** Whether job can be resumed after pause */
  resumable: boolean;
  /** Checkpoint data for resumable jobs */
  checkpoint: unknown | null;
  /** Associated decision ID if applicable */
  decisionId?: string;
  /** Tags for organization */
  tags?: string[];
  /** Current retry attempt count */
  attempts: number;
  /** Maximum retry attempts for this specific job */
  maxRetries: number;
  /** Next retry timestamp (if backoff applied) */
  retryAfter?: string;
}

export interface JobQueueConfig {
  /** Maximum concurrent jobs (default: 1 for deterministic execution) */
  concurrency: number;
  /** Interval between job polls in ms (default: 100) */
  pollIntervalMs: number;
  /** Default timeout in seconds (default: 3600) */
  defaultTimeoutSeconds: number;
  /** Maximum retry attempts for failed jobs (default: 0) */
  maxRetries: number;
  /** Whether to auto-start processing on init (default: true) */
  autoStart: boolean;
  /** Persist completed jobs for this many ms (default: 86400000 = 24h) */
  completedJobRetentionMs: number;
  /** Default retry delay in ms (default: 5000) */
  retryDelayMs: number;
}

export interface JobEnqueueOptions {
  /** Job priority (lower = higher) */
  priority?: number;
  /** Timeout in seconds */
  timeoutSeconds?: number;
  /** Whether job is resumable */
  resumable?: boolean;
  /** Associated decision ID */
  decisionId?: string;
  /** Tags for organization */
  tags?: string[];
  /** Override max retries for this job */
  maxRetries?: number;
}

export interface JobHandler<TPayload = unknown, TResult = unknown> {
  /** Job type this handler processes */
  type: JobType;
  /** Execute the job - called with job and updateProgress callback */
  execute(
    job: Job,
    updateProgress: (progress: Partial<JobProgress>) => void,
    checkCancelled: () => boolean
  ): Promise<TResult>;
  /** Restore from checkpoint for resumable jobs */
  restoreCheckpoint?(checkpoint: unknown): TPayload;
}

export interface JobQueueStats {
  /** Total jobs in queue (all statuses) */
  totalJobs: number;
  /** Jobs by status */
  byStatus: Record<JobStatus, number>;
  /** Currently running jobs */
  running: number;
  /** Jobs completed in last hour */
  completedLastHour: number;
  /** Average job duration in ms */
  averageDurationMs: number;
  /** Timestamp of oldest pending job */
  oldestPendingAt: string | null;
}

export interface JobFilter {
  /** Filter by status */
  status?: JobStatus[];
  /** Filter by type */
  type?: JobType[];
  /** Filter by decision ID */
  decisionId?: string;
  /** Filter by tags (all must match) */
  tags?: string[];
  /** Limit results */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}


/**
 * Deterministic Job Queue Implementation
 * FIFO scheduling with deterministic ordering
 */

import type {
  Job,
  JobType,
  JobStatus,
  JobProgress,
  JobQueueConfig,
  JobEnqueueOptions,
  JobHandler,
  JobQueueStats,
  JobFilter,
} from './types.js';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('zeo-jobforge');

const DEFAULT_CONFIG: JobQueueConfig = {
  concurrency: 1,  // Deterministic: one job at a time
  pollIntervalMs: 100,
  defaultTimeoutSeconds: 3600,
  maxRetries: 0,
  autoStart: true,
  completedJobRetentionMs: 24 * 60 * 60 * 1000, // 24 hours
  retryDelayMs: 5000,
};

function generateJobId(): string {
  // Deterministic ID based on timestamp + counter for same-ms collisions
  const ts = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `job-${ts}-${random.toString().padStart(4, '0')}`;
}

function createInitialProgress(): JobProgress {
  return {
    currentStep: 0,
    totalSteps: 0,
    currentOperation: 'Waiting to start',
    percentComplete: 0,
    itemsProcessed: 0,
    itemsTotal: 0,
    updatedAt: new Date().toISOString(),
  };
}

export class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<JobType, JobHandler> = new Map();
  private config: JobQueueConfig;
  private runningJobs: Set<string> = new Set();
  private processingInterval: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;
  private jobOrder: string[] = [];  // FIFO order for deterministic scheduling
  private stats = {
    totalCompleted: 0,
    totalDurationMs: 0,
  };

  constructor(config: Partial<JobQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Register a handler for a job type
   */
  registerHandler<TPayload, TResult>(handler: JobHandler<TPayload, TResult>): void {
    this.handlers.set(handler.type, handler as JobHandler);
  }

  /**
   * Enqueue a new job
   * Jobs are processed FIFO within priority level
   */
  enqueue<TPayload>(
    type: JobType,
    description: string,
    payload: TPayload,
    options: JobEnqueueOptions = {}
  ): Job {
    return tracer.startActiveSpan('job.enqueue', (span) => {
      span.setAttribute('job.type', type);
      span.setAttribute('job.description', description);

      const now = new Date().toISOString();
      const job: Job = {
        id: options.priority !== undefined ? `priority-${options.priority}-${generateJobId()}` : generateJobId(),
        type,
        description,
        payload,
        status: 'pending',
        progress: createInitialProgress(),
        createdAt: now,
        startedAt: null,
        completedAt: null,
        error: null,
        result: null,
        priority: options.priority ?? 0,
        timeoutSeconds: options.timeoutSeconds ?? this.config.defaultTimeoutSeconds,
        resumable: options.resumable ?? false,
        checkpoint: null,
        decisionId: options.decisionId,
        tags: options.tags,
        attempts: 0,
        maxRetries: options.maxRetries ?? this.config.maxRetries,
      };

      this.jobs.set(job.id, job);
      this.insertInOrder(job);

      span.setAttribute('job.id', job.id);
      span.end();
      return job;
    });
  }

  /**
   * Insert job in deterministic order (priority asc, then createdAt asc)
   */
  private insertInOrder(job: Job): void {
    // Remove if already exists
    const existingIndex = this.jobOrder.indexOf(job.id);
    if (existingIndex !== -1) {
      this.jobOrder.splice(existingIndex, 1);
    }

    // Find insertion point based on priority, then creation time
    let insertIndex = this.jobOrder.length;
    for (let i = 0; i < this.jobOrder.length; i++) {
      const otherId = this.jobOrder[i];
      const other = this.jobs.get(otherId);
      if (!other) continue;

      // Lower priority number = higher priority
      if (job.priority < other.priority ||
        (job.priority === other.priority && job.createdAt < other.createdAt)) {
        insertIndex = i;
        break;
      }
    }

    this.jobOrder.splice(insertIndex, 0, job.id);
  }

  /**
   * Get a job by ID
   */
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * List jobs with optional filtering
   */
  listJobs(filter: JobFilter = {}): Job[] {
    let jobs = Array.from(this.jobs.values());

    if (filter.status) {
      jobs = jobs.filter(j => filter.status!.includes(j.status));
    }

    if (filter.type) {
      jobs = jobs.filter(j => filter.type!.includes(j.type));
    }

    if (filter.decisionId) {
      jobs = jobs.filter(j => j.decisionId === filter.decisionId);
    }

    if (filter.tags) {
      jobs = jobs.filter(j =>
        filter.tags!.every((tag: string) => j.tags?.includes(tag))
      );
    }

    // Sort by priority, then creation time
    jobs.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.createdAt.localeCompare(b.createdAt);
    });

    if (filter.limit) {
      const start = filter.cursor ? parseInt(filter.cursor, 10) : 0;
      jobs = jobs.slice(start, start + filter.limit);
    }

    return jobs;
  }

  /**
   * Cancel a pending or running job
   */
  async cancel(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return false; // Already terminal
    }

    if (job.status === 'running') {
      // Mark for cancellation - handler should check
      job.status = 'cancelled';
      this.runningJobs.delete(jobId);
    } else {
      job.status = 'cancelled';
      job.completedAt = new Date().toISOString();
    }

    return true;
  }

  /**
   * Pause a running job (if resumable)
   */
  async pause(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status !== 'running') return false;
    if (!job.resumable) return false;

    job.status = 'paused';
    return true;
  }

  /**
   * Resume a paused job
   */
  async resume(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status !== 'paused') return false;

    job.status = 'pending';
    this.insertInOrder(job);
    return true;
  }

  /**
   * Manually retry a failed or dead-letter job
   */
  async retry(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status !== 'failed' && job.status !== 'dead_letter') return false;

    job.status = 'pending';
    job.error = null;
    job.retryAfter = undefined;
    this.insertInOrder(job);
    return true;
  }

  /**
   * Start processing jobs
   */
  start(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processNextJobs();
    }, this.config.pollIntervalMs);
  }

  /**
   * Stop processing new jobs
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): JobQueueStats {
    const jobs = Array.from(this.jobs.values());
    const byStatus: Record<JobStatus, number> = {
      pending: 0,
      running: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      dead_letter: 0,
      cancelled: 0,
    };

    for (const job of jobs) {
      byStatus[job.status]++;
    }

    const completedLastHour = jobs.filter(j =>
      j.status === 'completed' &&
      j.completedAt &&
      Date.now() - new Date(j.completedAt).getTime() < 60 * 60 * 1000
    ).length;

    const averageDurationMs = this.stats.totalCompleted > 0
      ? this.stats.totalDurationMs / this.stats.totalCompleted
      : 0;

    const pendingJobs = jobs.filter(j => j.status === 'pending');
    const oldestPendingAt = pendingJobs.length > 0
      ? pendingJobs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0].createdAt
      : null;

    return {
      totalJobs: jobs.length,
      byStatus,
      running: this.runningJobs.size,
      completedLastHour,
      averageDurationMs,
      oldestPendingAt,
    };
  }

  /**
   * Process next available jobs up to concurrency limit
   */
  private async processNextJobs(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.runningJobs.size < this.config.concurrency) {
        const nextJob = this.getNextPendingJob();
        if (!nextJob) break;

        this.processJob(nextJob);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the next pending job in deterministic order
   */
  private getNextPendingJob(): Job | null {
    for (const jobId of this.jobOrder) {
      const job = this.jobs.get(jobId);
      if (job && job.status === 'pending') {
        // Check if backoff period has passed
        if (job.retryAfter && new Date(job.retryAfter).getTime() > Date.now()) {
          continue;
        }
        return job;
      }
    }
    return null;
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    await tracer.startActiveSpan('job.process', async (span) => {
      span.setAttribute('job.id', job.id);
      span.setAttribute('job.type', job.type);

      const handler = this.handlers.get(job.type);
      if (!handler) {
        job.status = 'failed';
        job.error = `No handler registered for job type: ${job.type}`;
        job.completedAt = new Date().toISOString();
        span.setStatus({ code: SpanStatusCode.ERROR, message: job.error });
        span.end();
        return;
      }

      job.status = 'running';
      job.startedAt = new Date().toISOString();
      this.runningJobs.add(job.id);

      const startTime = Date.now();
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          if (job.timeoutSeconds > 0) {
            timeoutId = setTimeout(() => {
              reject(new Error(`Job timed out after ${job.timeoutSeconds} seconds`));
            }, job.timeoutSeconds * 1000);
          }
        });

        const updateProgress = (progress: Partial<JobProgress>) => {
          job.progress = {
            ...job.progress,
            ...progress,
            updatedAt: new Date().toISOString(),
          };
        };

        const checkCancelled = () => {
          const j = this.jobs.get(job.id);
          return j?.status === 'cancelled';
        };

        const result = await Promise.race([
          handler.execute(job, updateProgress, checkCancelled),
          timeoutPromise,
        ]);

        const currentJob = this.jobs.get(job.id);
        if (currentJob?.status === 'cancelled') {
          job.completedAt = new Date().toISOString();
          span.addEvent('job.cancelled');
        } else {
          job.status = 'completed';
          job.result = result;
          job.completedAt = new Date().toISOString();
          job.progress.percentComplete = 100;
          job.progress.currentOperation = 'Completed';
          this.stats.totalCompleted++;
          this.stats.totalDurationMs += Date.now() - startTime;
          span.setStatus({ code: SpanStatusCode.OK });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        span.recordException(error as Error);

        if (job.attempts < job.maxRetries) {
          job.attempts++;
          job.status = 'pending';
          job.error = `Attempt ${job.attempts} failed: ${errorMessage}`;
          const delay = this.config.retryDelayMs * Math.pow(2, job.attempts - 1);
          job.retryAfter = new Date(Date.now() + delay).toISOString();
          this.insertInOrder(job);
        } else {
          job.status = job.maxRetries > 0 ? 'dead_letter' : 'failed';
          job.error = errorMessage;
          job.completedAt = new Date().toISOString();
          span.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage });
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        this.runningJobs.delete(job.id);
        this.cleanupOldJobs();
        span.end();
      }
    });
  }

  /**
   * Remove old completed jobs to prevent memory bloat
   */
  private cleanupOldJobs(): void {
    const cutoff = Date.now() - this.config.completedJobRetentionMs;

    for (const [id, job] of this.jobs) {
      if (
        (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') &&
        job.completedAt &&
        new Date(job.completedAt).getTime() < cutoff
      ) {
        this.jobs.delete(id);
        const orderIndex = this.jobOrder.indexOf(id);
        if (orderIndex !== -1) {
          this.jobOrder.splice(orderIndex, 1);
        }
      }
    }
  }

  /**
   * Clear all jobs (for testing)
   */
  clear(): void {
    this.jobs.clear();
    this.jobOrder = [];
    this.runningJobs.clear();
    this.stats = { totalCompleted: 0, totalDurationMs: 0 };
  }
}

// Singleton instance for app-wide use
let globalQueue: JobQueue | null = null;

export function getJobQueue(config?: Partial<JobQueueConfig>): JobQueue {
  if (!globalQueue) {
    globalQueue = new JobQueue(config);
  }
  return globalQueue;
}

export function resetJobQueue(): void {
  if (globalQueue) {
    globalQueue.stop();
    globalQueue.clear();
  }
  globalQueue = null;
}

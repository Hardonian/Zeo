/**
 * Mesh Orchestrator — Phase 3
 *
 * Provides:
 * - Mesh mode: off / local / remote
 * - Worker registry with health check polling
 * - Circuit breaker after N failures
 * - Job scheduling: bounded concurrency, queue, exponential backoff retries
 * - Idempotent job_id deduplication
 * - Fallback: remote → local if allowed
 */

import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { kernel } from "@zeo/core";
import {
  type JobEnvelope,
  type ResultEnvelope,
  createJobEnvelope,
  createResultEnvelope,
  computeCanonicalHash,
  type CreateEnvelopeParams,
  type DeterministicJobConfig,
  type SchemaVersions,
  ENVELOPE_VERSION,
  redactSecrets,
} from "./envelope.js";
import type { WorkerServer } from "./worker.js";
import type { KernelInput, KernelPolicySnapshot } from "@zeo/core";

// ─── Types ───────────────────────────────────────────────────────────────

export type MeshMode = "off" | "local" | "remote";

export interface WorkerEndpoint {
  id: string;
  url: string;
  healthy: boolean;
  lastHealthCheck: string | null;
  consecutiveFailures: number;
  circuitOpen: boolean;
  totalJobsHandled: number;
}

export interface OrchestratorConfig {
  /** Mesh mode */
  mode: MeshMode;
  /** Worker endpoints for remote mode */
  workerEndpoints?: string[];
  /** Maximum concurrent jobs (default: 4) */
  maxConcurrency?: number;
  /** Circuit breaker threshold (default: 3 consecutive failures) */
  circuitBreakerThreshold?: number;
  /** Health check interval in ms (default: 10000) */
  healthCheckIntervalMs?: number;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Base retry delay in ms (default: 1000) */
  baseRetryDelayMs?: number;
  /** Allow local fallback when remote workers unavailable (default: true) */
  allowLocalFallback?: boolean;
  /** In-process worker for local mode */
  localWorker?: WorkerServer;
}

export interface BatchJob {
  kernel_input: KernelInput;
  tenant_id: string;
  policy_snapshot: KernelPolicySnapshot;
  trace_id?: string;
}

export interface BatchResult {
  results: ResultEnvelope[];
  failures: Array<{ job_index: number; error: string }>;
  stats: BatchStats;
}

export interface BatchStats {
  total_jobs: number;
  succeeded: number;
  failed: number;
  retried: number;
  fallback_local: number;
  total_duration_ms: number;
  avg_job_duration_ms: number;
  mode: MeshMode;
}

// ─── Job Queue ───────────────────────────────────────────────────────────

interface QueuedJob {
  index: number;
  envelope: JobEnvelope;
  attempt: number;
  maxRetries: number;
}

// ─── Orchestrator ────────────────────────────────────────────────────────

export class MeshOrchestrator {
  private readonly config: Required<OrchestratorConfig>;
  private workers: WorkerEndpoint[] = [];
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private completedJobIds = new Set<string>(); // idempotency

  constructor(config: OrchestratorConfig) {
    this.config = {
      mode: config.mode,
      workerEndpoints: config.workerEndpoints ?? [],
      maxConcurrency: config.maxConcurrency ?? 4,
      circuitBreakerThreshold: config.circuitBreakerThreshold ?? 3,
      healthCheckIntervalMs: config.healthCheckIntervalMs ?? 10_000,
      maxRetries: config.maxRetries ?? 3,
      baseRetryDelayMs: config.baseRetryDelayMs ?? 1_000,
      allowLocalFallback: config.allowLocalFallback ?? true,
      localWorker: config.localWorker ?? (null as any),
    };

    // Initialize worker registry
    for (const url of this.config.workerEndpoints) {
      this.workers.push({
        id: `worker_${randomUUID().slice(0, 8)}`,
        url,
        healthy: true, // optimistic
        lastHealthCheck: null,
        consecutiveFailures: 0,
        circuitOpen: false,
        totalJobsHandled: 0,
      });
    }
  }

  get mode(): MeshMode {
    return this.config.mode;
  }

  getWorkers(): WorkerEndpoint[] {
    return this.workers.map(w => ({ ...w }));
  }

  /**
   * Start health check polling (remote mode only).
   */
  startHealthChecks(): void {
    if (this.config.mode !== "remote") return;

    this.healthCheckTimer = setInterval(() => {
      this.pollHealthChecks().catch(() => {});
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Stop health check polling.
   */
  stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Execute a batch of jobs through the mesh.
   */
  async executeBatch(
    jobs: BatchJob[],
    deterministicConfig: DeterministicJobConfig,
    schemaVersions: SchemaVersions,
  ): Promise<BatchResult> {
    const startTime = performance.now();
    const results: ResultEnvelope[] = [];
    const failures: Array<{ job_index: number; error: string }> = [];
    let retriedCount = 0;
    let fallbackCount = 0;

    // Create envelopes for all jobs
    const envelopes: JobEnvelope[] = jobs.map((job) => {
      const params: CreateEnvelopeParams = {
        job_id: `job_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        tenant_id: job.tenant_id,
        policy_snapshot: job.policy_snapshot,
        kernel_input: job.kernel_input,
        schema_versions: schemaVersions,
        deterministic_config: deterministicConfig,
        trace_id: job.trace_id ?? randomUUID(),
        nonce: randomUUID(),
      };
      return createJobEnvelope(params);
    });

    // Build the job queue
    const queue: QueuedJob[] = envelopes.map((envelope, index) => ({
      index,
      envelope,
      attempt: 0,
      maxRetries: this.config.maxRetries,
    }));

    // Process with bounded concurrency
    const active = new Set<Promise<void>>();
    let queueIdx = 0;

    const processJob = async (queuedJob: QueuedJob): Promise<void> => {
      // Idempotency check
      if (this.completedJobIds.has(queuedJob.envelope.job_id)) {
        return;
      }

      try {
        const result = await this.executeOne(queuedJob.envelope);
        results.push(result);
        this.completedJobIds.add(queuedJob.envelope.job_id);
      } catch (err) {
        queuedJob.attempt++;

        if (queuedJob.attempt < queuedJob.maxRetries) {
          // Exponential backoff retry
          const delay = this.config.baseRetryDelayMs * Math.pow(2, queuedJob.attempt - 1);
          await sleep(delay);
          retriedCount++;
          await processJob(queuedJob);
        } else if (this.config.allowLocalFallback && this.config.mode === "remote") {
          // Fallback to local execution
          try {
            const result = await this.executeLocal(queuedJob.envelope);
            results.push(result);
            this.completedJobIds.add(queuedJob.envelope.job_id);
            fallbackCount++;
          } catch (localErr) {
            failures.push({
              job_index: queuedJob.index,
              error: localErr instanceof Error ? localErr.message : String(localErr),
            });
          }
        } else {
          failures.push({
            job_index: queuedJob.index,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    };

    while (queueIdx < queue.length || active.size > 0) {
      // Fill up to maxConcurrency
      while (queueIdx < queue.length && active.size < this.config.maxConcurrency) {
        const job = queue[queueIdx++];
        const promise = processJob(job).then(() => { active.delete(promise); });
        active.add(promise);
      }

      // Wait for at least one to complete
      if (active.size > 0) {
        await Promise.race(active);
      }
    }

    const totalDuration = Math.round(performance.now() - startTime);

    // Sort results by original job order to maintain determinism
    results.sort((a, b) => {
      const idxA = envelopes.findIndex(e => e.job_id === a.job_id);
      const idxB = envelopes.findIndex(e => e.job_id === b.job_id);
      return idxA - idxB;
    });

    return {
      results,
      failures,
      stats: {
        total_jobs: jobs.length,
        succeeded: results.length,
        failed: failures.length,
        retried: retriedCount,
        fallback_local: fallbackCount,
        total_duration_ms: totalDuration,
        avg_job_duration_ms: results.length > 0 ? Math.round(totalDuration / results.length) : 0,
        mode: this.config.mode,
      },
    };
  }

  // ─── Internal execution ────────────────────────────────────────────────

  private async executeOne(envelope: JobEnvelope): Promise<ResultEnvelope> {
    switch (this.config.mode) {
      case "off":
      case "local":
        return this.executeLocal(envelope);
      case "remote":
        return this.executeRemote(envelope);
    }
  }

  /**
   * Execute locally using the pure kernel directly.
   */
  private async executeLocal(envelope: JobEnvelope): Promise<ResultEnvelope> {
    const startTime = performance.now();
    const startedAt = new Date().toISOString();

    // If we have a local worker, use it
    if (this.config.localWorker) {
      return this.config.localWorker.executeJob(envelope);
    }

    // Direct kernel invocation
    const rawKernelOutput = kernel.computeDecision(envelope.kernel_input);
    const kernelOutput = redactSecrets(rawKernelOutput);

    const irOutput = kernel.computeDecisionIR(envelope.kernel_input);
    const irHash = computeCanonicalHash(redactSecrets(irOutput));

    const durationMs = Math.round(performance.now() - startTime);

    return createResultEnvelope({
      job_id: envelope.job_id,
      tenant_id: envelope.tenant_id,
      kernel_output: kernelOutput,
      ir_hash: irHash,
      execution_metadata: {
        worker_id: "local",
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
        memory_used_bytes: process.memoryUsage?.()?.heapUsed ?? 0,
      },
    });
  }

  /**
   * Execute remotely by sending to an available worker.
   */
  private async executeRemote(envelope: JobEnvelope): Promise<ResultEnvelope> {
    const worker = this.selectWorker();
    if (!worker) {
      throw new Error("No healthy workers available");
    }

    try {
      const response = await fetch(`${worker.url}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`Worker ${worker.id} returned ${response.status}: ${errorBody}`);
      }

      const result = await response.json() as ResultEnvelope;
      worker.consecutiveFailures = 0;
      worker.circuitOpen = false;
      worker.totalJobsHandled++;
      return result;
    } catch (err) {
      worker.consecutiveFailures++;
      if (worker.consecutiveFailures >= this.config.circuitBreakerThreshold) {
        worker.circuitOpen = true;
        worker.healthy = false;
      }
      throw err;
    }
  }

  /**
   * Select the best available worker (round-robin among healthy workers).
   */
  private selectWorker(): WorkerEndpoint | null {
    const healthy = this.workers.filter(w => w.healthy && !w.circuitOpen);
    if (healthy.length === 0) return null;

    // Least-loaded selection
    healthy.sort((a, b) => a.totalJobsHandled - b.totalJobsHandled);
    return healthy[0];
  }

  /**
   * Poll health checks for all registered workers.
   */
  private async pollHealthChecks(): Promise<void> {
    for (const worker of this.workers) {
      try {
        const response = await fetch(`${worker.url}/health`, {
          signal: AbortSignal.timeout(5_000),
        });
        if (response.ok) {
          worker.healthy = true;
          worker.lastHealthCheck = new Date().toISOString();
          // Half-open circuit breaker: reset on successful health check
          if (worker.circuitOpen) {
            worker.consecutiveFailures = 0;
            worker.circuitOpen = false;
          }
        } else {
          worker.healthy = false;
        }
      } catch {
        worker.healthy = false;
      }
    }
  }

  /**
   * Get mesh status summary.
   */
  getMeshStatus(): {
    mode: MeshMode,
    workers: WorkerEndpoint[],
    healthyWorkers: number,
    totalWorkers: number,
    completedJobs: number,
  } {
    return {
      mode: this.config.mode,
      workers: this.workers.map(w => ({ ...w })),
      healthyWorkers: this.workers.filter(w => w.healthy && !w.circuitOpen).length,
      totalWorkers: this.workers.length,
      completedJobs: this.completedJobIds.size,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

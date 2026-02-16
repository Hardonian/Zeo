/**
 * Remote Worker Service — Phase 2
 *
 * Minimal HTTP worker server:
 * - POST /execute: validate schema → verify signature → validate tenant + policy → run PURE kernel → return signed result
 * - GET /health: worker health check
 *
 * Enforces:
 * - Request size limit (default 10MB)
 * - Execution timeout (default 30s)
 * - Structured error responses
 * - Tenant isolation
 * - Policy enforcement
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { kernel } from "@zeo/core";
import {
  type JobEnvelope,
  type ResultEnvelope,
  verifyJobEnvelope,
  createResultEnvelope,
  computeCanonicalHash,
  deserializeEnvelope,
  serializeResult,
  redactSecrets,
} from "./envelope.js";

// ─── Types ───────────────────────────────────────────────────────────────

export interface WorkerConfig {
  /** Port to listen on */
  port: number;
  /** Worker ID (defaults to random UUID) */
  workerId?: string;
  /** Max request body size in bytes (default: 10MB) */
  maxRequestSizeBytes?: number;
  /** Max execution timeout in milliseconds (default: 30000) */
  executionTimeoutMs?: number;
  /** Allowed tenant IDs (empty = allow all) */
  allowedTenants?: string[];
}

export interface WorkerStats {
  workerId: string;
  startedAt: string;
  jobsExecuted: number;
  jobsFailed: number;
  totalExecutionMs: number;
  lastJobAt: string | null;
  status: "healthy" | "degraded" | "unhealthy";
}

export interface WorkerError {
  code: string;
  message: string;
  job_id?: string;
  details?: unknown;
}

// ─── Worker Server ───────────────────────────────────────────────────────

export class WorkerServer {
  private server: Server | null = null;
  private readonly config: Required<WorkerConfig>;
  private stats: WorkerStats;
  private activeJobs = new Set<string>();
  private processedJobIds = new Set<string>(); // idempotency dedupe

  constructor(config: WorkerConfig) {
    this.config = {
      port: config.port,
      workerId: config.workerId ?? randomUUID().slice(0, 12),
      maxRequestSizeBytes: config.maxRequestSizeBytes ?? 10 * 1024 * 1024,
      executionTimeoutMs: config.executionTimeoutMs ?? 30_000,
      allowedTenants: config.allowedTenants ?? [],
    };

    this.stats = {
      workerId: this.config.workerId,
      startedAt: new Date().toISOString(),
      jobsExecuted: 0,
      jobsFailed: 0,
      totalExecutionMs: 0,
      lastJobAt: null,
      status: "healthy",
    };
  }

  get workerId(): string {
    return this.config.workerId;
  }

  getStats(): WorkerStats {
    return { ...this.stats };
  }

  /**
   * Start the HTTP server.
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (err) {
          this.sendError(res, 500, {
            code: "INTERNAL_ERROR",
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }
      });

      this.server.on("error", reject);
      this.server.listen(this.config.port, () => {
        resolve();
      });
    });
  }

  /**
   * Stop the HTTP server.
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) { resolve(); return; }
      this.server.close(() => resolve());
    });
  }

  /**
   * Execute a job envelope directly (for in-process testing).
   */
  async executeJob(envelope: JobEnvelope): Promise<ResultEnvelope> {
    return this.processEnvelope(envelope);
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // CORS headers
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: this.stats.status,
        workerId: this.stats.workerId,
        jobsExecuted: this.stats.jobsExecuted,
        activeJobs: this.activeJobs.size,
        uptime: Date.now() - new Date(this.stats.startedAt).getTime(),
      }));
      return;
    }

    if (req.method === "POST" && req.url === "/execute") {
      // Read body with size limit
      const body = await this.readBody(req);
      if (body === null) {
        this.sendError(res, 413, {
          code: "REQUEST_TOO_LARGE",
          message: `Request body exceeds ${this.config.maxRequestSizeBytes} bytes`,
        });
        return;
      }

      let envelope: JobEnvelope;
      try {
        envelope = deserializeEnvelope(body);
      } catch {
        this.sendError(res, 400, {
          code: "INVALID_ENVELOPE",
          message: "Failed to parse job envelope",
        });
        return;
      }

      // Idempotency check
      if (this.processedJobIds.has(envelope.job_id)) {
        this.sendError(res, 409, {
          code: "DUPLICATE_JOB",
          message: `Job ${envelope.job_id} already processed`,
          job_id: envelope.job_id,
        });
        return;
      }

      try {
        const result = await this.processEnvelope(envelope);
        res.writeHead(200);
        res.end(serializeResult(result));
      } catch (err) {
        const workerError = err as WorkerError;
        const statusCode = workerError.code === "SIGNATURE_INVALID" ? 403
          : workerError.code === "TENANT_NOT_ALLOWED" ? 403
          : workerError.code === "POLICY_VIOLATION" ? 403
          : workerError.code === "EXECUTION_TIMEOUT" ? 408
          : 500;
        this.sendError(res, statusCode, workerError);
      }
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ code: "NOT_FOUND", message: "Unknown endpoint" }));
  }

  private async processEnvelope(envelope: JobEnvelope): Promise<ResultEnvelope> {
    // 1. Verify signature
    const verification = verifyJobEnvelope(envelope);
    if (!verification.valid) {
      this.stats.jobsFailed++;
      const err: WorkerError = {
        code: "SIGNATURE_INVALID",
        message: `Envelope signature verification failed: ${verification.errors.join(", ")}`,
        job_id: envelope.job_id,
      };
      throw err;
    }

    // 2. Validate tenant
    if (this.config.allowedTenants.length > 0 &&
        !this.config.allowedTenants.includes(envelope.tenant_id)) {
      this.stats.jobsFailed++;
      const err: WorkerError = {
        code: "TENANT_NOT_ALLOWED",
        message: `Tenant ${envelope.tenant_id} not allowed on this worker`,
        job_id: envelope.job_id,
      };
      throw err;
    }

    // 3. Validate policy
    const policySnapshot = envelope.policy_snapshot;
    if (policySnapshot.enforcementStrength === "maximum") {
      // In maximum enforcement, we verify all policies are enabled
      const disabledPolicies = policySnapshot.policies.filter(p => !p.enabled);
      if (disabledPolicies.length > 0) {
        this.stats.jobsFailed++;
        const err: WorkerError = {
          code: "POLICY_VIOLATION",
          message: `Maximum enforcement requires all policies enabled. Disabled: ${disabledPolicies.map(p => p.id).join(", ")}`,
          job_id: envelope.job_id,
        };
        throw err;
      }
    }

      // 4. Execute pure kernel with timeout
      this.activeJobs.add(envelope.job_id);
      const startTime = performance.now();
      const startedAt = new Date().toISOString();

      try {
        const rawKernelOutput = await this.executeWithTimeout(
          () => kernel.computeDecision(envelope.kernel_input),
          this.config.executionTimeoutMs,
          envelope.job_id,
        );

        // Phase 6: Redact secrets from output before signing
        const kernelOutput = redactSecrets(rawKernelOutput);

        const endTime = performance.now();
        const durationMs = Math.round(endTime - startTime);

        // Compute IR for IR hash
        const irOutput = kernel.computeDecisionIR(envelope.kernel_input);
        const irHash = computeCanonicalHash(redactSecrets(irOutput));

      // Build signed result
      const result = createResultEnvelope({
        job_id: envelope.job_id,
        tenant_id: envelope.tenant_id,
        kernel_output: kernelOutput,
        ir_hash: irHash,
        execution_metadata: {
          worker_id: this.config.workerId,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
          memory_used_bytes: process.memoryUsage?.()?.heapUsed ?? 0,
        },
      });

      // Update stats
      this.stats.jobsExecuted++;
      this.stats.totalExecutionMs += durationMs;
      this.stats.lastJobAt = new Date().toISOString();
      this.processedJobIds.add(envelope.job_id);

      return result;
    } finally {
      this.activeJobs.delete(envelope.job_id);
    }
  }

  private async executeWithTimeout<T>(
    fn: () => T,
    timeoutMs: number,
    jobId: string,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.stats.jobsFailed++;
        const err: WorkerError = {
          code: "EXECUTION_TIMEOUT",
          message: `Job ${jobId} exceeded timeout of ${timeoutMs}ms`,
          job_id: jobId,
        };
        reject(err);
      }, timeoutMs);

      try {
        const result = fn();
        clearTimeout(timer);
        resolve(result);
      } catch (err) {
        clearTimeout(timer);
        this.stats.jobsFailed++;
        reject(err);
      }
    });
  }

  private readBody(req: IncomingMessage): Promise<string | null> {
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      let totalSize = 0;

      req.on("data", (chunk: Buffer) => {
        totalSize += chunk.length;
        if (totalSize > this.config.maxRequestSizeBytes) {
          req.destroy();
          resolve(null);
          return;
        }
        chunks.push(chunk);
      });

      req.on("end", () => {
        resolve(Buffer.concat(chunks).toString("utf8"));
      });

      req.on("error", () => resolve(null));
    });
  }

  private sendError(res: ServerResponse, statusCode: number, error: WorkerError): void {
    res.writeHead(statusCode);
    res.end(JSON.stringify(error));
  }
}

/**
 * Create and start a worker server.
 */
export async function startWorkerServer(config: WorkerConfig): Promise<WorkerServer> {
  const server = new WorkerServer(config);
  await server.start();
  return server;
}

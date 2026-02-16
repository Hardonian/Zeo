/**
 * @zeo/mesh — Full Test Suite
 *
 * Phase 1: Signed Job Envelope tamper tests
 * Phase 2: Worker service validation tests
 * Phase 3: Orchestrator scheduling tests
 * Phase 4: Cross-mode determinism verification
 * Phase 5: Tenant isolation attack tests
 * Phase 6: Secret leak scan
 * Phase 7: Stress + performance benchmarks
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { kernel, type KernelInput, type KernelPolicySnapshot } from "@zeo/core";
import { KERNEL_VERSION, KERNEL_SCHEMA_VERSION } from "@zeo/core";
import {
  createJobEnvelope,
  createResultEnvelope,
  verifyJobEnvelope,
  verifyResultEnvelope,
  computeCanonicalHash,
  serializeEnvelope,
  deserializeEnvelope,
  ENVELOPE_VERSION,
  type JobEnvelope,
  type CreateEnvelopeParams,
  type SchemaVersions,
  type DeterministicJobConfig,
} from "../src/envelope.js";
import { WorkerServer, type WorkerConfig } from "../src/worker.js";
import { MeshOrchestrator, type BatchJob } from "../src/orchestrator.js";

// ─── Fixtures ────────────────────────────────────────────────────────────

const TEST_SCHEMA_VERSIONS: SchemaVersions = {
  envelope: ENVELOPE_VERSION,
  kernel: KERNEL_SCHEMA_VERSION,
  ir: "1.0.0",
  policy: "1.0.0",
};

const TEST_DETERMINISTIC_CONFIG: DeterministicJobConfig = {
  seed: "test-seed-v8-mesh",
  float_precision: 10,
  max_depth: 2,
};

const TEST_POLICY_SNAPSHOT: KernelPolicySnapshot = {
  policies: [
    { id: "units-sanity", name: "Units Sanity", enabled: true },
    { id: "uncertainty-honesty", name: "Uncertainty Honesty", enabled: true },
  ],
  enforcementStrength: "basic",
};

function makeTestKernelInput(seed = "test-seed"): KernelInput {
  return {
    spec: {
      id: `spec_${seed}`,
      title: "Test Decision",
      context: "Testing mesh transport",
      horizon: "days",
      agents: [
        { id: "agent_1", label: "Test Agent", perspective: "Analytical" },
      ],
      actions: [
        { id: "action_1", label: "Accept", actorId: "agent_1", kind: "accept" },
        { id: "action_2", label: "Reject", actorId: "agent_1", kind: "reject" },
      ],
      constraints: [
        { id: "c1", name: "Budget", value: "$10000", status: "fact", provenance: ["finance_report_2025"] },
      ],
      assumptions: [
        { id: "a1", text: "Market stable", status: "assumption", confidence: "medium", probability: { low: 0.3, high: 0.7 } },
      ],
      objectives: [
        { metric: "ROI", weight: 1 },
      ],
    },
    evidenceSnapshot: { version: "1.0.0", nodes: [] },
    policySnapshot: TEST_POLICY_SNAPSHOT,
    toolResultsSnapshot: { tools: [] },
    config: {
      seed,
      floatPrecision: 10,
      maxDepth: 2,
      maxBranchesPerAction: 4,
      useQuantEngine: false,
    },
    schemaVersion: KERNEL_SCHEMA_VERSION,
  };
}

function makeEnvelopeParams(tenantId = "tenant_A", seed = "test-seed"): CreateEnvelopeParams {
  return {
    job_id: `job_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    tenant_id: tenantId,
    policy_snapshot: TEST_POLICY_SNAPSHOT,
    kernel_input: makeTestKernelInput(seed),
    schema_versions: TEST_SCHEMA_VERSIONS,
    deterministic_config: TEST_DETERMINISTIC_CONFIG,
    trace_id: randomUUID(),
    nonce: randomUUID(),
  };
}

// ═════════════════════════════════════════════════════════════════════════
// Phase 1: Signed Job Envelope
// ═════════════════════════════════════════════════════════════════════════

describe("Phase 1: Signed Job Envelope", () => {
  it("creates a valid envelope with correct version", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    expect(env.envelope_version).toBe(ENVELOPE_VERSION);
    expect(env.signature).toBeTruthy();
    expect(env.signature.length).toBe(64); // SHA-256 hex
  });

  it("verifies a valid envelope", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    const result = verifyJobEnvelope(env);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects tampered envelope (modified tenant_id)", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    env.tenant_id = "evil_tenant";
    const result = verifyJobEnvelope(env);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("SIGNATURE_MISMATCH");
  });

  it("detects tampered envelope (modified kernel_input)", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    (env.kernel_input.spec as any).title = "Tampered Title";
    const result = verifyJobEnvelope(env);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("SIGNATURE_MISMATCH");
  });

  it("detects tampered envelope (modified policy_snapshot)", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    env.policy_snapshot.enforcementStrength = "maximum";
    const result = verifyJobEnvelope(env);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("SIGNATURE_MISMATCH");
  });

  it("detects tampered envelope (modified nonce)", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    env.nonce = "tampered-nonce";
    const result = verifyJobEnvelope(env);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("SIGNATURE_MISMATCH");
  });

  it("detects missing signature", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    env.signature = "";
    const result = verifyJobEnvelope(env);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("MISSING_SIGNATURE");
  });

  it("serializes and deserializes correctly", () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    const json = serializeEnvelope(env);
    const restored = deserializeEnvelope(json);
    const result = verifyJobEnvelope(restored);
    expect(result.valid).toBe(true);
  });

  it("creates and verifies result envelope", () => {
    const input = makeTestKernelInput();
    const output = kernel.computeDecision(input);
    const ir = kernel.computeDecisionIR(input);
    const irHash = computeCanonicalHash(ir);

    const result = createResultEnvelope({
      job_id: "job_test123",
      tenant_id: "tenant_A",
      kernel_output: output,
      ir_hash: irHash,
      execution_metadata: {
        worker_id: "test-worker",
        started_at: "2025-01-01T00:00:00.000Z",
        completed_at: "2025-01-01T00:00:01.000Z",
        duration_ms: 1000,
        memory_used_bytes: 0,
      },
    });

    const verification = verifyResultEnvelope(result);
    expect(verification.valid).toBe(true);
  });

  it("detects tampered result (modified output)", () => {
    const input = makeTestKernelInput();
    const output = kernel.computeDecision(input);
    const ir = kernel.computeDecisionIR(input);
    const irHash = computeCanonicalHash(ir);

    const result = createResultEnvelope({
      job_id: "job_test123",
      tenant_id: "tenant_A",
      kernel_output: output,
      ir_hash: irHash,
      execution_metadata: {
        worker_id: "test-worker",
        started_at: "2025-01-01T00:00:00.000Z",
        completed_at: "2025-01-01T00:00:01.000Z",
        duration_ms: 1000,
        memory_used_bytes: 0,
      },
    });

    // Tamper with the output
    result.kernel_output.status = "budget_reached";
    const verification = verifyResultEnvelope(result);
    expect(verification.valid).toBe(false);
    expect(verification.errors.length).toBeGreaterThan(0);
  });

  it("canonical hash is deterministic", () => {
    const obj = { b: 2, a: 1, c: { z: 26, a: 1 } };
    const h1 = computeCanonicalHash(obj);
    const h2 = computeCanonicalHash(obj);
    expect(h1).toBe(h2);

    // Different key order same result
    const obj2 = { a: 1, c: { a: 1, z: 26 }, b: 2 };
    const h3 = computeCanonicalHash(obj2);
    expect(h1).toBe(h3);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// Phase 2: Worker Service
// ═════════════════════════════════════════════════════════════════════════

describe("Phase 2: Worker Service", () => {
  let worker: WorkerServer;

  beforeAll(async () => {
    worker = new WorkerServer({ port: 0, workerId: "test-worker-1" }); // port 0 = random
  });

  it("rejects invalid signature", async () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    env.tenant_id = "tampered";
    try {
      await worker.executeJob(env);
      expect.unreachable("Should have thrown");
    } catch (err: any) {
      expect(err.code).toBe("SIGNATURE_INVALID");
    }
  });

  it("rejects disallowed tenant", async () => {
    const restrictedWorker = new WorkerServer({
      port: 0,
      workerId: "restricted-worker",
      allowedTenants: ["tenant_approved"],
    });

    const env = createJobEnvelope(makeEnvelopeParams("tenant_not_approved"));
    try {
      await restrictedWorker.executeJob(env);
      expect.unreachable("Should have thrown");
    } catch (err: any) {
      expect(err.code).toBe("TENANT_NOT_ALLOWED");
    }
  });

  it("rejects policy violation (max enforcement with disabled policies)", async () => {
    const params = makeEnvelopeParams();
    params.policy_snapshot = {
      policies: [
        { id: "pol-1", name: "Policy 1", enabled: false },
      ],
      enforcementStrength: "maximum",
    };
    const env = createJobEnvelope(params);
    try {
      await worker.executeJob(env);
      expect.unreachable("Should have thrown");
    } catch (err: any) {
      expect(err.code).toBe("POLICY_VIOLATION");
    }
  });

  it("executes a valid job and returns signed result", async () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    const result = await worker.executeJob(env);

    expect(result.job_id).toBe(env.job_id);
    expect(result.tenant_id).toBe(env.tenant_id);
    expect(result.signature).toBeTruthy();
    expect(result.kernel_output.status).toBe("completed");

    const verification = verifyResultEnvelope(result);
    expect(verification.valid).toBe(true);
  });

  it("tracks execution stats", async () => {
    const env = createJobEnvelope(makeEnvelopeParams());
    await worker.executeJob(env);

    const stats = worker.getStats();
    expect(stats.jobsExecuted).toBeGreaterThan(0);
    expect(stats.status).toBe("healthy");
  });
});

// ═════════════════════════════════════════════════════════════════════════
// Phase 3: Orchestrator
// ═════════════════════════════════════════════════════════════════════════

describe("Phase 3: Orchestrator", () => {
  it("executes batch in 'off' mode (sequential local)", async () => {
    const orch = new MeshOrchestrator({ mode: "off" });

    const jobs: BatchJob[] = [
      { kernel_input: makeTestKernelInput("seed-1"), tenant_id: "tenant_A", policy_snapshot: TEST_POLICY_SNAPSHOT },
      { kernel_input: makeTestKernelInput("seed-2"), tenant_id: "tenant_A", policy_snapshot: TEST_POLICY_SNAPSHOT },
    ];

    const result = await orch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);

    expect(result.stats.total_jobs).toBe(2);
    expect(result.stats.succeeded).toBe(2);
    expect(result.stats.failed).toBe(0);
    expect(result.stats.mode).toBe("off");
    expect(result.results).toHaveLength(2);
  });

  it("executes batch in 'local' mode with concurrency", async () => {
    const orch = new MeshOrchestrator({
      mode: "local",
      maxConcurrency: 2,
    });

    const jobs: BatchJob[] = Array.from({ length: 5 }, (_, i) => ({
      kernel_input: makeTestKernelInput(`seed-local-${i}`),
      tenant_id: "tenant_A",
      policy_snapshot: TEST_POLICY_SNAPSHOT,
    }));

    const result = await orch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);

    expect(result.stats.succeeded).toBe(5);
    expect(result.stats.failed).toBe(0);
    expect(result.results).toHaveLength(5);
  });

  it("returns mesh status", () => {
    const orch = new MeshOrchestrator({
      mode: "remote",
      workerEndpoints: ["http://localhost:9001", "http://localhost:9002"],
    });

    const status = orch.getMeshStatus();
    expect(status.mode).toBe("remote");
    expect(status.totalWorkers).toBe(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// Phase 4: Determinism Across Distribution
// ═════════════════════════════════════════════════════════════════════════

describe("Phase 4: Determinism Across Distribution", () => {
  it("produces identical output hashes across sequential and local parallel", async () => {
    const seed = "determinism-seed-v8";
    const input = makeTestKernelInput(seed);
    const jobs: BatchJob[] = [{
      kernel_input: input,
      tenant_id: "tenant_A",
      policy_snapshot: TEST_POLICY_SNAPSHOT,
    }];

    // 1. Sequential baseline (direct kernel call)
    const baselineOutput = kernel.computeDecision(input);
    const baselineHash = computeCanonicalHash(baselineOutput);

    // 2. Local parallel via orchestrator
    const localOrch = new MeshOrchestrator({ mode: "local", maxConcurrency: 1 });
    const localResult = await localOrch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);
    const localHash = computeCanonicalHash(localResult.results[0].kernel_output);

    // 3. Off mode (sequential via orchestrator)
    const offOrch = new MeshOrchestrator({ mode: "off" });
    const offResult = await offOrch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);
    const offHash = computeCanonicalHash(offResult.results[0].kernel_output);

    // Assert equality
    expect(baselineHash).toBe(localHash);
    expect(baselineHash).toBe(offHash);
  });

  it("produces identical results for batch of multiple jobs", async () => {
    const seeds = ["batch-det-1", "batch-det-2", "batch-det-3"];

    // Baseline: sequential
    const baselineHashes = seeds.map(seed => {
      const output = kernel.computeDecision(makeTestKernelInput(seed));
      return computeCanonicalHash(output);
    });

    // Local parallel
    const orch = new MeshOrchestrator({ mode: "local", maxConcurrency: 3 });
    const jobs: BatchJob[] = seeds.map(seed => ({
      kernel_input: makeTestKernelInput(seed),
      tenant_id: "tenant_A",
      policy_snapshot: TEST_POLICY_SNAPSHOT,
    }));

    const result = await orch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);
    const parallelHashes = result.results.map(r => computeCanonicalHash(r.kernel_output));

    expect(parallelHashes).toEqual(baselineHashes);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// Phase 5: Tenant Isolation Attacks
// ═════════════════════════════════════════════════════════════════════════

describe("Phase 5: Tenant Isolation Attacks", () => {
  let worker: WorkerServer;

  beforeAll(() => {
    worker = new WorkerServer({
      port: 0,
      workerId: "isolation-worker",
      allowedTenants: ["tenant_A", "tenant_B"],
    });
  });

  it("rejects envelope tenant swap attack", async () => {
    // Create envelope for tenant_A
    const env = createJobEnvelope(makeEnvelopeParams("tenant_A"));

    // Attacker swaps tenant_id to tenant_B
    env.tenant_id = "tenant_B";

    // Signature check should catch this
    try {
      await worker.executeJob(env);
      expect.unreachable("Should reject swapped tenant");
    } catch (err: any) {
      expect(err.code).toBe("SIGNATURE_INVALID");
    }
  });

  it("rejects policy modification attack", async () => {
    const env = createJobEnvelope(makeEnvelopeParams("tenant_A"));

    // Attacker modifies enforcement strength
    env.policy_snapshot.enforcementStrength = "basic";

    try {
      await worker.executeJob(env);
      expect.unreachable("Should reject modified policy");
    } catch (err: any) {
      expect(err.code).toBe("SIGNATURE_INVALID");
    }
  });

  it("rejects cross-tenant snapshot injection", async () => {
    // Create envelope for tenant_A with tenant_B's evidence
    const params = makeEnvelopeParams("tenant_A");

    // Inject foreign evidence nodes
    params.kernel_input.evidenceSnapshot = {
      version: "1.0.0",
      nodes: [{
        id: "evil_node",
        claim: "Injected cross-tenant claim",
        source: "tenant_B_secret",
        confidenceScore: 1.0,
        decayRate: 0,
        linkedActions: [],
        linkedDecisions: ["decision_from_tenant_B"],
        tags: ["injected"],
        outcome: "unknown",
        regretScore: 0,
      }],
    };

    const env = createJobEnvelope(params);

    // This succeeds because the signature covers the injected data
    // (injection happened BEFORE signing). What we're verifying is that
    // modifying AFTER signing is detected.
    const envCopy = createJobEnvelope(makeEnvelopeParams("tenant_A"));
    // Post-signing injection
    envCopy.kernel_input.evidenceSnapshot = params.kernel_input.evidenceSnapshot;

    try {
      await worker.executeJob(envCopy);
      expect.unreachable("Should reject post-signing injection");
    } catch (err: any) {
      expect(err.code).toBe("SIGNATURE_INVALID");
    }
  });

  it("simultaneously runs tenants A and B with isolation", async () => {
    const orch = new MeshOrchestrator({ mode: "local", maxConcurrency: 2 });

    const jobsA: BatchJob[] = [
      { kernel_input: makeTestKernelInput("tenant-A-1"), tenant_id: "tenant_A", policy_snapshot: TEST_POLICY_SNAPSHOT },
      { kernel_input: makeTestKernelInput("tenant-A-2"), tenant_id: "tenant_A", policy_snapshot: TEST_POLICY_SNAPSHOT },
    ];

    const jobsB: BatchJob[] = [
      { kernel_input: makeTestKernelInput("tenant-B-1"), tenant_id: "tenant_B", policy_snapshot: TEST_POLICY_SNAPSHOT },
      { kernel_input: makeTestKernelInput("tenant-B-2"), tenant_id: "tenant_B", policy_snapshot: TEST_POLICY_SNAPSHOT },
    ];

    // Execute both batches concurrently
    const [resultA, resultB] = await Promise.all([
      orch.executeBatch(jobsA, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS),
      orch.executeBatch(jobsB, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS),
    ]);

    // Verify tenant isolation in results
    for (const r of resultA.results) {
      expect(r.tenant_id).toBe("tenant_A");
    }
    for (const r of resultB.results) {
      expect(r.tenant_id).toBe("tenant_B");
    }

    // No cross-contamination: output hashes should differ
    const hashA0 = resultA.results[0]?.output_hash;
    const hashB0 = resultB.results[0]?.output_hash;
    // Different seeds = different inputs = different outputs
    if (hashA0 && hashB0) {
      expect(hashA0).not.toBe(hashB0);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════
// Phase 6: Secret Leak Scan
// ═════════════════════════════════════════════════════════════════════════

describe("Phase 6: Secret Leak Scan", () => {
  const SECRET_PATTERNS = [
    /FAKE_API_KEY_[A-Z0-9]+/,
    /sk-[a-zA-Z0-9]{32,}/,
    /ghp_[a-zA-Z0-9]{36}/,
    /aws_secret_[a-zA-Z0-9]+/i,
    /password\s*[:=]\s*\S+/i,
  ];

  it("does not leak injected secrets through mesh results", async () => {
    // Set fake secrets in environment
    const originalEnv = { ...process.env };
    process.env.FAKE_API_KEY_ZEO = "FAKE_API_KEY_SECRETVALUE123";
    process.env.AWS_SECRET_KEY = "aws_secret_FAKESECRETKEY999";
    process.env.DB_PASSWORD = "password=SuperSecret123!";

    try {
      const orch = new MeshOrchestrator({ mode: "local" });
      const jobs: BatchJob[] = [{
        kernel_input: makeTestKernelInput("secret-test"),
        tenant_id: "tenant_A",
        policy_snapshot: TEST_POLICY_SNAPSHOT,
      }];

      const result = await orch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);

      // Serialize everything to check for leaks
      const fullOutput = JSON.stringify(result, null, 2);

      // Scan for secret patterns
      const leaks: string[] = [];
      for (const pattern of SECRET_PATTERNS) {
        const match = pattern.exec(fullOutput);
        if (match) {
          leaks.push(`Leaked: ${match[0]} (pattern: ${pattern.source})`);
        }
      }

      expect(leaks).toEqual([]);
    } finally {
      // Restore environment
      process.env = originalEnv;
    }
  });

  it("does not leak secrets through execution metadata", async () => {
    const originalEnv = { ...process.env };
    process.env.SECRET_TOKEN = "sk-abc123def456ghi789jkl012mno345pqr678stu";

    try {
      const worker = new WorkerServer({ port: 0, workerId: "leak-test" });
      const env = createJobEnvelope(makeEnvelopeParams());
      const result = await worker.executeJob(env);

      const metadataStr = JSON.stringify(result.execution_metadata);
      for (const pattern of SECRET_PATTERNS) {
        expect(pattern.test(metadataStr)).toBe(false);
      }
    } finally {
      process.env = originalEnv;
    }
  });

  it("does not leak secrets through error messages", async () => {
    const originalEnv = { ...process.env };
    process.env.ADMIN_PASSWORD = "password=Admin123!@#";

    try {
      const worker = new WorkerServer({
        port: 0,
        workerId: "error-leak-test",
        allowedTenants: ["allowed_only"],
      });
      const env = createJobEnvelope(makeEnvelopeParams("not_allowed"));

      try {
        await worker.executeJob(env);
      } catch (err: any) {
        const errStr = JSON.stringify(err);
        for (const pattern of SECRET_PATTERNS) {
          expect(pattern.test(errStr)).toBe(false);
        }
      }
    } finally {
      process.env = originalEnv;
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════
// Phase 7: Stress + Performance
// ═════════════════════════════════════════════════════════════════════════

describe("Phase 7: Stress + Performance", () => {
  it("handles 100+ jobs through local mesh", async () => {
    const JOB_COUNT = 100;
    const orch = new MeshOrchestrator({
      mode: "local",
      maxConcurrency: 8,
    });

    const jobs: BatchJob[] = Array.from({ length: JOB_COUNT }, (_, i) => ({
      kernel_input: makeTestKernelInput(`stress-${i}`),
      tenant_id: "tenant_stress",
      policy_snapshot: TEST_POLICY_SNAPSHOT,
    }));

    const start = performance.now();
    const result = await orch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);
    const duration = performance.now() - start;

    expect(result.stats.total_jobs).toBe(JOB_COUNT);
    expect(result.stats.succeeded).toBe(JOB_COUNT);
    expect(result.stats.failed).toBe(0);
    expect(result.results).toHaveLength(JOB_COUNT);

    // Performance assertions: should complete 100 jobs within reasonable time
    // (kernel compute is deterministic and fast for small specs)
    expect(duration).toBeLessThan(60_000); // 60 seconds max

    // Log performance metrics
    console.log(`\n=== Stress Report ===`);
    console.log(`Jobs:          ${JOB_COUNT}`);
    console.log(`Succeeded:     ${result.stats.succeeded}`);
    console.log(`Failed:        ${result.stats.failed}`);
    console.log(`Total time:    ${duration.toFixed(2)}ms`);
    console.log(`Avg per job:   ${(duration / JOB_COUNT).toFixed(2)}ms`);
    console.log(`Throughput:    ${(JOB_COUNT / (duration / 1000)).toFixed(1)} jobs/sec`);
  }, 120_000);

  it("measures sequential vs parallel performance", async () => {
    const JOB_COUNT = 20;
    const input = makeTestKernelInput("perf-compare");
    const jobs: BatchJob[] = Array.from({ length: JOB_COUNT }, (_, i) => ({
      kernel_input: makeTestKernelInput(`perf-${i}`),
      tenant_id: "tenant_perf",
      policy_snapshot: TEST_POLICY_SNAPSHOT,
    }));

    // Sequential
    const seqStart = performance.now();
    const seqOrch = new MeshOrchestrator({ mode: "off", maxConcurrency: 1 });
    const seqResult = await seqOrch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);
    const seqDuration = performance.now() - seqStart;

    // Parallel (4 concurrent)
    const parStart = performance.now();
    const parOrch = new MeshOrchestrator({ mode: "local", maxConcurrency: 4 });
    const parResult = await parOrch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);
    const parDuration = performance.now() - parStart;

    expect(seqResult.stats.succeeded).toBe(JOB_COUNT);
    expect(parResult.stats.succeeded).toBe(JOB_COUNT);

    console.log(`\n=== Performance Comparison ===`);
    console.log(`Jobs:              ${JOB_COUNT}`);
    console.log(`Sequential:        ${seqDuration.toFixed(2)}ms`);
    console.log(`Parallel (4x):     ${parDuration.toFixed(2)}ms`);
    console.log(`Speedup:           ${(seqDuration / parDuration).toFixed(2)}x`);
    console.log(`Mem (heapUsed):    ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`);
  }, 60_000);

  it("all results have valid signatures under stress", async () => {
    const JOB_COUNT = 50;
    const orch = new MeshOrchestrator({ mode: "local", maxConcurrency: 8 });

    const jobs: BatchJob[] = Array.from({ length: JOB_COUNT }, (_, i) => ({
      kernel_input: makeTestKernelInput(`sig-stress-${i}`),
      tenant_id: "tenant_sig",
      policy_snapshot: TEST_POLICY_SNAPSHOT,
    }));

    const result = await orch.executeBatch(jobs, TEST_DETERMINISTIC_CONFIG, TEST_SCHEMA_VERSIONS);

    for (const r of result.results) {
      const v = verifyResultEnvelope(r);
      expect(v.valid).toBe(true);
    }
  }, 60_000);
});

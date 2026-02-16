/**
 * Execution Lifecycle — Unit Tests
 *
 * Verifies:
 * - ExecutionContext construction and deterministic runId generation
 * - Stage ordering enforcement
 * - Audit logging
 * - Full lifecycle orchestration via executeLifecycle()
 * - Error propagation through stages
 */

import { describe, it, expect } from "vitest";
import {
  ExecutionContext,
  ExecutionStage,
  STAGE_ORDER,
  runStage,
  executeLifecycle,
  type LifecycleHandlers,
} from "../execution-lifecycle.js";
import type { DecisionResult } from "@zeo/contracts";

function makeMinimalSpec() {
  return {
    id: "test-001",
    title: "Lifecycle Test",
    context: "unit test",
    createdAt: "2025-01-01T00:00:00.000Z",
    horizon: "days" as const,
    agents: [{ id: "a1", name: "Self", role: "self" as const }],
    actions: [{ id: "act-1", label: "Go", actorId: "a1", kind: "commit" as const }],
    constraints: [],
    assumptions: [],
    objectives: [{ id: "obj-1", metric: "success", weight: 1.0 }],
  };
}

function makeMinimalResult(): DecisionResult {
  return {
    status: "completed",
    graph: {
      decisionId: "test-001",
      nodes: [{ id: "n1", label: "root", kind: "state", notes: [], dependencies: [] }],
      edges: [],
    },
    evaluations: [],
    nextBestEvidence: [],
    explanation: { summary: "test", whatWouldChange: [] },
    assumptions: [],
    uncertaintyMap: {},
  } as any;
}

describe("ExecutionContext", () => {
  it("generates deterministic runId from seed + spec", () => {
    const spec = makeMinimalSpec();
    const ctx1 = new ExecutionContext({ seed: "seed-a", spec, opts: {}, clock: { now: () => "2025-01-01T00:00:00.000Z", timestamp: () => 0 } });
    const ctx2 = new ExecutionContext({ seed: "seed-a", spec, opts: {}, clock: { now: () => "2025-01-01T00:00:00.000Z", timestamp: () => 0 } });
    expect(ctx1.runId).toBe(ctx2.runId);
    expect(ctx1.inputHash).toBe(ctx2.inputHash);
  });

  it("different seeds produce different runIds", () => {
    const spec = makeMinimalSpec();
    const clock = { now: () => "2025-01-01T00:00:00.000Z", timestamp: () => 0 };
    const ctx1 = new ExecutionContext({ seed: "seed-a", spec, opts: {}, clock });
    const ctx2 = new ExecutionContext({ seed: "seed-b", spec, opts: {}, clock });
    expect(ctx1.runId).not.toBe(ctx2.runId);
  });

  it("starts in INIT stage", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    expect(ctx.currentStage).toBe(ExecutionStage.INIT);
  });

  it("advances stages in order", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    expect(ctx.currentStage).toBe("INIT");
    ctx.advanceStage();
    expect(ctx.currentStage).toBe("PLAN");
    ctx.advanceStage();
    expect(ctx.currentStage).toBe("VALIDATE");
    ctx.advanceStage();
    expect(ctx.currentStage).toBe("EXECUTE");
    ctx.advanceStage();
    expect(ctx.currentStage).toBe("VERIFY");
    ctx.advanceStage();
    expect(ctx.currentStage).toBe("EMIT_ARTIFACTS");
    ctx.advanceStage();
    expect(ctx.currentStage).toBe("FINALIZE");
  });

  it("throws when advancing past FINALIZE", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    for (let i = 0; i < STAGE_ORDER.length - 1; i++) ctx.advanceStage();
    expect(ctx.isFinalized).toBe(true);
    expect(() => ctx.advanceStage()).toThrow("cannot advance past FINALIZE");
  });

  it("records audit events", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    ctx.recordStage({ stage: ExecutionStage.INIT, timestamp: "2025-01-01T00:00:00Z", durationMs: 5, status: "ok" });
    expect(ctx.auditLog).toHaveLength(1);
    expect(ctx.auditLog[0].runId).toBe(ctx.runId);
    expect(ctx.auditLog[0].stage).toBe("INIT");
  });

  it("manages artifacts", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    ctx.setArtifact("result", { value: 42 });
    expect(ctx.getArtifact("result")).toEqual({ value: 42 });
    expect(ctx.getArtifact("missing")).toBeUndefined();
  });

  it("serializes to JSON", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    const json = ctx.toJSON();
    expect(json.runId).toBe(ctx.runId);
    expect(json.seed).toBe("s");
    expect(json.currentStage).toBe("INIT");
  });
});

describe("runStage", () => {
  it("runs handler and records audit event", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    const output = runStage(ExecutionStage.INIT, ctx, "input", (input) => {
      return `processed:${input}`;
    });
    expect(output).toBe("processed:input");
    expect(ctx.auditLog).toHaveLength(1);
    expect(ctx.auditLog[0].status).toBe("ok");
  });

  it("records error and rethrows on handler failure", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    expect(() => {
      runStage(ExecutionStage.INIT, ctx, null, () => {
        throw new Error("handler failed");
      });
    }).toThrow("handler failed");
    expect(ctx.auditLog).toHaveLength(1);
    expect(ctx.auditLog[0].status).toBe("error");
    expect(ctx.auditLog[0].error).toBe("handler failed");
  });

  it("throws on stage mismatch", () => {
    const ctx = new ExecutionContext({ seed: "s", spec: makeMinimalSpec(), opts: {} });
    expect(() => {
      runStage(ExecutionStage.EXECUTE, ctx, null, () => {});
    }).toThrow("Stage mismatch");
  });
});

describe("executeLifecycle", () => {
  it("runs all stages in order and returns result", () => {
    const ctx = new ExecutionContext({ seed: "lifecycle-test", spec: makeMinimalSpec(), opts: {} });
    const result = makeMinimalResult();

    const handlers: LifecycleHandlers = {
      init: () => {},
      plan: () => {},
      validate: () => {},
      execute: () => result,
      verify: (r) => ({ verified: true, outputHash: "abc123" }),
      emitArtifacts: () => {},
      finalize: () => {},
    };

    const outcome = executeLifecycle(ctx, handlers);
    expect(outcome.result).toBe(result);
    expect(outcome.verified).toBe(true);
    expect(outcome.outputHash).toBe("abc123");
    expect(ctx.isFinalized).toBe(true);
    expect(ctx.auditLog).toHaveLength(7);
  });

  it("propagates execution errors without swallowing", () => {
    const ctx = new ExecutionContext({ seed: "err-test", spec: makeMinimalSpec(), opts: {} });

    const handlers: LifecycleHandlers = {
      init: () => {},
      plan: () => {},
      validate: () => { throw new Error("validation failed"); },
      execute: () => makeMinimalResult(),
      verify: () => ({ verified: true, outputHash: "" }),
      emitArtifacts: () => {},
      finalize: () => {},
    };

    expect(() => executeLifecycle(ctx, handlers)).toThrow("validation failed");
    expect(ctx.currentStage).toBe("VALIDATE");
  });
});

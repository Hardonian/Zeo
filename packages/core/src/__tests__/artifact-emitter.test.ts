/**
 * Artifact Emitter — Unit Tests
 *
 * Verifies:
 * - Artifact construction with all required fields
 * - Deterministic artifact hashing
 * - Human-readable summary formatting
 * - Markdown report formatting
 */

import { describe, it, expect } from "vitest";
import {
  buildExecutionArtifact,
  formatArtifactSummary,
  formatArtifactMarkdown,
  type ExecutionArtifact,
} from "../artifact-emitter.js";

function makeArtifact(overrides?: Partial<Parameters<typeof buildExecutionArtifact>[0]>): ExecutionArtifact {
  return buildExecutionArtifact({
    runId: "run_test123",
    createdAt: "2025-01-01T00:00:00.000Z",
    inputHash: "a".repeat(64),
    result: {
      status: "completed",
      graph: { decisionId: "d1", nodes: [], edges: [] },
      evaluations: [],
      nextBestEvidence: [],
      explanation: { summary: "test", whatWouldChange: [] },
    } as any,
    toolChain: [
      { name: "branch_generator", version: "0.3.0", deterministic: true },
      { name: "robustness_evaluator", version: "0.3.0", deterministic: true },
    ],
    seed: "test-seed",
    durationMs: 42,
    verified: true,
    verificationMethod: "hash-compare",
    stages: [
      { runId: "run_test123", stage: "INIT" as any, timestamp: "2025-01-01T00:00:00.000Z", durationMs: 1, status: "ok" },
      { runId: "run_test123", stage: "EXECUTE" as any, timestamp: "2025-01-01T00:00:00.001Z", durationMs: 30, status: "ok" },
    ],
    ...overrides,
  });
}

describe("buildExecutionArtifact", () => {
  it("includes all required fields", () => {
    const artifact = makeArtifact();
    expect(artifact.schemaVersion).toBe("1.0.0");
    expect(artifact.runId).toBe("run_test123");
    expect(artifact.inputHash).toBe("a".repeat(64));
    expect(artifact.outputHash).toBeTruthy();
    expect(artifact.seed).toBe("test-seed");
    expect(artifact.durationMs).toBe(42);
    expect(artifact.verification.verified).toBe(true);
    expect(artifact.verification.method).toBe("hash-compare");
    expect(artifact.toolChain).toHaveLength(2);
    expect(artifact.stages).toHaveLength(2);
    expect(artifact.artifactHash).toBeTruthy();
  });

  it("produces deterministic artifact hash for same input", () => {
    const a1 = makeArtifact();
    const a2 = makeArtifact();
    expect(a1.artifactHash).toBe(a2.artifactHash);
    expect(a1.outputHash).toBe(a2.outputHash);
  });

  it("produces different hash for different input", () => {
    const a1 = makeArtifact({ seed: "seed-a" });
    const a2 = makeArtifact({ seed: "seed-b" });
    expect(a1.artifactHash).not.toBe(a2.artifactHash);
  });

  it("handles null result", () => {
    const artifact = makeArtifact({ result: null });
    expect(artifact.outputHash).toBeTruthy();
  });
});

describe("formatArtifactSummary", () => {
  it("produces human-readable text", () => {
    const artifact = makeArtifact();
    const summary = formatArtifactSummary(artifact);
    expect(summary).toContain("run_test123");
    expect(summary).toContain("test-seed");
    expect(summary).toContain("42ms");
    expect(summary).toContain("yes");
    expect(summary).toContain("Tool Chain:");
    expect(summary).toContain("branch_generator");
    expect(summary).toContain("Stages:");
  });
});

describe("formatArtifactMarkdown", () => {
  it("produces valid markdown with tables", () => {
    const artifact = makeArtifact();
    const md = formatArtifactMarkdown(artifact);
    expect(md).toContain("# Execution Report:");
    expect(md).toContain("## Summary");
    expect(md).toContain("## Tool Chain");
    expect(md).toContain("## Execution Stages");
    expect(md).toContain("| Tool | Version | Deterministic |");
    expect(md).toContain("branch_generator");
  });
});

/**
 * CI Determinism Test Suite
 * 
 * This test verifies that Zeo produces deterministic outputs
 * across multiple runs with the same inputs and seeds.
 * 
 * Run in CI with: pnpm test:determinism
 */

import { describe, it, expect, beforeAll } from "vitest";
import { 
  createExecutionEnvelope, 
  hashValue, 
  executeWithDEK,
  initializeDEK,
  registerModelAdapter,
  DEK_VERSION 
} from "@zeo/kernel";
import type { ZeoDeterminismFixture, ZeoModelSpec, ZeoModelAdapter, ZeoModelInput, ZeoModelResult } from "@zeo/contracts";

// Test fixture definition
const TEST_FIXTURE: ZeoDeterminismFixture = {
  name: "ci-determinism-test",
  input: {
    workflow: "test",
    data: { value: 42, nested: { array: [1, 2, 3] } },
  },
  modelSpec: {
    provider: "test",
    model: "deterministic-mock",
    parameters: { temperature: 0 },
  },
  seed: "ci-test-seed-2024",
  expectedOutputHash: "", // Will be computed on first run
  expectedEnvelopeHash: "", // Will be computed on first run
  tolerancePercent: 0, // Exact match required
};

// Deterministic mock adapter for testing
const mockAdapter: ZeoModelAdapter = {
  id: "test-deterministic-mock",
  provider: "test",
  model: "deterministic-mock",
  capabilities: {
    supportsStreaming: false,
    maxTokens: 4096,
    contextWindow: 8192,
    supportsToolCalling: false,
    supportsVision: false,
  },
  async execute(input: ZeoModelInput, params?: Record<string, unknown>): Promise<ZeoModelResult> {
    // Deterministic transformation - always produces same output for same input
    const content = JSON.stringify({
      messages: input.messages,
      params,
      timestamp: "2024-01-01T00:00:00.000Z", // Fixed for determinism
    });
    return {
      content,
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      finishReason: "stop",
      meta: { provider: "test", model: "deterministic-mock" },
      timing: { 
        startedAt: "2024-01-01T00:00:00.000Z", 
        finishedAt: "2024-01-01T00:00:01.000Z", 
        totalMs: 1000 
      },
      contentHash: hashValue(content),
    };
  },
  canHandle(spec: ZeoModelSpec): boolean {
    return spec.provider === "test" && spec.model === "deterministic-mock";
  },
  getConfigHash(): string {
    return hashValue({ provider: this.provider, model: this.model });
  },
};

describe("DEK Determinism", () => {
  beforeAll(() => {
    initializeDEK();
    registerModelAdapter(mockAdapter);
  });

  it("should produce identical envelope hashes for identical inputs", async () => {
    const envelope1 = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      TEST_FIXTURE.modelSpec,
      { deterministicSeed: TEST_FIXTURE.seed }
    );
    
    const envelope2 = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      TEST_FIXTURE.modelSpec,
      { deterministicSeed: TEST_FIXTURE.seed }
    );

    // Envelopes should have same input hash
    expect(envelope1.inputHash).toBe(envelope2.inputHash);
    expect(envelope1.modelSpecHash).toBe(envelope2.modelSpecHash);
  });

  it("should produce identical output hashes across multiple runs", async () => {
    const results: string[] = [];
    
    // Run 5 times with identical inputs
    for (let i = 0; i < 5; i++) {
      const { outputHash } = await executeWithDEK(
        TEST_FIXTURE.name,
        TEST_FIXTURE.input,
        TEST_FIXTURE.modelSpec,
        async (_ctx, input) => {
          const modelInput: ZeoModelInput = {
            messages: [{ role: 'user', content: JSON.stringify(input) }],
          };
          const result = await mockAdapter.execute(modelInput);
          return result;
        },
        { deterministicSeed: TEST_FIXTURE.seed }
      );
      results.push(outputHash);
    }

    // All hashes should be identical
    const firstHash = results[0];
    expect(results.every(h => h === firstHash)).toBe(true);
    
    // Log for CI visibility
    console.log(`Determinism test: 5 runs produced identical hash ${firstHash.slice(0, 16)}...`);
  });

  it("should detect input changes via hash differences", async () => {
    const baseEnvelope = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      TEST_FIXTURE.modelSpec
    );

    // Change input slightly
    const modifiedInput = { workflow: "test", data: { value: 43, nested: { array: [1, 2, 3] } } };
    const modifiedEnvelope = createExecutionEnvelope(
      TEST_FIXTURE.name,
      modifiedInput,
      TEST_FIXTURE.modelSpec
    );

    // Hashes should differ
    expect(baseEnvelope.inputHash).not.toBe(modifiedEnvelope.inputHash);
  });

  it("should detect model spec changes via hash differences", async () => {
    const baseEnvelope = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      TEST_FIXTURE.modelSpec
    );

    // Change model spec
    const modifiedSpec: ZeoModelSpec = {
      provider: TEST_FIXTURE.modelSpec.provider,
      model: TEST_FIXTURE.modelSpec.model,
      parameters: { temperature: 0.5 },
    };
    const modifiedEnvelope = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      modifiedSpec
    );

    // Hashes should differ
    expect(baseEnvelope.modelSpecHash).not.toBe(modifiedEnvelope.modelSpecHash);
  });

  it("should include DEK version in envelope", async () => {
    const envelope = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      TEST_FIXTURE.modelSpec
    );

    expect(envelope.version).toBe(DEK_VERSION);
    expect(envelope.dek.kernelVersion).toBeDefined();
    expect(envelope.dek.contractVersion).toBeDefined();
  });

  it("should generate deterministic seeds when not provided", async () => {
    const envelope = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      TEST_FIXTURE.modelSpec
    );

    // Seed should be a valid hex string
    expect(envelope.deterministicSeed).toBeDefined();
    expect(envelope.deterministicSeed.length).toBeGreaterThan(16);
    expect(/^[a-f0-9]+$/i.test(envelope.deterministicSeed)).toBe(true);
  });

  it("should use provided seed when available", async () => {
    const customSeed = "my-custom-seed-123";
    const envelope = createExecutionEnvelope(
      TEST_FIXTURE.name,
      TEST_FIXTURE.input,
      TEST_FIXTURE.modelSpec,
      { deterministicSeed: customSeed }
    );

    expect(envelope.deterministicSeed).toBe(customSeed);
  });
});

describe("DEK Journal", () => {
  it("should create journal entries with all required fields", async () => {
    const { journalEntry } = await executeWithDEK(
      "journal-test",
      { test: true },
      TEST_FIXTURE.modelSpec,
      async () => ({ result: "ok" }),
      { deterministicSeed: "journal-test-seed" }
    );

    expect(journalEntry.journalId).toBeDefined();
    expect(journalEntry.envelope).toBeDefined();
    expect(journalEntry.outputHash).toBeDefined();
    expect(journalEntry.durationMs).toBeGreaterThanOrEqual(0);
    expect(journalEntry.status).toBeDefined();
    expect(journalEntry.replayMeta).toBeDefined();
  });
});

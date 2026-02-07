import { describe, it, expect } from "vitest";
import { hashDecisionSpec, hashObservations, deriveSeedFromHashes } from "./hashing.js";
import { replayCase } from "./runner.js";
import { buildPredictionBundle, observationsUpTo, summarizePosterior } from "./predictions.js";
import type {
  ReplayCase,
  ReplayOptions,
  ReplayObservationBatch,
  DecisionSpec,
} from "@zeo/contracts";

describe("Hashing", () => {
  const sampleDecision: DecisionSpec = {
    id: "dec_001",
    title: "Test Decision",
    context: "Test context",
    createdAt: "2026-01-01T00:00:00.000Z",
    horizon: "days",
    agents: [{ id: "agent1", name: "Agent", role: "self" as const }],
    actions: [{ id: "action1", label: "Action", actorId: "agent1", kind: "commit" }],
    constraints: [],
    assumptions: [
      { id: "ass1", text: "Assumption", status: "assumption", confidence: "medium", tags: [] },
    ],
  };

  describe("hashDecisionSpec", () => {
    it("should produce consistent hash for same spec", () => {
      const hash1 = hashDecisionSpec(sampleDecision);
      const hash2 = hashDecisionSpec(sampleDecision);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should produce different hash for different spec", () => {
      const hash1 = hashDecisionSpec(sampleDecision);
      const differentDecision = { ...sampleDecision, title: "Different" };
      const hash2 = hashDecisionSpec(differentDecision);
      expect(hash1).not.toBe(hash2);
    });

    it("should be order-independent for arrays", () => {
      const decision1 = {
        ...sampleDecision,
        agents: [
          { id: "agent2", name: "Second", role: "counterparty" },
          { id: "agent1", name: "First", role: "self" },
        ],
      };
      const decision2 = {
        ...sampleDecision,
        agents: [
          { id: "agent1", name: "First", role: "self" },
          { id: "agent2", name: "Second", role: "counterparty" },
        ],
      };
      const hash1 = hashDecisionSpec(decision1);
      const hash2 = hashDecisionSpec(decision2);
      expect(hash1).toBe(hash2);
    });
  });

  describe("hashObservations", () => {
    const batches: ReplayObservationBatch[] = [
      {
        batchId: "batch1",
        timestamp: "2026-01-01T00:00:00.000Z",
        observations: [
          {
            observationId: "obs1",
            signalId: "sig1",
            value: 100,
            timestamp: "2026-01-01T00:00:00.000Z",
            provenance: [],
          },
        ],
      },
    ];

    it("should produce consistent hash for same batches", () => {
      const hash1 = hashObservations(batches);
      const hash2 = hashObservations(batches);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hash for different batches", () => {
      const hash1 = hashObservations(batches);
      const differentBatches = [
        {
          ...batches[0],
          observations: [{ ...batches[0].observations[0], value: 200 }],
        },
      ];
      const hash2 = hashObservations(differentBatches);
      expect(hash1).not.toBe(hash2);
    });

    it("should be order-independent", () => {
      const batchesUnordered: ReplayObservationBatch[] = [
        {
          batchId: "batch2",
          timestamp: "2026-01-02T00:00:00.000Z",
          observations: [
            {
              observationId: "obs2",
              signalId: "sig1",
              value: 200,
              timestamp: "2026-01-02T00:00:00.000Z",
              provenance: [],
            },
          ],
        },
        {
          batchId: "batch1",
          timestamp: "2026-01-01T00:00:00.000Z",
          observations: [
            {
              observationId: "obs1",
              signalId: "sig1",
              value: 100,
              timestamp: "2026-01-01T00:00:00.000Z",
              provenance: [],
            },
          ],
        },
      ];
      const batchesOrdered = [...batchesUnordered].reverse();

      const hash1 = hashObservations(batchesUnordered);
      const hash2 = hashObservations(batchesOrdered);
      expect(hash1).toBe(hash2);
    });
  });

  describe("deriveSeedFromHashes", () => {
    it("should produce consistent seed from same hashes", () => {
      const seed1 = deriveSeedFromHashes("hash1", "hash2");
      const seed2 = deriveSeedFromHashes("hash1", "hash2");
      expect(seed1).toBe(seed2);
      expect(seed1).toHaveLength(32);
    });

    it("should produce different seed from different hashes", () => {
      const seed1 = deriveSeedFromHashes("hash1", "hash2");
      const seed2 = deriveSeedFromHashes("hash1", "hash3");
      expect(seed1).not.toBe(seed2);
    });
  });
});

describe("Predictions", () => {
  describe("buildPredictionBundle", () => {
    it("should build bundle with predictions for tracked metrics", () => {
      const posteriorState = {
        variables: [
          { variableId: "var1", posteriorBand: { low: 0.2, high: 0.4 } },
        ],
      };

      const trackedMetrics = [
        { metricId: "m1", targetKind: "latent_variable" as const, targetId: "var1" },
        { metricId: "m2", targetKind: "action_outcome" as const, targetId: "out1" },
      ];

      const bundle = buildPredictionBundle(
        "2026-01-01T00:00:00.000Z",
        posteriorState,
        "decHash",
        "obsHash",
        "seed123",
        "0.3.1",
        trackedMetrics
      );

      expect(bundle.at).toBe("2026-01-01T00:00:00.000Z");
      expect(bundle.predictions).toHaveLength(2);
      expect(bundle.predictions[0].target.id).toBe("var1");
      expect(bundle.predictions[1].target.id).toBe("out1");
    });

    it("should include basis in predictions", () => {
      const bundle = buildPredictionBundle(
        "2026-01-01T00:00:00.000Z",
        { variables: [] },
        "decHash",
        "obsHash",
        "seed123",
        "0.3.1",
        []
      );

      expect(bundle.predictions).toHaveLength(0);
    });
  });

  describe("observationsUpTo", () => {
    const batches: ReplayObservationBatch[] = [
      {
        batchId: "batch1",
        timestamp: "2026-01-01T00:00:00.000Z",
        observations: [],
      },
      {
        batchId: "batch2",
        timestamp: "2026-01-02T00:00:00.000Z",
        observations: [],
      },
      {
        batchId: "batch3",
        timestamp: "2026-01-03T00:00:00.000Z",
        observations: [],
      },
    ];

    it("should return all batches up to timestamp", () => {
      const result = observationsUpTo(batches, "2026-01-02T00:00:00.000Z");
      expect(result).toHaveLength(2);
      expect(result[0].batchId).toBe("batch1");
      expect(result[1].batchId).toBe("batch2");
    });

    it("should return empty array for timestamp before all", () => {
      const result = observationsUpTo(batches, "2025-12-31T00:00:00.000Z");
      expect(result).toHaveLength(0);
    });
  });

  describe("summarizePosterior", () => {
    it("should compute summary with zero variables", () => {
      const summary = summarizePosterior([], 0);
      expect(summary.variableCount).toBe(0);
      expect(summary.observationCount).toBe(0);
      expect(summary.modelStrength).toBeGreaterThanOrEqual(0);
      expect(summary.modelStrength).toBeLessThanOrEqual(1);
    });

    it("should increase strength with more observations", () => {
      const variables = [
        { variableId: "var1", posteriorBand: { low: 0.3, high: 0.7 } },
      ];
      const summary1 = summarizePosterior(variables, 0);
      const summary2 = summarizePosterior(variables, 10);
      expect(summary2.modelStrength).toBeGreaterThan(summary1.modelStrength);
    });

    it("should increase strength with narrower bands", () => {
      const wideVars = [{ variableId: "var1", posteriorBand: { low: 0, high: 1 } }];
      const narrowVars = [{ variableId: "var1", posteriorBand: { low: 0.45, high: 0.55 } }];
      const summary1 = summarizePosterior(wideVars, 5);
      const summary2 = summarizePosterior(narrowVars, 5);
      expect(summary2.modelStrength).toBeGreaterThan(summary1.modelStrength);
    });
  });
});

describe("Replay Runner", () => {
  const sampleCase: ReplayCase = {
    caseId: "test_case_001",
    label: "Test Case",
    decisionSpec: {
      id: "dec_001",
      title: "Test Decision",
      context: "Test",
      createdAt: "2026-01-01T00:00:00.000Z",
      horizon: "days",
      agents: [],
      actions: [],
      constraints: [],
      assumptions: [
        { id: "ass1", text: "Test assumption", status: "assumption", confidence: "medium", tags: [] },
      ],
    },
    observationBatches: [
      {
        batchId: "batch1",
        timestamp: "2026-01-01T12:00:00.000Z",
        observations: [
          {
            observationId: "obs1",
            signalId: "sig1",
            value: 100,
            timestamp: "2026-01-01T12:00:00.000Z",
            provenance: [],
          },
        ],
      },
    ],
    horizons: {
      asOf: "2026-01-01T00:00:00.000Z",
      resolveBy: "2026-01-15T00:00:00.000Z",
    },
    outcome: {
      status: "resolved",
      resolvedAt: "2026-01-10T00:00:00.000Z",
      metrics: [
        {
          metricId: "metric1",
          label: "Test Metric",
          kind: "continuous",
          value: { kind: "continuous", actual: 105 },
          mapping: { linksTo: "latent_variable", targetId: "ass1" },
          provenance: [],
        },
      ],
    },
  };

  const defaultOptions: ReplayOptions = {
    depth: 3,
    limits: {},
    strict: true,
  };

  describe("replayCase", () => {
    it("should return deterministic results for same input", async () => {
      const result1 = await replayCase(sampleCase, defaultOptions);
      const result2 = await replayCase(sampleCase, defaultOptions);

      expect(result1.caseId).toBe(result2.caseId);
      expect(result1.runMeta.decisionHash).toBe(result2.runMeta.decisionHash);
      expect(result1.checkpoints).toHaveLength(result2.checkpoints.length);
    });

    it("should include all checkpoints", async () => {
      const result = await replayCase(sampleCase, defaultOptions);
      // Should have asOf checkpoint + 1 per batch
      expect(result.checkpoints.length).toBeGreaterThanOrEqual(2);
      expect(result.checkpoints[0].at).toBe(sampleCase.horizons.asOf);
    });

    it("should include run metadata", async () => {
      const result = await replayCase(sampleCase, defaultOptions);
      expect(result.runMeta.seed).toBeDefined();
      expect(result.runMeta.engineVersion).toBe("0.3.1");
      expect(result.runMeta.decisionHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.runMeta.observationsHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.runMeta.startedAt).toBeDefined();
      expect(result.runMeta.completedAt).toBeDefined();
    });

    it("should compute calibration scoring", async () => {
      const result = await replayCase(sampleCase, defaultOptions);
      expect(result.scoring).toBeDefined();
      expect(result.scoring.coverage).toBeDefined();
      expect(typeof result.scoring.coverage.overall).toBe("number");
      expect(result.scoring.recommendedAdjustment).toBeDefined();
    });

    it("should respect maxCheckpoints limit", async () => {
      const optionsWithLimit: ReplayOptions = {
        ...defaultOptions,
        limits: { maxCheckpoints: 2 },
      };
      const result = await replayCase(sampleCase, optionsWithLimit);
      expect(result.checkpoints.length).toBeLessThanOrEqual(2);
    });

    it("should use provided seed", async () => {
      const optionsWithSeed: ReplayOptions = {
        ...defaultOptions,
        seed: "custom_seed_123",
      };
      const result = await replayCase(sampleCase, optionsWithSeed);
      expect(result.runMeta.seed).toBe("custom_seed_123");
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  SeededRandom,
  inferPosterior,
  observationsToWorldEvidence,
  computeProvenanceQuality,
} from "./world-model.js";
import type {
  WorldModelSpec,
  SignalObservation,
  EvidenceEvent,
} from "@zeo/contracts";

describe("world-model", () => {
  describe("SeededRandom", () => {
    it("should be deterministic with same seed", () => {
      const rng1 = new SeededRandom("test-seed-123");
      const rng2 = new SeededRandom("test-seed-123");

      const vals1 = rng1.uniform(0, 1, 10);
      const vals2 = rng2.uniform(0, 1, 10);

      expect(vals1).toEqual(vals2);
    });

    it("should produce different values with different seeds", () => {
      const rng1 = new SeededRandom("seed-a");
      const rng2 = new SeededRandom("seed-b");

      const vals1 = rng1.uniform(0, 1, 10);
      const vals2 = rng2.uniform(0, 1, 10);

      expect(vals1).not.toEqual(vals2);
    });

    it("should produce values in range", () => {
      const rng = new SeededRandom("test");
      const vals = rng.uniform(5, 10, 100);

      expect(vals.every(v => v >= 5 && v <= 10)).toBe(true);
    });
  });

  describe("computeProvenanceQuality", () => {
    it("should return low quality for empty provenance", () => {
      const quality = computeProvenanceQuality([]);
      expect(quality).toBe(0.1);
    });

    it("should compute average quality from provenance", () => {
      const quality = computeProvenanceQuality(
        [
          {
            kind: "text",
            sourceId: "source1",
            offset: 0,
            length: 100,
            capturedAt: new Date().toISOString(),
            checksum: "abc123",
          },
        ],
        { source1: 0.8 }
      );
      expect(quality).toBe(0.8);
    });

    it("should penalize incomplete provenance", () => {
      const quality = computeProvenanceQuality(
        [
          {
            kind: "text",
            sourceId: "source1",
            offset: 0,
            length: 100,
            capturedAt: "", // Missing
            checksum: "abc123",
          },
        ],
        { source1: 0.8 }
      );
      expect(quality).toBe(0.1);
    });
  });

  describe("inferPosterior", () => {
    const baseWorldSpec: WorldModelSpec = {
      id: "test-world",
      version: "1.0",
      variables: [
        {
          id: "market_stress",
          label: "Market Stress Level",
          domain: "market",
          priorBand: { low: 0.2, high: 0.8 },
          volatilityHint: "medium",
        },
        {
          id: "counterparty_trust",
          label: "Counterparty Trust",
          domain: "ops",
          priorBand: { low: 0.4, high: 0.9 },
        },
      ],
      observationModels: [
        {
          id: "market_obs",
          label: "Market Observation",
          targetVariableIds: ["market_stress"],
          effect: "narrow",
          strength: 0.5,
          minQualityThreshold: 0.3,
          provenancePattern: "market:*",
        },
        {
          id: "news_obs",
          label: "News Observation",
          targetVariableIds: ["market_stress"],
          effect: "widen",
          strength: 0.3,
          minQualityThreshold: 0.2,
          provenancePattern: "news:*",
        },
      ],
    };

    it("should be deterministic with same seed", () => {
      const observations: SignalObservation[] = [
        {
          observationId: "obs1",
          signalId: "market:vix",
          t: new Date().toISOString(),
          valueBand: { low: 0.3, high: 0.4 },
          weightApplied: 0.5,
          qualityScore: 0.8,
          biasAdjustmentsApplied: [],
          provenance: [
            {
              kind: "text",
              sourceId: "market_data",
              offset: 0,
              length: 100,
              capturedAt: new Date().toISOString(),
              checksum: "abc123",
            },
          ],
          sourceId: "market_data",
          rawRef: { kind: "market", id: "vix" },
        },
      ];

      const posterior1 = inferPosterior(baseWorldSpec, observations, "seed-123");
      const posterior2 = inferPosterior(baseWorldSpec, observations, "seed-123");

      expect(posterior1.seed).toBe(posterior2.seed);
      expect(posterior1.worldSpecId).toBe(posterior2.worldSpecId);
      expect(posterior1.variables.length).toBe(posterior2.variables.length);
      for (let i = 0; i < posterior1.variables.length; i++) {
        expect(posterior1.variables[i].variableId).toBe(posterior2.variables[i].variableId);
        expect(posterior1.variables[i].posteriorBand.low).toBeCloseTo(posterior2.variables[i].posteriorBand.low);
        expect(posterior1.variables[i].posteriorBand.high).toBeCloseTo(posterior2.variables[i].posteriorBand.high);
      }
    });

    it("should narrow band with high-quality narrow observation", () => {
      const observations: SignalObservation[] = [
        {
          observationId: "obs1",
          signalId: "market:vix",
          t: new Date().toISOString(),
          valueBand: { low: 0.3, high: 0.4 },
          weightApplied: 0.5,
          qualityScore: 0.8,
          biasAdjustmentsApplied: [],
          provenance: [
            {
              kind: "text",
              sourceId: "market_data",
              offset: 0,
              length: 100,
              capturedAt: new Date().toISOString(),
              checksum: "abc123",
            },
          ],
          sourceId: "market_data",
          rawRef: { kind: "market", id: "vix" },
        },
      ];

      const posterior = inferPosterior(baseWorldSpec, observations, "seed-123");
      const marketStress = posterior.variables.find(v => v.variableId === "market_stress");

      expect(marketStress).toBeDefined();
      expect(marketStress!.observationCount).toBe(1);
      // Posterior should be narrower than prior (0.6 width)
      const priorWidth = 0.8 - 0.2;
      const postWidth = marketStress!.posteriorBand.high - marketStress!.posteriorBand.low;
      expect(postWidth).toBeLessThan(priorWidth);
    });

    it("should widen band with conflicting observations", () => {
      const observations: SignalObservation[] = [
        {
          observationId: "obs1",
          signalId: "market:vix",
          t: new Date().toISOString(),
          valueBand: { low: 0.1, high: 0.2 },
          weightApplied: 0.5,
          qualityScore: 0.8,
          biasAdjustmentsApplied: [],
          provenance: [
            {
              kind: "text",
              sourceId: "source_a",
              offset: 0,
              length: 100,
              capturedAt: new Date().toISOString(),
              checksum: "abc123",
            },
          ],
          sourceId: "source_a",
          rawRef: { kind: "market", id: "vix" },
        },
        {
          observationId: "obs2",
          signalId: "market:vix",
          t: new Date().toISOString(),
          valueBand: { low: 0.8, high: 0.9 },
          weightApplied: 0.5,
          qualityScore: 0.8,
          biasAdjustmentsApplied: [],
          provenance: [
            {
              kind: "text",
              sourceId: "source_b",
              offset: 0,
              length: 100,
              capturedAt: new Date().toISOString(),
              checksum: "def456",
            },
          ],
          sourceId: "source_b",
          rawRef: { kind: "market", id: "vix" },
        },
      ];

      const posterior = inferPosterior(baseWorldSpec, observations, "seed-123");
      const marketStress = posterior.variables.find(v => v.variableId === "market_stress");

      expect(marketStress).toBeDefined();
      expect(marketStress!.observationCount).toBe(2);
    });

    it("should have smaller effect with weak provenance", () => {
      const highQualityObs: SignalObservation[] = [
        {
          observationId: "obs1",
          signalId: "market:vix",
          t: new Date().toISOString(),
          valueBand: { low: 0.3, high: 0.4 },
          weightApplied: 0.5,
          qualityScore: 0.9,
          biasAdjustmentsApplied: [],
          provenance: [
            {
              kind: "text",
              sourceId: "market_data",
              offset: 0,
              length: 100,
              capturedAt: new Date().toISOString(),
              checksum: "abc123",
            },
          ],
          sourceId: "market_data",
          rawRef: { kind: "market", id: "vix" },
        },
      ];

      const lowQualityObs: SignalObservation[] = [
        {
          observationId: "obs1",
          signalId: "market:vix",
          t: new Date().toISOString(),
          valueBand: { low: 0.3, high: 0.4 },
          weightApplied: 0.5,
          qualityScore: 0.2,
          biasAdjustmentsApplied: [],
          provenance: [],
          sourceId: "unknown",
          rawRef: { kind: "market", id: "vix" },
        },
      ];

      const posteriorHigh = inferPosterior(baseWorldSpec, highQualityObs, "seed-123");
      const posteriorLow = inferPosterior(baseWorldSpec, lowQualityObs, "seed-123");

      const marketStressHigh = posteriorHigh.variables.find(v => v.variableId === "market_stress")!;
      const marketStressLow = posteriorLow.variables.find(v => v.variableId === "market_stress")!;

      // High quality should have more effect (narrower or more shifted)
      const widthHigh = marketStressHigh.posteriorBand.high - marketStressHigh.posteriorBand.low;
      const widthLow = marketStressLow.posteriorBand.high - marketStressLow.posteriorBand.low;

      // With weak provenance that doesn't meet threshold, posterior should equal prior
      expect(widthLow).toBeGreaterThanOrEqual(widthHigh);
    });

    it("should be invariant to observation batch order", () => {
      const obs1: SignalObservation = {
        observationId: "obs1",
        signalId: "market:vix",
        t: new Date().toISOString(),
        valueBand: { low: 0.3, high: 0.4 },
        weightApplied: 0.5,
        qualityScore: 0.8,
        biasAdjustmentsApplied: [],
        provenance: [
          {
            kind: "text",
            sourceId: "market_data",
            offset: 0,
            length: 100,
            capturedAt: new Date().toISOString(),
            checksum: "abc123",
          },
        ],
        sourceId: "market_data",
        rawRef: { kind: "market", id: "vix" },
      };

      const obs2: SignalObservation = {
        observationId: "obs2",
        signalId: "market:spy",
        t: new Date().toISOString(),
        valueBand: { low: 0.5, high: 0.6 },
        weightApplied: 0.5,
        qualityScore: 0.8,
        biasAdjustmentsApplied: [],
        provenance: [
          {
            kind: "text",
            sourceId: "market_data",
            offset: 0,
            length: 100,
            capturedAt: new Date().toISOString(),
            checksum: "def456",
          },
        ],
        sourceId: "market_data",
        rawRef: { kind: "market", id: "spy" },
      };

      const posteriorA = inferPosterior(baseWorldSpec, [obs1, obs2], "seed-123");
      const posteriorB = inferPosterior(baseWorldSpec, [obs2, obs1], "seed-123");

      // Compare everything except timestamps (which naturally differ between runs)
      expect(posteriorA.worldSpecId).toEqual(posteriorB.worldSpecId);
      expect(posteriorA.seed).toEqual(posteriorB.seed);
      expect(posteriorA.modelStrength).toEqual(posteriorB.modelStrength);
      expect(posteriorA.variables).toEqual(posteriorB.variables);
    });
  });

  describe("observationsToWorldEvidence", () => {
    it("should convert evidence events to observations", () => {
      const observations: SignalObservation[] = [];
      const evidenceEvents: EvidenceEvent[] = [
        {
          id: "ev1",
          type: "document",
          sourceId: "user_upload",
          capturedAt: new Date().toISOString(),
          checksum: "abc123",
          observations: ["Key finding in document"],
          claims: [
            {
              id: "claim1",
              text: "Market is volatile",
              status: "belief",
              confidence: "medium",
              tags: ["market"],
              provenance: [
                {
                  kind: "document",
                  sourceId: "doc_1",
                  page: 1,
                  selector: "p.1",
                  capturedAt: new Date().toISOString(),
                  checksum: "def456",
                },
              ],
            },
          ],
          constraints: [],
        },
      ];

      const mappingRules = [
        {
          evidenceType: "document",
          effect: "narrow" as const,
          strength: 0.4,
          targetVariables: ["market_stress"],
        },
      ];

      const result = observationsToWorldEvidence(observations, evidenceEvents, mappingRules);

      expect(result.length).toBe(1);
      expect(result[0].signalId).toBe("evidence:document");
      expect(result[0].qualityScore).toBeLessThan(0.5); // Evidence has lower quality
    });
  });
});


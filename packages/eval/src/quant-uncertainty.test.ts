
import { describe, it, expect } from "vitest";
import {
    computeExtendedUncertaintyLedger,
    ChangePointInput,
    ShrinkageInput,
    RedundancyInput,
    SensitivityInput
} from "./quant-uncertainty";
import type { Prediction } from "@zeo/contracts";

// Mock prediction helper
const mockPrediction = (id: string): Prediction => ({
    target: { kind: "latent_variable", id: "test-target" },
    band: { low: 0, high: 1 },
    basis: {
        decisionHash: "test",
        observationHash: "test",
        seed: id,
        engineVersion: "1.0.0"
    },
    provenanceRefs: []
});

describe("Quant Uncertainty Integration", () => {
    it("should maintain baseline uncertainty when no quant factors are present", () => {
        const p1 = mockPrediction("baseline");
        const result = computeExtendedUncertaintyLedger(p1, {
            changepoint: { candidates: [], stabilityScore: 1.0 },
            shrinkage: { shrinkageFactor: 1.0, varianceReduction: 0.1, averageShrinkage: 0 },
            redundancy: { overallRedundancy: 0.1, redundantFeatureCount: 0, totalFeatureCount: 10 },
            sensitivity: {
                looSensitivity: { coefficientOfVariation: 0.01, maxDeviation: 0.02, isStable: true },
                windowSensitivity: { cv: 0.01, isStable: true }
            }
        });

        // Check structure
        expect(result.quantComponents).toBeDefined();
        expect(result.quantAdjustedAggregate).toBeDefined();

        // Check values - should be close to base uncertainty (0.5 max cap typically)
        // Actually base uncertainty might be small from simple prediction
        const baseWidth = result.total.high - result.total.low;
        const adjustWidth = result.quantAdjustedAggregate!.high - result.quantAdjustedAggregate!.low;

        // With minimal factors, adjustment should be negligible or zero
        expect(adjustWidth).toBeGreaterThanOrEqual(baseWidth);
        expect(adjustWidth).toBeLessThan(baseWidth + 0.05); // Allow small float drift
    });

    it("should increase uncertainty for unstable time series", () => {
        const p = mockPrediction("unstable");
        const result = computeExtendedUncertaintyLedger(p, {
            changepoint: { candidates: [{ index: 50, score: 0.8 }], stabilityScore: 0.4 },
            // others stable
            sensitivity: {
                looSensitivity: { coefficientOfVariation: 0.01, maxDeviation: 0.02, isStable: true }
            }
        });

        const baseWidth = result.total.high - result.total.low;
        const adjustWidth = result.quantAdjustedAggregate!.high - result.quantAdjustedAggregate!.low;

        expect(adjustWidth).toBeGreaterThan(baseWidth);
        expect(result.quantComponents?.changepointInstability?.adjustmentFactor).toBeGreaterThan(0);
    });

    it("should increase uncertainty for high redundancy", () => {
        const p = mockPrediction("redundancy");
        const result = computeExtendedUncertaintyLedger(p, {
            redundancy: { overallRedundancy: 0.8, redundantFeatureCount: 8, totalFeatureCount: 10 }
        });

        const baseWidth = result.total.high - result.total.low;
        const adjustWidth = result.quantAdjustedAggregate!.high - result.quantAdjustedAggregate!.low;

        expect(adjustWidth).toBeGreaterThan(baseWidth);
        expect(result.quantComponents?.redundancyPenalty?.penaltyFactor).toBeGreaterThan(0);
    });

    it("should generate integration metadata", () => {
        const p = mockPrediction("metadata");
        const result = computeExtendedUncertaintyLedger(p, {
            changepoint: { candidates: [], stabilityScore: 1.0 },
            redundancy: { overallRedundancy: 0.1, redundantFeatureCount: 0, totalFeatureCount: 10 }
        });

        expect(result.integrationMetadata).toBeDefined();
        expect(result.integrationMetadata?.quantPackagesUsed).toContain("@zeo/quant-timeseries");
        expect(result.integrationMetadata?.quantPackagesUsed).toContain("@zeo/info-theory");
        expect(typeof result.integrationMetadata?.computeTimeMs).toBe("number");
    });
});

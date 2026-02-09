
import {
    computeExtendedUncertaintyLedger,
    ChangePointInput,
    ShrinkageInput,
    RedundancyInput,
    SensitivityInput
} from "../src/quant-uncertainty";
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

function runQuantEval() {
    console.log("Running Quant Stack Evaluation...");

    const results = [];

    // Test Case 1: stable baseline
    console.log("\nTest Case 1: Stable Baseline");
    const p1 = mockPrediction("baseline");
    const l1 = computeExtendedUncertaintyLedger(p1, {
        changepoint: { candidates: [], stabilityScore: 1.0 },
        shrinkage: { shrinkageFactor: 1.0, varianceReduction: 0.1, averageShrinkage: 0 },
        redundancy: { overallRedundancy: 0.1, redundantFeatureCount: 0, totalFeatureCount: 10 },
        sensitivity: {
            looSensitivity: { coefficientOfVariation: 0.01, maxDeviation: 0.02, isStable: true },
            windowSensitivity: { cv: 0.01, isStable: true }
        }
    });

    const width1 = l1.quantAdjustedAggregate!.high - l1.quantAdjustedAggregate!.low;
    console.log(`Baseline Width: ${width1.toFixed(3)}`);
    results.push({ case: "baseline", width: width1 });

    // Test Case 2: Unstable Time Series
    console.log("\nTest Case 2: Unstable Time Series");
    const p2 = mockPrediction("unstable-ts");
    const l2 = computeExtendedUncertaintyLedger(p2, {
        changepoint: { candidates: [{ index: 50, score: 0.8 }], stabilityScore: 0.4 },
        // others stable
        shrinkage: { shrinkageFactor: 1.0, varianceReduction: 0.1, averageShrinkage: 0 },
        redundancy: { overallRedundancy: 0.1, redundantFeatureCount: 0, totalFeatureCount: 10 },
        sensitivity: {
            looSensitivity: { coefficientOfVariation: 0.01, maxDeviation: 0.02, isStable: true },
            windowSensitivity: { cv: 0.01, isStable: true }
        }
    });

    const width2 = l2.quantAdjustedAggregate!.high - l2.quantAdjustedAggregate!.low;
    console.log(`Unstable TS Width: ${width2.toFixed(3)}`);
    console.log(`Factor: ${(width2 / width1).toFixed(2)}x`);
    results.push({ case: "unstable_ts", width: width2 });

    if (width2 <= width1) console.error("FAIL: Unstable TS did not increase uncertainty");

    // Test Case 3: High Redundancy
    console.log("\nTest Case 3: High Redundancy");
    const p3 = mockPrediction("redundancy");
    const l3 = computeExtendedUncertaintyLedger(p3, {
        changepoint: { candidates: [], stabilityScore: 1.0 },
        shrinkage: { shrinkageFactor: 1.0, varianceReduction: 0.1, averageShrinkage: 0 },
        redundancy: { overallRedundancy: 0.8, redundantFeatureCount: 8, totalFeatureCount: 10 },
        sensitivity: {
            looSensitivity: { coefficientOfVariation: 0.01, maxDeviation: 0.02, isStable: true },
            windowSensitivity: { cv: 0.01, isStable: true }
        }
    });

    const width3 = l3.quantAdjustedAggregate!.high - l3.quantAdjustedAggregate!.low;
    console.log(`High Redundancy Width: ${width3.toFixed(3)}`);
    console.log(`Factor: ${(width3 / width1).toFixed(2)}x`);
    results.push({ case: "redundancy", width: width3 });

    if (width3 <= width1) console.error("FAIL: High redundancy did not increase uncertainty");

    // Test Case 4: High Sensitivity (Fragile)
    console.log("\nTest Case 4: High Sensitivity");
    const p4 = mockPrediction("sensitivity");
    const l4 = computeExtendedUncertaintyLedger(p4, {
        changepoint: { candidates: [], stabilityScore: 1.0 },
        shrinkage: { shrinkageFactor: 1.0, varianceReduction: 0.1, averageShrinkage: 0 },
        redundancy: { overallRedundancy: 0.1, redundantFeatureCount: 0, totalFeatureCount: 10 },
        sensitivity: {
            looSensitivity: { coefficientOfVariation: 0.25, maxDeviation: 0.4, isStable: false },
            windowSensitivity: { cv: 0.15, isStable: false }
        }
    });

    const width4 = l4.quantAdjustedAggregate!.high - l4.quantAdjustedAggregate!.low;
    console.log(`High Sensitivity Width: ${width4.toFixed(3)}`);
    console.log(`Factor: ${(width4 / width1).toFixed(2)}x`);
    results.push({ case: "sensitivity", width: width4 });

    if (width4 <= width1) console.error("FAIL: High sensitivity did not increase uncertainty");

    // Test Case 5: All Combined (Worst Case)
    console.log("\nTest Case 5: Worst Case");
    const p5 = mockPrediction("worst-case");
    const l5 = computeExtendedUncertaintyLedger(p5, {
        changepoint: { candidates: [{ index: 50, score: 0.9 }], stabilityScore: 0.2 },
        shrinkage: { shrinkageFactor: 0.5, varianceReduction: 0.05, averageShrinkage: 0.8 },
        redundancy: { overallRedundancy: 0.9, redundantFeatureCount: 9, totalFeatureCount: 10 },
        sensitivity: {
            looSensitivity: { coefficientOfVariation: 0.3, maxDeviation: 0.5, isStable: false },
            windowSensitivity: { cv: 0.2, isStable: false }
        }
    });

    const width5 = l5.quantAdjustedAggregate!.high - l5.quantAdjustedAggregate!.low;
    console.log(`Worst Case Width: ${width5.toFixed(3)}`);
    console.log(`Factor: ${(width5 / width1).toFixed(2)}x`);
    results.push({ case: "worst_case", width: width5 });

    console.log("\nEvaluation Complete.");
    console.log(JSON.stringify(results, null, 2));
}

runQuantEval();

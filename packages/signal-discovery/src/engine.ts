
import { type UUID, type ProbabilityInterval, type ProvenancePointer } from "@zeo/contracts";
import type {
    CandidateSignal,
    DiscoveryConfig,
    RiskBands,
    SignalDiscoveryGraph,
    SignalMetrics,
    DiscoveryNode,
    DiscoveryEdge,
    SignalRelationshipType
} from "./types.js";
import { createHash } from "crypto";

/**
 * Signal Discovery Engine
 * 
 * Implements deterministic signal discovery with strong epistemic hygiene.
 */

function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

/**
 * Compute simple Pearson correlation (placeholder for full stats lib)
 */
function computePearson(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
    }

    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
}

/**
 * Compute signal metrics including stability
 */
function computeMetrics(
    signalData: number[],
    targetData: number[],
    config: DiscoveryConfig
): SignalMetrics {
    const r = computePearson(signalData, targetData);
    const n = signalData.length;

    // Approximate p-value (very simple t-distribution approx)
    // t = r * sqrt(n-2) / sqrt(1-r^2)
    const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);
    // Simple heuristic for p-value (not accurate for production stats)
    const pValue = Math.exp(-0.7 * t * t);

    // Uncertainty band (Fisher transformation)
    const z = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const zLow = z - 1.96 * se;
    const zHigh = z + 1.96 * se;
    const rLow = (Math.exp(2 * zLow) - 1) / (Math.exp(2 * zLow) + 1);
    const rHigh = (Math.exp(2 * zHigh) - 1) / (Math.exp(2 * zHigh) + 1);

    return {
        effectSize: r,
        pValue: Math.abs(r) > 0.99 ? 0 : pValue, // Handle perfect correlation case
        sampleSize: n,
        effectiveSampleSize: Math.floor(n * 0.8), // Placeholder for autocorrelation adjustment
        stabilityScore: Math.abs(r) > 0.5 ? 0.8 : 0.4, // Placeholder for window stability
        uncertaintyBand: { low: clamp(rLow, -1, 1), high: clamp(rHigh, -1, 1) }
    };
}

/**
 * Estimate risk bands (heuristic)
 */
function estimateRiskBands(r: number, signalName: string): RiskBands {
    const highCorrelation = Math.abs(r) > 0.9;

    return {
        confoundingRisk: "medium", // Default assumption
        leakageRisk: highCorrelation ? "high" : "low", // Super high correlation often means leakage
        dataQuality: "medium"
    };
}

/**
 * Deterministic hash for signal content
 */
function hashSignal(signal: Partial<CandidateSignal>): string {
    const content = JSON.stringify({
        name: signal.name,
        target: signal.targetId,
        type: signal.relationshipType,
        metrics: signal.metrics
    });
    return createHash("sha256").update(content).digest("hex");
}

/**
 * Main discovery function
 */
export function runSignalDiscovery(
    candidateSeries: Record<string, number[]>, // map of available signals
    targetSeries: Record<string, number[]>,    // map of target KPIs
    config: DiscoveryConfig
): SignalDiscoveryGraph {
    const signals = new Map<UUID, CandidateSignal>();
    const nodes: DiscoveryNode[] = [];
    const edges: DiscoveryEdge[] = [];

    // Register nodes
    for (const kpiId of Object.keys(targetSeries)) {
        nodes.push({ id: kpiId, type: "kpi" });
    }
    for (const sigId of Object.keys(candidateSeries)) {
        nodes.push({ id: sigId, type: "feature" });
    }

    // Discovery Loop
    const pairs: Array<{ signalId: string; targetId: string; r: number }> = [];
    let pairCount = 0;

    for (const targetId of Object.keys(targetSeries)) {
        for (const signalId of Object.keys(candidateSeries)) {
            if (pairCount >= config.budgets.maxPairs) break;

            const targetData = targetSeries[targetId];
            const signalData = candidateSeries[signalId];

            if (targetData.length !== signalData.length) continue; // Skip mismatched lengths for now

            const r = computePearson(signalData, targetData);

            if (Math.abs(r) >= config.thresholds.minEffectSize) {
                pairs.push({ signalId, targetId, r });
            }
            pairCount++;
        }
    }

    // Sort pairs deterministically for FDR
    pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

    // Create Candidate Signals
    for (const pair of pairs) {
        const metrics = computeMetrics(
            candidateSeries[pair.signalId],
            targetSeries[pair.targetId],
            config
        );

        const riskBands = estimateRiskBands(metrics.effectSize, pair.signalId);

        // Disclaimers
        const disclaimers = ["Correlation does not imply causation."];
        if (riskBands.leakageRisk === "high") {
            disclaimers.push("High risk of data leakage due to near-perfect correlation.");
        }

        const signalId = `sig-${pair.signalId}-${pair.targetId}` as UUID;
        const signal: CandidateSignal = {
            id: signalId,
            name: `${pair.signalId} -> ${pair.targetId}`,
            sourceSignalId: pair.signalId,
            targetId: pair.targetId,
            relationshipType: "correlation_pearson", // Default for now
            metrics,
            riskBands,
            provenance: [], // Would need real provenance from inputs
            disclaimers,
            createdAt: new Date().toISOString(),
            contentHash: ""
        };

        signal.contentHash = hashSignal(signal);
        signals.set(signalId, signal);

        edges.push({
            source: pair.signalId,
            target: pair.targetId,
            signalId,
            strength: Math.abs(metrics.effectSize)
        });
    }

    const generatedAt = new Date().toISOString();

    return {
        nodes,
        edges,
        signals,
        generatedAt,
        configHash: createHash("sha256").update(JSON.stringify(config)).digest("hex")
    };
}


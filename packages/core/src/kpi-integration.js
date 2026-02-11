/**
 * KPI Integration for Decision Engine
 *
 * Provides hooks to compute and store KPI metrics after each decision run.
 * Integrates with the warehouse storage for persistence.
 *
 * @module @zeo/core/kpi-integration
 */
import { createHash } from "crypto";
/**
 * Default KPI integration configuration
 */
export const DEFAULT_KPI_CONFIG = {
    autoStore: true,
    enabledKpis: {
        decisionCoverage: true,
        robustness: true,
        calibration: true,
    },
    defaultConfidence: { low: 0.7, high: 0.9 },
};
/**
 * Compute decision coverage metrics from a decision result
 */
export function computeDecisionCoverage(spec, result) {
    const graph = result.graph;
    const actions = spec.actions;
    // Calculate action coverage: how many actions have branch outcomes
    const actionsWithBranches = actions.filter(action => {
        return graph.edges.some(edge => edge.actionId === action.id);
    }).length;
    const actionCoverage = actions.length > 0 ? actionsWithBranches / actions.length : 0;
    // Calculate assumption coverage: assumptions with provenance vs total
    const assumptionsWithProvenance = spec.assumptions.filter(a => a.status === "fact" || (a.provenance && a.provenance.length > 0)).length;
    const assumptionCoverage = spec.assumptions.length > 0
        ? assumptionsWithProvenance / spec.assumptions.length
        : 1;
    // Determine branch depth from graph structure
    let maxDepth = 0;
    const rootId = graph.nodes[0]?.id;
    if (rootId) {
        const depthMap = new Map();
        depthMap.set(rootId, 0);
        // BFS to find max depth
        const queue = [rootId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            const currentDepth = depthMap.get(currentId) || 0;
            const children = graph.edges
                .filter(e => e.from === currentId)
                .map(e => e.to);
            for (const childId of children) {
                if (!depthMap.has(childId)) {
                    depthMap.set(childId, currentDepth + 1);
                    maxDepth = Math.max(maxDepth, currentDepth + 1);
                    queue.push(childId);
                }
            }
        }
    }
    return {
        actionCoverage,
        assumptionCoverage,
        branchDepth: maxDepth,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
    };
}
/**
 * Compute robustness metrics from lens evaluations
 */
export function computeRobustnessMetrics(spec, result) {
    const evaluations = result.evaluations;
    // Find robustness evaluation
    const robustnessEval = evaluations.find(e => e.lens === "robustness");
    const robustActions = robustnessEval?.robustActions || [];
    const fragileAssumptions = robustnessEval?.fragileAssumptions || [];
    const dominatedActions = robustnessEval?.dominatedActions || [];
    const totalActions = spec.actions.length;
    const robustActionPercentage = totalActions > 0
        ? robustActions.length / totalActions
        : 0;
    // Compute robustness score (composite metric)
    const robustnessScore = Math.max(0, Math.min(1, robustActionPercentage * 0.6 +
        (1 - (fragileAssumptions.length / Math.max(1, spec.assumptions.length))) * 0.4));
    return {
        robustnessScore,
        robustActionCount: robustActions.length,
        fragileAssumptionCount: fragileAssumptions.length,
        dominatedActionCount: dominatedActions.length,
        robustActionPercentage,
    };
}
/**
 * Compute calibration metrics
 * Note: This is a placeholder that returns default values.
 * In production, this would query the calibration system.
 */
export function computeCalibrationMetrics() {
    return {
        calibrationScore: 0.75, // Placeholder
        coverage: 0.8,
        widenFactor: 1.0,
        sampleSize: 0,
    };
}
/**
 * Create a KPI measurement for decision coverage
 */
export function createDecisionCoverageMeasurement(context, metrics, config) {
    const now = new Date().toISOString();
    const value = {
        type: "scalar",
        value: metrics.actionCoverage,
    };
    // Compute input hash for determinism
    const inputData = JSON.stringify({
        specId: context.spec.id,
        nodeCount: metrics.nodeCount,
        timestamp: context.timestamp,
    });
    const inputHash = createHash("sha256").update(inputData).digest("hex");
    return {
        id: `kpi:decision-coverage:${context.spec.id}:${Date.now()}`,
        kpiId: "decision-coverage",
        kpiVersion: "1.0.0",
        category: "decision_quality",
        measurement: value,
        periodStart: context.timestamp,
        periodEnd: context.timestamp,
        computation: {
            timestamp: now,
            inputHash,
            formulaVersion: "1.0.0",
            durationMs: 0,
        },
        inputs: {
            decisionCount: 1,
            assumptionsCount: context.spec.assumptions.length,
            customData: {
                branchDepth: metrics.branchDepth,
                nodeCount: metrics.nodeCount,
                edgeCount: metrics.edgeCount,
                assumptionCoverage: metrics.assumptionCoverage,
            },
        },
        epistemic: {
            status: "belief",
            confidenceBand: config.defaultConfidence,
            provenance: [{
                    kind: "text",
                    sourceId: "kpi-decision-engine",
                    offset: 0,
                    length: context.spec.id.length,
                    capturedAt: now,
                    checksum: inputHash.slice(0, 16),
                }],
            warnings: [
                "Coverage metrics are computed from the decision graph structure",
                "Actual coverage may vary based on decision complexity",
            ],
        },
        determinism: {
            isReproducible: true,
            seed: inputHash.slice(0, 16),
            verificationHash: inputHash,
        },
        tags: ["decision-coverage", "auto-generated", `decision:${context.spec.id}`],
        createdAt: now,
    };
}
/**
 * Create a KPI measurement for robustness score
 */
export function createRobustnessMeasurement(context, metrics, config) {
    const now = new Date().toISOString();
    const value = {
        type: "scalar",
        value: metrics.robustnessScore,
    };
    const inputData = JSON.stringify({
        specId: context.spec.id,
        robustActions: metrics.robustActionCount,
        fragileAssumptions: metrics.fragileAssumptionCount,
        timestamp: context.timestamp,
    });
    const inputHash = createHash("sha256").update(inputData).digest("hex");
    return {
        id: `kpi:robustness-score:${context.spec.id}:${Date.now()}`,
        kpiId: "robustness-score",
        kpiVersion: "1.0.0",
        category: "robustness",
        measurement: value,
        periodStart: context.timestamp,
        periodEnd: context.timestamp,
        computation: {
            timestamp: now,
            inputHash,
            formulaVersion: "1.0.0",
            durationMs: 0,
        },
        inputs: {
            decisionCount: 1,
            customData: {
                robustActionCount: metrics.robustActionCount,
                fragileAssumptionCount: metrics.fragileAssumptionCount,
                dominatedActionCount: metrics.dominatedActionCount,
                robustActionPercentage: metrics.robustActionPercentage,
            },
        },
        epistemic: {
            status: "belief",
            confidenceBand: config.defaultConfidence,
            provenance: [{
                    kind: "text",
                    sourceId: "kpi-decision-engine",
                    offset: 0,
                    length: context.spec.id.length,
                    capturedAt: now,
                    checksum: inputHash.slice(0, 16),
                }],
            warnings: [
                "Robustness score is derived from heuristic evaluation",
                "Score may vary with different lens configurations",
            ],
        },
        determinism: {
            isReproducible: true,
            seed: inputHash.slice(0, 16),
            verificationHash: inputHash,
        },
        tags: ["robustness-score", "auto-generated", `decision:${context.spec.id}`],
        createdAt: now,
    };
}
/**
 * Create a KPI measurement for calibration
 */
export function createCalibrationMeasurement(context, metrics, config) {
    const now = new Date().toISOString();
    const value = {
        type: "scalar",
        value: metrics.calibrationScore,
    };
    const inputData = JSON.stringify({
        specId: context.spec.id,
        timestamp: context.timestamp,
    });
    const inputHash = createHash("sha256").update(inputData).digest("hex");
    return {
        id: `kpi:calibration-score:${context.spec.id}:${Date.now()}`,
        kpiId: "calibration-score",
        kpiVersion: "1.0.0",
        category: "calibration",
        measurement: value,
        periodStart: context.timestamp,
        periodEnd: context.timestamp,
        computation: {
            timestamp: now,
            inputHash,
            formulaVersion: "1.0.0",
            durationMs: 0,
        },
        inputs: {
            decisionCount: metrics.sampleSize,
            customData: {
                coverage: metrics.coverage,
                widenFactor: metrics.widenFactor,
            },
        },
        epistemic: {
            status: "assumption",
            confidenceBand: { low: 0.5, high: 0.7 },
            provenance: [{
                    kind: "text",
                    sourceId: "kpi-decision-engine",
                    offset: 0,
                    length: context.spec.id.length,
                    capturedAt: now,
                    checksum: inputHash.slice(0, 16),
                }],
            warnings: [
                "Calibration score is a placeholder until outcome data is available",
                "Score will be updated when replay data is integrated",
            ],
        },
        determinism: {
            isReproducible: true,
            seed: inputHash.slice(0, 16),
            verificationHash: inputHash,
        },
        tags: ["calibration-score", "auto-generated", `decision:${context.spec.id}`],
        createdAt: now,
    };
}
/**
 * Store KPI measurements for a decision run
 */
export async function storeDecisionKpis(storage, context, config = DEFAULT_KPI_CONFIG) {
    const measurements = [];
    if (config.enabledKpis.decisionCoverage) {
        const coverageMetrics = computeDecisionCoverage(context.spec, context.result);
        const coverageMeasurement = createDecisionCoverageMeasurement(context, coverageMetrics, config);
        await storage.storeMeasurement(coverageMeasurement, {
            decisionId: context.spec.id,
            tags: ["auto-generated"],
        });
        measurements.push(coverageMeasurement);
    }
    if (config.enabledKpis.robustness) {
        const robustnessMetrics = computeRobustnessMetrics(context.spec, context.result);
        const robustnessMeasurement = createRobustnessMeasurement(context, robustnessMetrics, config);
        await storage.storeMeasurement(robustnessMeasurement, {
            decisionId: context.spec.id,
            tags: ["auto-generated"],
        });
        measurements.push(robustnessMeasurement);
    }
    if (config.enabledKpis.calibration) {
        const calibrationMetrics = computeCalibrationMetrics();
        const calibrationMeasurement = createCalibrationMeasurement(context, calibrationMetrics, config);
        await storage.storeMeasurement(calibrationMeasurement, {
            decisionId: context.spec.id,
            tags: ["auto-generated"],
        });
        measurements.push(calibrationMeasurement);
    }
    return measurements;
}
/**
 * KPI Integration class for managing KPI computation and storage
 */
export class KpiIntegration {
    storage = null;
    config;
    measurements = [];
    constructor(config = {}) {
        this.config = { ...DEFAULT_KPI_CONFIG, ...config };
    }
    /**
     * Initialize the integration with a warehouse storage
     */
    initialize(storage) {
        this.storage = storage;
    }
    /**
     * Check if the integration is initialized
     */
    get isInitialized() {
        return this.storage !== null;
    }
    /**
     * Process a decision result and store KPIs
     */
    async processDecision(spec, result, options) {
        if (!this.storage) {
            throw new Error("KpiIntegration not initialized. Call initialize() first.");
        }
        const context = {
            spec,
            result,
            timestamp: new Date().toISOString(),
            options,
        };
        const measurements = await storeDecisionKpis(this.storage, context, this.config);
        this.measurements.push(...measurements);
        // Trim history to prevent unbounded growth
        if (this.measurements.length > 1000) {
            this.measurements = this.measurements.slice(-1000);
        }
        return measurements;
    }
    /**
     * Get stored measurements
     */
    getMeasurements() {
        return [...this.measurements];
    }
    /**
     * Clear measurement history
     */
    clearHistory() {
        this.measurements = [];
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
/**
 * Create a KPI integration instance
 */
export function createKpiIntegration(config) {
    return new KpiIntegration(config);
}
//# sourceMappingURL=kpi-integration.js.map
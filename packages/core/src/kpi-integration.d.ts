/**
 * KPI Integration for Decision Engine
 *
 * Provides hooks to compute and store KPI metrics after each decision run.
 * Integrates with the warehouse storage for persistence.
 *
 * @module @zeo/core/kpi-integration
 */
import type { DecisionSpec, DecisionResult, KpiMeasurement } from "@zeo/contracts";
import type { KpiWarehouseStorage } from "@zeo/warehouse";
/**
 * KPI computation context
 */
export interface KpiComputationContext {
    /** Decision specification */
    spec: DecisionSpec;
    /** Decision result */
    result: DecisionResult;
    /** Computation timestamp */
    timestamp: string;
    /** Engine options used */
    options?: {
        depth?: number;
        useQuantEngine?: boolean;
    };
}
/**
 * Decision coverage metrics
 */
export interface DecisionCoverageMetrics {
    /** Percentage of actions with complete branch coverage */
    actionCoverage: number;
    /** Percentage of assumptions with provenance */
    assumptionCoverage: number;
    /** Branch depth achieved */
    branchDepth: number;
    /** Number of nodes in branch graph */
    nodeCount: number;
    /** Number of edges in branch graph */
    edgeCount: number;
}
/**
 * Robustness metrics from evaluation
 */
export interface RobustnessMetrics {
    /** Robustness score (0-1) */
    robustnessScore: number;
    /** Number of robust actions identified */
    robustActionCount: number;
    /** Number of fragile assumptions */
    fragileAssumptionCount: number;
    /** Number of dominated actions */
    dominatedActionCount: number;
    /** Percentage of actions that are robust */
    robustActionPercentage: number;
}
/**
 * Calibration metrics (placeholder for future calibration integration)
 */
export interface CalibrationMetrics {
    /** Current calibration score (0-1) */
    calibrationScore: number;
    /** Coverage percentage (how often intervals contain outcomes) */
    coverage: number;
    /** Recommended widen factor based on calibration */
    widenFactor: number;
    /** Number of decisions in calibration history */
    sampleSize: number;
}
/**
 * KPI integration configuration
 */
export interface KpiIntegrationConfig {
    /** Whether to auto-store KPIs after each decision */
    autoStore: boolean;
    /** KPIs to compute and store */
    enabledKpis: {
        decisionCoverage: boolean;
        robustness: boolean;
        calibration: boolean;
    };
    /** Default confidence band for measurements */
    defaultConfidence: {
        low: number;
        high: number;
    };
}
/**
 * Default KPI integration configuration
 */
export declare const DEFAULT_KPI_CONFIG: KpiIntegrationConfig;
/**
 * Compute decision coverage metrics from a decision result
 */
export declare function computeDecisionCoverage(spec: DecisionSpec, result: DecisionResult): DecisionCoverageMetrics;
/**
 * Compute robustness metrics from lens evaluations
 */
export declare function computeRobustnessMetrics(spec: DecisionSpec, result: DecisionResult): RobustnessMetrics;
/**
 * Compute calibration metrics
 * Note: This is a placeholder that returns default values.
 * In production, this would query the calibration system.
 */
export declare function computeCalibrationMetrics(): CalibrationMetrics;
/**
 * Create a KPI measurement for decision coverage
 */
export declare function createDecisionCoverageMeasurement(context: KpiComputationContext, metrics: DecisionCoverageMetrics, config: KpiIntegrationConfig): KpiMeasurement;
/**
 * Create a KPI measurement for robustness score
 */
export declare function createRobustnessMeasurement(context: KpiComputationContext, metrics: RobustnessMetrics, config: KpiIntegrationConfig): KpiMeasurement;
/**
 * Create a KPI measurement for calibration
 */
export declare function createCalibrationMeasurement(context: KpiComputationContext, metrics: CalibrationMetrics, config: KpiIntegrationConfig): KpiMeasurement;
/**
 * Store KPI measurements for a decision run
 */
export declare function storeDecisionKpis(storage: KpiWarehouseStorage, context: KpiComputationContext, config?: KpiIntegrationConfig): Promise<KpiMeasurement[]>;
/**
 * KPI Integration class for managing KPI computation and storage
 */
export declare class KpiIntegration {
    private storage;
    private config;
    private measurements;
    constructor(config?: Partial<KpiIntegrationConfig>);
    /**
     * Initialize the integration with a warehouse storage
     */
    initialize(storage: KpiWarehouseStorage): void;
    /**
     * Check if the integration is initialized
     */
    get isInitialized(): boolean;
    /**
     * Process a decision result and store KPIs
     */
    processDecision(spec: DecisionSpec, result: DecisionResult, options?: {
        depth?: number;
        useQuantEngine?: boolean;
    }): Promise<KpiMeasurement[]>;
    /**
     * Get stored measurements
     */
    getMeasurements(): KpiMeasurement[];
    /**
     * Clear measurement history
     */
    clearHistory(): void;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<KpiIntegrationConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): KpiIntegrationConfig;
}
/**
 * Create a KPI integration instance
 */
export declare function createKpiIntegration(config?: Partial<KpiIntegrationConfig>): KpiIntegration;
//# sourceMappingURL=kpi-integration.d.ts.map
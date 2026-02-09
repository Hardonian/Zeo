
import type {
    UUID,
    ProvenancePointer,
    ProbabilityInterval,
    ConfidenceBand
} from "@zeo/contracts";
import type { KpiMeasurement } from "@zeo/kpi";

/**
 * Signal Discovery Domain Models
 */

/**
 * Type of relationship between signals
 */
export type SignalRelationshipType =
    | "correlation_pearson"
    | "correlation_spearman"
    | "lead_lag_correlation"
    | "regime_conditional_correlation"
    | "event_rate_correlation";

/**
 * Risk bands for signal validity
 */
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskBands {
    confoundingRisk: RiskLevel;
    leakageRisk: RiskLevel;
    dataQuality: RiskLevel;
}

/**
 * Metrics associated with a discovered relationship
 */
export interface SignalMetrics {
    /** Effect size (correlation coefficient r or rho) */
    effectSize: number;

    /** Statistical significance (if applicable) */
    pValue?: number;

    /** Adjusted p-value (Benjamini-Hochberg / FDR) */
    adjustedPValue?: number;

    /** Stability score across time windows (0-1) */
    stabilityScore: number;

    /** Sample size used for calculation */
    sampleSize: number;

    /** Effective sample size (accounting for autocorrelation) */
    effectiveSampleSize?: number;

    /** Uncertainty band for the effect size */
    uncertaintyBand: ProbabilityInterval;

    /** Lag in time steps (for lead-lag) */
    lag?: number;
}

/**
 * A candidate signal discovered in the data.
 * Represents a potential relationship, not necessarily a causal one.
 */
export interface CandidateSignal {
    id: UUID;
    name: string;

    /** The source feature or signal */
    sourceSignalId: string;

    /** The target (e.g., KPI) it relates to */
    targetId: string;

    relationshipType: SignalRelationshipType;

    metrics: SignalMetrics;
    riskBands: RiskBands;

    provenance: ProvenancePointer[];

    /** Explicit disclaimers about causality */
    disclaimers: string[];

    createdAt: string;

    /** Hash for determinism */
    contentHash: string;
}

/**
 * Node in the discovery graph
 */
export interface DiscoveryNode {
    id: string;
    type: "kpi" | "feature" | "event" | "regime" | "decision";
    metadata?: Record<string, unknown>;
}

/**
 * Edge in the discovery graph (representing a CandidateSignal)
 */
export interface DiscoveryEdge {
    source: string;
    target: string;
    signalId: UUID;
    strength: number; // absolute effect size
}

/**
 * Complete discovery graph
 */
export interface SignalDiscoveryGraph {
    nodes: DiscoveryNode[];
    edges: DiscoveryEdge[];
    signals: Map<UUID, CandidateSignal>;
    generatedAt: string;
    configHash: string;
}

/**
 * Configuration for the discovery engine
 */
export interface DiscoveryConfig {
    /** Target KPIs to find signals for */
    targetKpiIds: string[];

    /** Data windows to analyze */
    windows: Array<{ start: string; end: string }>;

    /** Budgets for computation */
    budgets: {
        maxPairs: number;
        maxLags: number;
        maxWindows: number;
    };

    /** Thresholds */
    thresholds: {
        minEffectSize: number;
        maxPValue: number; // raw p-value threshold
        minStability: number;
    };

    /** Control for multiple testing */
    fdrControl: "bh" | "bonferroni" | "none";
}


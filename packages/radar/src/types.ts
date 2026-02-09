
import type {
    UUID,
    ProbabilityInterval,
    ConfidenceBand,
    ProvenancePointer
} from "@zeo/contracts";
import type { CandidateSignal } from "@zeo/signal-discovery";

/**
 * Strategic Radar Domain Models
 */

/**
 * Reason for watching a signal
 */
export type WatchReason =
    | "high_effect_size"
    | "novelty_spike"
    | "near_flip_threshold"
    | "regime_change_indicator"
    | "user_interest";

/**
 * A prioritization score for a signal
 */
export interface SignalPriority {
    score: number; // 0-1

    /** Component scores */
    components: {
        relevance: number;
        urgency: number;
        impact: number;
        uncertainty: number;
    };

    /** Explanation */
    rationale: string[];
}

/**
 * An item on the strategic watchlist
 */
export interface WatchlistItem {
    id: UUID;
    signalId: UUID;

    priority: SignalPriority;

    /** Why this matters */
    significance: string;

    /** Why it might be wrong (epistemic humility) */
    skepticism: string;

    /** Epistemic metadata */
    uncertaintyBand: ProbabilityInterval;
    stabilityScore: number;
    sampleAdequacy: "low" | "medium" | "high";

    /** Recommended next steps */
    recommendedActions: Array<{
        type: "collect_more" | "corroborate" | "falsify";
        description: string;
    }>;

    addedAt: string;
    lastUpdated: string;
}

/**
 * Feeds of important events
 */
export interface RadarFeedEvent {
    id: UUID;
    type: "correlation_shift" | "novelty" | "flip_approach";
    signalId: UUID;
    description: string;
    severity: "info" | "warning" | "critical";
    timestamp: string;
}

/**
 * The full Radar output
 */
export interface StrategicRadar {
    watchlist: WatchlistItem[];
    feed: RadarFeedEvent[];
    generatedAt: string;
    configHash: string;
}

/**
 * Configuration for the Radar
 */
export interface RadarConfig {
    /** User-defined domains of interest */
    domains: string[];

    /** Minimum priority to include in watchlist */
    minPriority: number;

    /** Weights for prioritization */
    weights: {
        relevance: number;
        urgency: number;
        impact: number;
        uncertainty: number;
    };

    /** Max items to return */
    maxItems: number;
}


import type { RegimeEvent, RegimeState, ProbabilityInterval } from "@zeo/contracts";
import type { PosteriorSummary } from "@zeo/models";
export interface RegimeBandConfig {
    transitionMultiplier: number;
    volatilityMultiplier: number;
    stableMultiplier: number;
    maxBandWidth: number;
}
export declare function regimeAwareBandWidth(currentRegime: RegimeState | undefined, config?: Partial<RegimeBandConfig>): number;
export declare function widenPosteriorBand(band: ProbabilityInterval, currentRegime: RegimeState | undefined, config?: Partial<RegimeBandConfig>): ProbabilityInterval;
export declare function widenPosteriors(posteriors: PosteriorSummary[], currentRegime: RegimeState | undefined, config?: Partial<RegimeBandConfig>): PosteriorSummary[];
export interface RegimeAdjustmentRecord {
    variableId: string;
    originalBand: ProbabilityInterval;
    widenedBand: ProbabilityInterval;
    regimeAtAdjustment: RegimeState | undefined;
    adjustmentReason: "transition_detected" | "high_volatility" | "regime_uncertainty";
    timestamp: string;
}
export interface RegimeAwareEvidenceRecord {
    evidencePacketId: string;
    regimeState: RegimeState | undefined;
    regimeEvent: RegimeEvent | undefined;
    adjustments: RegimeAdjustmentRecord[];
    bandwidthMultiplier: number;
    recordedAt: string;
}
export declare function createRegimeAdjustmentRecord(variableId: string, originalBand: ProbabilityInterval, widenedBand: ProbabilityInterval, regime: RegimeState | undefined, reason: RegimeAdjustmentRecord["adjustmentReason"]): RegimeAdjustmentRecord;
export declare function regimeAdjustmentFromBand(originalBand: ProbabilityInterval, widenedBand: ProbabilityInterval, regime: RegimeState | undefined): RegimeAdjustmentRecord["adjustmentReason"];
//# sourceMappingURL=regime-integration.d.ts.map
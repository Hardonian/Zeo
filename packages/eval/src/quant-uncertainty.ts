/**
 * @zeo/eval - Quant Uncertainty Integration
 * 
 * Phase 5: Extends uncertainty ledger with integrations to quant packages:
 * - Time-series uncertainty from change-point detection
 * - Shrinkage-adjusted uncertainty
 * - Information-theoretic redundancy penalties
 * - Robustness sensitivity adjustments
 */

import type { Prediction } from "@zeo/contracts";

import type { UncertaintyLedger, UncertaintyBand, UncertaintyCategory } from "./uncertainty-ledger.js";
import { computeUncertaintyLedger, aggregateUncertainty } from "./uncertainty-ledger.js";

/**
 * Extended uncertainty categories for quant integration
 */
export type ExtendedUncertaintyCategory =
    | UncertaintyCategory
    | "changepoint_instability"
    | "shrinkage_adjustment"
    | "redundancy_penalty"
    | "sensitivity_risk";

/**
 * Extended uncertainty ledger with quant integration
 */
export interface ExtendedUncertaintyLedger extends UncertaintyLedger {
    /** Quant-specific uncertainty components */
    quantComponents?: {
        /** Change-point instability from time-series analysis */
        changepointInstability?: {
            detected: boolean;
            stabilityScore: number;
            adjustmentFactor: number;
        };
        /** Shrinkage adjustment from Bayesian estimation */
        shrinkageAdjustment?: {
            applied: boolean;
            shrinkageFactor: number;
            varianceReduction: number;
        };
        /** Redundancy penalty from information theory */
        redundancyPenalty?: {
            detected: boolean;
            overallRedundancy: number;
            penaltyFactor: number;
        };
        /** Sensitivity risk from robustness analysis */
        sensitivityRisk?: {
            looSensitivity: number;
            windowSensitivity: number;
            combinedRisk: "low" | "medium" | "high";
        };
    };

    /** Quant-adjusted aggregate uncertainty */
    quantAdjustedAggregate?: UncertaintyBand;

    /** Integration metadata */
    integrationMetadata?: {
        quantPackagesUsed: string[];
        computeTimeMs: number;
    };
}

/**
 * Configuration for quant uncertainty integration
 */
export interface QuantUncertaintyConfig {
    /** Enable change-point instability component */
    enableChangepointAdjustment: boolean;
    changepointWeight: number;

    /** Enable shrinkage adjustment component */
    enableShrinkageAdjustment: boolean;
    shrinkageWeight: number;

    /** Enable redundancy penalty component */
    enableRedundancyPenalty: boolean;
    redundancyWeight: number;

    /** Enable sensitivity risk component */
    enableSensitivityRisk: boolean;
    sensitivityWeight: number;

    /** Scaling for quant adjustments */
    quantAdjustmentScale: number;

    /** Maximum quant-induced uncertainty */
    maxQuantUncertainty: number;
}

/**
 * Default quant uncertainty config
 */
export function createDefaultQuantConfig(): QuantUncertaintyConfig {
    return {
        enableChangepointAdjustment: true,
        changepointWeight: 0.15,
        enableShrinkageAdjustment: true,
        shrinkageWeight: 0.1,
        enableRedundancyPenalty: true,
        redundancyWeight: 0.1,
        enableSensitivityRisk: true,
        sensitivityWeight: 0.15,
        quantAdjustmentScale: 1.0,
        maxQuantUncertainty: 0.3,
    };
}

/**
 * Change-point analysis results (from @zeo/quant-timeseries)
 */
export interface ChangePointInput {
    candidates: Array<{ index: number; score: number }>;
    stabilityScore: number;
}

/**
 * Shrinkage analysis results (from @zeo/bayes-shrinkage)
 */
export interface ShrinkageInput {
    shrinkageFactor: number;
    varianceReduction: number;
    averageShrinkage: number;
}

/**
 * Redundancy analysis results (from @zeo/info-theory)
 */
export interface RedundancyInput {
    overallRedundancy: number;
    redundantFeatureCount: number;
    totalFeatureCount: number;
}

/**
 * Sensitivity analysis results (from @zeo/robustness)
 */
export interface SensitivityInput {
    looSensitivity?: {
        coefficientOfVariation: number;
        maxDeviation: number;
        isStable: boolean;
    };
    windowSensitivity?: {
        cv: number;
        isStable: boolean;
    };
}

/**
 * Compute change-point instability component
 */
export function computeChangepointUncertainty(
    input: ChangePointInput | undefined,
    config: QuantUncertaintyConfig
): UncertaintyBand | null {
    if (!input || !config.enableChangepointAdjustment) {
        return null;
    }

    // Inverse of stability score = instability
    const instability = 1 - input.stabilityScore;

    // Scale by number of change-points
    const cpPenalty = Math.min(1, input.candidates.length * 0.2);

    // Combined uncertainty
    const baseWidth = (instability * 0.5 + cpPenalty * 0.5) * config.changepointWeight * config.quantAdjustmentScale;
    const clampedWidth = Math.min(baseWidth, config.maxQuantUncertainty);

    return {
        low: -clampedWidth,
        high: clampedWidth,
        confidence: 0.9,
    };
}

/**
 * Compute shrinkage adjustment component
 * Lower shrinkage = higher uncertainty (estimates are noisy)
 */
export function computeShrinkageUncertainty(
    input: ShrinkageInput | undefined,
    config: QuantUncertaintyConfig
): UncertaintyBand | null {
    if (!input || !config.enableShrinkageAdjustment) {
        return null;
    }

    // High shrinkage = estimates were noisy, need adjustment
    // But high variance reduction = good, reduces uncertainty
    const shrinkageRisk = input.averageShrinkage * (1 - input.varianceReduction);

    const baseWidth = shrinkageRisk * config.shrinkageWeight * config.quantAdjustmentScale;
    const clampedWidth = Math.min(baseWidth, config.maxQuantUncertainty);

    return {
        low: -clampedWidth,
        high: clampedWidth,
        confidence: 0.9,
    };
}

/**
 * Compute redundancy penalty component
 * High redundancy = features provide overlapping information, less reliable
 */
export function computeRedundancyUncertainty(
    input: RedundancyInput | undefined,
    config: QuantUncertaintyConfig
): UncertaintyBand | null {
    if (!input || !config.enableRedundancyPenalty) {
        return null;
    }

    // Penalty based on redundancy level
    const redundancyPenalty = input.overallRedundancy;

    // Additional penalty if many features are redundant
    const featureRatio = input.totalFeatureCount > 0
        ? input.redundantFeatureCount / input.totalFeatureCount
        : 0;

    const combinedPenalty = (redundancyPenalty * 0.6 + featureRatio * 0.4);

    const baseWidth = combinedPenalty * config.redundancyWeight * config.quantAdjustmentScale;
    const clampedWidth = Math.min(baseWidth, config.maxQuantUncertainty);

    return {
        low: -clampedWidth,
        high: clampedWidth,
        confidence: 0.9,
    };
}

/**
 * Compute sensitivity risk component
 */
export function computeSensitivityUncertainty(
    input: SensitivityInput | undefined,
    config: QuantUncertaintyConfig
): UncertaintyBand | null {
    if (!input || !config.enableSensitivityRisk) {
        return null;
    }

    let risk = 0;
    let count = 0;

    if (input.looSensitivity) {
        // CV > 0.1 indicates sensitivity concerns
        const looRisk = Math.min(1, input.looSensitivity.coefficientOfVariation * 5);
        risk += looRisk;
        count++;
    }

    if (input.windowSensitivity) {
        const windowRisk = Math.min(1, input.windowSensitivity.cv * 3);
        risk += windowRisk;
        count++;
    }

    if (count === 0) return null;

    const avgRisk = risk / count;
    const baseWidth = avgRisk * config.sensitivityWeight * config.quantAdjustmentScale;
    const clampedWidth = Math.min(baseWidth, config.maxQuantUncertainty);

    return {
        low: -clampedWidth,
        high: clampedWidth,
        confidence: 0.9,
    };
}

/**
 * Compute extended uncertainty ledger with quant integrations
 */
export function computeExtendedUncertaintyLedger(
    prediction: Prediction,
    quantInputs?: {
        changepoint?: ChangePointInput;
        shrinkage?: ShrinkageInput;
        redundancy?: RedundancyInput;
        sensitivity?: SensitivityInput;
    },
    quantConfig?: Partial<QuantUncertaintyConfig>
): ExtendedUncertaintyLedger {
    const startTime = Date.now();
    const config = { ...createDefaultQuantConfig(), ...quantConfig };

    // First, compute base uncertainty ledger
    const baseLedger = computeUncertaintyLedger(prediction);

    // Compute quant components
    const changepointUncertainty = computeChangepointUncertainty(quantInputs?.changepoint, config);
    const shrinkageUncertainty = computeShrinkageUncertainty(quantInputs?.shrinkage, config);
    const redundancyUncertainty = computeRedundancyUncertainty(quantInputs?.redundancy, config);
    const sensitivityUncertainty = computeSensitivityUncertainty(quantInputs?.sensitivity, config);

    // Build quant components summary
    const quantComponents: ExtendedUncertaintyLedger["quantComponents"] = {};
    const quantPackagesUsed: string[] = [];

    if (quantInputs?.changepoint) {
        quantComponents.changepointInstability = {
            detected: quantInputs.changepoint.candidates.length > 0,
            stabilityScore: quantInputs.changepoint.stabilityScore,
            adjustmentFactor: changepointUncertainty?.high ?? 0,
        };
        quantPackagesUsed.push("@zeo/quant-timeseries");
    }

    if (quantInputs?.shrinkage) {
        quantComponents.shrinkageAdjustment = {
            applied: true,
            shrinkageFactor: quantInputs.shrinkage.shrinkageFactor,
            varianceReduction: quantInputs.shrinkage.varianceReduction,
        };
        quantPackagesUsed.push("@zeo/bayes-shrinkage");
    }

    if (quantInputs?.redundancy) {
        quantComponents.redundancyPenalty = {
            detected: quantInputs.redundancy.overallRedundancy > 0.3,
            overallRedundancy: quantInputs.redundancy.overallRedundancy,
            penaltyFactor: redundancyUncertainty?.high ?? 0,
        };
        quantPackagesUsed.push("@zeo/info-theory");
    }

    if (quantInputs?.sensitivity) {
        const combinedRisk = (quantInputs.sensitivity.looSensitivity?.isStable ?? true) &&
            (quantInputs.sensitivity.windowSensitivity?.isStable ?? true)
            ? "low" as const
            : (!quantInputs.sensitivity.looSensitivity?.isStable && !quantInputs.sensitivity.windowSensitivity?.isStable)
                ? "high" as const
                : "medium" as const;

        quantComponents.sensitivityRisk = {
            looSensitivity: quantInputs.sensitivity.looSensitivity?.coefficientOfVariation ?? 0,
            windowSensitivity: quantInputs.sensitivity.windowSensitivity?.cv ?? 0,
            combinedRisk,
        };
        quantPackagesUsed.push("@zeo/robustness");
    }

    // Aggregate all uncertainty (base + quant)
    const allCategories: Partial<Record<string, UncertaintyBand>> = { ...baseLedger.categories };

    if (changepointUncertainty) {
        allCategories["changepoint_instability"] = changepointUncertainty;
    }
    if (shrinkageUncertainty) {
        allCategories["shrinkage_adjustment"] = shrinkageUncertainty;
    }
    if (redundancyUncertainty) {
        allCategories["redundancy_penalty"] = redundancyUncertainty;
    }
    if (sensitivityUncertainty) {
        allCategories["sensitivity_risk"] = sensitivityUncertainty;
    }

    // Compute quant-adjusted aggregate
    const quantAdjustedAggregate = aggregateUncertainty(
        allCategories as Partial<Record<UncertaintyCategory, UncertaintyBand>>,
        baseLedger.metadata.computationMethod
    );

    const extendedLedger: ExtendedUncertaintyLedger = {
        ...baseLedger,
        quantComponents,
        quantAdjustedAggregate,
        integrationMetadata: {
            quantPackagesUsed,
            computeTimeMs: Date.now() - startTime,
        },
    };
    return extendedLedger;
}

/**
 * Create summary of extended uncertainty ledger
 */
export function createExtendedLedgerSummary(ledger: ExtendedUncertaintyLedger): {
    baseUncertainty: string;
    quantAdjustedUncertainty: string;
    quantFactors: string[];
    recommendations: string[];
} {
    const baseUncertainty = ledger.total
        ? `±${((ledger.total.high - ledger.total.low) / 2).toFixed(3)}`
        : "N/A";

    const quantAdjustedUncertainty = ledger.quantAdjustedAggregate
        ? `±${((ledger.quantAdjustedAggregate.high - ledger.quantAdjustedAggregate.low) / 2).toFixed(3)}`
        : baseUncertainty;

    const quantFactors: string[] = [];
    const recommendations: string[] = [];

    if (ledger.quantComponents?.changepointInstability?.detected) {
        quantFactors.push(`Change-point instability (stability: ${(ledger.quantComponents.changepointInstability.stabilityScore * 100).toFixed(0)}%)`);
        recommendations.push("Review recent structural changes in time series");
    }

    if (ledger.quantComponents?.shrinkageAdjustment?.applied) {
        quantFactors.push(`Shrinkage applied (factor: ${ledger.quantComponents.shrinkageAdjustment.shrinkageFactor.toFixed(2)})`);
        if (ledger.quantComponents.shrinkageAdjustment.varianceReduction > 0.3) {
            recommendations.push("High shrinkage indicates noisy source data");
        }
    }

    if (ledger.quantComponents?.redundancyPenalty?.detected) {
        quantFactors.push(`Redundancy detected (${(ledger.quantComponents.redundancyPenalty.overallRedundancy * 100).toFixed(0)}%)`);
        recommendations.push("Consider feature selection to reduce redundancy");
    }

    if (ledger.quantComponents?.sensitivityRisk?.combinedRisk !== "low") {
        quantFactors.push(`Sensitivity risk: ${ledger.quantComponents?.sensitivityRisk?.combinedRisk}`);
        recommendations.push("Estimate may be sensitive to specific observations or time windows");
    }

    if (quantFactors.length === 0) {
        quantFactors.push("No significant quant adjustments applied");
    }

    return {
        baseUncertainty,
        quantAdjustedUncertainty,
        quantFactors,
        recommendations,
    };
}

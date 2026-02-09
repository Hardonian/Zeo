/**
 * Calibration Feedback Application
 *
 * Applies calibration widen factors to prediction bands.
 * v0.3.1: Only widen, never narrow.
 */
import type { Prediction, RecommendedUncertaintyAdjustment } from "@zeo/contracts";
/**
 * Configuration for calibration mode.
 */
export type CalibrationModeConfig = {
    enabled: boolean;
    widenFactorByDomain: Record<string, number>;
    widenFactorDefault: number;
    sourceDatasetId?: string;
    sourceReportHash?: string;
};
/**
 * Apply calibration widen factors to a prediction.
 *
 * Rules:
 * - Only widen (factor >= 1.0), never narrow
 * - Centers widen on the original band center
 * - Preserves original meanHint
 * - Records adjustment in provenance
 *
 * @param prediction - The original prediction
 * @param domain - The domain this prediction belongs to
 * @param config - Calibration configuration
 * @returns Widen-adjusted prediction
 */
export declare function applyCalibrationWiden(prediction: Prediction, domain: string, config: CalibrationModeConfig): Prediction;
/**
 * Create calibration configuration from a recommended adjustment.
 */
export declare function configFromRecommendation(recommendation: RecommendedUncertaintyAdjustment, sourceDatasetId?: string, sourceReportHash?: string): CalibrationModeConfig;
/**
 * Apply calibration to an array of predictions.
 *
 * @param predictions - Array of predictions
 * @param domainResolver - Function to resolve domain for each prediction
 * @param config - Calibration configuration
 * @returns Array of (possibly) widened predictions
 */
export declare function applyCalibrationToPredictions(predictions: Prediction[], domainResolver: (prediction: Prediction) => string, config: CalibrationModeConfig): Prediction[];
/**
 * Create a widen-adjusted band directly.
 * Useful for adjusting latent variable posteriors.
 *
 * @param originalBand - Original band
 * @param widenFactor - Factor to widen by
 * @returns Widen-adjusted band
 */
export declare function widenBand(originalBand: {
    low: number;
    high: number;
}, widenFactor: number): {
    low: number;
    high: number;
};
/**
 * Check if calibration would change a prediction.
 */
export declare function wouldCalibrationChange(prediction: Prediction, domain: string, config: CalibrationModeConfig): boolean;
//# sourceMappingURL=calibration-feedback.d.ts.map

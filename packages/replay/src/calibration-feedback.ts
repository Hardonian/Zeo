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
export function applyCalibrationWiden(
  prediction: Prediction,
  domain: string,
  config: CalibrationModeConfig
): Prediction {
  if (!config.enabled) {
    return prediction;
  }

  // Get widen factor for domain, or default
  const widenFactor = config.widenFactorByDomain[domain] ?? config.widenFactorDefault;

  // v0.3.1: Only widen, never narrow
  if (widenFactor <= 1.0) {
    return prediction;
  }

  // Compute widened band centered on original center
  const originalBand = prediction.band;
  const center = (originalBand.low + originalBand.high) / 2;
  const originalWidth = originalBand.high - originalBand.low;
  const newWidth = originalWidth * widenFactor;

  const widenedBand = {
    low: Math.max(0, center - newWidth / 2),
    high: Math.min(1, center + newWidth / 2),
  };

  // Build provenance ref for the adjustment
  const adjustmentRef = `calibration_widen:${domain}:${widenFactor.toFixed(2)}`;
  const sourceRef = config.sourceDatasetId
    ? `source:${config.sourceDatasetId}:${config.sourceReportHash ?? "unknown"}`
    : "source:unspecified";

  return {
    ...prediction,
    band: widenedBand,
    provenanceRefs: [...prediction.provenanceRefs, adjustmentRef, sourceRef],
    // Note: meanHint is intentionally NOT adjusted - it's the original estimate
  };
}

/**
 * Create calibration configuration from a recommended adjustment.
 */
export function configFromRecommendation(
  recommendation: RecommendedUncertaintyAdjustment,
  sourceDatasetId?: string,
  sourceReportHash?: string
): CalibrationModeConfig {
  return {
    enabled: true,
    widenFactorByDomain: recommendation.widenFactorByDomain,
    widenFactorDefault: recommendation.widenFactorOverall,
    sourceDatasetId,
    sourceReportHash,
  };
}

/**
 * Apply calibration to an array of predictions.
 *
 * @param predictions - Array of predictions
 * @param domainResolver - Function to resolve domain for each prediction
 * @param config - Calibration configuration
 * @returns Array of (possibly) widened predictions
 */
export function applyCalibrationToPredictions(
  predictions: Prediction[],
  domainResolver: (prediction: Prediction) => string,
  config: CalibrationModeConfig
): Prediction[] {
  if (!config.enabled) {
    return predictions;
  }

  return predictions.map(p => applyCalibrationWiden(p, domainResolver(p), config));
}

/**
 * Create a widen-adjusted band directly.
 * Useful for adjusting latent variable posteriors.
 *
 * @param originalBand - Original band
 * @param widenFactor - Factor to widen by
 * @returns Widen-adjusted band
 */
export function widenBand(
  originalBand: { low: number; high: number },
  widenFactor: number
): { low: number; high: number } {
  // v0.3.1: Only widen, never narrow
  if (widenFactor <= 1.0) {
    return originalBand;
  }

  const center = (originalBand.low + originalBand.high) / 2;
  const originalWidth = originalBand.high - originalBand.low;
  const newWidth = originalWidth * widenFactor;

  return {
    low: Math.max(0, center - newWidth / 2),
    high: Math.min(1, center + newWidth / 2),
  };
}

/**
 * Check if calibration would change a prediction.
 */
export function wouldCalibrationChange(
  prediction: Prediction,
  domain: string,
  config: CalibrationModeConfig
): boolean {
  if (!config.enabled) {
    return false;
  }

  const widenFactor = config.widenFactorByDomain[domain] ?? config.widenFactorDefault;
  return widenFactor > 1.0;
}

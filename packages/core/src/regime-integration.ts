import type {
  RegimeEvent,
  RegimeState,
  ProbabilityInterval,
} from "@zeo/contracts";
import type { PosteriorSummary } from "@zeo/models";

export interface RegimeBandConfig {
  transitionMultiplier: number;
  volatilityMultiplier: number;
  stableMultiplier: number;
  maxBandWidth: number;
}

const defaultConfig: RegimeBandConfig = {
  transitionMultiplier: 2.0,
  volatilityMultiplier: 1.5,
  stableMultiplier: 1.0,
  maxBandWidth: 0.95,
};

export function regimeAwareBandWidth(
  currentRegime: RegimeState | undefined,
  config: Partial<RegimeBandConfig> = {}
): number {
  const cfg = { ...defaultConfig, ...config };

  if (!currentRegime) {
    return cfg.stableMultiplier;
  }

  switch (currentRegime.currentLabel) {
    case "stable":
      return cfg.stableMultiplier;
    case "transition":
      return cfg.transitionMultiplier;
    case "volatile":
      return cfg.volatilityMultiplier;
    case "unknown":
    default:
      return cfg.stableMultiplier;
  }
}

export function widenPosteriorBand(
  band: ProbabilityInterval,
  currentRegime: RegimeState | undefined,
  config: Partial<RegimeBandConfig> = {}
): ProbabilityInterval {
  const cfg = { ...defaultConfig, ...config };
  const multiplier = regimeAwareBandWidth(currentRegime, cfg);

  const currentWidth = band.high - band.low;
  const targetWidth = Math.min(
    currentWidth * multiplier,
    cfg.maxBandWidth
  );

  const center = (band.high + band.low) / 2;
  const halfWidth = targetWidth / 2;

  return {
    low: Math.max(0, center - halfWidth),
    high: Math.min(1, center + halfWidth),
  };
}

export function widenPosteriors(
  posteriors: PosteriorSummary[],
  currentRegime: RegimeState | undefined,
  config: Partial<RegimeBandConfig> = {}
): PosteriorSummary[] {
  return posteriors.map(p => ({
    ...p,
    credibleInterval: widenPosteriorBand(p.credibleInterval, currentRegime, config),
  }));
}

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

export function createRegimeAdjustmentRecord(
  variableId: string,
  originalBand: ProbabilityInterval,
  widenedBand: ProbabilityInterval,
  regime: RegimeState | undefined,
  reason: RegimeAdjustmentRecord["adjustmentReason"]
): RegimeAdjustmentRecord {
  return {
    variableId,
    originalBand,
    widenedBand,
    regimeAtAdjustment: regime,
    adjustmentReason: reason,
    timestamp: new Date().toISOString(),
  };
}

export function regimeAdjustmentFromBand(
  originalBand: ProbabilityInterval,
  widenedBand: ProbabilityInterval,
  regime: RegimeState | undefined
): RegimeAdjustmentRecord["adjustmentReason"] {
  if (!regime) {
    return "regime_uncertainty";
  }

  if (regime.currentLabel === "transition") {
    return "transition_detected";
  }

  if (regime.currentLabel === "volatile") {
    return "high_volatility";
  }

  return "regime_uncertainty";
}

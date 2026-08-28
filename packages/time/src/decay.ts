/**
 * Memory Decay Engine
 *
 * Applies deterministic, explainable decay to evidence and signals.
 */

import type {
  DecayModel,
  DecayConfig,
  DecayResult,
  TemporalMetadata,
  EvidenceTemporalStatus,
  StepThreshold,
  DecayParameters
} from "./types.js";

export function applyDecay(
  weight: number,
  temporalMetadata: TemporalMetadata,
  referenceTime: Date = new Date()
): DecayResult {
  const ageMs = referenceTime.getTime() - temporalMetadata.observedAt.getTime();

  if (temporalMetadata.validUntil && referenceTime > temporalMetadata.validUntil) {
    return {
      originalWeight: weight,
      decayedWeight: 0,
      decayFactor: 0,
      ageMs,
      appliedModel: "step"
    };
  }

  const decayFactor = computeDecayFactor(
    ageMs,
    temporalMetadata.decayModel,
    temporalMetadata.decayParameters
  );

  return {
    originalWeight: weight,
    decayedWeight: weight * decayFactor,
    decayFactor,
    ageMs,
    appliedModel: temporalMetadata.decayModel
  };
}

export function computeDecayFactor(
  ageMs: number,
  model: DecayModel,
  parameters?: DecayParameters
): number {
  switch (model) {
    case "none":
      return 1.0;

    case "exponential": {
      const halfLifeMs = (parameters?.halfLifeMs as number | undefined) ?? 86400000;
      if (halfLifeMs <= 0) return 1.0;
      return Math.exp(-ageMs / halfLifeMs);
    }

    case "step": {
      const defaultThresholds: StepThreshold[] = [
        { ageMs: 86400000, decayFactor: 1.0 },
        { ageMs: 604800000, decayFactor: 0.5 },
        { ageMs: 2592000000, decayFactor: 0.1 }
      ];

      let thresholds: StepThreshold[];
      if (parameters && 'stepThresholds' in parameters && Array.isArray(parameters.stepThresholds)) {
        thresholds = parameters.stepThresholds as StepThreshold[];
      } else {
        thresholds = defaultThresholds;
      }

      let factor = 0;
      for (const threshold of thresholds) {
        if (ageMs >= threshold.ageMs) {
          factor = threshold.decayFactor;
        } else {
          break;
        }
      }
      return factor;
    }

    case "domain_specific": {
      if (parameters && 'domainFormula' in parameters && typeof parameters.domainFormula === 'function') {
        const domainFn = parameters.domainFormula as (ageMs: number, params: Record<string, number>) => number;
        const numericParams: Record<string, number> = {};
        for (const [key, value] of Object.entries(parameters)) {
          if (typeof value === 'number') {
            numericParams[key] = value;
          }
        }
        return domainFn(ageMs, numericParams);
      }
      return 1.0;
    }

    default:
      return 1.0;
  }
}

export function isExpired(
  temporalMetadata: TemporalMetadata,
  referenceTime: Date = new Date()
): boolean {
  if (temporalMetadata.validUntil) {
    return referenceTime > temporalMetadata.validUntil;
  }
  return false;
}

export function isStale(
  temporalMetadata: TemporalMetadata,
  thresholdMs: number = 604800000,
  referenceTime: Date = new Date()
): boolean {
  const ageMs = referenceTime.getTime() - temporalMetadata.observedAt.getTime();
  return ageMs > thresholdMs;
}

export function getEvidenceTemporalStatus(
  evidenceId: string,
  temporalMetadata: TemporalMetadata,
  config?: {
    staleThresholdMs?: number;
    referenceTime?: Date;
  }
): EvidenceTemporalStatus {
  const referenceTime = config?.referenceTime ?? new Date();
  const staleThresholdMs = config?.staleThresholdMs ?? 604800000;

  const ageMs = referenceTime.getTime() - temporalMetadata.observedAt.getTime();
  const decayFactor = computeDecayFactor(
    ageMs,
    temporalMetadata.decayModel,
    temporalMetadata.decayParameters
  );

  const expired = isExpired(temporalMetadata, referenceTime);
  const stale = isStale(temporalMetadata, staleThresholdMs, referenceTime);

  let stalenessReason: string | undefined;
  if (expired) {
    stalenessReason = "Evidence has exceeded its validUntil timestamp";
  } else if (stale) {
    stalenessReason = `Evidence is older than threshold (${(ageMs / 86400000).toFixed(1)} days)`;
  }

  return {
    evidenceId,
    temporalMetadata,
    currentDecayFactor: decayFactor,
    isStale: stale,
    isExpired: expired,
    stalenessReason
  };
}

export function batchApplyDecay<T extends { weight: number; temporalMetadata: TemporalMetadata }>(
  items: T[],
  referenceTime: Date = new Date()
): Array<{ item: T; result: DecayResult }> {
  return items.map(item => ({
    item,
    result: applyDecay(item.weight, item.temporalMetadata, referenceTime)
  }));
}

export function createDecayConfig(
  model: DecayModel,
  options?: {
    halfLifeMs?: number;
    stepThresholds?: Array<{ ageMs: number; decayFactor: number }>;
  }
): DecayConfig {
  return {
    model,
    halfLifeMs: options?.halfLifeMs,
    stepThresholds: options?.stepThresholds
  };
}

export const DEFAULT_DECAY_CONFIGS: Record<string, DecayConfig> = {
  market: {
    model: "exponential",
    halfLifeMs: 3600000
  },
  news: {
    model: "exponential",
    halfLifeMs: 86400000
  },
  macro: {
    model: "step",
    stepThresholds: [
      { ageMs: 2592000000, decayFactor: 1.0 },
      { ageMs: 7776000000, decayFactor: 0.5 },
      { ageMs: 31536000000, decayFactor: 0.1 }
    ]
  },
  persistent: {
    model: "none"
  }
};


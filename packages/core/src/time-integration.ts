/**
 * Time Integration
 * 
 * Connects @zeo/time to evidence and signal processing.
 * Applies temporal decay to evidence and ensures temporal consistency.
 */

import type { EvidenceEvent } from "@zeo/contracts";
import type { TemporalMetadata, DecayConfig, TemporalContext } from "@zeo/time";
import { applyDecay, createTemporalContext, validateTemporalAlignment } from "@zeo/time";

export interface EvidenceWithTemporalMetadata {
  evidence: EvidenceEvent;
  temporalMetadata: TemporalMetadata;
  reliability: number;
}

/**
 * Apply temporal decay to evidence array.
 * Returns evidence weighted by current reliability.
 */
export function applyTemporalDecayToEvidence(
  evidence: Array<{ evidence: EvidenceEvent; temporalMetadata: TemporalMetadata; weight: number }>,
  asOf: Date
): Array<{ evidence: EvidenceEvent; temporalMetadata: TemporalMetadata; reliability: number; decayedWeight: number }> {
  return evidence.map(e => {
    const result = applyDecay(e.weight, e.temporalMetadata, asOf);
    return { 
      evidence: e.evidence, 
      temporalMetadata: e.temporalMetadata, 
      reliability: result.decayFactor,
      decayedWeight: result.decayedWeight
    };
  });
}

/**
 * Filter out stale evidence below reliability threshold.
 */
export function filterStaleEvidence<T extends { reliability: number }>(
  evidence: T[],
  threshold: number = 0.1
): T[] {
  return evidence.filter(e => e.reliability >= threshold);
}

/**
 * Enforce temporal consistency for decision.
 * Throws if any evidence is from the future.
 */
export function enforceTemporalConsistency(
  decisionAsOf: Date,
  evidence: Array<{ temporalMetadata: TemporalMetadata }>
): void {
  const temporalContext = createTemporalContext(decisionAsOf);
  
  const items = evidence.map((e, i) => ({
    id: `evidence-${i}`,
    temporalMetadata: e.temporalMetadata,
    weight: 1
  }));
  
  const validation = validateTemporalAlignment(items, temporalContext);
  
  if (!validation.aligned) {
    throw new TemporalInconsistencyError(
      `Temporal consistency violation: ${validation.issues.join("; ")}`
    );
  }
}

/**
 * Create default decay config for evidence type.
 */
export function createDefaultDecayConfig(
  evidenceType: string
): DecayConfig {
  switch (evidenceType) {
    case "contract":
      return {
        model: "step",
        stepThresholds: [
          { ageMs: 31536000000, decayFactor: 1.0 }, // 1 year
          { ageMs: 63072000000, decayFactor: 0.5 }, // 2 years
        ]
      };
    case "market":
      return {
        model: "exponential",
        halfLifeMs: 3600000 // 1 hour
      };
    case "news":
      return {
        model: "exponential",
        halfLifeMs: 86400000 // 24 hours
      };
    case "relationship":
      return {
        model: "exponential",
        halfLifeMs: 604800000 // 1 week
      };
    default:
      return {
        model: "exponential",
        halfLifeMs: 604800000 // 1 week
      };
  }
}

/**
 * Error thrown when temporal consistency is violated.
 */
export class TemporalInconsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemporalInconsistencyError";
  }
}

export { applyDecay, createTemporalContext, validateTemporalAlignment } from "@zeo/time";
export type { TemporalMetadata, DecayConfig, TemporalContext } from "@zeo/time";

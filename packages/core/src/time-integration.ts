/**
 * Time Integration
 * 
 * Connects @zeo/time to evidence and signal processing.
 * Applies temporal decay to evidence and ensures temporal consistency.
 */

import type { EvidenceEvent } from "@zeo/contracts";
import type { TimeStampedEvidence, DecayModel, TemporalContext } from "@zeo/time";
import { computeCurrentReliability, assertTemporalConsistency } from "@zeo/time";

export interface EvidenceWithTemporalMetadata {
  evidence: EvidenceEvent;
  temporalMetadata: {
    capturedAt: string;
    decayModel: DecayModel;
    reliability: number;
  };
}

/**
 * Apply temporal decay to evidence array.
 * Returns evidence weighted by current reliability.
 */
export function applyTemporalDecayToEvidence(
  evidence: TimeStampedEvidence[],
  asOf: string
): Array<{ evidence: TimeStampedEvidence; reliability: number }> {
  return evidence.map(e => {
    const reliability = computeCurrentReliability(e, asOf);
    return { evidence: e, reliability };
  });
}

/**
 * Filter out stale evidence below reliability threshold.
 */
export function filterStaleEvidence(
  evidence: Array<{ evidence: TimeStampedEvidence; reliability: number }>,
  threshold: number = 0.1
): Array<{ evidence: TimeStampedEvidence; reliability: number }> {
  return evidence.filter(e => e.reliability >= threshold);
}

/**
 * Enforce temporal consistency for decision.
 * Throws if any evidence is from the future.
 */
export function enforceTemporalConsistency(
  decisionAsOf: string,
  evidence: TimeStampedEvidence[]
): void {
  assertTemporalConsistency(decisionAsOf, evidence);
}

/**
 * Create default decay model for evidence type.
 */
export function createDefaultDecayModel(
  evidenceType: string
): DecayModel {
  switch (evidenceType) {
    case "contract":
      return {
        type: "step",
        halfLifeHours: 8760, // 1 year (but step is binary)
        floor: 0,
        ceiling: 1,
      };
    case "market":
      return {
        type: "exponential",
        halfLifeHours: 1,
        floor: 0.3,
        ceiling: 1,
      };
    case "news":
      return {
        type: "exponential",
        halfLifeHours: 24,
        floor: 0.1,
        ceiling: 1,
      };
    case "relationship":
      return {
        type: "sigmoid",
        halfLifeHours: 168, // 1 week
        floor: 0.2,
        ceiling: 1,
      };
    default:
      return {
        type: "exponential",
        halfLifeHours: 168,
        floor: 0.2,
        ceiling: 1,
      };
  }
}

export { computeCurrentReliability, assertTemporalConsistency } from "@zeo/time";
export type { TimeStampedEvidence, DecayModel, TemporalContext } from "@zeo/time";

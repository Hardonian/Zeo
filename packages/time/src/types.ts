/**
 * Time Semantics & Memory Decay Types
 *
 * Prevents stale evidence and temporal misalignment.
 */

export type DecayModel =
  | "none"
  | "exponential"
  | "step"
  | "domain_specific";

export interface TemporalMetadata {
  observedAt: Date;
  validUntil?: Date;
  decayModel: DecayModel;
  decayParameters?: DecayParameters;
  sourceTimestamp?: Date;
  ingestedAt: Date;
}

export type DecayParameters = Record<string, number | DomainFormula | StepThreshold[] | undefined>;

export interface StepThreshold {
  ageMs: number;
  decayFactor: number;
}

export type DomainFormula = (ageMs: number, params: Record<string, number>) => number;

export interface DecayConfig {
  model: DecayModel;
  halfLifeMs?: number;
  stepThresholds?: StepThreshold[];
  domainFormula?: DomainFormula;
}

export interface DecayResult {
  originalWeight: number;
  decayedWeight: number;
  decayFactor: number;
  ageMs: number;
  appliedModel: DecayModel;
}

export interface TimeConsistencyCheck {
  checkType: "preference_reversal" | "horizon_mismatch" | "option_value_decay";
  severity: "info" | "warning" | "critical";
  description: string;
  affectedEvidenceIds: string[];
  recommendation: string;
}

export interface TimeConsistencyReport {
  checks: TimeConsistencyCheck[];
  timestamp: Date;
  evidenceAnalyzed: number;
  violationsFound: number;
}

export interface TemporalContext {
  decisionTime: Date;
  evidenceHorizon: Date;
  forecastHorizon?: Date;
  referenceTime: Date;
}

export interface EvidenceTemporalStatus {
  evidenceId: string;
  temporalMetadata: TemporalMetadata;
  currentDecayFactor: number;
  isStale: boolean;
  isExpired: boolean;
  stalenessReason?: string;
}


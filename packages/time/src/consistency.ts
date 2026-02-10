/**
 * Time Consistency Checks
 * 
 * Detects preference reversals, horizon mismatches, and option value decay.
 */

import type { 
  TimeConsistencyCheck, 
  TimeConsistencyReport,
  TemporalContext,
  TemporalMetadata 
} from "./types.js";

export interface EvidenceItem {
  id: string;
  temporalMetadata: TemporalMetadata;
  weight: number;
  value?: number;
}

export interface DecisionHistory {
  decisionId: string;
  timestamp: Date;
  chosenOption: string;
  rejectedOptions: string[];
  valueFunctionId: string;
}

export function runTimeConsistencyChecks(
  evidence: EvidenceItem[],
  temporalContext: TemporalContext,
  decisionHistory?: DecisionHistory[]
): TimeConsistencyReport {
  const checks: TimeConsistencyCheck[] = [];
  
  const horizonCheck = checkHorizonMismatch(evidence, temporalContext);
  if (horizonCheck) checks.push(horizonCheck);
  
  const reversalCheck = checkPreferenceReversal(evidence, decisionHistory);
  if (reversalCheck) checks.push(reversalCheck);
  
  const optionValueCheck = checkOptionValueDecay(evidence, temporalContext);
  if (optionValueCheck) checks.push(optionValueCheck);
  
  return {
    checks,
    timestamp: new Date(),
    evidenceAnalyzed: evidence.length,
    violationsFound: checks.filter(c => c.severity !== "info").length
  };
}

function checkHorizonMismatch(
  evidence: EvidenceItem[],
  temporalContext: TemporalContext
): TimeConsistencyCheck | null {
  const horizon = temporalContext.forecastHorizon;
  if (!horizon) return null;
  
  const outdatedEvidence = evidence.filter(e => {
    const evidenceAge = temporalContext.decisionTime.getTime() - e.temporalMetadata.observedAt.getTime();
    const forecastWindow = horizon.getTime() - temporalContext.decisionTime.getTime();
    return evidenceAge > forecastWindow * 2;
  });
  
  if (outdatedEvidence.length === 0) return null;
  
  return {
    checkType: "horizon_mismatch",
    severity: outdatedEvidence.length > evidence.length / 2 ? "critical" : "warning",
    description: `${outdatedEvidence.length} evidence items are older than the forecast horizon window`,
    affectedEvidenceIds: outdatedEvidence.map(e => e.id),
    recommendation: "Consider refreshing outdated evidence or adjusting forecast horizon"
  };
}

function checkPreferenceReversal(
  evidence: EvidenceItem[],
  decisionHistory?: DecisionHistory[]
): TimeConsistencyCheck | null {
  if (!decisionHistory || decisionHistory.length < 2) return null;
  
  const sorted = [...decisionHistory].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  const reversals: string[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    if (prev.rejectedOptions.includes(curr.chosenOption)) {
      reversals.push(`${curr.chosenOption} rejected at ${prev.timestamp.toISOString()} but chosen at ${curr.timestamp.toISOString()}`);
    }
  }
  
  if (reversals.length === 0) return null;
  
  return {
    checkType: "preference_reversal",
    severity: reversals.length > 2 ? "critical" : "warning",
    description: `Detected ${reversals.length} preference reversals in decision history`,
    affectedEvidenceIds: evidence.map(e => e.id),
    recommendation: "Review assumptions that changed between decisions causing reversals"
  };
}

function checkOptionValueDecay(
  evidence: EvidenceItem[],
  temporalContext: TemporalContext
): TimeConsistencyCheck | null {
  const timeSensitiveEvidence = evidence.filter(e => {
    const age = temporalContext.decisionTime.getTime() - e.temporalMetadata.observedAt.getTime();
    return age > 86400000 && e.temporalMetadata.decayModel !== "none";
  });
  
  const severelyDecayed = timeSensitiveEvidence.filter(e => {
    const age = temporalContext.decisionTime.getTime() - e.temporalMetadata.observedAt.getTime();
    const halfLife = (e.temporalMetadata.decayParameters?.halfLifeMs as number | undefined) ?? 86400000;
    const decayFactor = Math.exp(-age / halfLife);
    return decayFactor < 0.3;
  });
  
  if (severelyDecayed.length === 0) return null;
  
  return {
    checkType: "option_value_decay",
    severity: severelyDecayed.length > 3 ? "warning" : "info",
    description: `${severelyDecayed.length} evidence items have decayed below 30% relevance`,
    affectedEvidenceIds: severelyDecayed.map(e => e.id),
    recommendation: "Consider whether decayed evidence still supports current options"
  };
}

export function validateTemporalAlignment(
  evidence: EvidenceItem[],
  temporalContext: TemporalContext
): { aligned: boolean; issues: string[] } {
  const issues: string[] = [];
  
  const futureEvidence = evidence.filter(e => 
    e.temporalMetadata.observedAt > temporalContext.decisionTime
  );
  if (futureEvidence.length > 0) {
    issues.push(`${futureEvidence.length} evidence items have future timestamps`);
  }
  
  const expiredEvidence = evidence.filter(e =>
    e.temporalMetadata.validUntil && 
    e.temporalMetadata.validUntil < temporalContext.decisionTime
  );
  if (expiredEvidence.length > 0) {
    issues.push(`${expiredEvidence.length} evidence items have expired`);
  }
  
  return {
    aligned: issues.length === 0,
    issues
  };
}

export function createTemporalContext(
  decisionTime: Date,
  options?: {
    evidenceHorizon?: Date;
    forecastHorizon?: Date;
    referenceTime?: Date;
  }
): TemporalContext {
  const now = options?.referenceTime ?? new Date();
  
  return {
    decisionTime,
    evidenceHorizon: options?.evidenceHorizon ?? new Date(decisionTime.getTime() - 2592000000),
    forecastHorizon: options?.forecastHorizon,
    referenceTime: now
  };
}


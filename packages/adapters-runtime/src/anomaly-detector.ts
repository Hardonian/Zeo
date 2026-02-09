/**
 * Anomaly detection for data poisoning defense
 */

import type { SignalObservation } from "@zeo/contracts";
import type { AnomalyRule, AnomalyViolation, AnomalyDetectionResult } from "./types";

/**
 * Detect sudden distribution jumps using Z-score
 */
export function detectSuddenJump(
  observations: SignalObservation[],
  history: SignalObservation[] = [],
  threshold: number = 3
): AnomalyViolation[] {
  const violations: AnomalyViolation[] = [];
  
  if (observations.length === 0) return violations;
  
  // Combine current and history for baseline
  const allValues = [...history, ...observations].map(obs =>
    (obs.valueBand.low + obs.valueBand.high) / 2
  );
  
  if (allValues.length < 10) return violations; // Not enough data
  
  // Compute mean and std from history only (if available) or all data
  const baselineValues = history.length >= 10
    ? history.map(obs => (obs.valueBand.low + obs.valueBand.high) / 2)
    : allValues.slice(0, -observations.length);
  
  const mean = baselineValues.reduce((a, b) => a + b, 0) / baselineValues.length;
  const variance = baselineValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / baselineValues.length;
  const std = Math.sqrt(variance);
  
  if (std === 0) return violations; // No variation to detect
  
  // Check current observations for jumps
  for (const obs of observations) {
    const value = (obs.valueBand.low + obs.valueBand.high) / 2;
    const zScore = Math.abs((value - mean) / std);
    
    if (zScore > threshold) {
      violations.push({
        ruleId: "sudden_jump",
        severity: zScore > threshold * 2 ? "critical" : "high",
        message: `Value ${value.toFixed(4)} is ${zScore.toFixed(2)} standard deviations from mean (${mean.toFixed(4)})`,
        affectedObservations: [obs.observationId],
        details: { zScore, mean, std, threshold, value },
      });
    }
  }
  
  return violations;
}

/**
 * Detect missingness spikes (too many missing/null values)
 */
export function detectMissingnessSpike(
  observations: SignalObservation[],
  threshold: number = 0.3
): AnomalyViolation[] {
  const violations: AnomalyViolation[] = [];
  
  if (observations.length === 0) return violations;
  
  // Group by signal
  const bySignal = new Map<string, SignalObservation[]>();
  for (const obs of observations) {
    const group = bySignal.get(obs.signalId) ?? [];
    group.push(obs);
    bySignal.set(obs.signalId, group);
  }
  
  // Check missingness per signal
  for (const [signalId, group] of bySignal) {
    const missingCount = group.filter(obs =>
      obs.valueBand.low === 0 && obs.valueBand.high === 0
    ).length;
    
    const missingnessRate = missingCount / group.length;
    
    if (missingnessRate > threshold) {
      violations.push({
        ruleId: "missingness_spike",
        severity: missingnessRate > 0.7 ? "critical" : missingnessRate > 0.5 ? "high" : "medium",
        message: `Signal ${signalId} has ${(missingnessRate * 100).toFixed(1)}% missing values`,
        affectedObservations: group.map(o => o.observationId),
        details: { signalId, missingnessRate, missingCount, totalCount: group.length },
      });
    }
  }
  
  return violations;
}

/**
 * Detect timestamp inconsistencies
 */
export function detectTimestampInconsistency(
  observations: SignalObservation[],
  context?: { asOf?: string }
): AnomalyViolation[] {
  const violations: AnomalyViolation[] = [];
  
  if (observations.length === 0) return violations;
  
  const now = context?.asOf ? new Date(context.asOf) : new Date();
  const futureCutoff = new Date(now.getTime() + 60000); // 1 minute tolerance
  
  // Group by signal and check ordering
  const bySignal = new Map<string, SignalObservation[]>();
  for (const obs of observations) {
    const group = bySignal.get(obs.signalId) ?? [];
    group.push(obs);
    bySignal.set(obs.signalId, group);
  }
  
  for (const [signalId, group] of bySignal) {
    // Sort by timestamp
    const sorted = [...group].sort((a, b) =>
      new Date(a.t).getTime() - new Date(b.t).getTime()
    );
    
    // Check for future timestamps
    const futureObservations = sorted.filter(obs =>
      new Date(obs.t) > futureCutoff
    );
    
    if (futureObservations.length > 0) {
      violations.push({
        ruleId: "future_timestamp",
        severity: "critical",
        message: `${futureObservations.length} observations have future timestamps`,
        affectedObservations: futureObservations.map(o => o.observationId),
        details: { signalId, futureCount: futureObservations.length },
      });
    }
    
    // Check for out-of-order timestamps
    const outOfOrder: SignalObservation[] = [];
    let lastTime = 0;
    for (const obs of sorted) {
      const time = new Date(obs.t).getTime();
      if (time < lastTime) {
        outOfOrder.push(obs);
      }
      lastTime = time;
    }
    
    if (outOfOrder.length > 0) {
      violations.push({
        ruleId: "out_of_order",
        severity: "high",
        message: `${outOfOrder.length} observations are out of chronological order`,
        affectedObservations: outOfOrder.map(o => o.observationId),
        details: { signalId, outOfOrderCount: outOfOrder.length },
      });
    }
    
    // Check for duplicate timestamps
    const timestampCounts = new Map<number, number>();
    for (const obs of sorted) {
      const time = new Date(obs.t).getTime();
      timestampCounts.set(time, (timestampCounts.get(time) ?? 0) + 1);
    }
    
    const duplicates = Array.from(timestampCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([timestamp]) => timestamp);
    
    if (duplicates.length > 0) {
      const dupObservations = sorted.filter(obs =>
        duplicates.includes(new Date(obs.t).getTime())
      );
      
      violations.push({
        ruleId: "duplicate_timestamps",
        severity: "medium",
        message: `${duplicates.length} duplicate timestamps detected`,
        affectedObservations: dupObservations.map(o => o.observationId),
        details: { signalId, duplicateCount: duplicates.length },
      });
    }
  }
  
  return violations;
}

/**
 * Detect value band anomalies (inverted bands, extreme values)
 */
export function detectValueBandAnomalies(
  observations: SignalObservation[]
): AnomalyViolation[] {
  const violations: AnomalyViolation[] = [];
  
  for (const obs of observations) {
    // Check for inverted bands (low > high)
    if (obs.valueBand.low > obs.valueBand.high) {
      violations.push({
        ruleId: "inverted_band",
        severity: "critical",
        message: `Value band is inverted: low=${obs.valueBand.low} > high=${obs.valueBand.high}`,
        affectedObservations: [obs.observationId],
        details: { valueBand: obs.valueBand },
      });
    }
    
    // Check for values outside [0, 1]
    if (obs.valueBand.low < 0 || obs.valueBand.high > 1) {
      violations.push({
        ruleId: "out_of_bounds",
        severity: "critical",
        message: `Value band outside [0, 1]: [${obs.valueBand.low}, ${obs.valueBand.high}]`,
        affectedObservations: [obs.observationId],
        details: { valueBand: obs.valueBand },
      });
    }
    
    // Check for extremely narrow bands (possible precision loss)
    const bandWidth = obs.valueBand.high - obs.valueBand.low;
    if (bandWidth < 0.001 && bandWidth > 0) {
      violations.push({
        ruleId: "narrow_band",
        severity: "low",
        message: `Suspiciously narrow value band: ${bandWidth.toFixed(6)}`,
        affectedObservations: [obs.observationId],
        details: { valueBand: obs.valueBand, bandWidth },
      });
    }
  }
  
  return violations;
}

export const DEFAULT_ANOMALY_RULES: AnomalyRule[] = [
  {
    id: "sudden_jump",
    name: "Sudden Distribution Jump",
    enabled: true,
    severity: "high",
    check: (obs, hist) => detectSuddenJump(obs, hist, 3),
  },
  {
    id: "missingness_spike",
    name: "Missingness Spike",
    enabled: true,
    severity: "medium",
    check: (obs) => detectMissingnessSpike(obs, 0.3),
  },
  {
    id: "timestamp_inconsistency",
    name: "Timestamp Inconsistency",
    enabled: true,
    severity: "critical",
    check: (obs, _hist, context?: { asOf?: string }) => detectTimestampInconsistency(obs, context),
  },
  {
    id: "value_band_anomalies",
    name: "Value Band Anomalies",
    enabled: true,
    severity: "critical",
    check: (obs) => detectValueBandAnomalies(obs),
  },
];

interface AnomalyDetector {
  detect(
    observations: SignalObservation[],
    history?: SignalObservation[],
    context?: { asOf?: string }
  ): AnomalyDetectionResult;
  addRule(rule: AnomalyRule): void;
  disableRule(ruleId: string): void;
  enableRule(ruleId: string): void;
}

export function createAnomalyDetector(rules: AnomalyRule[] = DEFAULT_ANOMALY_RULES): AnomalyDetector {
  const activeRules = new Map(rules.map(r => [r.id, r]));
  
  return {
    detect(
      observations: SignalObservation[],
      history?: SignalObservation[],
      context?: { asOf?: string }
    ): AnomalyDetectionResult {
      const allViolations: AnomalyViolation[] = [];
      
      for (const rule of activeRules.values()) {
        if (!rule.enabled) continue;
        
        const violations = rule.check(observations, history, context);
        allViolations.push(...violations);
      }
      
      // Count by severity
      const criticalCount = allViolations.filter(v => v.severity === "critical").length;
      const highCount = allViolations.filter(v => v.severity === "high").length;
      const mediumCount = allViolations.filter(v => v.severity === "medium").length;
      const lowCount = allViolations.filter(v => v.severity === "low").length;
      
      return {
        passed: criticalCount === 0 && highCount === 0,
        violations: allViolations,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
      };
    },
    
    addRule(rule: AnomalyRule): void {
      activeRules.set(rule.id, rule);
    },
    
    disableRule(ruleId: string): void {
      const rule = activeRules.get(ruleId);
      if (rule) {
        rule.enabled = false;
      }
    },
    
    enableRule(ruleId: string): void {
      const rule = activeRules.get(ruleId);
      if (rule) {
        rule.enabled = true;
      }
    },
  };
}


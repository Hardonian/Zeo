/**
 * Pattern Detection Module
 *
 * Detects recurring patterns in decision-making behavior.
 */

import type {
  DecisionPattern,
  DecisionRecord,
  MetaLearnerConfig,
  PatternType,
  Severity,
} from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";

/**
 * Detect recurring assumption errors from decision records
 */
export function detectAssumptionErrors(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): DecisionPattern[] {
  if (records.length < config.minObservations) {
    return [];
  }

  const assumptionOutcomes = new Map<string, { total: number; failures: number; examples: string[] }>();

  for (const record of records) {
    if (!record.outcome) continue;

    for (const assumption of record.assumptions) {
      const normalized = normalizeAssumption(assumption);
      const current = assumptionOutcomes.get(normalized) ?? { total: 0, failures: 0, examples: [] };
      current.total++;
      if (record.outcome === "failure") {
        current.failures++;
      }
      if (current.examples.length < 3) {
        current.examples.push(assumption);
      }
      assumptionOutcomes.set(normalized, current);
    }
  }

  const patterns: DecisionPattern[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.lookbackDays);

  for (const [assumption, stats] of assumptionOutcomes) {
    const errorRate = stats.total > 0 ? stats.failures / stats.total : 0;
    if (errorRate >= config.patternThreshold && stats.total >= 3) {
      const relevantRecords = records.filter(
        (r) =>
          r.assumptions.some((a) => normalizeAssumption(a) === assumption) &&
          r.timestamp >= cutoffDate
      );

      if (relevantRecords.length === 0) continue;

      const dates = relevantRecords.map((r) => r.timestamp);
      const severity = determineSeverity(errorRate, stats.total);

      patterns.push({
        patternType: "assumption_error",
        frequency: errorRate,
        examples: stats.examples,
        severity,
        firstObserved: new Date(Math.min(...dates.map((d) => d.getTime()))),
        lastObserved: new Date(Math.max(...dates.map((d) => d.getTime()))),
      });
    }
  }

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Detect confidence miscalibration (overconfidence and underconfidence)
 */
export function detectConfidenceMiscalibration(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): DecisionPattern[] {
  if (records.length < config.minObservations) {
    return [];
  }

  const patterns: DecisionPattern[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.lookbackDays);

  const relevantRecords = records.filter((r) => r.timestamp >= cutoffDate && r.outcome);

  if (relevantRecords.length < config.minObservations) {
    return [];
  }

  // Detect overconfidence: high confidence but failure
  const highConfidenceFailures = relevantRecords.filter(
    (r) => r.confidence > 0.8 && r.outcome === "failure"
  );

  const overconfidenceRate =
    relevantRecords.length > 0 ? highConfidenceFailures.length / relevantRecords.length : 0;

  if (overconfidenceRate >= config.patternThreshold && highConfidenceFailures.length >= 3) {
    const dates = highConfidenceFailures.map((r) => r.timestamp);
    patterns.push({
      patternType: "overconfidence",
      frequency: overconfidenceRate,
      examples: highConfidenceFailures.slice(0, 3).map((r) => `Decision ${r.decisionId}: ${r.confidence}% confidence, failed`),
      severity: determineSeverity(overconfidenceRate, highConfidenceFailures.length),
      firstObserved: new Date(Math.min(...dates.map((d) => d.getTime()))),
      lastObserved: new Date(Math.max(...dates.map((d) => d.getTime()))),
    });
  }

  // Detect underconfidence: low confidence but success
  const lowConfidenceSuccesses = relevantRecords.filter(
    (r) => r.confidence < 0.4 && r.outcome === "success"
  );

  const underconfidenceRate =
    relevantRecords.length > 0 ? lowConfidenceSuccesses.length / relevantRecords.length : 0;

  if (underconfidenceRate >= config.patternThreshold && lowConfidenceSuccesses.length >= 3) {
    const dates = lowConfidenceSuccesses.map((r) => r.timestamp);
    patterns.push({
      patternType: "underconfidence",
      frequency: underconfidenceRate,
      examples: lowConfidenceSuccesses.slice(0, 3).map((r) => `Decision ${r.decisionId}: ${r.confidence}% confidence, succeeded`),
      severity: determineSeverity(underconfidenceRate, lowConfidenceSuccesses.length),
      firstObserved: new Date(Math.min(...dates.map((d) => d.getTime()))),
      lastObserved: new Date(Math.max(...dates.map((d) => d.getTime()))),
    });
  }

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Detect frequent decision reversals
 */
export function detectReversals(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): DecisionPattern[] {
  if (records.length < config.minObservations) {
    return [];
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.lookbackDays);

  const relevantRecords = records.filter((r) => r.timestamp >= cutoffDate && r.reversalOf);

  if (relevantRecords.length < 3) {
    return [];
  }

  const totalDecisions = records.filter((r) => r.timestamp >= cutoffDate).length;
  const reversalRate = totalDecisions > 0 ? relevantRecords.length / totalDecisions : 0;

  if (reversalRate >= config.patternThreshold) {
    const dates = relevantRecords.map((r) => r.timestamp);
    return [
      {
        patternType: "reversal",
        frequency: reversalRate,
        examples: relevantRecords.slice(0, 3).map(
          (r) => `Reversed decision ${r.reversalOf} on ${r.timestamp.toISOString().split("T")[0]}`
        ),
        severity: determineSeverity(reversalRate, relevantRecords.length),
        firstObserved: new Date(Math.min(...dates.map((d) => d.getTime()))),
        lastObserved: new Date(Math.max(...dates.map((d) => d.getTime()))),
      },
    ];
  }

  return [];
}

/**
 * Detect ignored clarifiers pattern
 */
export function detectIgnoredClarifiers(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): DecisionPattern[] {
  if (records.length < config.minObservations) {
    return [];
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.lookbackDays);

  const relevantRecords = records.filter(
    (r) =>
      r.timestamp >= cutoffDate &&
      r.clarifiersIgnored.length > 0 &&
      r.outcome
  );

  if (relevantRecords.length < 3) {
    return [];
  }

  // Check if ignoring clarifiers correlates with poor outcomes
  const ignoredWithFailure = relevantRecords.filter(
    (r) => r.outcome === "failure"
  );

  const ignoreFailureRate =
    relevantRecords.length > 0 ? ignoredWithFailure.length / relevantRecords.length : 0;

  if (ignoreFailureRate >= config.patternThreshold) {
    const dates = relevantRecords.map((r) => r.timestamp);
    const clarifierExamples: string[] = [];

    for (const record of relevantRecords.slice(0, 3)) {
      for (const clarifier of record.clarifiersIgnored.slice(0, 2)) {
        clarifierExamples.push(`Ignored: "${clarifier}"`);
      }
    }

    return [
      {
        patternType: "ignored_clarifier",
        frequency: ignoreFailureRate,
        examples: clarifierExamples.slice(0, 3),
        severity: determineSeverity(ignoreFailureRate, relevantRecords.length),
        firstObserved: new Date(Math.min(...dates.map((d) => d.getTime()))),
        lastObserved: new Date(Math.max(...dates.map((d) => d.getTime()))),
      },
    ];
  }

  return [];
}

/**
 * Normalize an assumption string for comparison
 */
function normalizeAssumption(assumption: string): string {
  return assumption.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Determine severity based on frequency and sample size
 */
function determineSeverity(frequency: number, sampleSize: number): Severity {
  if (frequency >= 0.6 && sampleSize >= 5) return "high";
  if (frequency >= 0.4 && sampleSize >= 3) return "medium";
  return "low";
}

/**
 * Detect all patterns from decision records
 */
export function detectAllPatterns(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): DecisionPattern[] {
  const assumptionErrors = detectAssumptionErrors(records, config);
  const confidenceIssues = detectConfidenceMiscalibration(records, config);
  const reversals = detectReversals(records, config);
  const ignoredClarifiers = detectIgnoredClarifiers(records, config);

  return [...assumptionErrors, ...confidenceIssues, ...reversals, ...ignoredClarifiers].sort(
    (a, b) => b.frequency - a.frequency
  );
}


/**
 * Meta-Learning Integration
 *
 * Links @zeo/meta to decision memory system.
 * Enables cross-decision learning without auto-modification.
 */

import type { DecisionRecord, MetaLearnerConfig, DecisionOutcome, MetaInsight } from "@zeo/meta";
import { analyzeDecisions, createMetaInsights, DEFAULT_CONFIG } from "@zeo/meta";

export interface LearningConfig {
  enabled: boolean;
  autoApplyPriors: boolean;
  notifyOnPatterns: boolean;
  minSampleSize: number;
}

export const DEFAULT_LEARNING_CONFIG: LearningConfig = {
  enabled: true,
  autoApplyPriors: false, // Never auto-apply by default
  notifyOnPatterns: true,
  minSampleSize: 10,
};

/**
 * Analyze decision history for patterns.
 * Does NOT modify decisions - only produces insights.
 */
export function analyzeDecisionHistory(
  records: DecisionRecord[],
  config: LearningConfig = DEFAULT_LEARNING_CONFIG
): {
  patterns: unknown[];
  insights: MetaInsight[];
  epistemicWarnings: string[];
  calibrationNudges: string[];
} {
  if (!config.enabled || records.length < config.minSampleSize) {
    return {
      patterns: [],
      insights: [],
      epistemicWarnings: [],
      calibrationNudges: [],
    };
  }

  const metaConfig: MetaLearnerConfig = {
    ...DEFAULT_CONFIG,
    minObservations: config.minSampleSize,
  };

  // Analyze decisions - this never modifies the input records
  const result = analyzeDecisions(records, metaConfig);

  // Create insights from patterns
  const insights = createMetaInsights(result.patterns, metaConfig);

  return {
    patterns: result.patterns,
    insights,
    epistemicWarnings: result.epistemicWarnings,
    calibrationNudges: result.calibrationNudges,
  };
}

/**
 * Invariant check: Ensure learning never auto-modifies decisions.
 * This is a safety check that can be called in tests.
 */
export function verifyNoAutoModification(
  originalDecision: DecisionRecord,
  afterLearning: DecisionRecord
): { modified: boolean; changes: string[] } {
  const changes: string[] = [];

  // Check decisionId hasn't changed (property is decisionId, not id)
  if (originalDecision.decisionId !== afterLearning.decisionId) {
    changes.push("Decision ID was modified");
  }

  // Check timestamps (timestamp is a Date object)
  if (originalDecision.timestamp.getTime() !== afterLearning.timestamp.getTime()) {
    changes.push("Decision timestamp was modified");
  }

  // Check confidence hasn't changed
  if (originalDecision.confidence !== afterLearning.confidence) {
    changes.push("Decision confidence was modified");
  }

  // Check assumptions haven't changed
  if (JSON.stringify(originalDecision.assumptions) !== JSON.stringify(afterLearning.assumptions)) {
    changes.push("Decision assumptions were modified");
  }

  return {
    modified: changes.length > 0,
    changes,
  };
}

/**
 * Create decision record from decision spec and outcome.
 */
export function createDecisionRecord(
  decisionId: string,
  assumptions: string[],
  confidence: number,
  outcome?: DecisionOutcome,
  clarifiersRequested: string[] = [],
  clarifiersIgnored: string[] = [],
  reversalOf?: string
): DecisionRecord {
  return {
    decisionId,
    timestamp: new Date(),
    assumptions,
    confidence,
    outcome,
    clarifiersRequested,
    clarifiersIgnored,
    reversalOf,
  };
}

export { analyzeDecisions, createMetaInsights, DEFAULT_CONFIG } from "@zeo/meta";
export type { DecisionRecord, MetaInsight, DecisionOutcome } from "@zeo/meta";


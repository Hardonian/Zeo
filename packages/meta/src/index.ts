/**
 * Meta-Learning Package
 *
 * Tracks and learns from decision patterns to provide personalized
 * epistemic guidance while maintaining advisory-only status.
 *
 * @module @zeo/meta
 */

// Types
export {
  DecisionPattern,
  MetaLearningResult,
  MetaLearnerConfig,
  DecisionRecord,
  MetaInsight,
  PatternType,
  Severity,
  DecisionOutcome,
  DEFAULT_CONFIG,
  isPatternType,
  isSeverity,
  isDecisionOutcome,
} from "./types.js";

// Pattern detection
export {
  detectAssumptionErrors,
  detectConfidenceMiscalibration,
  detectReversals,
  detectIgnoredClarifiers,
  detectAllPatterns,
} from "./patterns.js";

// Meta-learning
export {
  aggregatePatterns,
  generateEpistemicWarnings,
  generateCalibrationNudges,
  recommendLenses,
  createMetaInsights,
  analyzeDecisions,
  hasEnoughObservations,
  filterDismissedInsights,
} from "./learner.js";

/**
 * Key design principles:
 *
 * 1. Advisory Only: Never changes decisions automatically
 * 2. Fully Inspectable: All insights include supporting evidence
 * 3. Dismissible: Users can dismiss any insight
 * 4. Minimum Thresholds: Patterns require minimum observations
 * 5. Privacy-First: Local processing, no external data sharing
 */

/**
 * Quick start:
 *
 * ```typescript
 * import { analyzeDecisions, createMetaInsights, DEFAULT_CONFIG } from "@zeo/meta";
 *
 * const records: DecisionRecord[] = [...]; // Your decision history
 * const result = analyzeDecisions(records, DEFAULT_CONFIG);
 *
 * // Get actionable insights
 * console.log(result.epistemicWarnings);
 * console.log(result.calibrationNudges);
 *
 * // Create insights for packets
 * const insights = createMetaInsights(result.patterns, DEFAULT_CONFIG);
 * ```
 */


/**
 * Meta-Learning / Decision Pattern Analysis
 *
 * Tracks and learns from decision patterns to provide personalized epistemic
 * guidance. Advisory only - never changes decisions automatically.
 */

/**
 * Types of decision patterns that can be detected
 */
export type PatternType =
  | "assumption_error"
  | "overconfidence"
  | "underconfidence"
  | "reversal"
  | "ignored_clarifier";

/**
 * Severity levels for patterns
 */
export type Severity = "low" | "medium" | "high";

/**
 * Outcome of a decision
 */
export type DecisionOutcome = "success" | "failure" | "partial";

/**
 * A detected pattern in decision-making
 */
export interface DecisionPattern {
  patternType: PatternType;
  frequency: number;
  examples: string[];
  severity: Severity;
  firstObserved: Date;
  lastObserved: Date;
}

/**
 * Result of meta-learning analysis
 */
export interface MetaLearningResult {
  patterns: DecisionPattern[];
  epistemicWarnings: string[];
  calibrationNudges: string[];
  lensRecommendations: string[];
}

/**
 * Configuration for the meta-learner
 */
export interface MetaLearnerConfig {
  minObservations: number;
  patternThreshold: number;
  lookbackDays: number;
  advisoryOnly: boolean;
}

/**
 * Record of a single decision for analysis
 */
export interface DecisionRecord {
  decisionId: string;
  timestamp: Date;
  assumptions: string[];
  confidence: number;
  outcome?: DecisionOutcome;
  clarifiersRequested: string[];
  clarifiersIgnored: string[];
  reversalOf?: string;
}

/**
 * A single meta-insight that can be presented to the user
 */
export interface MetaInsight {
  id: string;
  category: "pattern" | "warning" | "nudge" | "recommendation";
  message: string;
  supportingEvidence: string[];
  dismissible: boolean;
  dismissed?: boolean;
}

/**
 * Default configuration for the meta-learner
 */
export const DEFAULT_CONFIG: MetaLearnerConfig = {
  minObservations: 5,
  patternThreshold: 0.3,
  lookbackDays: 30,
  advisoryOnly: true,
};

/**
 * Type guard for PatternType
 */
export function isPatternType(value: unknown): value is PatternType {
  return (
    typeof value === "string" &&
    ["assumption_error", "overconfidence", "underconfidence", "reversal", "ignored_clarifier"].includes(value)
  );
}

/**
 * Type guard for Severity
 */
export function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && ["low", "medium", "high"].includes(value);
}

/**
 * Type guard for DecisionOutcome
 */
export function isDecisionOutcome(value: unknown): value is DecisionOutcome {
  return typeof value === "string" && ["success", "failure", "partial"].includes(value);
}


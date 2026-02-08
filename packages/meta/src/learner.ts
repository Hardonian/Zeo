/**
 * Meta-Learner Module
 *
 * Aggregates patterns and generates personalized epistemic guidance.
 */

import type {
  DecisionPattern,
  DecisionRecord,
  MetaInsight,
  MetaLearnerConfig,
  MetaLearningResult,
} from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";
import { detectAllPatterns } from "./patterns.js";

/**
 * Aggregate all detected patterns into a comprehensive view
 */
export function aggregatePatterns(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): DecisionPattern[] {
  if (records.length < config.minObservations) {
    return [];
  }

  return detectAllPatterns(records, config);
}

/**
 * Generate epistemic warnings based on detected patterns
 */
export function generateEpistemicWarnings(
  patterns: DecisionPattern[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): string[] {
  const warnings: string[] = [];

  for (const pattern of patterns) {
    if (pattern.severity === "low") continue;

    switch (pattern.patternType) {
      case "assumption_error":
        warnings.push(
          `Pattern: Assumption errors (${Math.round(pattern.frequency * 100)}% rate). ` +
            `Consider validating key assumptions before deciding.`
        );
        break;
      case "overconfidence":
        warnings.push(
          `Pattern: Overconfidence detected. High-confidence decisions are failing ` +
            `${Math.round(pattern.frequency * 100)}% of the time. Consider wider confidence intervals.`
        );
        break;
      case "underconfidence":
        warnings.push(
          `Pattern: Underconfidence detected. You're succeeding despite low confidence ` +
            `(${Math.round(pattern.frequency * 100)}% rate). Trust your analysis more.`
        );
        break;
      case "reversal":
        warnings.push(
          `Pattern: Frequent reversals (${Math.round(pattern.frequency * 100)}% of decisions). ` +
            `Consider spending more time on initial analysis.`
        );
        break;
      case "ignored_clarifier":
        warnings.push(
          `Pattern: Ignoring clarifiers correlates with poor outcomes ` +
            `(${Math.round(pattern.frequency * 100)}% failure rate when clarifiers skipped).`
        );
        break;
    }
  }

  return warnings;
}

/**
 * Generate calibration nudges based on pattern analysis
 */
export function generateCalibrationNudges(
  patterns: DecisionPattern[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): string[] {
  const nudges: string[] = [];

  // Confidence calibration nudges
  const overconfidence = patterns.find((p) => p.patternType === "overconfidence");
  const underconfidence = patterns.find((p) => p.patternType === "underconfidence");

  if (overconfidence && overconfidence.severity !== "low") {
    nudges.push(
      "When you're highly confident (>80%), consider: What would change your mind? What evidence would falsify your view?"
    );
    nudges.push(
      "Try pre-mortem analysis: Imagine this decision failed. What went wrong?"
    );
  }

  if (underconfidence && underconfidence.severity !== "low") {
    nudges.push(
      "Your track record is better than your confidence suggests. Consider narrowing your confidence intervals."
    );
    nudges.push(
      "You've succeeded despite low confidence. What signals are you discounting?"
    );
  }

  // Assumption nudges
  const assumptionErrors = patterns.filter((p) => p.patternType === "assumption_error");
  if (assumptionErrors.length > 0) {
    nudges.push(
      "For each key assumption, ask: What would I observe if this were false?"
    );
    nudges.push(
      "Consider the strongest argument against each of your assumptions."
    );
  }

  // Reversal nudges
  const reversals = patterns.find((p) => p.patternType === "reversal");
  if (reversals && reversals.severity !== "low") {
    nudges.push(
      "Before deciding, write down your reasoning. Review it before reversing."
    );
    nudges.push(
      "Set a minimum deliberation time proportional to decision importance."
    );
  }

  // Clarifier nudges
  const ignoredClarifiers = patterns.find((p) => p.patternType === "ignored_clarifier");
  if (ignoredClarifiers && ignoredClarifiers.severity !== "low") {
    nudges.push(
      "When clarifiers are offered, pause and consider: Why was this flagged?"
    );
    nudges.push(
      "The system asks clarifiers based on patterns. Answering them improves decision quality."
    );
  }

  return nudges;
}

/**
 * Recommend lenses based on decision history and patterns
 */
export function recommendLenses(
  patterns: DecisionPattern[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): string[] {
  const recommendations: string[] = [];

  // Map pattern types to lens recommendations
  const patternToLens: Map<string, string[]> = new Map([
    ["assumption_error", ["risk-minimization", "growth"]],
    ["overconfidence", ["risk-minimization", "adversarial"]],
    ["underconfidence", ["growth", "negotiation"]],
    ["reversal", ["risk-minimization", "ethical"]],
    ["ignored_clarifier", ["ethical", "growth"]],
  ]);

  const highSeverityPatterns = patterns.filter((p) => p.severity !== "low");

  for (const pattern of highSeverityPatterns) {
    const lenses = patternToLens.get(pattern.patternType);
    if (lenses) {
      for (const lens of lenses) {
        if (!recommendations.includes(lens)) {
          recommendations.push(lens);
        }
      }
    }
  }

  return recommendations;
}

/**
 * Create meta-insights from patterns (for inclusion in packets)
 */
export function createMetaInsights(
  patterns: DecisionPattern[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): MetaInsight[] {
  const insights: MetaInsight[] = [];
  let id = 0;

  for (const pattern of patterns) {
    if (pattern.severity === "low") continue;

    const baseId = `meta-${Date.now()}-${id++}`;

    // Create pattern insight
    insights.push({
      id: `${baseId}-pattern`,
      category: "pattern",
      message: `${pattern.patternType.replace("_", " ")} pattern detected (${Math.round(
        pattern.frequency * 100
      )}% frequency, ${pattern.severity} severity)`,
      supportingEvidence: pattern.examples,
      dismissible: true,
    });

    // Create warning insight for high severity
    if (pattern.severity === "high") {
      insights.push({
        id: `${baseId}-warning`,
        category: "warning",
        message: getWarningMessage(pattern),
        supportingEvidence: pattern.examples,
        dismissible: true,
      });
    }
  }

  // Add nudges as insights
  const nudges = generateCalibrationNudges(patterns, config);
  for (let i = 0; i < Math.min(nudges.length, 3); i++) {
    insights.push({
      id: `meta-nudge-${Date.now()}-${i}`,
      category: "nudge",
      message: nudges[i],
      supportingEvidence: [],
      dismissible: true,
    });
  }

  // Add lens recommendations
  const lenses = recommendLenses(patterns, config);
  if (lenses.length > 0) {
    insights.push({
      id: `meta-lens-${Date.now()}`,
      category: "recommendation",
      message: `Consider viewing through lens(es): ${lenses.join(", ")}`,
      supportingEvidence: patterns
        .filter((p) => p.severity !== "low")
        .map((p) => `${p.patternType}: ${Math.round(p.frequency * 100)}%`),
      dismissible: true,
    });
  }

  return insights;
}

/**
 * Run full meta-learning analysis on decision records
 */
export function analyzeDecisions(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): MetaLearningResult {
  const patterns = aggregatePatterns(records, config);

  return {
    patterns,
    epistemicWarnings: generateEpistemicWarnings(patterns, config),
    calibrationNudges: generateCalibrationNudges(patterns, config),
    lensRecommendations: recommendLenses(patterns, config),
  };
}

/**
 * Get warning message for a pattern
 */
function getWarningMessage(pattern: DecisionPattern): string {
  switch (pattern.patternType) {
    case "assumption_error":
      return "Recurring assumption errors detected. These assumptions often prove wrong.";
    case "overconfidence":
      return "You tend to be overconfident. Your high-confidence predictions fail more often than expected.";
    case "underconfidence":
      return "You tend to be underconfident. You succeed even when you doubt yourself.";
    case "reversal":
      return "Frequent decision reversals detected. Consider more deliberate initial analysis.";
    case "ignored_clarifier":
      return "Ignoring clarifiers correlates with poor outcomes. Consider engaging with them.";
    default:
      return `Pattern detected: ${pattern.patternType}`;
  }
}

/**
 * Check if enough observations exist for pattern detection
 */
export function hasEnoughObservations(
  records: DecisionRecord[],
  config: MetaLearnerConfig = DEFAULT_CONFIG
): boolean {
  return records.length >= config.minObservations;
}

/**
 * Filter out dismissed insights
 */
export function filterDismissedInsights(insights: MetaInsight[]): MetaInsight[] {
  return insights.filter((i) => !i.dismissed);
}

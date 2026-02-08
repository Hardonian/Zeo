/**
 * Explain Integration
 * 
 * Hooks @zeo/explain into result formatting.
 * Generates tiered explanations for decision results.
 */

import type { DecisionResult } from "@zeo/contracts";
import type { ExplanationLevel, ExplanationContent, ExplanationSelectionContext } from "@zeo/explain";
import { generateExplanation, autoSelectExplanationLevel, createDefaultRules } from "@zeo/explain";

export interface ExplanationConfig {
  maxLevel: 0 | 1 | 2 | 3 | 4;
  includeUncertainty: boolean;
  includeProvenance: boolean;
  format: 'structured' | 'narrative' | 'bullet';
  audience: 'executive' | 'analyst' | 'expert';
}

export const DEFAULT_EXPLANATION_CONFIG: ExplanationConfig = {
  maxLevel: 3,
  includeUncertainty: true,
  includeProvenance: true,
  format: 'narrative',
  audience: 'analyst',
};

/**
 * Enrich decision result with explanation.
 */
export function enrichResultWithExplanation(
  result: DecisionResult,
  config: ExplanationConfig = DEFAULT_EXPLANATION_CONFIG
): DecisionResult & { explanation?: ExplanationContent } {
  const selectionContext: ExplanationSelectionContext = {
    decisionId: result.decisionId,
    hasUncertainty: true,
    complexityScore: result.branches?.nodes?.length || 1,
    userOverrideCount: 0,
    previousLevel: config.maxLevel,
  };

  // Auto-select level based on context
  const autoSelectedLevel = autoSelectExplanationLevel(
    selectionContext,
    createDefaultRules()
  );

  const level = Math.min(config.maxLevel, autoSelectedLevel) as 0 | 1 | 2 | 3 | 4;

  // Generate explanation
  const explanation = generateExplanation(level, {
    decisionId: result.decisionId,
    recommendedAction: result.recommendedAction,
    confidence: result.confidence,
  });

  return {
    ...result,
    explanation,
  };
}

/**
 * Generate explanation at specified level.
 */
export function generateExplanationAtLevel(
  result: DecisionResult,
  level: 0 | 1 | 2 | 3 | 4,
  format: ExplanationConfig['format'] = 'narrative'
): ExplanationContent {
  return generateExplanation(level, {
    decisionId: result.decisionId,
    recommendedAction: result.recommendedAction,
    confidence: result.confidence,
  });
}

/**
 * Verify explanation consistency across levels.
 * Ensures higher levels don't contradict lower levels.
 */
export function verifyExplanationConsistency(
  explanations: Map<number, ExplanationContent>
): { consistent: boolean; issues: string[] } {
  const issues: string[] = [];
  const sortedLevels = Array.from(explanations.keys()).sort((a, b) => a - b);

  for (let i = 1; i < sortedLevels.length; i++) {
    const lower = explanations.get(sortedLevels[i - 1]);
    const higher = explanations.get(sortedLevels[i]);

    if (!lower || !higher) continue;

    // Check for contradictions (simplified)
    if (lower.recommendedAction && higher.recommendedAction &&
        lower.recommendedAction !== higher.recommendedAction) {
      issues.push(
        `Level ${sortedLevels[i - 1]} recommends "${lower.recommendedAction}" ` +
        `but level ${sortedLevels[i]} recommends "${higher.recommendedAction}"`
      );
    }
  }

  return { consistent: issues.length === 0, issues };
}

export { generateExplanation, autoSelectExplanationLevel } from "@zeo/explain";
export type { ExplanationLevel, ExplanationContent } from "@zeo/explain";

/**
 * Explain Integration
 *
 * Hooks @zeo/explain into result formatting.
 * Generates tiered explanations for decision results.
 */

import type { DecisionResult, UUID } from "@zeo/contracts";
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
  _decisionId: UUID,
  config: ExplanationConfig = DEFAULT_EXPLANATION_CONFIG
): Omit<DecisionResult, 'explanation'> & { explanation: ExplanationContent } {
  // Map numeric level to ExplanationLevel type
  const levelMap: Record<number, ExplanationLevel> = {
    0: 'executive',
    1: 'executive',
    2: 'operational',
    3: 'analytical',
    4: 'epistemic'
  };

  const selectionContext: ExplanationSelectionContext = {
    decisionRiskTier: 'operational',
    userInteractionCount: result.evaluations?.length || 0,
    recentOverrideCount: 0,
  };

  // Auto-select level based on context
  const autoSelectedLevel = autoSelectExplanationLevel(
    selectionContext,
    createDefaultRules()
  );

  // Map auto-selected level to numeric and pick the lower of maxLevel
  const autoSelectedNumeric = autoSelectedLevel === 'executive' ? 1 :
                              autoSelectedLevel === 'operational' ? 2 :
                              autoSelectedLevel === 'analytical' ? 3 : 4;
  const levelNum = Math.min(config.maxLevel, autoSelectedNumeric) as 0 | 1 | 2 | 3 | 4;
  const level = levelMap[levelNum];

  // Generate explanation - generateExplanation takes (result: unknown, level)
  // Cast result to unknown first to match the expected type
  const explanation = generateExplanation(result as unknown as Record<string, unknown>, level);

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
  const levelMap: Record<number, ExplanationLevel> = {
    0: 'executive',
    1: 'executive',
    2: 'operational',
    3: 'analytical',
    4: 'epistemic'
  };
  return generateExplanation(result, levelMap[level]);
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

    // Check for contradictions (simplified) - compare summaries
    if (lower.summary && higher.summary &&
        lower.summary !== higher.summary) {
      // Check if the summary contradicts - this is a simplified check
      const lowerActions = extractActionMentions(lower.summary);
      const higherActions = extractActionMentions(higher.summary);

      // Find conflicting recommendations
      for (const action of lowerActions) {
        if (higherActions.includes(`not-${action}`) ||
            (lower.summary.includes('recommend') && higher.summary.includes('avoid'))) {
          issues.push(
            `Level ${sortedLevels[i - 1]} recommends "${action}" ` +
            `but level ${sortedLevels[i]} appears to contradict this`
          );
        }
      }
    }
  }

  return { consistent: issues.length === 0, issues };
}

/**
 * Extract action mentions from summary text.
 */
function extractActionMentions(summary: string): string[] {
  // Simple extraction - look for quoted strings or capitalized phrases
  const matches = summary.match(/"([^"]+)"|(?:recommend|suggest|choose)\s+(\w+)/gi);
  return matches || [];
}

export { generateExplanation, autoSelectExplanationLevel } from "@zeo/explain";
export type { ExplanationLevel, ExplanationContent } from "@zeo/explain";

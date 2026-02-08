/**
 * Values Integration
 * 
 * Integrates @zeo/values into @zeo/core decision scoring.
 * Ensures no decision is scored without explicit value function.
 */

import type { DecisionSpec, DecisionResult, Action } from "@zeo/contracts";
import type { ValueProfile } from "@zeo/values";
import { evaluateActions, applyConstraints, ValueFunctionRequiredError } from "@zeo/values";

export interface DecisionWithValue {
  spec: DecisionSpec;
  valueProfile: ValueProfile | undefined;
}

/**
 * Evaluate decision actions with value function.
 * Throws ValueFunctionRequiredError if no value profile provided.
 */
export function evaluateDecisionActions(
  spec: DecisionSpec,
  valueProfile: ValueProfile | undefined,
  outcomes: Map<string, Record<string, number>>
): Array<{ action: Action; score: number; violations: unknown[] }> {
  if (!valueProfile) {
    throw new ValueFunctionRequiredError(
      `Decision "${spec.title}" requires an explicit value function. ` +
      `Define what "good" means for this decision using a ValueProfile.`
    );
  }

  const evaluated = evaluateActions(spec.actions, outcomes, valueProfile);
  
  return evaluated.map(e => ({
    action: e.action,
    score: e.score,
    violations: e.violations || [],
  }));
}

/**
 * Enrich decision result with value function information.
 */
export function enrichResultWithValueInfo(
  result: DecisionResult,
  valueProfile: ValueProfile | undefined
): DecisionResult {
  if (!valueProfile) {
    return {
      ...result,
      valueInfo: {
        hasValueFunction: false,
        warning: "Decision scored without explicit value function",
      },
    };
  }

  return {
    ...result,
    valueInfo: {
      hasValueFunction: true,
      profileId: valueProfile.id,
      profileName: valueProfile.name,
      objectiveCount: valueProfile.objectives.length,
      constraintCount: valueProfile.constraints.filter(c => c.isHard).length,
    },
  };
}

/**
 * Check if value function is properly configured.
 */
export function validateValueProfileForDecision(
  valueProfile: ValueProfile | undefined,
  spec: DecisionSpec
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!valueProfile) {
    errors.push("No value profile provided");
    return { valid: false, errors };
  }

  if (valueProfile.objectives.length === 0) {
    errors.push("Value profile has no objectives");
  }

  if (valueProfile.objectives.every(o => o.weight === 0)) {
    errors.push("All objectives have zero weight");
  }

  // Check if attributes cover decision context
  const decisionAttributes = new Set(spec.actions.flatMap(a => 
    Object.keys(a.expectedOutcome || {})
  ));
  
  const profileAttributes = new Set(valueProfile.attributes.map(a => a.id));
  
  for (const attr of decisionAttributes) {
    if (!profileAttributes.has(attr)) {
      errors.push(`Decision references attribute "${attr}" not in value profile`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export { ValueFunctionRequiredError } from "@zeo/values";

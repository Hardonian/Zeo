/**
 * Values Integration
 * 
 * Integrates @zeo/values into @zeo/core decision scoring.
 * Ensures no decision is scored without explicit value function.
 */

import type { DecisionSpec, DecisionResult } from "@zeo/contracts";
import type { ValueProfile, ValueFunction, ValueScoringContext } from "@zeo/values";
import { runGuards, EXPLICIT_VALUE_FUNCTION_RULE } from "@zeo/values";

export interface DecisionWithValue {
  spec: DecisionSpec;
  valueProfile: ValueProfile | undefined;
}

/**
 * Error thrown when decision is missing required value function.
 */
export class ValueFunctionRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValueFunctionRequiredError";
  }
}

/**
 * Validate that decision has explicit value function.
 * Throws ValueFunctionRequiredError if validation fails.
 */
export function requireValueFunction(
  spec: DecisionSpec,
  valueProfile: ValueProfile | undefined
): void {
  const guardContext = {
    profile: valueProfile,
    decisionId: spec.id,
  };

  const result = runGuards(guardContext, [EXPLICIT_VALUE_FUNCTION_RULE]);
  
  const missingValueError = result.errors.find(
    e => e.code === "MISSING_VALUE_FUNCTION"
  );
  
  if (missingValueError) {
    throw new ValueFunctionRequiredError(
      `Decision "${spec.title}" requires an explicit value function. ` +
      `Define what "good" means for this decision using a ValueProfile.`
    );
  }
}

/**
 * Check if value function is properly configured for decision.
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

  if (!valueProfile.defaultValueFunctionId) {
    errors.push("Value profile has no default value function");
  }

  const guardResult = runGuards({
    profile: valueProfile,
    decisionId: spec.id,
  });

  for (const error of guardResult.errors.filter(e => e.severity === "error")) {
    errors.push(error.message);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create value scoring context for decision.
 */
export function createValueScoringContext(
  decisionId: string,
  valueFunctionId: string,
  lensId?: string
): ValueScoringContext {
  return {
    decisionId,
    lensId,
    valueFunctionId,
    timestamp: new Date(),
  };
}

export { runGuards } from "@zeo/values";
export type { ValueProfile, ValueFunction } from "@zeo/values";


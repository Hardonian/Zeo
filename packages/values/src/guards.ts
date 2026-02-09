/**
 * Value System Guards
 * 
 * Enforces rules that prevent hidden optimization and ensure value system integrity.
 */

import type { 
  ValueFunction, 
  ValueProfile, 
  ValueScoringContext,
  ValueValidationError 
} from "./types";

export interface GuardRule {
  id: string;
  name: string;
  description: string;
  check: (context: GuardContext) => ValueValidationError | null;
}

export interface GuardContext {
  valueFunction?: ValueFunction;
  profile?: ValueProfile;
  scoringContext?: ValueScoringContext;
  decisionId?: string;
}

export const HIDDEN_OPTIMIZATION_RULE: GuardRule = {
  id: "NO_HIDDEN_OPTIMIZATION",
  name: "No Hidden Optimization",
  description: "Forbids value functions that hide optimization targets",
  check: (context: GuardContext): ValueValidationError | null => {
    const { valueFunction } = context;
    
    if (!valueFunction) {
      return {
        code: "MISSING_VALUE_FUNCTION",
        message: "No value function provided for decision",
        severity: "error"
      };
    }
    
    const weights = valueFunction.components;
    const totalWeight = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);
    
    if (totalWeight === 0) {
      return {
        code: "HIDDEN_OPTIMIZATION",
        message: `Value function '${valueFunction.label}' (${valueFunction.id}) has zero total weight - optimization target is hidden`,
        severity: "error",
        valueFunctionId: valueFunction.id,
        details: { totalWeight }
      };
    }
    
    const activeComponents = Object.entries(weights).filter(([_, v]) => (v ?? 0) > 0);
    if (activeComponents.length === 0) {
      return {
        code: "HIDDEN_OPTIMIZATION",
        message: `Value function '${valueFunction.label}' has no active components`,
        severity: "error",
        valueFunctionId: valueFunction.id
      };
    }
    
    return null;
  }
};

export const WEIGHT_DOMINANCE_RULE: GuardRule = {
  id: "WEIGHT_DOMINANCE_WARNING",
  name: "Weight Dominance Warning",
  description: "Warns when single component dominates outcome sensitivity",
  check: (context: GuardContext): ValueValidationError | null => {
    const { valueFunction } = context;
    
    if (!valueFunction) return null;
    
    const weights = valueFunction.components;
    const values = [
      weights.utility,
      weights.downside_penalty,
      weights.regret_penalty,
      weights.irreversibility_penalty,
      weights.fairness_penalty ?? 0
    ];
    
    const totalWeight = values.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return null;
    
    const maxWeight = Math.max(...values);
    const dominanceRatio = maxWeight / totalWeight;
    
    if (dominanceRatio > 0.85) {
      const dominantComponent = Object.entries(weights)
        .find(([_, v]) => v === maxWeight)?.[0] || "unknown";
      
      return {
        code: "WEIGHT_DOMINANCE",
        message: `Value function dominated by '${dominantComponent}' (${(dominanceRatio * 100).toFixed(1)}%). Outcome sensitivity to other factors is severely reduced.`,
        severity: "warning",
        valueFunctionId: valueFunction.id,
        details: {
          dominanceRatio,
          dominantComponent,
          totalWeight,
          componentWeights: weights
        }
      };
    }
    
    return null;
  }
};

export const EXPLICIT_VALUE_FUNCTION_RULE: GuardRule = {
  id: "EXPLICIT_VALUE_FUNCTION_REQUIRED",
  name: "Explicit Value Function Required",
  description: "Every decision must reference an explicit value function",
  check: (context: GuardContext): ValueValidationError | null => {
    const { scoringContext, decisionId } = context;
    
    if (!scoringContext && decisionId) {
      return {
        code: "MISSING_VALUE_FUNCTION",
        message: `Decision ${decisionId} has no value scoring context`,
        severity: "error",
        details: { decisionId }
      };
    }
    
    if (scoringContext && !scoringContext.valueFunctionId) {
      return {
        code: "MISSING_VALUE_FUNCTION",
        message: `Decision ${scoringContext.decisionId} scored without explicit value function`,
        severity: "error",
        details: { decisionId: scoringContext.decisionId }
      };
    }
    
    return null;
  }
};

export const COMPARABLE_ACROSS_LENSES_RULE: GuardRule = {
  id: "COMPARABLE_ACROSS_LENSES",
  name: "Comparable Across Lenses",
  description: "Value comparisons across lenses should use compatible functions",
  check: (context: GuardContext): ValueValidationError | null => {
    const { profile, scoringContext } = context;
    
    if (!profile || !scoringContext?.lensId) return null;
    
    const lensOverrides = profile.overrides.filter(o => o.lensId === scoringContext.lensId);
    
    if (lensOverrides.length > 0) {
      const defaultFuncId = profile.defaultValueFunctionId;
      const lensFuncId = lensOverrides[0].valueFunctionId;
      
      if (defaultFuncId !== lensFuncId) {
        return {
          code: "WEIGHT_DOMINANCE",
          message: `Lens '${scoringContext.lensId}' uses different value function (${lensFuncId}) than default (${defaultFuncId}). Cross-lens comparisons may be inconsistent.`,
          severity: "warning",
          details: {
            lensId: scoringContext.lensId,
            lensValueFunction: lensFuncId,
            defaultValueFunction: defaultFuncId
          }
        };
      }
    }
    
    return null;
  }
};

export const DEFAULT_GUARDS: GuardRule[] = [
  HIDDEN_OPTIMIZATION_RULE,
  WEIGHT_DOMINANCE_RULE,
  EXPLICIT_VALUE_FUNCTION_RULE,
  COMPARABLE_ACROSS_LENSES_RULE
];

export function runGuards(
  context: GuardContext,
  guards: GuardRule[] = DEFAULT_GUARDS
): { passed: boolean; errors: ValueValidationError[] } {
  const errors: ValueValidationError[] = [];
  
  for (const guard of guards) {
    const result = guard.check(context);
    if (result) {
      errors.push(result);
    }
  }
  
  const criticalErrors = errors.filter(e => e.severity === "error");
  
  return {
    passed: criticalErrors.length === 0,
    errors
  };
}

export function createGuardSuite(
  customRules: GuardRule[],
  options: { 
    failOnWarning?: boolean;
    skipDefaults?: boolean;
  } = {}
): (context: GuardContext) => { passed: boolean; errors: ValueValidationError[] } {
  const rules = options.skipDefaults 
    ? customRules 
    : [...DEFAULT_GUARDS, ...customRules];
  
  return (context: GuardContext) => {
    const { errors } = runGuards(context, rules);
    
    const criticalErrors = errors.filter(e => e.severity === "error");
    const warnings = errors.filter(e => e.severity === "warning");
    
    return {
      passed: options.failOnWarning 
        ? errors.length === 0 
        : criticalErrors.length === 0,
      errors
    };
  };
}


/**
 * Value Function Implementation
 *
 * Creates and manages value functions with explicit, auditable optimization targets.
 */

import type {
  ValueFunction,
  ValueWeights,
  ValueComponent,
  ValueValidationResult,
  ValueValidationError,
  MeasurementScale
} from "./types.js";

const VALID_COMPONENTS: ValueComponent[] = [
  "utility",
  "downside_penalty",
  "regret_penalty",
  "irreversibility_penalty",
  "fairness_penalty"
];

const VALID_SCALES: MeasurementScale[] = [
  "ratio",
  "interval",
  "ordinal",
  "nominal",
  "currency_usd",
  "currency_eur",
  "percent",
  "probability"
];

export function createValueFunction(
  label: string,
  components: Partial<ValueWeights>,
  units: string,
  description?: string
): ValueFunction {
  const now = new Date();

  const weights: ValueWeights = {
    utility: components.utility ?? 1.0,
    downside_penalty: components.downside_penalty ?? 0.0,
    regret_penalty: components.regret_penalty ?? 0.0,
    irreversibility_penalty: components.irreversibility_penalty ?? 0.0,
    fairness_penalty: components.fairness_penalty ?? 0.0
  };

  return {
    id: generateValueFunctionId(),
    label,
    description,
    components: weights,
    units,
    version: "1.0.0",
    createdAt: now,
    updatedAt: now
  };
}

export function normalizeWeights(weights: ValueWeights): ValueWeights {
  const values = [
    weights.utility,
    weights.downside_penalty,
    weights.regret_penalty,
    weights.irreversibility_penalty,
    weights.fairness_penalty ?? 0
  ];

  const sum = values.reduce((a, b) => a + b, 0);

  if (sum === 0) {
    return {
      utility: 1.0,
      downside_penalty: 0,
      regret_penalty: 0,
      irreversibility_penalty: 0,
      fairness_penalty: 0
    };
  }

  return {
    utility: weights.utility / sum,
    downside_penalty: weights.downside_penalty / sum,
    regret_penalty: weights.regret_penalty / sum,
    irreversibility_penalty: weights.irreversibility_penalty / sum,
    fairness_penalty: (weights.fairness_penalty ?? 0) / sum
  };
}

export function validateValueFunction(
  valueFunction: ValueFunction
): ValueValidationResult {
  const errors: ValueValidationError[] = [];
  const warnings: ValueValidationError[] = [];

  if (!valueFunction.id) {
    errors.push({
      code: "MISSING_VALUE_FUNCTION",
      message: "Value function must have an ID",
      severity: "error"
    });
  }

  if (!valueFunction.label || valueFunction.label.trim() === "") {
    errors.push({
      code: "MISSING_VALUE_FUNCTION",
      message: "Value function must have a label",
      severity: "error"
    });
  }

  const weights = valueFunction.components;
  const hasNegativeWeight = Object.values(weights).some(w => w !== undefined && w < 0);
  if (hasNegativeWeight) {
    errors.push({
      code: "INVALID_WEIGHTS",
      message: "Value weights must be non-negative",
      severity: "error",
      valueFunctionId: valueFunction.id
    });
  }

  const allZero = Object.values(weights).every(w => w === undefined || w === 0);
  if (allZero) {
    errors.push({
      code: "HIDDEN_OPTIMIZATION",
      message: "Value function has no active components - optimization target is hidden",
      severity: "error",
      valueFunctionId: valueFunction.id
    });
  }

  const maxWeight = Math.max(
    weights.utility,
    weights.downside_penalty,
    weights.regret_penalty,
    weights.irreversibility_penalty,
    weights.fairness_penalty ?? 0
  );
  const totalWeight = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);

  if (totalWeight > 0 && maxWeight / totalWeight > 0.8) {
    warnings.push({
      code: "WEIGHT_DOMINANCE",
      message: `Single component dominates with ${(maxWeight/totalWeight * 100).toFixed(1)}% of weight. Outcome sensitivity may be reduced.`,
      severity: "warning",
      valueFunctionId: valueFunction.id,
      details: {
        maxWeightRatio: maxWeight / totalWeight,
        dominantComponent: Object.entries(weights)
          .find(([_, v]) => v === maxWeight)?.[0]
      }
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function computeValueScore(
  valueFunction: ValueFunction,
  componentValues: Record<ValueComponent, number>
): number {
  const weights = valueFunction.components;

  let score = 0;
  score += (componentValues.utility ?? 0) * weights.utility;
  score += (componentValues.downside_penalty ?? 0) * weights.downside_penalty;
  score += (componentValues.regret_penalty ?? 0) * weights.regret_penalty;
  score += (componentValues.irreversibility_penalty ?? 0) * weights.irreversibility_penalty;
  score += (componentValues.fairness_penalty ?? 0) * (weights.fairness_penalty ?? 0);

  return score;
}

export function getActiveComponents(valueFunction: ValueFunction): ValueComponent[] {
  const active: ValueComponent[] = [];
  const weights = valueFunction.components;

  if (weights.utility > 0) active.push("utility");
  if (weights.downside_penalty > 0) active.push("downside_penalty");
  if (weights.regret_penalty > 0) active.push("regret_penalty");
  if (weights.irreversibility_penalty > 0) active.push("irreversibility_penalty");
  if (weights.fairness_penalty && weights.fairness_penalty > 0) active.push("fairness_penalty");

  return active;
}

export function compareValueFunctions(
  vf1: ValueFunction,
  vf2: ValueFunction
): { compatible: boolean; differences: string[] } {
  const differences: string[] = [];

  const components1 = getActiveComponents(vf1);
  const components2 = getActiveComponents(vf2);

  const onlyIn1 = components1.filter(c => !components2.includes(c));
  const onlyIn2 = components2.filter(c => !components1.includes(c));

  if (onlyIn1.length > 0) {
    differences.push(`vf1 has components not in vf2: ${onlyIn1.join(", ")}`);
  }
  if (onlyIn2.length > 0) {
    differences.push(`vf2 has components not in vf1: ${onlyIn2.join(", ")}`);
  }

  const sharedComponents = components1.filter(c => components2.includes(c));
  for (const component of sharedComponents) {
    const w1 = vf1.components[component] ?? 0;
    const w2 = vf2.components[component] ?? 0;
    if (Math.abs(w1 - w2) > 0.01) {
      differences.push(`Weight differs for ${component}: ${w1.toFixed(3)} vs ${w2.toFixed(3)}`);
    }
  }

  return {
    compatible: differences.length === 0,
    differences
  };
}

function generateValueFunctionId(): string {
  return `vf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


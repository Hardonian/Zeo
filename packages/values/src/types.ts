/**
 * Value System Encoding Types
 * 
 * Makes optimization targets explicit and inspectable.
 */

export type ValueComponent = 
  | "utility"
  | "downside_penalty" 
  | "regret_penalty"
  | "irreversibility_penalty"
  | "fairness_penalty";

export interface ValueComponentConfig {
  component: ValueComponent;
  weight: number;
  description?: string;
}

export interface ValueWeights {
  utility: number;
  downside_penalty: number;
  regret_penalty: number;
  irreversibility_penalty: number;
  fairness_penalty?: number;
}

export interface ValueFunction {
  id: string;
  label: string;
  description?: string;
  components: ValueWeights;
  units: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValueOverride {
  lensId?: string;
  decisionId?: string;
  valueFunctionId: string;
  reason: string;
  appliedAt: Date;
}

export interface ValueProfileChange {
  timestamp: Date;
  changeType: "create" | "update" | "override" | "delete";
  valueFunctionId: string;
  previousState?: Partial<ValueFunction> | { override?: ValueOverride };
  newState?: Partial<ValueFunction> | { override?: ValueOverride };
  actor: string;
  reason: string;
}

export interface ValueProfile {
  id: string;
  defaultValueFunctionId: string;
  overrides: ValueOverride[];
  changeHistory: ValueProfileChange[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ValueScoringContext {
  decisionId: string;
  lensId?: string;
  valueFunctionId: string;
  timestamp: Date;
}

export interface ValueScore {
  context: ValueScoringContext;
  totalScore: number;
  componentScores: Record<ValueComponent, number>;
  valueFunctionId: string;
  assumptions: string[];
}

export interface ValueValidationError {
  code: "HIDDEN_OPTIMIZATION" | "WEIGHT_DOMINANCE" | "MISSING_VALUE_FUNCTION" | "INVALID_WEIGHTS";
  message: string;
  severity: "error" | "warning";
  valueFunctionId?: string;
  details?: Record<string, unknown>;
}

export interface ValueValidationResult {
  valid: boolean;
  errors: ValueValidationError[];
  warnings: ValueValidationError[];
}

export type MeasurementScale = 
  | "ratio"
  | "interval" 
  | "ordinal"
  | "nominal"
  | "currency_usd"
  | "currency_eur"
  | "percent"
  | "probability";


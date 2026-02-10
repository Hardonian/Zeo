import {
    Assumption,
    Uncertainty,
    BudgetConstraints,
    TypedCost,
    TypedDuration,
    PlanResult,
    RunData
} from "@zeo/repro-pack";
import { DecisionResult } from "@zeo/contracts";

export type PolicySeverity = "warn" | "block";

export interface PolicyViolation {
    code: "POLICY_VIOLATION";
    policyId: string;
    severity: PolicySeverity;
    message: string;
    remediation: string;
    keys: string[];
}

export interface PolicyContext {
    // Inputs
    assumptions?: Assumption[];
    constraints?: BudgetConstraints;

    // Outputs
    runData?: Partial<RunData>;
    decisionResult?: Partial<DecisionResult>;
}

export interface Policy {
    id: string;
    name: string;
    description: string;
    validate(context: PolicyContext): PolicyViolation[];
}

export class PolicyEngine {
    private policies: Policy[] = [];

    constructor() {
        this.register(new UnitsSanityPolicy());
        this.register(new UncertaintyHonestyPolicy());
        this.register(new BudgetDisclosuresPolicy());
        this.register(new ConstraintFeasibilityPolicy());
    }

    register(policy: Policy) {
        this.policies.push(policy);
    }

    validate(context: PolicyContext): PolicyViolation[] {
        return this.policies.flatMap(p => p.validate(context));
    }
}

// ─── Policies ───────────────────────────────────────────────────────────────

class UnitsSanityPolicy implements Policy {
    id = "units-sanity";
    name = "Units Sanity Check";
    description = "Enforces non-negative durations/costs and valid units.";

    validate(context: PolicyContext): PolicyViolation[] {
        const violations: PolicyViolation[] = [];

        // Check constraints
        if (context.constraints) {
            const { maxCost, maxDuration } = context.constraints;

            if (maxCost && maxCost.amount < 0) {
                violations.push({
                    code: "POLICY_VIOLATION",
                    policyId: this.id,
                    severity: "block",
                    message: "Negative cost constraint detected.",
                    remediation: "Ensure maxCost amount is >= 0.",
                    keys: ["constraints.maxCost"]
                });
            }

            if (maxDuration && maxDuration.amount < 0) {
                violations.push({
                    code: "POLICY_VIOLATION",
                    policyId: this.id,
                    severity: "block",
                    message: "Negative duration constraint detected.",
                    remediation: "Ensure maxDuration amount is >= 0.",
                    keys: ["constraints.maxDuration"]
                });
            }
        }

        // Check assumptions for unit consistency (basic check)
        if (context.assumptions) {
            context.assumptions.forEach(ass => {
                if (typeof ass.value === 'number' && ass.value < 0 && (ass.units.includes('cost') || ass.units.includes('duration'))) {
                    // Heuristic: usually cost/duration shouldn't be negative in assumptions unless specified
                    // Keeping this as warn for now as negative costs (savings) might be valid in some contexts
                    violations.push({
                        code: "POLICY_VIOLATION",
                        policyId: this.id,
                        severity: "warn",
                        message: `Potential negative value for ${ass.key} with unit ${ass.units}.`,
                        remediation: "Verify if negative value is intended (e.g. savings) or an error.",
                        keys: [`assumptions.${ass.key}`]
                    });
                }
            });
        }

        return violations;
    }
}

class UncertaintyHonestyPolicy implements Policy {
    id = "uncertainty-honesty";
    name = "Uncertainty Honesty";
    description = "Ensures uncertainty is correctly represented and not masked.";

    validate(context: PolicyContext): PolicyViolation[] {
        const violations: PolicyViolation[] = [];

        // If runData has uncertaintyMap, check for "unknown"
        if (context.runData?.uncertaintyMap) {
            Object.entries(context.runData.uncertaintyMap).forEach(([key, uncertainty]) => {
                if (uncertainty.kind === "unknown") {
                    // This is actually a valid state, but we must ensure it isn't being used to mask a value.
                    // The policy says: if uncertainty.kind="unknown", UI/report must display unknown, never "~0"
                    // Here we assume the engine just flags it if it looks suspicious, but mostly this is a pass-through
                    // to ensure the UI handles it. 
                    // However, let's complain if params are provided for unknown.
                    if (uncertainty.params && Object.keys(uncertainty.params).length > 0) {
                        violations.push({
                            code: "POLICY_VIOLATION",
                            policyId: this.id,
                            severity: "warn",
                            message: `Uncertainty for ${key} is marked 'unknown' but has params.`,
                            remediation: "Remove params or change kind from 'unknown'.",
                            keys: [`uncertaintyMap.${key}`]
                        });
                    }
                }
            });
        }

        return violations;
    }
}

class BudgetDisclosuresPolicy implements Policy {
    id = "budget-disclosures";
    name = "Budget Disclosures";
    description = "Ensures partial outputs are flagged if budget is reached.";

    validate(context: PolicyContext): PolicyViolation[] {
        const violations: PolicyViolation[] = [];

        // Check if decision result status is budget_reached
        // Note: DecisionResult status string might vary, mapping to what we have in contracts
        if (context.decisionResult?.status === "budget_reached") {
            violations.push({
                code: "POLICY_VIOLATION",
                policyId: this.id,
                severity: "warn", // Warn because it's a valid state, but needs disclosure
                message: "Run terminated early due to budget constraints. Output is partial.",
                remediation: "Increase budget or accept partial results.",
                keys: ["status"]
            });
        }

        return violations;
    }
}

class ConstraintFeasibilityPolicy implements Policy {
    id = "constraint-feasibility";
    name = "Constraint Feasibility";
    description = "Blocks final recommendation language if plan is infeasible.";

    validate(context: PolicyContext): PolicyViolation[] {
        const violations: PolicyViolation[] = [];

        // Check if we have an infeasible plan explanation in the runData events
        const isInfeasible = context.runData?.events?.some(e => e.type === "PLAN_INFEASIBLE");

        if (isInfeasible) {
            violations.push({
                code: "POLICY_VIOLATION",
                policyId: this.id,
                severity: "block",
                message: "No feasible plan found under current constraints.",
                remediation: "Relax constraints or adjust assumptions.",
                keys: ["status", "constraints"]
            });
        }

        return violations;
    }
}

// Singleton instance
export const policyEngine = new PolicyEngine();

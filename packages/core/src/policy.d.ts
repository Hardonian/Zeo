import { Assumption, BudgetConstraints, RunData } from "@zeo/repro-pack";
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
    assumptions?: Assumption[];
    constraints?: BudgetConstraints;
    runData?: Partial<RunData>;
    decisionResult?: Partial<DecisionResult>;
}
export interface Policy {
    id: string;
    name: string;
    description: string;
    validate(context: PolicyContext): PolicyViolation[];
}
export declare class PolicyEngine {
    private policies;
    constructor();
    register(policy: Policy): void;
    validate(context: PolicyContext): PolicyViolation[];
}
export declare const policyEngine: PolicyEngine;
//# sourceMappingURL=policy.d.ts.map
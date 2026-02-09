/**
 * Repro Pack Types
 *
 * Types for reproducibility packs, assumptions tracking,
 * uncertainty surfacing, and typed cost/time/risk.
 */

// ─── Assumptions & Uncertainty ──────────────────────────────────────────────

export type AssumptionSource = "user" | "default" | "system";

export interface Assumption {
    key: string;
    label: string;
    value: unknown;
    units: string;
    source: AssumptionSource;
    rationale: string;
    sensitivity: number; // 0–1, higher = more sensitive
    provenance: string;  // traceable origin description
}

export type UncertaintyKind = "interval" | "stddev" | "distribution" | "unknown";

export interface Uncertainty {
    kind: UncertaintyKind;
    params: Record<string, number>;
    method?: string;
    note?: string;
}

// ─── Typed Cost / Time / Risk ───────────────────────────────────────────────

export interface TypedCost {
    amount: number;
    unit: string; // e.g. "USD", "EUR", "hours", "tokens"
}

export interface TypedDuration {
    amount: number;
    unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months";
}

export interface TypedRisk {
    level: number; // 0–1
    unit: string;  // e.g. "probability", "impact_score"
    label: string;
}

// ─── Budget Constraints ─────────────────────────────────────────────────────

export interface BudgetConstraints {
    maxCost?: TypedCost;
    maxDuration?: TypedDuration;
    maxRisk?: TypedRisk;
}

// ─── Plan Feasibility ───────────────────────────────────────────────────────

export type PlanStatus = "FEASIBLE" | "INFEASIBLE";

export interface InfeasiblePlanExplanation {
    status: "INFEASIBLE";
    reasons: string[];
    constraintsViolated: Array<{
        constraint: string;
        required: number;
        available: number;
        unit: string;
    }>;
    smallestRelaxation: Array<{
        constraint: string;
        relaxTo: number;
        unit: string;
    }>;
}

export interface FeasiblePlan {
    status: "FEASIBLE";
    planId: string;
    totalCost: TypedCost;
    totalDuration: TypedDuration;
    totalRisk: TypedRisk;
}

export type PlanResult = FeasiblePlan | InfeasiblePlanExplanation;

// ─── Run Events ─────────────────────────────────────────────────────────────

export type RunEventType =
    | "RUN_STARTED"
    | "ASSUMPTION_APPLIED"
    | "CONSTRAINT_EVALUATED"
    | "PLAN_SELECTED"
    | "PLAN_INFEASIBLE"
    | "ARTIFACT_PRODUCED"
    | "RUN_COMPLETED"
    | "RUN_FAILED";

export interface RunEvent {
    id: string;
    timestamp: string;
    type: RunEventType;
    data: Record<string, unknown>;
}

// ─── Repro Pack Manifest ────────────────────────────────────────────────────

export interface ReproPackManifest {
    schemaVersion: "1.0.0";
    appVersion: string;
    gitSha: string;
    createdAt: string;
    tenantId: string;
    actor: string;
    requestId: string;
    runId: string;
}

// ─── Pack Builder Params ────────────────────────────────────────────────────

export interface BuildReproPackParams {
    runId: string;
    tenantId: string;
    actor: string;
    requestId: string;
}

export interface RunData {
    inputs: Record<string, unknown>;
    assumptions: Assumption[];
    uncertaintyMap: Record<string, Uncertainty>;
    artifacts: {
        flipDistance: unknown;
        voiRankings: unknown;
        evidencePlan: unknown;
    };
    outputs: Record<string, unknown>;
    events: RunEvent[];
    seed?: string;
}

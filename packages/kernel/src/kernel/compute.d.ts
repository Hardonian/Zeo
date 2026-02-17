/**
 * Pure Decision Kernel — Compute Functions
 *
 * computeDecision: KernelInput -> KernelOutput
 * computePlan: KernelInput -> KernelPlanOutput
 * computeDiff: KernelOutput x KernelOutput -> KernelDiff
 *
 * INVARIANTS:
 * - No I/O (no fs, no net, no process, no env)
 * - No time (clock is injected via config)
 * - No randomness (RNG is seeded deterministically)
 * - No global mutable state (all state passed in, returned out)
 * - Same input -> identical output (by construction)
 */
import type { KernelInput, KernelOutput, KernelPlanOutput, KernelDiff } from "./types.js";
import type { DecisionIR, PlanIR } from "./ir.js";
export declare function computeDecision(input: KernelInput): KernelOutput;
export declare function computeDecisionIR(input: KernelInput): DecisionIR;
export declare function computePlan(input: KernelInput, budget: number): KernelPlanOutput;
export declare function computePlanIR(input: KernelInput, budget: number): PlanIR;
export declare function computeDiff(a: KernelOutput, b: KernelOutput): KernelDiff;
//# sourceMappingURL=compute.d.ts.map
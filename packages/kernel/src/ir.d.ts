/**
 * Decision IR (Intermediate Representation) v1
 *
 * Stable, versioned, JSON-serializable IR types.
 * The kernel produces IR; the runtime adapter consumes it.
 *
 * IR requirements:
 * - JSON-serializable
 * - Stable ordering rules (arrays sorted by deterministic keys)
 * - Explicit version field
 * - No embedded secrets
 * - tenant_id NEVER embedded (handled by runtime context)
 */
import type { KernelBranchGraph, KernelLensEvaluation, KernelExplanation, KernelFlipCondition, KernelFlipDistanceResult, KernelVoiEstimate, KernelEvidencePlanStep } from "./types.js";
export declare const IR_VERSION = "1.0.0";
export interface DecisionIR {
    version: typeof IR_VERSION;
    kind: "decision";
    /** What decision was computed */
    graph: KernelBranchGraph;
    evaluations: KernelLensEvaluation[];
    explanation: KernelExplanation;
    flipConditions: KernelFlipCondition[];
    /** What evidence to collect next (declarative) */
    evidenceRequests: EvidenceQueryIR[];
    /** What tool calls are requested (declarative, not executed) */
    toolCallRequests: ToolCallIR[];
    /** Status of computation */
    status: "completed" | "budget_reached";
    /** Stable hash of this IR */
    irHash: string;
}
export interface PlanIR {
    version: typeof IR_VERSION;
    kind: "plan";
    planId: string;
    flipDistances: KernelFlipDistanceResult[];
    voiEstimates: KernelVoiEstimate[];
    steps: KernelEvidencePlanStep[];
    totalExpectedGain: number;
    totalEstimatedCost: number;
    budget: number;
    /** Stable hash of this IR */
    irHash: string;
}
export interface EvidenceQueryIR {
    version: typeof IR_VERSION;
    kind: "evidence_query";
    /** What evidence to collect */
    prompt: string;
    rationale: string;
    /** Which assumptions this targets */
    targetAssumptions: string[];
    /** Priority (higher = more important) */
    priority: number;
}
export interface ToolCallIR {
    version: typeof IR_VERSION;
    kind: "tool_call";
    /** Tool to invoke */
    toolName: string;
    /** Tool version requirement */
    toolVersion: string;
    /** Arguments to pass (JSON-serializable) */
    args: Record<string, unknown>;
    /** Why this tool call is needed */
    rationale: string;
    /** Whether this call is required or optional */
    required: boolean;
}
export type IRNode = DecisionIR | PlanIR | EvidenceQueryIR | ToolCallIR;
export declare function validateIRVersion(node: {
    version: string;
}): boolean;
export declare function isDecisionIR(node: IRNode): node is DecisionIR;
export declare function isPlanIR(node: IRNode): node is PlanIR;
export declare function isEvidenceQueryIR(node: IRNode): node is EvidenceQueryIR;
export declare function isToolCallIR(node: IRNode): node is ToolCallIR;
//# sourceMappingURL=ir.d.ts.map
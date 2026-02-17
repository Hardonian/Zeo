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

import type {
  KernelBranchGraph,
  KernelLensEvaluation,
  KernelEvidenceCandidate,
  KernelExplanation,
  KernelFlipCondition,
  KernelFlipDistanceResult,
  KernelVoiEstimate,
  KernelEvidencePlanStep,
} from "./types.js";

// ─── IR Version ──────────────────────────────────────────────────────────

export const IR_VERSION = "1.0.0";

// ─── Decision IR ─────────────────────────────────────────────────────────

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

// ─── Plan IR ─────────────────────────────────────────────────────────────

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

// ─── Evidence Query IR ───────────────────────────────────────────────────

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

// ─── Tool Call IR (declarative, no execution) ────────────────────────────

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

// ─── Union type for all IR nodes ─────────────────────────────────────────

export type IRNode = DecisionIR | PlanIR | EvidenceQueryIR | ToolCallIR;

// ─── IR Validation ───────────────────────────────────────────────────────

export function validateIRVersion(node: { version: string }): boolean {
  return node.version === IR_VERSION;
}

export function isDecisionIR(node: IRNode): node is DecisionIR {
  return node.kind === "decision";
}

export function isPlanIR(node: IRNode): node is PlanIR {
  return node.kind === "plan";
}

export function isEvidenceQueryIR(node: IRNode): node is EvidenceQueryIR {
  return node.kind === "evidence_query";
}

export function isToolCallIR(node: IRNode): node is ToolCallIR {
  return node.kind === "tool_call";
}

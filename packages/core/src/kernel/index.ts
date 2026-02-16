/**
 * Decision Kernel — Public API
 *
 * Pure function pipeline: normalized inputs -> deterministic outputs.
 * No I/O, no time, no random, no global state.
 */

// Core types
export type {
  KernelInput,
  KernelOutput,
  KernelPlanOutput,
  KernelDiff,
  KernelConfig,
  KernelDecisionSpec,
  KernelClaim,
  KernelAgent,
  KernelAction,
  KernelConstraint,
  KernelObjective,
  KernelProbabilityInterval,
  KernelBranchGraph,
  KernelBranchNode,
  KernelBranchEdge,
  KernelLensEvaluation,
  KernelFlipCondition,
  KernelExplanation,
  KernelEvidenceCandidate,
  KernelEvidenceSnapshot,
  KernelEvidenceNode,
  KernelPolicySnapshot,
  KernelToolResult,
  KernelToolResultsSnapshot,
  KernelOutputMetadata,
  KernelFlipDistanceResult,
  KernelVoiEstimate,
  KernelEvidencePlanStep,
  KernelDiffAssumption,
  KernelDiffOutput,
  KernelDiffConfidence,
} from "./types.js";
export { KERNEL_VERSION, KERNEL_SCHEMA_VERSION } from "./types.js";

// IR types
export type {
  DecisionIR,
  PlanIR,
  EvidenceQueryIR,
  ToolCallIR,
  IRNode,
} from "./ir.js";
export {
  IR_VERSION,
  validateIRVersion,
  isDecisionIR,
  isPlanIR,
  isEvidenceQueryIR,
  isToolCallIR,
} from "./ir.js";

// Compute functions (pure)
export {
  computeDecision,
  computeDecisionIR,
  computePlan,
  computePlanIR,
  computeDiff,
} from "./compute.js";

// Hashing (pure)
export { kernelHash, kernelHashRaw } from "./hash.js";

// ID generation (pure, stateful only within returned object)
export { createKernelIdGenerator, type KernelIdGenerator } from "./id.js";

// RNG (pure, stateful only within returned object)
export { createKernelRng, type KernelRng } from "./rng.js";

// State machine
export {
  type ExecutionState,
  type StateTransition,
  type ExecutionTrace,
  DecisionStateMachine,
  ReplayStateMachine,
  formatExecutionTrace,
} from "./state-machine.js";

/**
 * Decision Kernel — Public API
 *
 * Pure function pipeline: normalized inputs -> deterministic outputs.
 * No I/O, no time, no random, no global state.
 */
export type { KernelInput, KernelOutput, KernelPlanOutput, KernelDiff, KernelConfig, KernelDecisionSpec, KernelClaim, KernelAgent, KernelAction, KernelConstraint, KernelObjective, KernelProbabilityInterval, KernelBranchGraph, KernelBranchNode, KernelBranchEdge, KernelLensEvaluation, KernelFlipCondition, KernelExplanation, KernelEvidenceCandidate, KernelEvidenceSnapshot, KernelEvidenceNode, KernelPolicySnapshot, KernelToolResult, KernelToolResultsSnapshot, KernelOutputMetadata, KernelFlipDistanceResult, KernelVoiEstimate, KernelEvidencePlanStep, KernelDiffAssumption, KernelDiffOutput, KernelDiffConfidence, } from "./types.js";
export { KERNEL_VERSION, KERNEL_SCHEMA_VERSION } from "./types.js";
export type { DecisionIR, PlanIR, EvidenceQueryIR, ToolCallIR, IRNode, } from "./ir.js";
export { IR_VERSION, validateIRVersion, isDecisionIR, isPlanIR, isEvidenceQueryIR, isToolCallIR, } from "./ir.js";
export { computeDecision, computeDecisionIR, computePlan, computePlanIR, computeDiff, } from "./compute.js";
export { kernelHash, kernelHashRaw } from "./hash.js";
export { createKernelIdGenerator, type KernelIdGenerator } from "./id.js";
export { createKernelRng, type KernelRng } from "./rng.js";
export { type ExecutionState, type StateTransition, type ExecutionTrace, DecisionStateMachine, ReplayStateMachine, formatExecutionTrace, } from "./state-machine.js";
export { type DeterminismError, type ValidationResult, DETERMINISM_SPEC_VERSION, validateNormalizedInput, validateStableSerialization, validateIROrdering, validateOutputHash, validateFloatBounds, mergeValidations, assertValid, DeterminismValidationError, } from "./determinism-validator.js";
//# sourceMappingURL=index.d.ts.map
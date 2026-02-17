/**
 * Decision Kernel — Public API
 *
 * Pure function pipeline: normalized inputs -> deterministic outputs.
 * No I/O, no time, no random, no global state.
 */
export { KERNEL_VERSION, KERNEL_SCHEMA_VERSION } from "./types.js";
export { IR_VERSION, validateIRVersion, isDecisionIR, isPlanIR, isEvidenceQueryIR, isToolCallIR, } from "./ir.js";
// Compute functions (pure)
export { computeDecision, computeDecisionIR, computePlan, computePlanIR, computeDiff, } from "./compute.js";
// Hashing (pure)
export { kernelHash, kernelHashRaw } from "./hash.js";
// ID generation (pure, stateful only within returned object)
export { createKernelIdGenerator } from "./id.js";
// RNG (pure, stateful only within returned object)
export { createKernelRng } from "./rng.js";
// State machine
export { DecisionStateMachine, ReplayStateMachine, formatExecutionTrace, } from "./state-machine.js";
// Determinism validator (DETERMINISM_SPEC.md §9)
export { DETERMINISM_SPEC_VERSION, validateNormalizedInput, validateStableSerialization, validateIROrdering, validateOutputHash, validateFloatBounds, mergeValidations, assertValid, DeterminismValidationError, } from "./determinism-validator.js";
//# sourceMappingURL=index.js.map
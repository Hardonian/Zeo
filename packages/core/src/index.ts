export * from "./engine.js";
export * from "./quant-engine.js";
export * from "./examples.js";
export * from "./canonicalize.js";
export * from "./rng.js";
export * from "./pruning.js";
export * from "./flip-conditions.js";
export * from "./evidence.js";
export * from "./packets.js";
export * from "./regime-integration.js";
export * from "./scenarios.js";
export {
  executeDecision,
  finalizeDecisionTranscript,
  verifyDecisionTranscript,
  normalizeTranscriptForReplay,
  computeStableHash,
  computeTranscriptHash as computeDecisionTranscriptHash,
  type ExecuteDecisionInput,
  type ExecuteDecisionOutput,
  type ReplayNormalizedTranscript,
} from "./transcript.js";
export type { RunMeta } from "./packets.js";
export {
  hashDecisionSpec,
  hashAssumptionSet,
  cacheKey,
} from "./hashing.js";
export type {
  LearningDecisionRunner,
  LearningAwareDecisionOptions,
  LearningAwareDecisionResult,
} from "./learning-integration.js";
export {
  evaluateActionsWithPosterior,
  computeVariableSensitivity,
  computeFlipConditions,
  generateEvidenceCandidatesFromFlips,
  type ActionScore,
} from "./decision-coupling.js";

// Runner - orchestrated execution
export { ZeoRunner, type ZeoRunnerConfig } from "./runner.js";

// Policy engine
export { policyEngine, type PolicyViolation } from "./policy.js";

// Reporting
export { generateDecisionReport, type DecisionReport } from "./reporting.js";

// Scenario packs
export {
  exportScenarioPack,
  importScenarioPack,
  type ImportedPackContent,
} from "./scenario-packs.js";

// Note: Re-exports from other packages removed due to cyclic dependencies
// and type incompatibility issues. Import directly from packages instead.

export * from "./transcript-security.js";
export { computeTranscriptHash as computeSecurityTranscriptHash } from "./transcript-security.js";

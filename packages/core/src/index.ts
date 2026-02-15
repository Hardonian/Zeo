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
  type ExecuteDecisionInput,
  type ExecuteDecisionOutput,
  computeStableHash,
  type ReplayNormalizedTranscript,
  normalizeTranscriptForReplay,
  finalizeDecisionTranscript,
  executeDecision,
  verifyDecisionTranscript,
  computeTranscriptHash as computeDecisionTranscriptHash,
} from "./transcript.js";
export * from "./graph.js";
export type { RunMeta } from "./packets.js";
export {
  computeTranscriptHash,
  hashDecisionSpec,
  hashAssumptionSet,
  cacheKey,
  getContractVersionHash,
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

// Capabilities / Permissions
export * from "./capabilities.js";
export * from "./limits.js";
export * from "./canonical-json.js";
export * from "./agent-manifest.js";
export * from "./migrations.js";

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

// Enterprise Wedge: Evidence + Policy Packs + Webhooks
export * from "./evidence-attestation.js";
export * from "./evidence-storage.js";
export * from "./policy-packs.js";
export * from "./webhooks-security.js";


// Note: Re-exports from other packages removed due to cyclic dependencies
// and type incompatibility issues. Import directly from packages instead.

export * from "./transcript-security.js";
export * from "./storage-provider.js";
export * from "./storage/prisma.js";
export * from "./storage/sqlite.js";
export * from "./evidence-signing.js";
export * from "./github-auth.js";

// v2.0 — Decision Operating System Hardening

// Deterministic execution
export * from "./deterministic.js";

// Execution snapshots
export {
  type ExecutionSnapshot,
  type ToolRegistryState,
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  computeInputHash,
  computeOutputHash,
  computeToolRegistryHash,
  computeChainHash,
  getDefaultToolRegistry,
} from "./snapshot.js";

// Replay engine
export {
  type ReplayVerdict,
  type ReplayResult as ReplayEngineResult,
  type ReplayDiff,
  replayRun,
  replaySnapshot,
  formatReplayResult,
} from "./replay-engine.js";

// Structured reasoning logs
export {
  type ReasoningStep,
  type ReasoningLog,
  ReasoningLogger,
  formatReasoningTrace,
  formatReasoningExplain,
} from "./reasoning-log.js";

// Diff engine
export {
  type RunDiff,
  type AssumptionDiff,
  type OutputDiff,
  type ConfidenceDelta as DiffConfidenceDelta,
  type EvidenceChange,
  diffRuns,
  diffSnapshots,
  formatRunDiff,
} from "./diff-engine.js";

// Evidence graph
export {
  type EvidenceNode,
  type EvidenceGraph as EvidenceGraphData,
  type DriftAlert,
  type OutcomeMarker,
  loadEvidenceGraph,
  saveEvidenceGraph,
  registerClaim,
  refreshConfidence,
  detectDrift,
  markOutcome,
  filterStale,
  filterByTag,
  filterByDecision,
  filterHighRegret,
  formatEvidenceList,
  formatDriftAlerts,
} from "./evidence-graph.js";

// Agent runtime schema
export {
  type AgentCapabilitySchema,
  type JsonSchema,
  type CostEstimate,
  type ResourceBudget,
  type ResourceUsage,
  type AgentHealthStatus,
  type AgentHealth,
  type ValidationResult,
  validateAgainstSchema,
  registerAgent,
  getAgent,
  listAgents,
  clearAgentRegistry,
  ResourceTracker,
  executeAgent,
  checkAgentHealth,
  formatAgentHealthList,
} from "./agent-schema.js";

// Planning engine
export {
  type FlipDistanceResult,
  type VoiEstimate,
  type EvidencePlanStep,
  type BoundedEvidencePlan,
  type ConfidenceDeltaProjection,
  computeFlipDistances,
  estimateVoi,
  generateEvidencePlan,
  projectConfidenceDeltas,
  formatFlipDistances,
  formatEvidencePlan,
  formatConfidenceDeltas,
} from "./plan-engine.js";

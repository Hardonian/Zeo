/**
 * @zeo/core Trust Envelope
 *
 * Deterministic execution fabric with verifiable reasoning boundaries.
 *
 * Components:
 *   - deterministicExecution: Same input → same output hash wrapper
 *   - boundaryGuard: Trust boundary enforcement at all entry points
 *   - invariantRegistry: Centralized system invariant checks
 *   - agentPolicyResolver: Policy enforcement for agent tool invocation
 *   - trustReport: Structured execution audit report
 */

export {
  executeDeterministic,
  executeDeterministicAsync,
  stripNondeterministicFields,
  stableSerialize,
  verifyFingerprints,
  type ExecutionFingerprint,
  type DeterministicExecutionOptions,
  type DeterministicExecutionResult,
} from "./deterministicExecution.js";

export {
  BoundaryGuard,
  BoundaryViolationError,
  getDefaultBoundaryGuard,
  resetDefaultBoundaryGuard,
  type BoundaryCheckResult,
  type BoundaryCheck,
  type BoundaryGuardConfig,
} from "./boundaryGuard.js";

export {
  InvariantRegistry,
  InvariantViolationError,
  getDefaultInvariantRegistry,
  resetInvariantRegistry,
  type Invariant,
  type InvariantContext,
  type InvariantViolation,
  type InvariantCheckResult,
} from "./invariantRegistry.js";

export {
  AgentPolicyResolver,
  PolicyResolutionError,
  getDefaultPolicyResolver,
  resetPolicyResolver,
  type AgentPolicy,
  type PolicyResolution,
  type PolicyResolverStats,
} from "./agentPolicyResolver.js";

export {
  createTrustReportBuilder,
  formatTrustReport,
  serializeTrustReport,
  type TrustReport,
  type TrustReportBuilder,
  type ExecutionTraceEntry,
  type ToolInvocation,
} from "./trustReport.js";

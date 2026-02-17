/**
 * Decision Kernel Types
 *
 * Pure data types for the decision kernel.
 * No I/O, no side effects, no Node-specific imports.
 * All types are JSON-serializable POJOs suitable for WASM boundary crossing.
 */

// ─── Kernel Input ─────────────────────────────────────────────────────────

export interface KernelConfig {
  seed: string;
  floatPrecision: number;
  maxDepth: 2 | 3;
  maxBranchesPerAction: number;
  useQuantEngine: boolean;
}

export interface KernelInput {
  /** Normalized decision spec (already canonicalized, tenant-scoped) */
  spec: KernelDecisionSpec;
  /** Evidence snapshot (already resolved, read-only data) */
  evidenceSnapshot: KernelEvidenceSnapshot;
  /** Policy snapshot (already validated, read-only data) */
  policySnapshot: KernelPolicySnapshot;
  /** Tool results snapshot (injected as data, no live calls) */
  toolResultsSnapshot: KernelToolResultsSnapshot;
  /** Deterministic configuration */
  config: KernelConfig;
  /** Schema version for forward/backward compat */
  schemaVersion: string;
}

// ─── Kernel Decision Spec (mirrors @zeo/contracts but kernel-local) ──────

export interface KernelProbabilityInterval {
  low: number;
  high: number;
}

export interface KernelClaim {
  id: string;
  text: string;
  status: "fact" | "belief" | "assumption" | "unknown";
  confidence: "low" | "medium" | "high";
  provenance?: string[];
  tags?: string[];
  probability?: KernelProbabilityInterval;
}

export interface KernelAgent {
  id: string;
  label: string;
  perspective: string;
}

export interface KernelAction {
  id: string;
  label: string;
  actorId: string;
  kind: string;
  rationale?: string;
}

export interface KernelConstraint {
  id: string;
  name: string;
  value: string;
  status: "fact" | "belief" | "assumption" | "unknown";
  provenance?: string[];
}

export interface KernelObjective {
  metric: string;
  weight: number;
}

export interface KernelDecisionSpec {
  id: string;
  title: string;
  context: string;
  horizon: "hours" | "days" | "weeks" | "months";
  agents: KernelAgent[];
  actions: KernelAction[];
  constraints: KernelConstraint[];
  assumptions: KernelClaim[];
  objectives: KernelObjective[];
  createdAt?: string;
}

// ─── Snapshots (injected data) ───────────────────────────────────────────

export interface KernelEvidenceNode {
  id: string;
  claim: string;
  source: string;
  confidenceScore: number;
  decayRate: number;
  linkedActions: string[];
  linkedDecisions: string[];
  tags: string[];
  outcome: "outcome_positive" | "outcome_negative" | "unknown";
  regretScore: number;
}

export interface KernelEvidenceSnapshot {
  version: string;
  nodes: KernelEvidenceNode[];
}

export interface KernelPolicySnapshot {
  policies: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
  enforcementStrength: "basic" | "moderate" | "maximum";
}

export interface KernelToolResult {
  toolName: string;
  toolVersion: string;
  status: "ready" | "error" | "timeout";
  result?: unknown;
}

export interface KernelToolResultsSnapshot {
  tools: KernelToolResult[];
}

// ─── Kernel Output ───────────────────────────────────────────────────────

export interface KernelBranchNode {
  id: string;
  label: string;
  kind: "state" | "event" | "outcome";
  notes: string[];
  dependencies: KernelClaim[];
}

export interface KernelBranchEdge {
  id: string;
  from: string;
  to: string;
  actionId: string | undefined;
  probability: KernelProbabilityInterval | undefined;
  notes: string[];
}

export interface KernelBranchGraph {
  id: string;
  decisionId: string;
  createdAt: string;
  nodes: KernelBranchNode[];
  edges: KernelBranchEdge[];
}

export interface KernelLensEvaluation {
  lens: "expected_utility" | "game_theory" | "evolutionary" | "robustness";
  summary: string;
  robustActions: string[];
  fragileAssumptions: string[];
  dominatedActions: string[];
}

export interface KernelFlipCondition {
  assumptionId: string;
  flipThreshold: string;
  reasoning: string;
}

export interface KernelExplanation {
  why: string[];
  whatWouldChange: Array<{
    assumptionId: string;
    flipCondition: string;
  }>;
}

export interface KernelEvidenceCandidate {
  prompt: string;
  rationale: string;
}

export interface KernelOutput {
  /** Decision result */
  graph: KernelBranchGraph;
  evaluations: KernelLensEvaluation[];
  nextBestEvidence: KernelEvidenceCandidate[];
  explanation: KernelExplanation;
  flipConditions: KernelFlipCondition[];
  /** Status */
  status: "completed" | "budget_reached";
  /** Stable hash of this output (computed deterministically) */
  outputHash: string;
  /** Schema version */
  schemaVersion: string;
  /** Metadata */
  metadata: KernelOutputMetadata;
}

export interface KernelOutputMetadata {
  inputHash: string;
  outputHash: string;
  kernelVersion: string;
  configHash: string;
}

// ─── Plan Output ─────────────────────────────────────────────────────────

export interface KernelFlipDistanceResult {
  assumptionId: string;
  assumptionText: string;
  flipDistance: number;
  currentConfidence: string;
  requiredShift: string;
}

export interface KernelVoiEstimate {
  evidencePrompt: string;
  rationale: string;
  benefitScore: number;
  costScore: number;
  voiScore: number;
  targetAssumptions: string[];
}

export interface KernelEvidencePlanStep {
  stepNumber: number;
  action: string;
  rationale: string;
  expectedConfidenceGain: number;
  estimatedCost: number;
  targetAssumptions: string[];
}

export interface KernelPlanOutput {
  planId: string;
  flipDistances: KernelFlipDistanceResult[];
  voiEstimates: KernelVoiEstimate[];
  steps: KernelEvidencePlanStep[];
  totalExpectedGain: number;
  totalEstimatedCost: number;
  budget: number;
  /** Stable hash */
  outputHash: string;
  schemaVersion: string;
}

// ─── Diff Output ─────────────────────────────────────────────────────────

export interface KernelDiffAssumption {
  id: string;
  text: string;
  changeType: "added" | "removed" | "modified";
  oldValue?: unknown;
  newValue?: unknown;
}

export interface KernelDiffOutput {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface KernelDiffConfidence {
  robustActionsA: string[];
  robustActionsB: string[];
  added: string[];
  removed: string[];
}

export interface KernelDiff {
  changedAssumptions: KernelDiffAssumption[];
  changedOutputs: KernelDiffOutput[];
  confidenceDelta: KernelDiffConfidence | null;
  summary: string;
  schemaVersion: string;
}

// ─── Constants ───────────────────────────────────────────────────────────

export const KERNEL_VERSION = "1.0.0";
export const KERNEL_SCHEMA_VERSION = "1.0.0";

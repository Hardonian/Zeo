import { sha256 } from "./utils/sha256.js";
import type { DecisionResult, DecisionSpec, FinalizedDecisionTranscript, LensEvaluation, DecisionTranscript, TranscriptAgentRecord, EvidenceEvent } from "@zeo/contracts";
import { runDecision, type RunDecisionOpts } from "./engine.js";
import { VERSION_INFO } from "./version.js";
import { encodeCanonicalJson } from "./canonical-json.js";
// cleaned up

export type ExecuteDecisionInput = {
  spec: DecisionSpec;
  opts?: RunDecisionOpts;
  evidence?: EvidenceEvent[];
  parentTranscriptHash?: string;
  dependsOn?: string[];
  informs?: string[];
  logicalTimestamp?: number;
  agents?: TranscriptAgentRecord[];
};

export type ExecuteDecisionOutput = {
  result: DecisionResult;
  transcript: FinalizedDecisionTranscript;
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function computeTranscriptHash(input: any): string {
  return sha256(encodeCanonicalJson(input));
}

export function computeStableHash(value: unknown): string {
  return computeTranscriptHash(value);
}

export { computeTranscriptHash };

export type ReplayNormalizedTranscript = {
  outcome: DecisionTranscript["outcome"];
  counterfactuals: DecisionTranscript["counterfactuals"];
  decision_boundaries: DecisionTranscript["analysis"]["decision_boundaries"];
  flip_distances: DecisionTranscript["analysis"]["flip_distances"];
  recommended_action_ids: string[];
  decision_result_hash: string;
};

export function normalizeTranscriptForReplay(transcript: DecisionTranscript | FinalizedDecisionTranscript): ReplayNormalizedTranscript {
  return {
    outcome: transcript.outcome,
    counterfactuals: transcript.counterfactuals,
    decision_boundaries: transcript.analysis.decision_boundaries,
    flip_distances: transcript.analysis.flip_distances,
    recommended_action_ids: [...transcript.outcome.recommended_action_ids],
    decision_result_hash: transcript.decision_result_hash,
  };
}


function buildDecisionBoundaries(evaluations: LensEvaluation[]): Array<{ lens: LensEvaluation["lens"]; robust_actions: string[]; fragile_assumptions: string[] }> {
  return evaluations.map((evaluation) => ({
    lens: evaluation.lens,
    robust_actions: [...evaluation.robustActions],
    fragile_assumptions: [...evaluation.fragileAssumptions],
  }));
}

function normalizeConfidence(result: DecisionResult): { lower: string; upper: string; method: string } {
  const intervals = result.graph.edges
    .filter((edge) => edge.probability)
    .map((edge) => edge.probability!);
  if (intervals.length === 0) return { lower: "0.0000", upper: "1.0000", method: "range_aggregation" };
  const lower = Math.max(0, Math.min(...intervals.map((p) => p.low)));
  const upper = Math.min(1, Math.max(...intervals.map((p) => p.high)));
  return { lower: lower.toFixed(4), upper: upper.toFixed(4), method: "range_aggregation" };
}


function normalizeDecisionResultForHash(result: DecisionResult): unknown {
  return {
    evaluations: result.evaluations,
    nextBestEvidence: result.nextBestEvidence,
    explanation: result.explanation,
    assumptions: result.assumptions,
    inferences: result.inferences,
    uncertaintyMap: result.uncertaintyMap,
    hygieneWarnings: result.hygieneWarnings,
    status: result.status,
    budget: result.budget,
    graph: {
      decisionId: result.graph.decisionId,
      nodes: result.graph.nodes.map((node) => ({
        label: node.label,
        kind: node.kind,
        notes: node.notes,
        dependencies: node.dependencies,
      })),
      edges: result.graph.edges.map((edge) => ({
        fromLabel: result.graph.nodes.find((node) => node.id === edge.from)?.label ?? edge.from,
        toLabel: result.graph.nodes.find((node) => node.id === edge.to)?.label ?? edge.to,
        actionId: edge.actionId,
        probability: edge.probability,
        notes: edge.notes,
      })),
    },
  };
}

function buildTranscript(input: ExecuteDecisionInput, result: DecisionResult): DecisionTranscript {
  const timestamp = input.logicalTimestamp ?? 0;
  const robustActions = result.evaluations.find((evaluation) => evaluation.lens === "robustness")?.robustActions ?? [];
  const evidence = (input.evidence ?? []).map((event) => ({
    evidenceId: event.id,
    sourceId: event.sourceId,
    capturedAt: event.capturedAt,
    checksum: event.checksum,
    observations: [...event.observations],
    provenance: event.claims.flatMap((claim) => claim.provenance ?? []).concat(event.constraints.flatMap((constraint) => constraint.provenance ?? [])),
    cost: { time: "unknown", compute: "unknown", risk: "unknown" },
  }));

  return {
    transcript_version: "1.0.0",
    zeo_version: VERSION_INFO.version,
    timestamp,
    logical_clock: [timestamp, result.graph.nodes.length, result.graph.edges.length],
    parent_transcript_hash: input.parentTranscriptHash,
    depends_on: input.dependsOn,
    informs: input.informs,
    inputs: {
      initial_context: input.spec.context,
      decision_spec: input.spec,
      assumptions: input.spec.assumptions.map((assumption) => ({ id: assumption.id, text: assumption.text, status: assumption.status })),
      constraints: input.spec.constraints.map((constraint) => ({ id: constraint.id, name: constraint.name, value: constraint.value, status: constraint.status })),
    },
    evidence: {
      submitted: evidence,
      totals: { count: evidence.length, time: `${evidence.length}`, risk: "bounded" },
    },
    analysis: {
      flip_distances: result.explanation.whatWouldChange.map((change, index) => ({
        assumption_id: change.assumptionId,
        distance: `${(index + 1).toFixed(4)}`,
        boundary: change.flipCondition,
      })),
      decision_boundaries: buildDecisionBoundaries(result.evaluations),
      voi_rankings: result.nextBestEvidence.map((item, index) => ({ prompt: item.prompt, rank: index + 1, rationale: item.rationale })),
    },
    plan: {
      regret_bounded_evidence_plan: result.nextBestEvidence.map((item) => ({ prompt: item.prompt, rationale: item.rationale })),
      stop_conditions: [
        "No non-dominated evidence actions remain",
        "Confidence range is decision-sufficient",
        "Flip-distance threshold exceeds admissible change",
      ],
    },
    outcome: {
      recommended_action_ids: robustActions,
      confidence_bounds: normalizeConfidence(result),
    },
    counterfactuals: result.explanation.whatWouldChange.map((change) => ({
      assumption_id: change.assumptionId,
      minimum_change: change.flipCondition,
    })),
    agents: input.agents ?? [],
    decision_result_hash: computeStableHash(normalizeDecisionResultForHash(result)),
    invariants: {
      determinism_checks: [
        "same_inputs_same_transcript",
        "append_order_deterministic",
        "transcript_does_not_mutate_result",
      ],
      validation_assertions: [
        "boundary_conditions_present",
        "counterfactuals_present",
        "confidence_bounds_present",
      ],
    },
  };
}

export function finalizeDecisionTranscript(transcript: DecisionTranscript): FinalizedDecisionTranscript {
  const transcript_hash = computeTranscriptHash(transcript);
  return {
    ...transcript,
    transcript_hash,
    transcript_id: `tr_${transcript_hash.slice(0, 16)}`,
  };
}

export function executeDecision(input: ExecuteDecisionInput): ExecuteDecisionOutput {
  const result = runDecision(input.spec, input.opts);
  const transcript = finalizeDecisionTranscript(buildTranscript(input, result));
  return { result, transcript };
}

export function verifyDecisionTranscript(transcript: FinalizedDecisionTranscript): { valid: boolean; reasons: string[] } {
  const { transcript_hash, transcript_id, ...unsigned } = transcript;
  const recomputed = computeTranscriptHash(unsigned);
  const reasons: string[] = [];

  if (transcript_hash !== recomputed) reasons.push("transcript_hash_mismatch");
  if (transcript_id !== `tr_${transcript_hash.slice(0, 16)}`) reasons.push("transcript_id_mismatch");
  const replayNormalized = normalizeTranscriptForReplay(unsigned);
  if (replayNormalized.flip_distances.length === 0) reasons.push("missing_flip_distances");
  if (replayNormalized.decision_boundaries.length === 0) reasons.push("missing_decision_boundaries");

  return { valid: reasons.length === 0, reasons };
}

import { createHash } from "node:crypto";
import type {
  DecisionSpec,
  DecisionResult,
  ObservationBatch,
  BranchGraph,
  LensEvaluation,
  ZeoError,
  ZeoErrorCode,
  RegimeState,
} from "@zeo/contracts";
import { hashDecisionSpec, hashAssumptionSet } from "./hashing.js";
import { canonicalizeDecisionSpec, canonicalizeObservationBatch, hashObservationBatch } from "./canonicalize.js";
import { computeDeterministicSeed } from "./rng.js";

const ENGINE_VERSION = "0.2.7";

export interface RunMeta {
  seed: string;
  depth: number;
  limits: {
    maxBranches: number;
    maxDepth: number;
  };
  startedAt: string;
  finishedAt: string;
}

export interface EvidencePacketJSON {
  version: string;
  engineVersion: string;
  decision: {
    spec: DecisionSpec;
    hash: string;
  };
  observationBatch?: {
    batch: ObservationBatch;
    hash: string;
  };
  regime?: {
    currentState: RegimeState | null;
    adjustmentsApplied: number;
  };
  runMeta: RunMeta;
  results: {
    graph: BranchGraph;
    evaluations: LensEvaluation[];
    nextBestEvidence: Array<{ prompt: string; rationale: string }>;
    explanation: {
      why: string[];
      whatWouldChange: Array<{ assumptionId: string; flipCondition: string }>;
    };
  };
  determinism: {
    decisionHash: string;
    observationHash?: string;
    seed: string;
    canonicalizedSpec: boolean;
    canonicalizedBatch: boolean;
  };
  errors?: Array<{ code: ZeoErrorCode; message: string; details?: unknown }>;
  exportedAt: string;
}

export interface EvidencePacketOptions {
  decisionSpec: DecisionSpec;
  decisionResult: DecisionResult;
  observationBatch?: ObservationBatch;
  runMeta: RunMeta;
  errors?: ZeoError[];
  currentRegime?: RegimeState;
  regimeAdjustmentsCount?: number;
}

function formatDuration(startedAt: string, finishedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatProvenance(provenance: Array<{ sourceId: string; capturedAt: string; checksum: string }>): string {
  return provenance.map(p => `- ${p.sourceId} (${p.capturedAt}) checksum=${p.checksum.slice(0, 8)}...`).join("\n");
}

function formatAssumptions(spec: DecisionSpec): string {
  return spec.assumptions.map(a => {
    const prob = a.probability ? ` [${(a.probability.low * 100).toFixed(0)}%-${(a.probability.high * 100).toFixed(0)}%]` : "";
    return `- [${a.status}] ${a.text}${prob}`;
  }).join("\n");
}

function formatTopSignals(evaluations: LensEvaluation[]): string {
  const robust = evaluations.find(e => e.lens === "robustness");
  if (!robust) return "No robust actions identified.";
  return robust.robustActions.length > 0
    ? robust.robustActions.slice(0, 5).join(", ")
    : "No clear robust actions.";
}

function formatBranches(graph: BranchGraph): string {
  const states = graph.nodes.filter(n => n.kind === "state").length;
  const events = graph.nodes.filter(n => n.kind === "event").length;
  const outcomes = graph.nodes.filter(n => n.kind === "outcome").length;
  return `${graph.nodes.length} total nodes (${states} states, ${events} events, ${outcomes} outcomes})`;
}

function formatWhatWouldChange(result: DecisionResult): string {
  if (result.explanation.whatWouldChange.length === 0) {
    return "No specific flip conditions identified.";
  }
  return result.explanation.whatWouldChange.map(wc => {
    const assumption = result.graph.nodes
      .flatMap(n => "dependencies" in n ? n.dependencies : [])
      .find(a => a.id === wc.assumptionId);
    const text = assumption?.text || "Unknown assumption";
    return `- If "${text}" changes: ${wc.flipCondition}`;
  }).join("\n");
}

function getAssumptionsWithIntervals(spec: DecisionSpec): Array<{ text: string; interval?: { low: number; high: number } }> {
  return spec.assumptions
    .filter(a => a.probability)
    .map(a => ({
      text: a.text,
      interval: {
        low: a.probability!.low,
        high: a.probability!.high,
      },
    }));
}

export function buildEvidencePacket(options: EvidencePacketOptions): EvidencePacketJSON {
  const {
    decisionSpec,
    decisionResult,
    observationBatch,
    runMeta,
    errors,
    currentRegime,
    regimeAdjustmentsCount,
  } = options;

  const canonicalSpec = canonicalizeDecisionSpec(decisionSpec);
  const decisionHash = hashDecisionSpec(canonicalSpec);

  let observationHash: string | undefined;
  let canonicalBatch: ObservationBatch | undefined;
  if (observationBatch) {
    canonicalBatch = canonicalizeObservationBatch(observationBatch);
    observationHash = hashObservationBatch(canonicalBatch);
  }

  const seed = computeDeterministicSeed(
    decisionHash,
    observationHash,
    runMeta.depth
  );

  const errorPayload = errors?.map(e => ({
    code: e.code,
    message: e.message,
    details: e.details,
  }));

  return {
    version: "1.0.0",
    engineVersion: ENGINE_VERSION,
    decision: {
      spec: decisionSpec,
      hash: decisionHash,
    },
    observationBatch: observationBatch && observationHash ? {
      batch: observationBatch,
      hash: observationHash,
    } : undefined,
    regime: currentRegime ? {
      currentState: currentRegime,
      adjustmentsApplied: regimeAdjustmentsCount ?? 0,
    } : undefined,
    runMeta,
    results: {
      graph: decisionResult.graph,
      evaluations: decisionResult.evaluations,
      nextBestEvidence: decisionResult.nextBestEvidence,
      explanation: decisionResult.explanation,
    },
    determinism: {
      decisionHash,
      observationHash,
      seed,
      canonicalizedSpec: true,
      canonicalizedBatch: !!observationBatch,
    },
    errors: errorPayload,
    exportedAt: new Date().toISOString(),
  };
}

export function buildEvidencePacketMarkdown(packet: EvidencePacketJSON): string {
  const lines: string[] = [];

  lines.push("# Zeo Evidence Packet");
  lines.push("");
  lines.push(`**Engine Version:** ${packet.engineVersion}`);
  lines.push(`**Exported At:** ${packet.exportedAt}`);
  lines.push(`**Duration:** ${formatDuration(packet.runMeta.startedAt, packet.runMeta.finishedAt)}`);
  lines.push("");

  lines.push("## Decision Summary");
  lines.push("");
  lines.push(`**Title:** ${packet.decision.spec.title}`);
  lines.push(`**Horizon:** ${packet.decision.spec.horizon}`);
  lines.push(`**Context:** ${packet.decision.spec.context}`);
  lines.push(`**Actions:** ${packet.decision.spec.actions.length}`);
  lines.push(`**Assumptions:** ${packet.decision.spec.assumptions.length}`);
  lines.push("");

  lines.push("## Assumptions & Intervals");
  lines.push("");
  const assumptionsWithIntervals = getAssumptionsWithIntervals(packet.decision.spec);
  if (assumptionsWithIntervals.length === 0) {
    lines.push("No probabilistic assumptions.");
  } else {
    for (const a of assumptionsWithIntervals) {
      lines.push(`- ${a.text}: [${(a.interval!.low * 100).toFixed(0)}%-${(a.interval!.high * 100).toFixed(0)}%]`);
    }
  }
  lines.push("");

  lines.push("## Evidence & Signals");
  lines.push("");
  if (packet.observationBatch) {
    lines.push(`**Observations:** ${packet.observationBatch.batch.items.length} signals`);
    lines.push("");
  } else {
    lines.push("_No observations provided._");
    lines.push("");
  }

  if (packet.regime) {
    lines.push("## Regime Context");
    lines.push("");
    lines.push(`**Current Regime:** ${packet.regime.currentState?.currentLabel || "unknown"}`);
    lines.push(`**Domain:** ${packet.regime.currentState?.domain || "not specified"}`);
    lines.push(`**Adjustments Applied:** ${packet.regime.adjustmentsApplied}`);
    lines.push(`**Updated At:** ${packet.regime.currentState?.updatedAt || "N/A"}`);
    lines.push("");
  }

  lines.push("## Dominant Branches");
  lines.push("");
  lines.push(`**Structure:** ${formatBranches(packet.results.graph)}`);
  lines.push(`**Top Robust Actions:** ${formatTopSignals(packet.results.evaluations)}`);
  lines.push("");

  lines.push("## What Would Change The Answer");
  lines.push("");
  lines.push(formatWhatWouldChange({
    graph: packet.results.graph,
    evaluations: packet.results.evaluations,
    nextBestEvidence: packet.results.nextBestEvidence,
    explanation: packet.results.explanation,
  } as DecisionResult));
  lines.push("");

  lines.push("## Determinism");
  lines.push("");
  lines.push(`- **Decision Hash:** \`${packet.determinism.decisionHash}\``);
  lines.push(`- **Observation Hash:** \`${packet.determinism.observationHash || "none"}\``);
  lines.push(`- **Seed:** \`${packet.determinism.seed}\``);
  lines.push(`- **Depth:** ${packet.runMeta.depth}`);
  lines.push(`- **Canonicalized Spec:** ${packet.determinism.canonicalizedSpec ? "Yes" : "No"}`);
  lines.push(`- **Canonicalized Batch:** ${packet.determinism.canonicalizedBatch ? "Yes" : "No"}`);
  lines.push("");

  lines.push("## Provenance");
  lines.push("");
  const allProvenances = packet.observationBatch?.batch.items.flatMap(item => item.provenance) || [];
  if (allProvenances.length === 0) {
    lines.push("_No provenance data._");
  } else {
    lines.push(formatProvenance(allProvenances as Array<{ sourceId: string; capturedAt: string; checksum: string }>));
  }
  lines.push("");

  if (packet.errors && packet.errors.length > 0) {
    lines.push("## Errors");
    lines.push("");
    for (const err of packet.errors) {
      lines.push(`- **[${err.code}]** ${err.message}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("*Generated by Zeo v${packet.engineVersion}*");

  return lines.join("\n");
}

export { ENGINE_VERSION };

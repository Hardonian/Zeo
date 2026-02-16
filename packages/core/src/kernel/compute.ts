/**
 * Pure Decision Kernel — Compute Functions
 *
 * computeDecision: KernelInput -> KernelOutput
 * computePlan: KernelInput -> KernelPlanOutput
 * computeDiff: KernelOutput x KernelOutput -> KernelDiff
 *
 * INVARIANTS:
 * - No I/O (no fs, no net, no process, no env)
 * - No time (clock is injected via config)
 * - No randomness (RNG is seeded deterministically)
 * - No global mutable state (all state passed in, returned out)
 * - Same input -> identical output (by construction)
 */

import type {
  KernelInput,
  KernelOutput,
  KernelPlanOutput,
  KernelDiff,
  KernelBranchGraph,
  KernelBranchNode,
  KernelBranchEdge,
  KernelLensEvaluation,
  KernelFlipCondition,
  KernelEvidenceCandidate,
  KernelProbabilityInterval,
  KernelClaim,
  KernelAction,
  KernelDecisionSpec,
  KernelFlipDistanceResult,
  KernelVoiEstimate,
  KernelEvidencePlanStep,
  KernelDiffAssumption,
  KernelDiffOutput,
  KernelDiffConfidence,
} from "./types.js";
import { KERNEL_VERSION, KERNEL_SCHEMA_VERSION } from "./types.js";
import { kernelHash, kernelHashRaw } from "./hash.js";
import { createKernelIdGenerator, type KernelIdGenerator } from "./id.js";
import type { DecisionIR, PlanIR, EvidenceQueryIR } from "./ir.js";
import { IR_VERSION } from "./ir.js";

// ─── Internal Helpers ────────────────────────────────────────────────────

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function interval(low: number, high: number): KernelProbabilityInterval {
  return { low: clamp01(low), high: clamp01(high) };
}

function negotiationHeuristicBranches(
  action: KernelAction,
): Array<{ label: string; p: KernelProbabilityInterval; deps: KernelClaim[]; notes: string[] }> {
  const baseDeps: KernelClaim[] = [];
  const common = [
    { label: "Accept", p: interval(0.2, 0.45), deps: baseDeps, notes: ["Accepts your move as framed."] },
    { label: "Counter", p: interval(0.35, 0.6), deps: baseDeps, notes: ["Responds with a modified offer."] },
    { label: "Stall", p: interval(0.1, 0.3), deps: baseDeps, notes: ["Delays decision; may seek internal approval."] },
    { label: "Reject", p: interval(0.05, 0.25), deps: baseDeps, notes: ["Declines; could be final or tactical."] },
  ];

  if (action.kind === "delay" || action.kind === "verify") {
    return [
      { label: "Provides more info", p: interval(0.25, 0.5), deps: baseDeps, notes: ["Shares details that reduce uncertainty."] },
      { label: "Pushes for commitment", p: interval(0.2, 0.45), deps: baseDeps, notes: ["Seeks to shorten timeline or force a decision."] },
      { label: "Stalls", p: interval(0.2, 0.45), deps: baseDeps, notes: ["Delay continues; uncertainty remains high."] },
    ];
  }

  return common;
}

function createNode(
  idGen: KernelIdGenerator,
  label: string,
  kind: KernelBranchNode["kind"],
  notes: string[],
  deps: KernelClaim[] = [],
): KernelBranchNode {
  return { id: idGen.nextId(), label, kind, notes, dependencies: deps };
}

function createEdge(
  idGen: KernelIdGenerator,
  from: string,
  to: string,
  actionId: string | undefined,
  p: KernelProbabilityInterval | undefined,
  notes: string[],
): KernelBranchEdge {
  return { id: idGen.nextId(), from, to, actionId, probability: p, notes };
}

// ─── Branch Graph Generation ─────────────────────────────────────────────

function generateBranchGraph(
  idGen: KernelIdGenerator,
  spec: KernelDecisionSpec,
  clockNow: string,
  maxDepth: 2 | 3,
  maxBranchesPerAction: number,
): KernelBranchGraph {
  // Validate provenance for facts
  for (const c of spec.constraints) {
    if (c.status === "fact" && (!c.provenance || c.provenance.length === 0)) {
      throw new Error(`Fact constraint "${c.name}: ${c.value}" is missing provenance.`);
    }
  }

  const root = createNode(idGen, spec.title, "state", [spec.context], []);
  const nodes: KernelBranchNode[] = [root];
  const edges: KernelBranchEdge[] = [];

  for (const a of spec.actions) {
    const aNode = createNode(idGen, `Action: ${a.label}`, "event", [`Actor: ${a.actorId}`, `Kind: ${a.kind}`]);
    nodes.push(aNode);
    edges.push(createEdge(idGen, root.id, aNode.id, a.id, undefined, ["User-initiated action"]));

    const branches = negotiationHeuristicBranches(a).slice(0, maxBranchesPerAction);
    for (const b of branches) {
      const out = createNode(idGen, `Outcome: ${b.label}`, "outcome", b.notes, b.deps);
      nodes.push(out);
      edges.push(createEdge(idGen, aNode.id, out.id, a.id, b.p, ["Counterparty response branch"]));
    }
  }

  if (maxDepth === 3) {
    const outcomes = nodes.filter((n) => n.kind === "outcome");
    for (const o of outcomes) {
      const rel = createNode(idGen, "Second-order: relationship impact", "state", [
        "Reputation and future cooperation probability may shift.",
        "This node exists to force second-order thinking; it is not a claim of measurement.",
      ]);
      nodes.push(rel);
      edges.push(createEdge(idGen, o.id, rel.id, undefined, interval(0.6, 0.9), ["Second-order effects are likely in repeated interactions."]));
    }
  }

  return {
    id: idGen.nextId(),
    decisionId: spec.id,
    createdAt: clockNow,
    nodes,
    edges,
  };
}

// ─── Evaluations ─────────────────────────────────────────────────────────

function evaluateRobustness(spec: KernelDecisionSpec, graph: KernelBranchGraph): KernelLensEvaluation {
  const acceptable = new Set(["Accept", "Counter", "Provides more info"]);
  const actionScores: Array<{ actionId: string; minScore: number }> = [];

  for (const a of spec.actions) {
    const outEdges = graph.edges.filter((e) => e.actionId === a.id && e.probability);
    let accLow = 0;
    let rejHigh = 0;
    for (const e of outEdges) {
      const toNode = graph.nodes.find((n) => n.id === e.to);
      if (!toNode || !e.probability) continue;
      const label = toNode.label.replace("Outcome: ", "");
      if (acceptable.has(label)) accLow += e.probability.low;
      if (label === "Reject") rejHigh += e.probability.high;
    }
    actionScores.push({ actionId: a.id, minScore: accLow - rejHigh });
  }

  actionScores.sort((a, b) => b.minScore - a.minScore || a.actionId.localeCompare(b.actionId));
  const best = actionScores.slice(0, Math.max(1, Math.min(2, actionScores.length))).map((s) => s.actionId);

  const fragile = spec.assumptions
    .filter((c) => c.status === "assumption" || c.status === "belief")
    .slice(0, 3)
    .map((c) => c.id);

  const anyPositive = actionScores.some((s) => s.minScore > 0);
  const dominated = anyPositive ? actionScores.filter((s) => s.minScore < 0).map((s) => s.actionId) : [];

  return {
    lens: "robustness",
    summary: `Selected ${best.length} robust action(s) by conservative acceptable-outcome mass (low) minus reject mass (high).`,
    robustActions: best,
    fragileAssumptions: fragile,
    dominatedActions: dominated,
  };
}

function evaluateExpectedUtility(spec: KernelDecisionSpec): KernelLensEvaluation {
  return {
    lens: "expected_utility",
    summary: "Expected utility is presented qualitatively in v0.1. Zeo avoids inventing utilities; users may add explicit utility weights in a later version.",
    robustActions: spec.actions.slice(0, 1).map((a) => a.id),
    fragileAssumptions: spec.assumptions.slice(0, 2).map((a) => a.id),
    dominatedActions: [],
  };
}

function evaluateGameTheory(spec: KernelDecisionSpec): KernelLensEvaluation {
  return {
    lens: "game_theory",
    summary: "Game theory lens requires an explicit payoff structure and belief model of other agents. v0.1 highlights multi-agent incentives without asserting equilibrium.",
    robustActions: spec.actions
      .filter((a) => a.kind === "verify" || a.kind === "delay")
      .map((a) => a.id)
      .slice(0, 1),
    fragileAssumptions: spec.assumptions.slice(0, 2).map((a) => a.id),
    dominatedActions: [],
  };
}

function evaluateEvolutionary(spec: KernelDecisionSpec): KernelLensEvaluation {
  return {
    lens: "evolutionary",
    summary: "Evolutionary lens emphasizes repeated interactions: cooperation, retaliation, and reputation effects. v0.1 treats this as a second-order overlay.",
    robustActions: spec.actions
      .filter((a) => a.kind === "communicate" || a.kind === "verify")
      .map((a) => a.id)
      .slice(0, 1),
    fragileAssumptions: spec.assumptions.slice(0, 2).map((a) => a.id),
    dominatedActions: [],
  };
}

// ─── Flip Conditions ─────────────────────────────────────────────────────

function generateKernelFlipConditions(
  spec: KernelDecisionSpec,
  evaluations: KernelLensEvaluation[],
): KernelFlipCondition[] {
  const robustness = evaluations.find((e) => e.lens === "robustness");
  const conditions: KernelFlipCondition[] = [];

  for (const assumption of spec.assumptions) {
    const isFlagged = robustness?.fragileAssumptions.includes(assumption.id) ?? false;
    if (!isFlagged && assumption.confidence === "high") continue;

    const prob = assumption.probability;
    let threshold: string;
    let reasoning: string;

    if (prob) {
      const midpoint = (prob.low + prob.high) / 2;
      threshold = `Shift probability outside [${(prob.low * 100).toFixed(0)}%, ${(prob.high * 100).toFixed(0)}%]`;
      reasoning = midpoint > 0.5
        ? "Currently favors positive outcome; a drop below midpoint would flip recommendation."
        : "Currently uncertain; any significant shift could change the recommended action.";
    } else {
      threshold = `Change epistemic status from '${assumption.status}'`;
      reasoning = "This assumption lacks probability bounds; resolving it would materially affect the decision.";
    }

    conditions.push({
      assumptionId: assumption.id,
      flipThreshold: threshold,
      reasoning,
    });
  }

  return conditions;
}

// ─── Evidence Candidates ─────────────────────────────────────────────────

function generateEvidenceCandidates(): KernelEvidenceCandidate[] {
  return [
    {
      prompt: "Ask or verify the counterparty's timeline constraints (decision deadline, internal approvals).",
      rationale: "Timeline sensitivity often flips whether to press, verify, or concede on secondary terms.",
    },
    {
      prompt: "Confirm the non-negotiable constraints (budget, exclusivity, termination terms) with provenance.",
      rationale: "Hard constraints collapse many branches early and prevent wasted negotiation cycles.",
    },
    {
      prompt: "Probe the counterparty's primary objective (speed vs price vs risk) via a targeted question.",
      rationale: "Objective ordering determines which concessions are high-leverage and which are wasted.",
    },
  ];
}

// ─── computeDecision ─────────────────────────────────────────────────────

export function computeDecision(input: KernelInput): KernelOutput {
  const { spec, config } = input;
  const idGen = createKernelIdGenerator(config.seed);

  // Use a fixed clock value derived from seed for determinism
  const clockNow = "2025-01-01T00:00:00.000Z";

  // Generate branch graph
  const graph = generateBranchGraph(
    idGen,
    spec,
    clockNow,
    config.maxDepth,
    config.maxBranchesPerAction,
  );

  // Run evaluations
  const evaluations: KernelLensEvaluation[] = [
    evaluateRobustness(spec, graph),
    evaluateExpectedUtility(spec),
    evaluateGameTheory(spec),
    evaluateEvolutionary(spec),
  ];

  // Flip conditions
  const flipConditions = generateKernelFlipConditions(spec, evaluations);

  // Evidence candidates
  const nextBestEvidence = generateEvidenceCandidates();

  // Explanation
  const explanation = {
    why: [
      "Zeo generated a conservative branch map emphasizing plausible counterparty responses.",
      "Recommendations prioritize robustness: actions that retain value across uncertain assumptions.",
      "Uncertainty is represented as probability ranges and explicit dependencies.",
    ],
    whatWouldChange: flipConditions.map((fc) => ({
      assumptionId: fc.assumptionId,
      flipCondition: `${fc.flipThreshold}. ${fc.reasoning}`,
    })),
  };

  // Compute stable output hash
  const outputData = {
    evaluations,
    nextBestEvidence,
    explanation,
    graph: {
      decisionId: graph.decisionId,
      nodes: graph.nodes.map((n) => ({ label: n.label, kind: n.kind, notes: n.notes })),
      edges: graph.edges.map((e) => ({
        from: e.from,
        to: e.to,
        actionId: e.actionId,
        probability: e.probability,
        notes: e.notes,
      })),
    },
  };
  const outputHash = kernelHash(outputData);
  const inputHash = kernelHash(input);
  const configHash = kernelHash(config);

  return {
    graph,
    evaluations,
    nextBestEvidence,
    explanation,
    flipConditions,
    status: "completed",
    outputHash,
    schemaVersion: KERNEL_SCHEMA_VERSION,
    metadata: {
      inputHash,
      outputHash,
      kernelVersion: KERNEL_VERSION,
      configHash,
    },
  };
}

// ─── computeDecisionIR ──────────────────────────────────────────────────

export function computeDecisionIR(input: KernelInput): DecisionIR {
  const output = computeDecision(input);

  const evidenceRequests: EvidenceQueryIR[] = output.nextBestEvidence.map((e, i) => ({
    version: IR_VERSION,
    kind: "evidence_query" as const,
    prompt: e.prompt,
    rationale: e.rationale,
    targetAssumptions: [],
    priority: output.nextBestEvidence.length - i,
  }));

  const toolCallRequests = input.toolResultsSnapshot.tools
    .filter((t) => t.status === "ready")
    .map((t) => ({
      version: IR_VERSION,
      kind: "tool_call" as const,
      toolName: t.toolName,
      toolVersion: t.toolVersion,
      args: {} as Record<string, unknown>,
      rationale: `Tool ${t.toolName} is available and ready`,
      required: false,
    }));

  const irHash = kernelHash({
    graph: output.graph,
    evaluations: output.evaluations,
    explanation: output.explanation,
    flipConditions: output.flipConditions,
    evidenceRequests,
    status: output.status,
  });

  return {
    version: IR_VERSION,
    kind: "decision",
    graph: output.graph,
    evaluations: output.evaluations,
    explanation: output.explanation,
    flipConditions: output.flipConditions,
    evidenceRequests,
    toolCallRequests,
    status: output.status,
    irHash,
  };
}

// ─── computePlan ─────────────────────────────────────────────────────────

export function computePlan(input: KernelInput, budget: number): KernelPlanOutput {
  const output = computeDecision(input);

  // Flip distances
  const flipDistances = computeFlipDistances(input.spec, output);

  // VOI estimates
  const voiEstimates = computeVoiEstimates(input.spec, output, flipDistances);

  // Bounded evidence plan
  const steps: KernelEvidencePlanStep[] = [];
  let remainingBudget = budget;
  let totalGain = 0;
  let totalCost = 0;
  let stepNum = 0;

  for (const estimate of voiEstimates) {
    const stepCost = Math.ceil(estimate.costScore * 10);
    if (stepCost > remainingBudget) continue;

    stepNum++;
    const gain = estimate.benefitScore * 0.2;

    steps.push({
      stepNumber: stepNum,
      action: estimate.evidencePrompt,
      rationale: estimate.rationale,
      expectedConfidenceGain: Math.round(gain * 10000) / 10000,
      estimatedCost: stepCost,
      targetAssumptions: estimate.targetAssumptions,
    });

    totalGain += gain;
    totalCost += stepCost;
    remainingBudget -= stepCost;
  }

  const planHash = kernelHash({ spec: input.spec.id, budget, steps: steps.length });
  const planId = `plan_${planHash.slice(0, 12)}`;

  const outputHash = kernelHash({
    planId,
    flipDistances,
    voiEstimates,
    steps,
    totalExpectedGain: Math.round(totalGain * 10000) / 10000,
    totalEstimatedCost: totalCost,
    budget,
  });

  return {
    planId,
    flipDistances,
    voiEstimates,
    steps,
    totalExpectedGain: Math.round(totalGain * 10000) / 10000,
    totalEstimatedCost: totalCost,
    budget,
    outputHash,
    schemaVersion: KERNEL_SCHEMA_VERSION,
  };
}

// ─── computePlanIR ──────────────────────────────────────────────────────

export function computePlanIR(input: KernelInput, budget: number): PlanIR {
  const plan = computePlan(input, budget);

  return {
    version: IR_VERSION,
    kind: "plan",
    planId: plan.planId,
    flipDistances: plan.flipDistances,
    voiEstimates: plan.voiEstimates,
    steps: plan.steps,
    totalExpectedGain: plan.totalExpectedGain,
    totalEstimatedCost: plan.totalEstimatedCost,
    budget: plan.budget,
    irHash: plan.outputHash,
  };
}

// ─── Flip Distances (for plan) ───────────────────────────────────────────

function computeFlipDistances(
  spec: KernelDecisionSpec,
  output: KernelOutput,
): KernelFlipDistanceResult[] {
  const robustness = output.evaluations.find((e) => e.lens === "robustness");
  if (!robustness) return [];

  const distances: KernelFlipDistanceResult[] = [];

  for (const assumption of spec.assumptions) {
    const isFlagged = robustness.fragileAssumptions.includes(assumption.id);
    const prob = assumption.probability;

    let distance: number;
    if (prob) {
      const width = prob.high - prob.low;
      distance = width > 0 ? Math.min(1, width) : 0.1;
      if (isFlagged) distance *= 0.5;
    } else {
      distance = isFlagged ? 0.3 : 0.7;
    }

    distances.push({
      assumptionId: assumption.id,
      assumptionText: assumption.text,
      flipDistance: Math.round(distance * 10000) / 10000,
      currentConfidence: assumption.confidence,
      requiredShift: prob
        ? `Shift probability outside [${(prob.low * 100).toFixed(0)}%, ${(prob.high * 100).toFixed(0)}%]`
        : `Change epistemic status from '${assumption.status}'`,
    });
  }

  distances.sort((a, b) => a.flipDistance - b.flipDistance);
  return distances;
}

// ─── VOI Estimates (for plan) ────────────────────────────────────────────

function computeVoiEstimates(
  spec: KernelDecisionSpec,
  output: KernelOutput,
  flipDistances: KernelFlipDistanceResult[],
): KernelVoiEstimate[] {
  const estimates: KernelVoiEstimate[] = [];

  for (const evidence of output.nextBestEvidence) {
    const relatedAssumptions = flipDistances.filter((fd) => {
      const eWords = new Set(evidence.prompt.toLowerCase().split(/\s+/));
      const aWords = fd.assumptionText.toLowerCase().split(/\s+/);
      return aWords.some((w) => eWords.has(w) && w.length > 3);
    });

    const avgFlipDistance =
      relatedAssumptions.length > 0
        ? relatedAssumptions.reduce((s, a) => s + a.flipDistance, 0) / relatedAssumptions.length
        : 0.5;
    const benefitScore = Math.max(0.1, 1 - avgFlipDistance);
    const costScore = Math.max(0.1, Math.min(1, evidence.prompt.length / 200));
    const voiScore = costScore > 0 ? Math.round((benefitScore / costScore) * 10000) / 10000 : 0;

    estimates.push({
      evidencePrompt: evidence.prompt,
      rationale: evidence.rationale,
      benefitScore: Math.round(benefitScore * 10000) / 10000,
      costScore: Math.round(costScore * 10000) / 10000,
      voiScore,
      targetAssumptions: relatedAssumptions.map((a) => a.assumptionId),
    });
  }

  estimates.sort((a, b) => b.voiScore - a.voiScore);
  return estimates;
}

// ─── computeDiff ─────────────────────────────────────────────────────────

export function computeDiff(a: KernelOutput, b: KernelOutput): KernelDiff {
  const changedAssumptions: KernelDiffAssumption[] = [];
  const changedOutputs: KernelDiffOutput[] = [];

  // Compare evaluations
  if (a.evaluations.length !== b.evaluations.length) {
    changedOutputs.push({
      field: "evaluations.length",
      oldValue: a.evaluations.length,
      newValue: b.evaluations.length,
    });
  }

  for (let i = 0; i < Math.min(a.evaluations.length, b.evaluations.length); i++) {
    if (a.evaluations[i].summary !== b.evaluations[i].summary) {
      changedOutputs.push({
        field: `evaluations[${i}].summary`,
        oldValue: a.evaluations[i].summary,
        newValue: b.evaluations[i].summary,
      });
    }
  }

  // Compare graph structure
  if (a.graph.nodes.length !== b.graph.nodes.length) {
    changedOutputs.push({
      field: "graph.nodes.count",
      oldValue: a.graph.nodes.length,
      newValue: b.graph.nodes.length,
    });
  }

  if (a.graph.edges.length !== b.graph.edges.length) {
    changedOutputs.push({
      field: "graph.edges.count",
      oldValue: a.graph.edges.length,
      newValue: b.graph.edges.length,
    });
  }

  // Compare explanation
  if (a.explanation.why.join("|") !== b.explanation.why.join("|")) {
    changedOutputs.push({
      field: "explanation.why",
      oldValue: a.explanation.why,
      newValue: b.explanation.why,
    });
  }

  // Confidence delta
  let confidenceDelta: KernelDiffConfidence | null = null;
  const robA = a.evaluations.find((e) => e.lens === "robustness");
  const robB = b.evaluations.find((e) => e.lens === "robustness");

  if (robA && robB) {
    const setA = new Set(robA.robustActions);
    const setB = new Set(robB.robustActions);
    confidenceDelta = {
      robustActionsA: robA.robustActions,
      robustActionsB: robB.robustActions,
      added: robB.robustActions.filter((id) => !setA.has(id)),
      removed: robA.robustActions.filter((id) => !setB.has(id)),
    };
  }

  // Summary
  const summaryParts: string[] = [];
  if (changedAssumptions.length > 0) summaryParts.push(`${changedAssumptions.length} assumption change(s)`);
  if (changedOutputs.length > 0) summaryParts.push(`${changedOutputs.length} output change(s)`);
  if (confidenceDelta && (confidenceDelta.added.length > 0 || confidenceDelta.removed.length > 0)) {
    summaryParts.push("robust action set changed");
  }

  return {
    changedAssumptions,
    changedOutputs,
    confidenceDelta,
    summary: summaryParts.length > 0 ? summaryParts.join(", ") : "no differences detected",
    schemaVersion: KERNEL_SCHEMA_VERSION,
  };
}

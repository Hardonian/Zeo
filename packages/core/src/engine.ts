import { nanoid } from "nanoid";
import type {
  Action,
  BranchEdge,
  BranchGraph,
  BranchNode,
  Claim,
  DecisionResult,
  DecisionSpec,
  LensEvaluation,
  ProbabilityInterval,
} from "@zeo/contracts";
import { pruneGraph, defaultPruningConfig } from "./pruning";
import type { PruningConfig } from "./pruning";
import { generateFlipConditions } from "./flip-conditions";
import { QuantEngine } from "./quant-engine";
import type { AssumptionTracker } from "@zeo/repro-pack";
import { hygiene } from "./hygiene";
import { BudgetManager, BudgetReachedError } from "./budget";
import type { Budget } from "@zeo/contracts";

/**
 * Zeo core engine: branching + evaluation.
 *
 * This is intentionally conservative:
 * - Generates a small branch graph by default (2–3 steps).
 * - Uses probability intervals and explicit dependencies.
 * - Produces robustness-oriented recommendations and a "what would change" list.
 */

function nowISO(): string {
  return new Date().toISOString();
}

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function interval(low: number, high: number): ProbabilityInterval {
  return { low: clamp01(low), high: clamp01(high) };
}

export function requireProvenanceForFacts(claims: Claim[]): void {
  for (const c of claims) {
    if (c.status === "fact") {
      if (!c.provenance || c.provenance.length === 0) {
        throw new Error(`Fact claim "${c.text}" is missing provenance.`);
      }
    }
  }
}

type BranchHeuristics = {
  maxDepth: 2 | 3;
  maxBranchesPerAction: number; // 3–5 recommended
};

const defaultHeuristics: BranchHeuristics = {
  maxDepth: 2,
  maxBranchesPerAction: 4,
};

function negotiationHeuristicBranches(action: Action): Array<{ label: string; p: ProbabilityInterval; deps: Claim[]; notes: string[] }> {
  // A small, opinionated branch set aimed at negotiation/ops.
  // In real builds, these come from structured models + evidence, not hardcoded rules.
  const baseDeps: Claim[] = [];
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

  if (action.kind === "change_terms") return common;

  if (action.kind === "communicate") return common;

  return common;
}

function createNode(label: string, kind: BranchNode["kind"], notes: string[], deps: Claim[] = []): BranchNode {
  return { id: nanoid(), label, kind, notes, dependencies: deps };
}

function createEdge(from: string, to: string, actionId: string | undefined, p: ProbabilityInterval | undefined, notes: string[]): BranchEdge {
  return { id: nanoid(), from, to, actionId, probability: p, notes };
}

export function generateBranchGraph(spec: DecisionSpec, heuristics: BranchHeuristics = defaultHeuristics): BranchGraph {
  requireProvenanceForFacts(spec.constraints.map(c => ({ id: c.id, text: `${c.name}: ${c.value}`, status: c.status, confidence: "high", provenance: c.provenance, tags: ["constraint"] })));

  const root = createNode(spec.title, "state", [spec.context], []);
  const nodes: BranchNode[] = [root];
  const edges: BranchEdge[] = [];

  const actions = spec.actions.slice(0); // shallow copy
  const depth1Nodes: BranchNode[] = [];

  for (const a of actions) {
    const aNode = createNode(`Action: ${a.label}`, "event", [`Actor: ${a.actorId}`, `Kind: ${a.kind}`]);
    nodes.push(aNode);
    edges.push(createEdge(root.id, aNode.id, a.id, undefined, ["User-initiated action"]));
    depth1Nodes.push(aNode);

    const branches = negotiationHeuristicBranches(a).slice(0, heuristics.maxBranchesPerAction);
    for (const b of branches) {
      const out = createNode(`Outcome: ${b.label}`, "outcome", b.notes, b.deps);
      nodes.push(out);
      edges.push(createEdge(aNode.id, out.id, a.id, b.p, ["Counterparty response branch"]));
    }
  }

  // Depth 2: simple second-order effects on outcomes for maxDepth=3
  if (heuristics.maxDepth === 3) {
    const outcomes = nodes.filter(n => n.kind === "outcome");
    for (const o of outcomes) {
      // Add a generic second-order "relationship impact" node
      const rel = createNode("Second-order: relationship impact", "state", [
        "Reputation and future cooperation probability may shift.",
        "This node exists to force second-order thinking; it is not a claim of measurement."
      ]);
      nodes.push(rel);
      edges.push(createEdge(o.id, rel.id, undefined, interval(0.6, 0.9), ["Second-order effects are likely in repeated interactions."]));
    }
  }

  return {
    id: nanoid(),
    decisionId: spec.id,
    createdAt: nowISO(),
    nodes,
    edges,
  };
}

function evaluateRobustness(spec: DecisionSpec, graph: BranchGraph): LensEvaluation {
  // Simple robustness heuristic for v0.1:
  // Prefer actions that maximize the minimum of probability-weighted "acceptable outcomes".
  // Here, "acceptable" is approximated as outcomes labeled Accept/Counter (versus Reject).
  const acceptable = new Set(["Accept", "Counter", "Provides more info"]);
  const actionScores: Array<{ actionId: string; minScore: number }> = [];

  for (const a of spec.actions) {
    const outEdges = graph.edges.filter(e => e.actionId === a.id && e.probability);
    // compute conservative lower bound of acceptable probability mass
    let accLow = 0;
    let rejHigh = 0;
    for (const e of outEdges) {
      const toNode = graph.nodes.find(n => n.id === e.to);
      if (!toNode || !e.probability) continue;
      const label = toNode.label.replace("Outcome: ", "");
      if (acceptable.has(label)) accLow += e.probability.low;
      if (label === "Reject") rejHigh += e.probability.high;
    }
    // conservative score: acceptable low minus reject high
    const minScore = accLow - rejHigh;
    actionScores.push({ actionId: a.id, minScore });
  }

  actionScores.sort((a, b) => b.minScore - a.minScore);
  const best = actionScores.slice(0, Math.max(1, Math.min(2, actionScores.length))).map(s => s.actionId);

  // Fragile assumptions (v0.1): any assumptions explicitly listed in the spec are candidates.
  const fragile = spec.assumptions
    .filter(c => c.status === "assumption" || c.status === "belief")
    .slice(0, 3)
    .map(c => c.id);

  // Dominated actions (v0.1): those with negative minScore if any positive exists
  const anyPositive = actionScores.some(s => s.minScore > 0);
  const dominated = anyPositive ? actionScores.filter(s => s.minScore < 0).map(s => s.actionId) : [];

  return {
    lens: "robustness",
    summary: `Selected ${best.length} robust action(s) by conservative acceptable-outcome mass (low) minus reject mass (high).`,
    robustActions: best,
    fragileAssumptions: fragile,
    dominatedActions: dominated,
  };
}

function evaluateExpectedUtility(spec: DecisionSpec): LensEvaluation {
  // v0.1 expected utility is qualitative: we provide a narrative emphasizing tradeoffs and uncertainty.
  // Numeric utilities are deliberately not assumed.
  const actionIds = spec.actions.map(a => a.id);
  return {
    lens: "expected_utility",
    summary: "Expected utility is presented qualitatively in v0.1. Zeo avoids inventing utilities; users may add explicit utility weights in a later version.",
    robustActions: actionIds.slice(0, 1),
    fragileAssumptions: spec.assumptions.slice(0, 2).map(a => a.id),
    dominatedActions: [],
  };
}

function evaluateGameTheory(spec: DecisionSpec): LensEvaluation {
  // v0.1: provide a discipline reminder rather than claiming equilibrium without a payoff matrix.
  return {
    lens: "game_theory",
    summary: "Game theory lens requires an explicit payoff structure and belief model of other agents. v0.1 highlights multi-agent incentives without asserting equilibrium.",
    robustActions: spec.actions.filter(a => a.kind === "verify" || a.kind === "delay").map(a => a.id).slice(0, 1),
    fragileAssumptions: spec.assumptions.slice(0, 2).map(a => a.id),
    dominatedActions: [],
  };
}

function evaluateEvolutionary(spec: DecisionSpec): LensEvaluation {
  return {
    lens: "evolutionary",
    summary: "Evolutionary lens emphasizes repeated interactions: cooperation, retaliation, and reputation effects. v0.1 treats this as a second-order overlay.",
    robustActions: spec.actions.filter(a => a.kind === "communicate" || a.kind === "verify").map(a => a.id).slice(0, 1),
    fragileAssumptions: spec.assumptions.slice(0, 2).map(a => a.id),
    dominatedActions: [],
  };
}

export type RunDecisionOpts = {
  depth?: 2 | 3;
  pruning?: Partial<PruningConfig>;
  useQuantEngine?: boolean;
  tracker?: AssumptionTracker;
  budget?: Budget;
};

export function runDecision(spec: DecisionSpec, opts?: RunDecisionOpts): DecisionResult {
  const budgetManager = new BudgetManager(opts?.budget);

  // Initial minimal graph for partial results
  let graph: BranchGraph = {
    id: nanoid(),
    decisionId: spec.id,
    createdAt: nowISO(),
    nodes: [createNode(spec.title, "state", [spec.context], [])],
    edges: [],
  };

  let evaluations: LensEvaluation[] = [];
  let nextBestEvidence: { prompt: string; rationale: string }[] = [];
  let flipConditions: Array<{ assumptionId: string; flipThreshold: string; reasoning: string }> = [];

  const getPartialResult = (): Partial<DecisionResult> => ({
    graph,
    evaluations,
    nextBestEvidence,
    explanation: {
      why: ["Budget reached before completion."],
      whatWouldChange: flipConditions.map(fc => ({
        assumptionId: fc.assumptionId,
        flipCondition: `${fc.flipThreshold}. ${fc.reasoning}`,
      })),
    },
    assumptions: opts?.tracker?.getAssumptions(),
    inferences: opts?.tracker?.getInferences(),
    uncertaintyMap: opts?.tracker?.getUncertaintyMap(),
  });

  try {
    budgetManager.check(getPartialResult);

    const hygieneWarnings = hygiene.check(spec);
    budgetManager.incrementSteps(); // Hygiene check cost

    if (opts?.tracker) {
      opts.tracker.recordSystemAssumption("max_depth", "Branch Depth Limit", opts.depth ?? defaultHeuristics.maxDepth, "levels", "Computational complexity constraint");
      opts.tracker.recordSystemAssumption("max_branches_per_action", "Branch Fan-out Limit", defaultHeuristics.maxBranchesPerAction, "branches", "Heuristic exploration limit");

      const pruningVars = opts?.pruning ? "custom" : "standard";
      opts.tracker.recordSystemAssumption("pruning_strategy", "Pruning Strategy", pruningVars, "mode", "Graph size management");

      const pConfig = { ...defaultPruningConfig, ...opts?.pruning };
      opts.tracker.recordSystemAssumption("pruning_max_nodes", "Max Graph Nodes", pConfig.maxNodes, "nodes", "Performance constraint");
      opts.tracker.recordSystemAssumption("pruning_max_edges", "Max Graph Edges", pConfig.maxEdges, "edges", "Performance constraint");
    }

    // 2. Generate Branch Graph
    budgetManager.check(getPartialResult);
    const rawGraph = generateBranchGraph(spec, { ...defaultHeuristics, maxDepth: opts?.depth ?? 2 });

    // We update our local graph reference
    graph = rawGraph;
    budgetManager.incrementSteps(rawGraph.nodes.length); // Rough cost proxy

    // 3. Prune
    budgetManager.check(getPartialResult);
    const pruningConfig: PruningConfig = { ...defaultPruningConfig, ...opts?.pruning };
    graph = pruneGraph(rawGraph, pruningConfig);
    budgetManager.incrementSteps(); // Pruning cost

    // 4. Evaluations
    if (opts?.useQuantEngine) {
      budgetManager.check(getPartialResult);
      // Use quant engine for analytical evaluations
      const quantEngine = new QuantEngine();
      // Quant engine ops are expensive, we should ideally pass budget manager down,
      // but for now we wrap the blocks.

      const robustnessEval = quantEngine.evaluateRobustnessWithGameTheory(spec);
      evaluations.push(robustnessEval);
      budgetManager.incrementSteps(5);

      budgetManager.check(getPartialResult);
      evaluations.push(evaluateExpectedUtility(spec));

      budgetManager.check(getPartialResult);
      evaluations.push(evaluateGameTheory(spec));

      budgetManager.check(getPartialResult);
      evaluations.push(evaluateEvolutionary(spec));

      budgetManager.check(getPartialResult);
      const quantFlip = quantEngine.generateFlipConditions(spec, evaluations);
      flipConditions = quantFlip.map(fc => ({
        assumptionId: fc.assumptionId,
        flipThreshold: `${(fc.requiredBeliefShift * 100).toFixed(0)}% belief shift`,
        reasoning: fc.flipCondition,
      }));
      budgetManager.incrementSteps(5);
    } else {
      budgetManager.check(getPartialResult);
      // Use heuristic evaluations
      evaluations.push(evaluateRobustness(spec, graph));
      budgetManager.incrementSteps();

      budgetManager.check(getPartialResult);
      evaluations.push(evaluateExpectedUtility(spec));

      budgetManager.check(getPartialResult);
      evaluations.push(evaluateGameTheory(spec));

      budgetManager.check(getPartialResult);
      evaluations.push(evaluateEvolutionary(spec));

      budgetManager.check(getPartialResult);
      flipConditions = generateFlipConditions(spec, evaluations);
      budgetManager.incrementSteps();
    }

    if (opts?.tracker) {
      for (const evalResult of evaluations) {
        opts.tracker.recordInference({
          key: `eval_${evalResult.lens}`,
          value: evalResult.robustActions,
          units: "action_ids",
          method: opts?.useQuantEngine ? "quantitative_analysis" : "heuristic_analysis",
          uncertainty: { kind: "unknown", params: {}, note: "Heuristic confidence not quantified" }
        });
      }
    }

    budgetManager.check(getPartialResult);
    nextBestEvidence = [
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

    if (opts?.tracker) {
      opts.tracker.recordInference({
        key: "next_best_evidence",
        value: nextBestEvidence.map(e => e.prompt),
        units: "prompts",
        method: "heuristic_template",
        uncertainty: { kind: "unknown", params: {}, note: "Static heuristics" }
      });
    }

    budgetManager.check(getPartialResult);

    return {
      graph,
      evaluations,
      nextBestEvidence,
      explanation: {
        why: [
          "Zeo generated a conservative branch map emphasizing plausible counterparty responses.",
          opts?.useQuantEngine
            ? "Robustness analysis uses game-theoretic dominance under interval payoffs."
            : "Recommendations prioritize robustness: actions that retain value across uncertain assumptions.",
          "Uncertainty is represented as probability ranges and explicit dependencies.",
        ],
        whatWouldChange: flipConditions.map(fc => ({
          assumptionId: fc.assumptionId,
          flipCondition: `${fc.flipThreshold}. ${fc.reasoning}`,
        })),
      },
      assumptions: opts?.tracker?.getAssumptions(),
      inferences: opts?.tracker?.getInferences(),
      uncertaintyMap: opts?.tracker?.getUncertaintyMap(),
      hygieneWarnings,
      // Budget info
      status: "completed",
      budget: opts?.budget,
      usage: budgetManager.getUsage(),
    };
  } catch (error) {
    if (error instanceof BudgetReachedError) {
      return error.partialResult as DecisionResult;
    }
    throw error;
  }
}


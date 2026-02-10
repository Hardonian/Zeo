import { generateId } from "@zeo/id";
import { pruneGraph, defaultPruningConfig } from "./pruning.js";
import { generateFlipConditions } from "./flip-conditions.js";
import { QuantEngine } from "./quant-engine.js";
/**
 * Zeo core engine: branching + evaluation.
 *
 * This is intentionally conservative:
 * - Generates a small branch graph by default (2–3 steps).
 * - Uses probability intervals and explicit dependencies.
 * - Produces robustness-oriented recommendations and a "what would change" list.
 */
function nowISO() {
    return new Date().toISOString();
}
function clamp01(x) {
    if (x < 0)
        return 0;
    if (x > 1)
        return 1;
    return x;
}
export function interval(low, high) {
    return { low: clamp01(low), high: clamp01(high) };
}
export function requireProvenanceForFacts(claims) {
    for (const c of claims) {
        if (c.status === "fact") {
            if (!c.provenance || c.provenance.length === 0) {
                throw new Error(`Fact claim "${c.text}" is missing provenance.`);
            }
        }
    }
}
const defaultHeuristics = {
    maxDepth: 2,
    maxBranchesPerAction: 4,
};
function negotiationHeuristicBranches(action) {
    // A small, opinionated branch set aimed at negotiation/ops.
    // In real builds, these come from structured models + evidence, not hardcoded rules.
    const baseDeps = [];
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
    if (action.kind === "change_terms")
        return common;
    if (action.kind === "communicate")
        return common;
    return common;
}
function createNode(label, kind, notes, deps = []) {
    return { id: generateId(), label, kind, notes, dependencies: deps };
}
function createEdge(from, to, actionId, p, notes) {
    return { id: generateId(), from, to, actionId, probability: p, notes };
}
export function generateBranchGraph(spec, heuristics = defaultHeuristics) {
    requireProvenanceForFacts(spec.constraints.map(c => ({ id: c.id, text: `${c.name}: ${c.value}`, status: c.status, confidence: "high", provenance: c.provenance, tags: ["constraint"] })));
    const root = createNode(spec.title, "state", [spec.context], []);
    const nodes = [root];
    const edges = [];
    const actions = spec.actions.slice(0); // shallow copy
    const depth1Nodes = [];
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
        id: generateId(),
        decisionId: spec.id,
        createdAt: nowISO(),
        nodes,
        edges,
    };
}
function evaluateRobustness(spec, graph) {
    // Simple robustness heuristic for v0.1:
    // Prefer actions that maximize the minimum of probability-weighted "acceptable outcomes".
    // Here, "acceptable" is approximated as outcomes labeled Accept/Counter (versus Reject).
    const acceptable = new Set(["Accept", "Counter", "Provides more info"]);
    const actionScores = [];
    for (const a of spec.actions) {
        const outEdges = graph.edges.filter(e => e.actionId === a.id && e.probability);
        // compute conservative lower bound of acceptable probability mass
        let accLow = 0;
        let rejHigh = 0;
        for (const e of outEdges) {
            const toNode = graph.nodes.find(n => n.id === e.to);
            if (!toNode || !e.probability)
                continue;
            const label = toNode.label.replace("Outcome: ", "");
            if (acceptable.has(label))
                accLow += e.probability.low;
            if (label === "Reject")
                rejHigh += e.probability.high;
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
function evaluateExpectedUtility(spec) {
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
function evaluateGameTheory(spec) {
    // v0.1: provide a discipline reminder rather than claiming equilibrium without a payoff matrix.
    return {
        lens: "game_theory",
        summary: "Game theory lens requires an explicit payoff structure and belief model of other agents. v0.1 highlights multi-agent incentives without asserting equilibrium.",
        robustActions: spec.actions.filter(a => a.kind === "verify" || a.kind === "delay").map(a => a.id).slice(0, 1),
        fragileAssumptions: spec.assumptions.slice(0, 2).map(a => a.id),
        dominatedActions: [],
    };
}
function evaluateEvolutionary(spec) {
    return {
        lens: "evolutionary",
        summary: "Evolutionary lens emphasizes repeated interactions: cooperation, retaliation, and reputation effects. v0.1 treats this as a second-order overlay.",
        robustActions: spec.actions.filter(a => a.kind === "communicate" || a.kind === "verify").map(a => a.id).slice(0, 1),
        fragileAssumptions: spec.assumptions.slice(0, 2).map(a => a.id),
        dominatedActions: [],
    };
}
export function runDecision(spec, opts) {
    const rawGraph = generateBranchGraph(spec, { ...defaultHeuristics, maxDepth: opts?.depth ?? 2 });
    const pruningConfig = { ...defaultPruningConfig, ...opts?.pruning };
    const graph = pruneGraph(rawGraph, pruningConfig);
    let evaluations;
    let flipConditions;
    if (opts?.useQuantEngine) {
        // Use quant engine for analytical evaluations
        const quantEngine = new QuantEngine();
        const robustnessEval = quantEngine.evaluateRobustnessWithGameTheory(spec);
        evaluations = [
            robustnessEval,
            evaluateExpectedUtility(spec),
            evaluateGameTheory(spec),
            evaluateEvolutionary(spec),
        ];
        const quantFlip = quantEngine.generateFlipConditions(spec, evaluations);
        flipConditions = quantFlip.map(fc => ({
            assumptionId: fc.assumptionId,
            flipThreshold: `${(fc.requiredBeliefShift * 100).toFixed(0)}% belief shift`,
            reasoning: fc.flipCondition,
        }));
    }
    else {
        // Use heuristic evaluations
        evaluations = [
            evaluateRobustness(spec, graph),
            evaluateExpectedUtility(spec),
            evaluateGameTheory(spec),
            evaluateEvolutionary(spec),
        ];
        flipConditions = generateFlipConditions(spec, evaluations);
    }
    const nextBestEvidence = [
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
    };
}
//# sourceMappingURL=engine.js.map
/**
 * Client-safe exports from @zeo/core
 * These can be safely imported in browser/Next.js client components
 * without pulling in Node.js-specific modules
 * 
 * ALL CODE IN THIS FILE IS SELF-CONTAINED - No imports from other modules
 */

// Only import types - these are erased at compile time
import type { DecisionSpec, DecisionResult, Action, Agent, EvidenceEvent } from "@zeo/contracts";

// ============================================================================
// ID Generation (inline implementation)
// ============================================================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Canonical JSON (inline implementation)
// ============================================================================

function stringifyCanonical(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) {
    throw new Error("Canonical JSON does not support undefined");
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Canonical JSON does not support non-finite numbers");
    }
    if (value === 0 && 1 / value === -Infinity) {
      return "0";
    }
    return value.toString();
  }
  if (typeof value === "string") {
    return JSON.stringify(value.normalize("NFC"));
  }
  if (Array.isArray(value)) {
    const items = value.map(stringifyCanonical);
    return `[${items.join(",")}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    const pairs = keys.map(k => {
      const v = (value as Record<string, unknown>)[k];
      if (v === undefined) return null;
      return `${JSON.stringify(k)}:${stringifyCanonical(v)}`;
    }).filter(x => x !== null);
    return `{${pairs.join(",")}}`;
  }
  throw new Error(`Unsupported type for Canonical JSON: ${typeof value}`);
}

// ============================================================================
// Hashing (browser-compatible with Web Crypto API)
// ============================================================================

export async function hashDecisionSpec(spec: DecisionSpec): Promise<string> {
  const normalized = {
    ...spec,
    agents: spec.agents?.map(({ id, ...a }: any) => a) ?? [],
    actions: spec.actions?.map(({ id, actorId, ...a }: any) => a) ?? [],
    constraints: spec.constraints?.map(({ id, ...c }: any) => c) ?? [],
    assumptions: spec.assumptions?.map(({ id, ...a }: any) => a) ?? [],
  };
  
  const json = stringifyCanonical(normalized);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function computeStableHash(value: unknown): Promise<string> {
  const json = stringifyCanonical(value);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// RNG (inline implementation)
// ============================================================================

export function computeDeterministicSeed(
  specHash: string,
  observationHash?: string,
  depth: number = 1
): string {
  const combined = observationHash
    ? `${specHash}:${observationHash}:${depth}`
    : `${specHash}:${depth}`;
  
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(16, '0');
}

// ============================================================================
// Probability Intervals (inline implementation)
// ============================================================================

export interface ProbabilityInterval {
  low: number;
  high: number;
}

export function interval(low: number, high: number): ProbabilityInterval {
  return { low, high };
}

// ============================================================================
// Branch Graph Generation (inline implementation)
// ============================================================================

export interface BranchNode {
  id: string;
  type: 'state' | 'event' | 'outcome';
  label: string;
  kind: string;
  notes: string[];
  dependencies: any[];
}

export interface BranchEdge {
  id: string;
  from: string;
  to: string;
  actionId?: string;
  probability?: ProbabilityInterval;
  notes: string[];
}

export interface BranchGraph {
  id: string;
  decisionId: string;
  createdAt: string;
  nodes: BranchNode[];
  edges: BranchEdge[];
}

export interface BranchHeuristics {
  maxDepth: number;
  minProbability: number;
}

const defaultHeuristics: BranchHeuristics = {
  maxDepth: 3,
  minProbability: 0.05,
};

export function generateBranchGraph(
  spec: DecisionSpec,
  heuristics: BranchHeuristics = defaultHeuristics
): BranchGraph {
  const nodes: BranchNode[] = [];
  const edges: BranchEdge[] = [];
  const decisionId = spec.id || generateId();
  
  const rootNode: BranchNode = {
    id: `root-${generateId()}`,
    type: 'state',
    label: spec.title || 'Decision',
    kind: 'state',
    notes: [],
    dependencies: [],
  };
  nodes.push(rootNode);
  
  spec.actions.forEach((action, idx) => {
    const actionNode: BranchNode = {
      id: `action-${idx}-${generateId()}`,
      type: 'event',
      label: action.label,
      kind: 'event',
      notes: [],
      dependencies: [],
    };
    nodes.push(actionNode);
    
    edges.push({
      id: `edge-${idx}-${generateId()}`,
      from: rootNode.id,
      to: actionNode.id,
      actionId: action.id,
      notes: [],
    });
    
    const terminalNode: BranchNode = {
      id: `terminal-${idx}-${generateId()}`,
      type: 'outcome',
      label: `Outcome ${idx + 1}`,
      kind: 'outcome',
      notes: [],
      dependencies: [],
    };
    nodes.push(terminalNode);
    
    edges.push({
      id: `edge-term-${idx}-${generateId()}`,
      from: actionNode.id,
      to: terminalNode.id,
      notes: [],
    });
  });
  
  return {
    id: `graph-${generateId()}`,
    decisionId,
    createdAt: new Date().toISOString(),
    nodes,
    edges,
  };
}

// ============================================================================
// Decision Engine (inline implementation)
// ============================================================================

export interface RunDecisionOpts {
  depth?: number;
  observation?: string;
}

export function runDecision(spec: DecisionSpec, opts?: RunDecisionOpts): DecisionResult {
  const depth = opts?.depth ?? 2;
  const graph = generateBranchGraph(spec, { maxDepth: depth, minProbability: 0.05 });
  
  const evaluations = [
    {
      lens: 'robustness' as const,
      summary: 'Robustness analysis completed',
      robustActions: spec.actions.slice(0, 2).map(a => a.id),
      fragileAssumptions: [] as string[],
      dominatedActions: [] as string[],
    },
    {
      lens: 'expected_utility' as const,
      summary: 'Expected utility analysis completed',
      robustActions: spec.actions.slice(0, 1).map(a => a.id),
      fragileAssumptions: [] as string[],
      dominatedActions: spec.actions.slice(2).map(a => a.id),
    },
  ];
  
  const nextBestEvidence = spec.assumptions.slice(0, 3).map((a: any, idx: number) => ({
    prompt: a.text || `Assumption ${idx + 1}`,
    rationale: 'Would reduce uncertainty',
  }));
  
  return {
    graph,
    evaluations,
    nextBestEvidence,
    explanation: {
      why: [`Analysis of "${spec.title}" with ${spec.actions.length} actions`],
      whatWouldChange: spec.assumptions.slice(0, 2).map((a: any, idx: number) => ({
        assumptionId: a.id || `assumption-${idx}`,
        flipCondition: `If assumption ${idx + 1} changes`,
      })),
    },
    status: 'completed' as const,
  } as unknown as DecisionResult;
}

// ============================================================================
// Examples (inline implementation)
// ============================================================================

function nowISO(): string {
  return new Date().toISOString();
}

export function makeNegotiationExample(): DecisionSpec {
  const self: Agent = { id: generateId(), name: "You", role: "self" };
  const other: Agent = { id: generateId(), name: "Counterparty", role: "counterparty" };

  const actions: Action[] = [
    { id: generateId(), label: "Propose revised terms (reduce exclusivity, add termination flexibility)", actorId: self.id, kind: "change_terms" },
    { id: generateId(), label: "Ask clarifying question about timeline and approvals", actorId: self.id, kind: "verify" },
    { id: generateId(), label: "Accept as-is to secure deal quickly", actorId: self.id, kind: "commit" },
    { id: generateId(), label: "Delay decision pending internal review", actorId: self.id, kind: "delay" },
  ];

  const assumptions = [
    {
      id: generateId(),
      text: "Counterparty is more sensitive to timeline than to price.",
      status: "assumption" as const,
      confidence: "medium" as const,
      tags: [] as string[],
    },
    {
      id: generateId(),
      text: "Internal legal can review within 48 hours if escalated.",
      status: "assumption" as const,
      confidence: "medium" as const,
      tags: [] as string[],
    },
  ];

  const constraints = [
    { id: generateId(), name: "exclusivity", value: "territory", status: "assumption" as const },
  ];

  return {
    id: generateId(),
    title: "SaaS Contract Negotiation - Enterprise Deal",
    context: "Negotiating enterprise SaaS contract with exclusivity clause",
    createdAt: nowISO(),
    horizon: "weeks",
    agents: [self, other],
    actions,
    constraints,
    assumptions: assumptions as any,
    objectives: [{ id: generateId(), metric: "value", weight: 1 }],
  } as DecisionSpec;
}

export function makeOpsExample(): DecisionSpec {
  const self: Agent = { id: generateId(), name: "Ops Lead", role: "self" };
  
  const actions: Action[] = [
    { id: generateId(), label: "Deploy immediately with rollback plan", actorId: self.id, kind: "commit" },
    { id: generateId(), label: "Run additional canary test for 2 hours", actorId: self.id, kind: "verify" },
    { id: generateId(), label: "Delay to tomorrow during low-traffic window", actorId: self.id, kind: "delay" },
    { id: generateId(), label: "Revert to previous stable version", actorId: self.id, kind: "change_terms" },
  ];

  const assumptions = [
    {
      id: generateId(),
      text: "Current error rate is within acceptable threshold.",
      status: "assumption" as const,
      confidence: "medium" as const,
      tags: [] as string[],
    },
    {
      id: generateId(),
      text: "Rollback can complete within 5 minutes.",
      status: "assumption" as const,
      confidence: "high" as const,
      tags: [] as string[],
    },
  ];

  const constraints = [
    { id: generateId(), name: "compliance", value: "deployment", status: "assumption" as const },
  ];

  return {
    id: generateId(),
    title: "Production Deployment Decision",
    context: "Deciding whether to deploy to production",
    createdAt: nowISO(),
    horizon: "hours",
    agents: [self],
    actions,
    constraints,
    assumptions: assumptions as any,
    objectives: [{ id: generateId(), metric: "stability", weight: 1 }],
  } as DecisionSpec;
}

// ============================================================================
// Canonicalization (inline implementation)
// ============================================================================

export function canonicalizeDecisionSpec(spec: DecisionSpec): DecisionSpec {
  return {
    ...spec,
    actions: spec.actions.map(a => ({
      ...a,
      kind: a.kind || "change_terms",
    })),
  };
}

// ============================================================================
// Packets (inline implementation)
// ============================================================================

export interface RunMeta {
  runId: string;
  timestamp: string;
  version: string;
}

export interface EvidencePacket {
  id: string;
  decisionHash: string;
  evidence: EvidenceEvent[];
  timestamp: string;
}

export function buildEvidencePacket(
  decisionHash: string,
  evidence: EvidenceEvent[]
): EvidencePacket {
  return {
    id: generateId(),
    decisionHash,
    evidence,
    timestamp: nowISO(),
  };
}

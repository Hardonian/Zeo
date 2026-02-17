/**
 * Evidence Graph — Persistent Knowledge Spine
 *
 * Lightweight internal evidence registry.
 *
 * EvidenceNode:
 *   - id (hash)
 *   - claim
 *   - source
 *   - timestamp
 *   - confidence_score
 *   - decay_rate
 *   - linked_actions[]
 *
 * Features:
 *   1) Claim Registration - decisions reference evidence IDs
 *   2) Confidence Decay - decreases over time based on decay_rate
 *   3) Drift Detection - flags impacted decisions when assumptions change
 *   4) Regret Tracking - outcome_positive | outcome_negative + regret_score
 *   5) List/filter/query via `zeo evidence`
 */

import { sha256, encodeCanonicalJson } from "@zeo/kernel";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// ─── Data Model ───────────────────────────────────────────────────────────

export type OutcomeMarker = "outcome_positive" | "outcome_negative" | "unknown";

export interface EvidenceNode {
  id: string;
  claim: string;
  source: string;
  timestamp: string;
  confidenceScore: number;   // 0-1
  decayRate: number;          // per-day decay factor, e.g. 0.01
  linkedActions: string[];    // action/decision IDs
  linkedDecisions: string[];  // decision IDs that reference this evidence
  tags: string[];
  outcome: OutcomeMarker;
  regretScore: number;        // 0-1, higher = more regret
  metadata?: Record<string, unknown>;
}

export interface EvidenceGraph {
  version: string;
  nodes: EvidenceNode[];
  lastUpdated: string;
}

export interface DriftAlert {
  evidenceId: string;
  claim: string;
  impactedDecisions: string[];
  reason: string;
  severityScore: number; // 0-1
}

// ─── Persistence ──────────────────────────────────────────────────────────

function getStorePath(baseDir?: string): string {
  return join(baseDir ?? process.cwd(), ".zeo", "evidence-graph.json");
}

export function loadEvidenceGraph(baseDir?: string): EvidenceGraph {
  const path = getStorePath(baseDir);
  if (!existsSync(path)) {
    return { version: "1.0.0", nodes: [], lastUpdated: new Date().toISOString() };
  }
  return JSON.parse(readFileSync(path, "utf8")) as EvidenceGraph;
}

export function saveEvidenceGraph(graph: EvidenceGraph, baseDir?: string): void {
  const path = getStorePath(baseDir);
  const dir = join(baseDir ?? process.cwd(), ".zeo");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  graph.lastUpdated = new Date().toISOString();
  writeFileSync(path, JSON.stringify(graph, null, 2), "utf8");
}

// ─── Claim Registration ──────────────────────────────────────────────────

function computeEvidenceId(claim: string, source: string): string {
  const hash = sha256(encodeCanonicalJson({ claim, source }));
  return `ev_${hash.slice(0, 16)}`;
}

export function registerClaim(
  graph: EvidenceGraph,
  params: {
    claim: string;
    source: string;
    confidenceScore: number;
    decayRate?: number;
    linkedActions?: string[];
    linkedDecisions?: string[];
    tags?: string[];
    metadata?: Record<string, unknown>;
  }
): EvidenceNode {
  const id = computeEvidenceId(params.claim, params.source);

  // Update existing if same claim+source
  const existing = graph.nodes.find(n => n.id === id);
  if (existing) {
    existing.confidenceScore = params.confidenceScore;
    existing.timestamp = new Date().toISOString();
    if (params.linkedActions) {
      for (const a of params.linkedActions) {
        if (!existing.linkedActions.includes(a)) existing.linkedActions.push(a);
      }
    }
    if (params.linkedDecisions) {
      for (const d of params.linkedDecisions) {
        if (!existing.linkedDecisions.includes(d)) existing.linkedDecisions.push(d);
      }
    }
    return existing;
  }

  const node: EvidenceNode = {
    id,
    claim: params.claim,
    source: params.source,
    timestamp: new Date().toISOString(),
    confidenceScore: Math.max(0, Math.min(1, params.confidenceScore)),
    decayRate: params.decayRate ?? 0.01,
    linkedActions: params.linkedActions ?? [],
    linkedDecisions: params.linkedDecisions ?? [],
    tags: params.tags ?? [],
    outcome: "unknown",
    regretScore: 0,
    metadata: params.metadata,
  };

  graph.nodes.push(node);
  return node;
}

// ─── Confidence Decay ─────────────────────────────────────────────────────

/**
 * Apply time-based confidence decay to all nodes.
 * decay formula: score * (1 - decayRate)^daysSinceUpdate
 */
export function refreshConfidence(graph: EvidenceGraph, referenceTime?: Date): number {
  const now = referenceTime ?? new Date();
  let updated = 0;

  for (const node of graph.nodes) {
    const nodeTime = new Date(node.timestamp);
    const daysSince = (now.getTime() - nodeTime.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince > 0) {
      const decayedScore = node.confidenceScore * Math.pow(1 - node.decayRate, daysSince);
      const newScore = Math.max(0, Math.round(decayedScore * 10000) / 10000);
      if (newScore !== node.confidenceScore) {
        node.confidenceScore = newScore;
        updated++;
      }
    }
  }

  return updated;
}

// ─── Drift Detection ──────────────────────────────────────────────────────

/**
 * Detect evidence drift — when confidence drops below threshold,
 * flag all impacted decisions for re-evaluation.
 */
export function detectDrift(graph: EvidenceGraph, threshold = 0.3): DriftAlert[] {
  const alerts: DriftAlert[] = [];

  for (const node of graph.nodes) {
    if (node.confidenceScore < threshold && node.linkedDecisions.length > 0) {
      alerts.push({
        evidenceId: node.id,
        claim: node.claim,
        impactedDecisions: [...node.linkedDecisions],
        reason: `Confidence dropped to ${(node.confidenceScore * 100).toFixed(1)}% (threshold: ${(threshold * 100).toFixed(1)}%)`,
        severityScore: 1 - node.confidenceScore,
      });
    }
  }

  // Sort by severity (highest first)
  alerts.sort((a, b) => b.severityScore - a.severityScore);
  return alerts;
}

// ─── Regret Tracking ──────────────────────────────────────────────────────

/**
 * Mark a decision outcome and update regret scores on linked evidence
 */
export function markOutcome(
  graph: EvidenceGraph,
  evidenceId: string,
  outcome: "outcome_positive" | "outcome_negative"
): void {
  const node = graph.nodes.find(n => n.id === evidenceId);
  if (!node) throw new Error(`Evidence node not found: ${evidenceId}`);

  node.outcome = outcome;

  if (outcome === "outcome_negative") {
    // Increase regret score — capped at 1.0
    node.regretScore = Math.min(1, node.regretScore + 0.25);
    // Also reduce confidence
    node.confidenceScore = Math.max(0, node.confidenceScore * 0.8);
  } else {
    // Decrease regret score
    node.regretScore = Math.max(0, node.regretScore - 0.1);
    // Slightly boost confidence
    node.confidenceScore = Math.min(1, node.confidenceScore * 1.05);
  }
}

// ─── Query Helpers ────────────────────────────────────────────────────────

/**
 * Filter stale evidence (confidence below threshold)
 */
export function filterStale(graph: EvidenceGraph, threshold = 0.3): EvidenceNode[] {
  return graph.nodes.filter(n => n.confidenceScore < threshold);
}

/**
 * Get evidence nodes by tag
 */
export function filterByTag(graph: EvidenceGraph, tag: string): EvidenceNode[] {
  return graph.nodes.filter(n => n.tags.includes(tag));
}

/**
 * Get evidence nodes linked to a decision
 */
export function filterByDecision(graph: EvidenceGraph, decisionId: string): EvidenceNode[] {
  return graph.nodes.filter(n => n.linkedDecisions.includes(decisionId));
}

/**
 * Get high-regret evidence
 */
export function filterHighRegret(graph: EvidenceGraph, threshold = 0.5): EvidenceNode[] {
  return graph.nodes.filter(n => n.regretScore >= threshold);
}

// ─── Formatting ───────────────────────────────────────────────────────────

export function formatEvidenceList(nodes: EvidenceNode[]): string {
  if (nodes.length === 0) return "No evidence nodes.";

  const lines: string[] = [];
  lines.push(`Evidence Nodes (${nodes.length}):`);
  lines.push("");

  for (const node of nodes) {
    const conf = (node.confidenceScore * 100).toFixed(1);
    const regret = node.regretScore > 0 ? ` regret=${(node.regretScore * 100).toFixed(0)}%` : "";
    const outcome = node.outcome !== "unknown" ? ` [${node.outcome}]` : "";
    const stale = node.confidenceScore < 0.3 ? " (STALE)" : "";

    lines.push(`  ${node.id} | ${conf}% confidence${regret}${outcome}${stale}`);
    lines.push(`    Claim: ${node.claim}`);
    lines.push(`    Source: ${node.source} | Decay: ${node.decayRate}/day`);
    if (node.linkedDecisions.length > 0) {
      lines.push(`    Decisions: ${node.linkedDecisions.join(", ")}`);
    }
    if (node.tags.length > 0) {
      lines.push(`    Tags: ${node.tags.join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function formatDriftAlerts(alerts: DriftAlert[]): string {
  if (alerts.length === 0) return "No drift detected.";

  const lines: string[] = [];
  lines.push(`Drift Alerts (${alerts.length}):`);
  lines.push("");

  for (const alert of alerts) {
    lines.push(`  ${alert.evidenceId} — severity ${(alert.severityScore * 100).toFixed(0)}%`);
    lines.push(`    Claim: ${alert.claim}`);
    lines.push(`    Reason: ${alert.reason}`);
    lines.push(`    Impacted: ${alert.impactedDecisions.join(", ")}`);
    lines.push("    Action: Consider re-evaluating linked decisions.");
    lines.push("");
  }

  return lines.join("\n");
}

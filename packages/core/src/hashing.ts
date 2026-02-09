import { createHash } from "node:crypto";
import type { Claim, DecisionSpec } from "@zeo/contracts";

/**
 * Deterministic hashing for decision specs and assumption sets.
 *
 * Enables caching: identical DecisionSpec + assumption set -> identical hash.
 * Only structurally meaningful fields are included (no timestamps, no generated IDs).
 */

function sortedJson(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(sortedJson).join(",") + "]";
  }
  const keys = Object.keys(value).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + sortedJson((value as Record<string, unknown>)[k])).join(",") + "}";
}

function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Hash the structural content of a DecisionSpec, excluding volatile fields (id, createdAt).
 * Two specs with the same title, context, agents, actions, constraints, and assumptions
 * will produce the same hash.
 */
export function hashDecisionSpec(spec: DecisionSpec): string {
  const structural = {
    title: spec.title,
    context: spec.context,
    horizon: spec.horizon,
    agents: spec.agents.map(a => ({ name: a.name, role: a.role })),
    actions: spec.actions.map(a => ({ label: a.label, kind: a.kind })),
    constraints: spec.constraints.map(c => ({ name: c.name, value: c.value, status: c.status })),
    assumptions: spec.assumptions.map(a => ({
      text: a.text,
      status: a.status,
      confidence: a.confidence,
      probability: a.probability,
    })),
  };
  return sha256(sortedJson(structural));
}

/**
 * Hash an assumption set only (subset of the decision spec).
 * Useful for checking if assumptions changed independently of the rest of the spec.
 */
export function hashAssumptionSet(assumptions: Claim[]): string {
  const structural = assumptions.map(a => ({
    text: a.text,
    status: a.status,
    confidence: a.confidence,
    probability: a.probability,
  }));
  return sha256(sortedJson(structural));
}

/**
 * Combined cache key: decision structure hash + assumption set hash.
 * If both match, the branch graph can be served from cache.
 */
export function cacheKey(spec: DecisionSpec): string {
  return `${hashDecisionSpec(spec)}:${hashAssumptionSet(spec.assumptions)}`;
}


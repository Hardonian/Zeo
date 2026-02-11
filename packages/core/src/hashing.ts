import { createHash } from "node:crypto";
import type { DecisionSpec, Assumption, Claim } from "@zeo/contracts";
import { encodeCanonicalJson } from "./canonical-json.js";

/**
 * Validates and sorts assumptions for deterministic ordering
 */
function sortAssumptions(assumptions: (Assumption | Claim)[]): (Assumption | Claim)[] {
  return [...assumptions].sort((a, b) => {
    const idA = "id" in a ? a.id : ("key" in a ? a.key : "");
    const idB = "id" in b ? b.id : ("key" in b ? b.key : "");
    return idA.localeCompare(idB);
  });
}

/**
 * Computes the SHA-256 hash of a transcript (or any object) using 
 * the rigorous Canonical JSON encoding (RFC 8785 rules + Zeo specifics).
 */
export function computeTranscriptHash(input: any): string {
  return createHash("sha256").update(encodeCanonicalJson(input)).digest("hex");
}

function normalizeDecisionSpec(spec: DecisionSpec): Record<string, unknown> {
  const { id, createdAt, agents, actions, constraints, assumptions, ...rest } = spec;

  return {
    ...rest,
    agents: agents.map(({ id, ...a }) => a),
    actions: actions.map(({ id, actorId, ...a }) => a),
    constraints: constraints.map(({ id, ...c }) => c),
    assumptions: assumptions.map(({ id, ...a }) => a)
  };
}

export function hashDecisionSpec(spec: DecisionSpec): string {
  const normalized = normalizeDecisionSpec(spec);
  return createHash("sha256").update(encodeCanonicalJson(normalized)).digest("hex");
}

export function hashAssumptionSet(assumptions: (Assumption | Claim)[]): string {
  // Strip IDs for stable hashing
  const localized = assumptions.map((a) => {
        const { id, ...rest } = a as any;
    return rest;
  });

  // Sort by canonical JSON string to ensure order independence without relying on IDs
  // Since we stripped IDs, we must rely on content for sorting.
  const sorted = localized.sort((a, b) => {
    const jsonA = encodeCanonicalJson(a).toString("utf8");
    const jsonB = encodeCanonicalJson(b).toString("utf8");
    return jsonA.localeCompare(jsonB);
  });

  return createHash("sha256").update(encodeCanonicalJson(sorted)).digest("hex");
}

export function cacheKey(spec: DecisionSpec): string {
  const specHash = hashDecisionSpec(spec);
  // We use assumptions from spec
  const assumptionsHash = hashAssumptionSet(spec.assumptions);
  return `${specHash}:${assumptionsHash}`;
}

export function requestCacheKey(spec: DecisionSpec, assumptions: (Assumption | Claim)[]): string {
  const specHash = hashDecisionSpec(spec);
  const assumptionsHash = hashAssumptionSet(assumptions);
  return `${specHash}:${assumptionsHash}`;
}

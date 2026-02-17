import { sha256 } from "./utils/sha256.js";
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
  return sha256(encodeCanonicalJson(input));
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
  return sha256(encodeCanonicalJson(normalized));
}

export function hashAssumptionSet(assumptions: (Assumption | Claim)[]): string {
  // Strip IDs for stable hashing
  const localized = assumptions.map((a) => Object.fromEntries(
    Object.entries(a as Record<string, unknown>).filter(([key]) => key !== "id")
  ));

  // Sort by canonical JSON string to ensure order independence without relying on IDs
  // Since we stripped IDs, we must rely on content for sorting.
  const sorted = localized.sort((a, b) => {
    const jsonA = encodeCanonicalJson(a).toString("utf8");
    const jsonB = encodeCanonicalJson(b).toString("utf8");
    return jsonA.localeCompare(jsonB);
  });

  return sha256(encodeCanonicalJson(sorted));
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
export function getContractVersionHash(): string {
  // Matches v1.1.0 contract state
  return "v1.1.0-03c0caeee3dd25a1427aa02102a2142a5b2002cb";
}

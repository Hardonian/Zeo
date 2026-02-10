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

export function hashDecisionSpec(spec: DecisionSpec): string {
  // Use canonical JSON encoding
  return createHash("sha256").update(encodeCanonicalJson(spec)).digest("hex");
}

export function hashAssumptionSet(assumptions: (Assumption | Claim)[]): string {
  const sorted = sortAssumptions(assumptions);
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

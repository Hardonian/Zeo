import type { Claim, DecisionSpec } from "@zeo/contracts";
/**
 * Hash the structural content of a DecisionSpec, excluding volatile fields (id, createdAt).
 * Two specs with the same title, context, agents, actions, constraints, and assumptions
 * will produce the same hash.
 */
export declare function hashDecisionSpec(spec: DecisionSpec): string;
/**
 * Hash an assumption set only (subset of the decision spec).
 * Useful for checking if assumptions changed independently of the rest of the spec.
 */
export declare function hashAssumptionSet(assumptions: Claim[]): string;
/**
 * Combined cache key: decision structure hash + assumption set hash.
 * If both match, the branch graph can be served from cache.
 */
export declare function cacheKey(spec: DecisionSpec): string;
//# sourceMappingURL=hashing.d.ts.map

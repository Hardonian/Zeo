import type { DecisionSpec, Assumption, Claim } from "@zeo/contracts";
/**
 * Computes the SHA-256 hash of a transcript (or any object) using
 * the rigorous Canonical JSON encoding.
 */
export declare function computeTranscriptHash(input: any): string;
export declare function hashDecisionSpec(spec: DecisionSpec): string;
export declare function hashAssumptionSet(assumptions: (Assumption | Claim)[]): string;
export declare function cacheKey(spec: DecisionSpec): string;
export declare function requestCacheKey(spec: DecisionSpec, assumptions: (Assumption | Claim)[]): string;
export declare function getContractVersionHash(): string;
//# sourceMappingURL=hashing.d.ts.map
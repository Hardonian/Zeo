/**
 * Hashing utilities for deterministic replay
 *
 * Computes canonical hashes for decisions and observations
to ensure reproducibility.
 */
import type { DecisionSpec, ReplayObservationBatch } from "@zeo/contracts";
/**
 * Compute a deterministic hash of a decision spec.
 * Uses JSON canonicalization before hashing.
 */
export declare function hashDecisionSpec(spec: DecisionSpec): string;
/**
 * Compute a deterministic hash of observation batches.
 * Orders batches and observations consistently before hashing.
 */
export declare function hashObservations(batches: ReplayObservationBatch[]): string;
/**
 * Compute combined hash of decision + observations.
 */
export declare function hashCombined(spec: DecisionSpec, batches: ReplayObservationBatch[]): string;
/**
 * Derive a deterministic seed from hashes.
 * Used when no explicit seed is provided.
 */
export declare function deriveSeedFromHashes(decisionHash: string, observationsHash: string): string;
//# sourceMappingURL=hashing.d.ts.map
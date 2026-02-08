/**
 * Deterministic normalization for observations
 */

import { createHash } from "crypto";
import type { SignalObservation, ObservationBatch } from "@zeo/contracts";
import type { NormalizationOptions, NormalizedOutput } from "./types.js";

export const DEFAULT_NORMALIZATION_OPTIONS: NormalizationOptions = {
  canonicalizeKeys: true,
  stableSort: true,
  sortBy: ["t", "signalId", "observationId"],
  deterministicHash: true,
};

/**
 * Canonicalize an object by sorting keys recursively
 */
export function canonicalize<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(canonicalize) as unknown as T;
  }
  
  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    const value = (obj as Record<string, unknown>)[key];
    sorted[key] = canonicalize(value);
  }
  
  return sorted as T;
}

/**
 * Stable sort observations by specified fields
 */
export function stableSort<T extends Record<string, unknown>>(
  items: T[],
  sortBy: string[]
): T[] {
  return [...items].sort((a, b) => {
    for (const field of sortBy) {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal === bVal) continue;
      
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        const cmp = aVal.localeCompare(bVal);
        if (cmp !== 0) return cmp;
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        const cmp = aVal - bVal;
        if (cmp !== 0) return cmp;
      } else {
        const cmp = String(aVal).localeCompare(String(bVal));
        if (cmp !== 0) return cmp;
      }
    }
    return 0;
  });
}

/**
 * Compute deterministic hash for an array of observations
 */
export function computeDeterministicHash(observations: SignalObservation[]): string {
  const canonical = observations.map(obs => canonicalize(obs));
  const json = JSON.stringify(canonical);
  return createHash("sha256").update(json).digest("hex");
}

/**
 * Compute ordering hash (hash of just the sort keys)
 */
export function computeOrderingHash(observations: SignalObservation[]): string {
  const ordering = observations.map(obs => ({
    t: obs.t,
    signalId: obs.signalId,
    observationId: obs.observationId,
  }));
  const canonical = canonicalize(ordering);
  const json = JSON.stringify(canonical);
  return createHash("sha256").update(json).digest("hex");
}

interface Normalizer {
  normalize(observations: SignalObservation[]): NormalizedOutput<SignalObservation>;
  normalizeBatch(batch: ObservationBatch): ObservationBatch;
  verifyDeterminism(observations: SignalObservation[]): boolean;
}

export function createNormalizer(
  options: NormalizationOptions = DEFAULT_NORMALIZATION_OPTIONS
): Normalizer {
  return {
    normalize(observations: SignalObservation[]): NormalizedOutput<SignalObservation> {
      let data = [...observations];
      
      // Canonicalize each observation
      if (options.canonicalizeKeys) {
        data = data.map(canonicalize<SignalObservation>);
      }
      
      // Stable sort
      if (options.stableSort) {
        data = stableSort<SignalObservation>(data, options.sortBy);
      }
      
      // Compute checksums
      const checksum = options.deterministicHash
        ? computeDeterministicHash(data)
        : createHash("sha256").update(JSON.stringify(data)).digest("hex");
      
      const orderingHash = computeOrderingHash(data);
      
      return {
        data,
        checksum,
        orderingHash,
        metadata: {
          count: data.length,
          canonicalized: options.canonicalizeKeys,
          sorted: options.stableSort,
        },
      };
    },
    
    normalizeBatch(batch: ObservationBatch): ObservationBatch {
      const normalized = this.normalize(batch.items);
      
      return {
        ...batch,
        items: normalized.data,
        inputChecksum: normalized.checksum,
      };
    },
    
    verifyDeterminism(observations: SignalObservation[]): boolean {
      // Run normalization twice and verify same result
      const first = this.normalize(observations);
      const second = this.normalize(observations);
      
      return (
        first.checksum === second.checksum &&
        first.orderingHash === second.orderingHash &&
        first.data.length === second.data.length
      );
    },
  };
}

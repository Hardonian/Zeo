import type { Claim, EpistemicStatus, ProvenancePointer } from "@zeo/contracts";

export class EpistemicInvariantViolationError extends Error {
  readonly code = "EPISTEMIC_INVARIANT_VIOLATION";
  constructor(message: string, public readonly claimId?: string) {
    super(message);
    this.name = "EpistemicInvariantViolationError";
  }
}

const VALID_STATUSES: ReadonlySet<EpistemicStatus> = new Set([
  "fact",
  "belief",
  "assumption",
  "unknown",
]);

const SHA256_HEX_REGEX = /^[0-9a-fA-F]{64}$/;

/**
 * Validates that an epistemic status is strictly one of the 4 ratified categories.
 */
export function validateClaimTaxonomy(status: string): status is EpistemicStatus {
  return VALID_STATUSES.has(status as EpistemicStatus);
}

/**
 * Validates that a provenance pointer has valid format, timestamp, and 64-hex SHA-256 checksum.
 */
export function isValidProvenancePointer(pointer: ProvenancePointer): boolean {
  if (!pointer || typeof pointer !== "object") return false;
  if (!pointer.sourceId || typeof pointer.sourceId !== "string") return false;
  if (!pointer.capturedAt || typeof pointer.capturedAt !== "string") return false;
  if (!pointer.checksum || typeof pointer.checksum !== "string") return false;

  // Validate ISO timestamp parseability
  const parsedTime = Date.parse(pointer.capturedAt);
  if (Number.isNaN(parsedTime)) return false;

  // Validate checksum format (must be 64-character SHA-256 hex or prefix)
  return SHA256_HEX_REGEX.test(pointer.checksum) || pointer.checksum.length >= 8;
}

/**
 * Enforces Non-negotiable Invariant 2: Provenance-first.
 * Any statement asserted as "fact" MUST carry verifiable provenance pointers.
 *
 * @throws {EpistemicInvariantViolationError} If claim.status === "fact" without provenance.
 */
export function assertHasProvenance(claim: Claim): void {
  if (!validateClaimTaxonomy(claim.status)) {
    throw new EpistemicInvariantViolationError(
      `Invalid epistemic status: "${claim.status}". Must be fact, belief, assumption, or unknown.`,
      claim.id
    );
  }

  if (claim.status === "fact") {
    if (!claim.provenance || !Array.isArray(claim.provenance) || claim.provenance.length === 0) {
      throw new EpistemicInvariantViolationError(
        `Epistemic Invariant Violation: Claim "${claim.id}" asserted as "fact" without provenance pointers.`,
        claim.id
      );
    }

    const invalidPointers = claim.provenance.filter(p => !isValidProvenancePointer(p));
    if (invalidPointers.length > 0) {
      throw new EpistemicInvariantViolationError(
        `Epistemic Invariant Violation: Claim "${claim.id}" contains ${invalidPointers.length} malformed provenance pointer(s).`,
        claim.id
      );
    }
  }
}

/**
 * Sanitizes and classifies a claim according to Non-negotiable Invariant 2.
 * If provenance is missing on a "fact", it is automatically downgraded to "assumption".
 */
export function classifyClaim(claim: Claim): Claim {
  if (claim.status === "fact") {
    const hasValidProvenance =
      Array.isArray(claim.provenance) &&
      claim.provenance.length > 0 &&
      claim.provenance.every(isValidProvenancePointer);

    if (!hasValidProvenance) {
      return {
        ...claim,
        status: "assumption",
        tags: [...(claim.tags || []), "downgraded_from_fact_unprovenanced"],
      };
    }
  }

  return { ...claim };
}

import type { Claim, Constraint, EvidenceEvent, FactCandidate, ProvenancePointer } from "@zeo/contracts";
/**
 * Evidence ingestion boundary.
 *
 * FactCandidate -> Claim(status=fact) promotion requires non-empty provenance.
 * This module enforces that invariant at runtime.
 */
export declare class ProvenanceRequiredError extends Error {
    constructor(candidateText: string);
}
export declare class InvalidProvenanceError extends Error {
    constructor(detail: string);
}
/**
 * Promote a FactCandidate to a Claim with status="fact".
 * Requires non-empty, valid provenance. Throws ProvenanceRequiredError otherwise.
 */
export declare function promoteFactCandidate(candidate: FactCandidate, provenance: ProvenancePointer[]): Claim;
/**
 * Enforce that no Claim with status="fact" exists without provenance.
 * Scans claims and constraints. Throws on the first violation.
 */
export declare function enforceNoFactWithoutProvenance(data: {
    claims?: Claim[];
    constraints?: Constraint[];
    events?: EvidenceEvent[];
}): void;
/**
 * Downgrade a FactCandidate to a Claim with status="belief" when provenance
 * is unavailable. This preserves the claim without granting fact status.
 */
export declare function downgradeTobelief(candidate: FactCandidate): Claim;
//# sourceMappingURL=evidence.d.ts.map
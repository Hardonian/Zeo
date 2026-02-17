import { generateId } from "@zeo/kernel";
import type {
  Claim,
  Constraint,
  DecisionSpec,
  EvidenceEvent,
  FactCandidate,
  ProvenancePointer,
} from "@zeo/contracts";

/**
 * Evidence ingestion boundary.
 *
 * FactCandidate -> Claim(status=fact) promotion requires non-empty provenance.
 * This module enforces that invariant at runtime.
 */

export class ProvenanceRequiredError extends Error {
  constructor(candidateText: string) {
    super(
      `Cannot promote FactCandidate to Fact without provenance: "${candidateText}". ` +
      `Provide at least one ProvenancePointer with a valid sourceId and checksum.`
    );
    this.name = "ProvenanceRequiredError";
  }
}

export class InvalidProvenanceError extends Error {
  constructor(detail: string) {
    super(`Invalid provenance: ${detail}`);
    this.name = "InvalidProvenanceError";
  }
}

function validateProvenance(provenance: ProvenancePointer[]): void {
  for (const p of provenance) {
    if (!p.sourceId || p.sourceId.trim().length === 0) {
      throw new InvalidProvenanceError("sourceId must be a non-empty string.");
    }
    if (!p.checksum || p.checksum.trim().length === 0) {
      throw new InvalidProvenanceError("checksum must be a non-empty string.");
    }
    if (!p.capturedAt || p.capturedAt.trim().length === 0) {
      throw new InvalidProvenanceError("capturedAt must be a non-empty string.");
    }
  }
}

/**
 * Promote a FactCandidate to a Claim with status="fact".
 * Requires non-empty, valid provenance. Throws ProvenanceRequiredError otherwise.
 */
export function promoteFactCandidate(
  candidate: FactCandidate,
  provenance: ProvenancePointer[],
): Claim {
  if (!provenance || provenance.length === 0) {
    throw new ProvenanceRequiredError(candidate.text);
  }
  validateProvenance(provenance);

  return {
    id: candidate.id,
    text: candidate.text,
    status: "fact",
    confidence: "high",
    provenance,
    tags: candidate.tags,
  };
}

/**
 * Enforce that no Claim with status="fact" exists without provenance.
 * Scans claims and constraints. Throws on the first violation.
 */
export function enforceNoFactWithoutProvenance(data: {
  claims?: Claim[];
  constraints?: Constraint[];
  events?: EvidenceEvent[];
}): void {
  const allClaims: Claim[] = [];

  if (data.claims) allClaims.push(...data.claims);
  if (data.constraints) {
    for (const c of data.constraints) {
      allClaims.push({
        id: c.id,
        text: `${c.name}: ${c.value}`,
        status: c.status,
        confidence: "high",
        provenance: c.provenance,
        tags: ["constraint"],
      });
    }
  }
  if (data.events) {
    for (const ev of data.events) {
      allClaims.push(...ev.claims);
      for (const c of ev.constraints) {
        allClaims.push({
          id: c.id,
          text: `${c.name}: ${c.value}`,
          status: c.status,
          confidence: "high",
          provenance: c.provenance,
          tags: ["constraint"],
        });
      }
    }
  }

  for (const claim of allClaims) {
    if (claim.status === "fact") {
      if (!claim.provenance || claim.provenance.length === 0) {
        throw new ProvenanceRequiredError(claim.text);
      }
      validateProvenance(claim.provenance);
    }
  }
}

/**
 * Downgrade a FactCandidate to a Claim with status="belief" when provenance
 * is unavailable. This preserves the claim without granting fact status.
 */
export function downgradeTobelief(
  candidate: FactCandidate,
): Claim {
  return {
    id: candidate.id,
    text: candidate.text,
    status: "belief",
    confidence: candidate.rawConfidence,
    tags: candidate.tags,
  };
}

import { describe, it, expect } from "vitest";
import {
  promoteFactCandidate,
  enforceNoFactWithoutProvenance,
  downgradeTobelief,
  ProvenanceRequiredError,
  InvalidProvenanceError,
} from "./evidence.js";
import type { Claim, Constraint, FactCandidate, ProvenancePointer } from "@zeo/contracts";
import { generateId } from "@zeo/id";

function makeCandidate(overrides?: Partial<FactCandidate>): FactCandidate {
  return {
    id: generateId(),
    text: "Revenue is $5M ARR",
    sourceDescription: "Financial report Q4",
    capturedAt: new Date().toISOString(),
    rawConfidence: "high",
    tags: ["finance"],
    ...overrides,
  };
}

function makeProvenance(): ProvenancePointer[] {
  return [
    {
      kind: "document",
      sourceId: "doc-123",
      selector: "p.revenue",
      capturedAt: new Date().toISOString(),
      checksum: "sha256:abc123",
    },
  ];
}

describe("promoteFactCandidate", () => {
  it("promotes with valid provenance", () => {
    const candidate = makeCandidate();
    const claim = promoteFactCandidate(candidate, makeProvenance());
    expect(claim.status).toBe("fact");
    expect(claim.provenance).toHaveLength(1);
    expect(claim.text).toBe(candidate.text);
    expect(claim.confidence).toBe("high");
  });

  it("throws ProvenanceRequiredError when provenance is empty", () => {
    const candidate = makeCandidate();
    expect(() => promoteFactCandidate(candidate, [])).toThrow(ProvenanceRequiredError);
  });

  it("throws ProvenanceRequiredError when provenance is null-ish", () => {
    const candidate = makeCandidate();
    expect(() => promoteFactCandidate(candidate, undefined as unknown as ProvenancePointer[])).toThrow(ProvenanceRequiredError);
  });

  it("throws InvalidProvenanceError for empty sourceId", () => {
    const candidate = makeCandidate();
    const badProvenance: ProvenancePointer[] = [
      {
        kind: "text",
        sourceId: "",
        offset: 0,
        length: 10,
        capturedAt: new Date().toISOString(),
        checksum: "sha256:abc",
      },
    ];
    expect(() => promoteFactCandidate(candidate, badProvenance)).toThrow(InvalidProvenanceError);
  });

  it("throws InvalidProvenanceError for empty checksum", () => {
    const candidate = makeCandidate();
    const badProvenance: ProvenancePointer[] = [
      {
        kind: "text",
        sourceId: "src-1",
        offset: 0,
        length: 10,
        capturedAt: new Date().toISOString(),
        checksum: "",
      },
    ];
    expect(() => promoteFactCandidate(candidate, badProvenance)).toThrow(InvalidProvenanceError);
  });
});

describe("enforceNoFactWithoutProvenance", () => {
  it("passes when all facts have provenance", () => {
    const claims: Claim[] = [
      {
        id: generateId(),
        text: "Valid fact",
        status: "fact",
        confidence: "high",
        provenance: makeProvenance(),
        tags: [],
      },
      {
        id: generateId(),
        text: "Just a belief",
        status: "belief",
        confidence: "medium",
        tags: [],
      },
    ];
    expect(() => enforceNoFactWithoutProvenance({ claims })).not.toThrow();
  });

  it("throws when a claim is fact without provenance", () => {
    const claims: Claim[] = [
      {
        id: generateId(),
        text: "Orphan fact",
        status: "fact",
        confidence: "high",
        tags: [],
      },
    ];
    expect(() => enforceNoFactWithoutProvenance({ claims })).toThrow(ProvenanceRequiredError);
  });

  it("checks constraints too", () => {
    const constraints: Constraint[] = [
      {
        id: generateId(),
        name: "Budget",
        value: "$100k",
        status: "fact",
        // no provenance
      },
    ];
    expect(() => enforceNoFactWithoutProvenance({ constraints })).toThrow(ProvenanceRequiredError);
  });

  it("passes for assumptions and beliefs without provenance", () => {
    const claims: Claim[] = [
      { id: generateId(), text: "assumption", status: "assumption", confidence: "low", tags: [] },
      { id: generateId(), text: "belief", status: "belief", confidence: "medium", tags: [] },
      { id: generateId(), text: "unknown", status: "unknown", confidence: "low", tags: [] },
    ];
    expect(() => enforceNoFactWithoutProvenance({ claims })).not.toThrow();
  });
});

describe("downgradeToBelief", () => {
  it("creates a belief claim from a candidate", () => {
    const candidate = makeCandidate({ rawConfidence: "medium" });
    const claim = downgradeTobelief(candidate);
    expect(claim.status).toBe("belief");
    expect(claim.confidence).toBe("medium");
    expect(claim.provenance).toBeUndefined();
    expect(claim.text).toBe(candidate.text);
  });
});


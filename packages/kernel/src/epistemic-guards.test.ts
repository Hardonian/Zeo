import { describe, it, expect } from "vitest";
import {
  assertHasProvenance,
  classifyClaim,
  validateClaimTaxonomy,
  EpistemicInvariantViolationError,
} from "./epistemic-guards.js";
import { encodeCanonicalJson, canonicalizeValue } from "./canonical-json.js";
import type { Claim } from "@zeo/contracts";

describe("Epistemic Invariant Guards", () => {
  it("validates strict claim status taxonomy", () => {
    expect(validateClaimTaxonomy("fact")).toBe(true);
    expect(validateClaimTaxonomy("belief")).toBe(true);
    expect(validateClaimTaxonomy("assumption")).toBe(true);
    expect(validateClaimTaxonomy("unknown")).toBe(true);
    expect(validateClaimTaxonomy("inferred_truth")).toBe(false);
  });

  it("throws EpistemicInvariantViolationError when a fact lacks provenance", () => {
    const unprovenancedFact: Claim = {
      id: "claim-1",
      text: "Revenue was $10M",
      status: "fact",
      confidence: "high",
      tags: ["financial"],
    };

    expect(() => assertHasProvenance(unprovenancedFact)).toThrow(
      EpistemicInvariantViolationError
    );
  });

  it("passes when a fact has valid provenance pointers", () => {
    const validFact: Claim = {
      id: "claim-2",
      text: "Revenue was $10M",
      status: "fact",
      confidence: "high",
      tags: ["financial"],
      provenance: [
        {
          kind: "document",
          sourceId: "10k-filing-2025.pdf",
          page: 12,
          selector: "section.revenue",
          capturedAt: "2026-02-18T10:00:00.000Z",
          checksum:
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
      ],
    };

    expect(() => assertHasProvenance(validFact)).not.toThrow();
  });

  it("allows beliefs and assumptions without provenance", () => {
    const assumption: Claim = {
      id: "claim-3",
      text: "Market growth continues at 8%",
      status: "assumption",
      confidence: "medium",
      tags: ["forecast"],
    };

    expect(() => assertHasProvenance(assumption)).not.toThrow();
  });

  it("automatically downgrades unprovenanced facts to assumptions per Invariant 2", () => {
    const unprovenancedFact: Claim = {
      id: "claim-4",
      text: "Unverified claim",
      status: "fact",
      confidence: "high",
      tags: ["news"],
    };

    const classified = classifyClaim(unprovenancedFact);
    expect(classified.status).toBe("assumption");
    expect(classified.tags).toContain("downgraded_from_fact_unprovenanced");
  });
});

describe("Canonical JSON Hardening", () => {
  it("detects circular references and throws TypeError instead of stack overflow", () => {
    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;

    expect(() => encodeCanonicalJson(circular)).toThrow(TypeError);
    expect(() => canonicalizeValue(circular)).toThrow(TypeError);
  });

  it("normalizes -0 to 0", () => {
    expect(canonicalizeValue(-0)).toBe("0");
    expect(canonicalizeValue(0)).toBe("0");
  });

  it("normalizes decomposed Unicode strings to NFC", () => {
    // e + combining acute accent vs precomposed é
    const decomposed = "e\u0301";
    const precomposed = "\u00e9";

    expect(canonicalizeValue(decomposed)).toBe(canonicalizeValue(precomposed));
  });
});

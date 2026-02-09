import { describe, it, expect } from "vitest";
import { hashDecisionSpec, hashAssumptionSet, cacheKey } from "./hashing";
import { makeNegotiationExample, makeOpsExample } from "./examples";
import type { DecisionSpec } from "@zeo/contracts";

describe("hashing", () => {
  it("produces stable hash for identical DecisionSpec", () => {
    // makeNegotiationExample uses nanoid for IDs and Date.now for timestamps,
    // so two calls produce different IDs/times. But hashing ignores those fields.
    // We need to test with a fixed spec.
    const spec1 = makeNegotiationExample();
    const spec2: DecisionSpec = {
      ...spec1,
      id: "different-id",
      createdAt: "2099-01-01T00:00:00.000Z",
      agents: spec1.agents.map(a => ({ ...a, id: "different-agent-id" })),
      actions: spec1.actions.map(a => ({ ...a, id: "different-action-id", actorId: "different-actor-id" })),
      constraints: spec1.constraints.map(c => ({ ...c, id: "different-constraint-id" })),
      assumptions: spec1.assumptions.map(a => ({ ...a, id: "different-assumption-id" })),
    };

    expect(hashDecisionSpec(spec1)).toBe(hashDecisionSpec(spec2));
  });

  it("produces different hash for different spec content", () => {
    const specA = makeNegotiationExample();
    const specB = makeOpsExample();
    expect(hashDecisionSpec(specA)).not.toBe(hashDecisionSpec(specB));
  });

  it("hashAssumptionSet is stable for same assumptions regardless of IDs", () => {
    const spec = makeNegotiationExample();
    const hash1 = hashAssumptionSet(spec.assumptions);
    const modified = spec.assumptions.map(a => ({ ...a, id: "replaced-id" }));
    const hash2 = hashAssumptionSet(modified);
    expect(hash1).toBe(hash2);
  });

  it("hashAssumptionSet differs when assumption text changes", () => {
    const spec = makeNegotiationExample();
    const hash1 = hashAssumptionSet(spec.assumptions);
    const modified = spec.assumptions.map((a, i) =>
      i === 0 ? { ...a, text: "Totally different assumption" } : a
    );
    const hash2 = hashAssumptionSet(modified);
    expect(hash1).not.toBe(hash2);
  });

  it("cacheKey combines decision and assumption hashes", () => {
    const spec = makeNegotiationExample();
    const key = cacheKey(spec);
    expect(key).toContain(":");
    const [decHash, assHash] = key.split(":");
    expect(decHash).toBe(hashDecisionSpec(spec));
    expect(assHash).toBe(hashAssumptionSet(spec.assumptions));
  });
});


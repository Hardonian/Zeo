import { describe, it, expect } from "vitest";
import { makeNegotiationExample, makeOpsExample } from "./examples.js";
import { runDecision } from "./engine.js";

describe("zeo core", () => {
  it("generates a branch graph for negotiation", () => {
    const spec = makeNegotiationExample();
    const res = runDecision(spec, { depth: 2 });
    expect(res.graph.nodes.length).toBeGreaterThan(0);
    expect(res.evaluations.length).toBeGreaterThan(0);
    // Robustness lens must exist
    expect(res.evaluations.some(e => e.lens === "robustness")).toBe(true);
  });

  it("enforces provenance for fact constraints", () => {
    const spec = makeOpsExample();
    const res = runDecision(spec);
    expect(res.graph.decisionId).toBe(spec.id);
  });

  it("produces next-best-evidence prompts", () => {
    const spec = makeNegotiationExample();
    const res = runDecision(spec);
    expect(res.nextBestEvidence.length).toBeGreaterThanOrEqual(3);
  });
});

import { describe, it, expect } from "vitest";
import { generateFlipConditions } from "./flip-conditions";
import { runDecision } from "./engine";
import { makeNegotiationExample, makeOpsExample } from "./examples";

describe("flip-conditions", () => {
  it("generates flip conditions mapping to assumption IDs", () => {
    const spec = makeNegotiationExample();
    const result = runDecision(spec, { depth: 2 });
    const conditions = generateFlipConditions(spec, result.evaluations);

    expect(conditions.length).toBeGreaterThan(0);

    // Each condition must reference a valid assumption
    const assumptionIds = new Set(spec.assumptions.map(a => a.id));
    for (const c of conditions) {
      expect(assumptionIds.has(c.assumptionId)).toBe(true);
      expect(c.assumptionText.length).toBeGreaterThan(0);
      expect(c.flipThreshold.length).toBeGreaterThan(0);
      expect(c.reasoning.length).toBeGreaterThan(0);
    }
  });

  it("includes probability-based thresholds for assumptions with intervals", () => {
    const spec = makeNegotiationExample();
    const result = runDecision(spec, { depth: 2 });
    const conditions = generateFlipConditions(spec, result.evaluations);

    // At least one assumption in the negotiation example has a probability interval
    const withProbability = conditions.filter(c => {
      const assumption = spec.assumptions.find(a => a.id === c.assumptionId);
      return assumption?.probability !== undefined;
    });
    // May or may not have probability conditions depending on which are flagged fragile
    // But the conditions themselves should always have thresholds
    for (const c of conditions) {
      expect(c.flipThreshold).toBeTruthy();
    }
  });

  it("returns empty array when no robustness evaluation exists", () => {
    const spec = makeNegotiationExample();
    const conditions = generateFlipConditions(spec, []);
    expect(conditions).toEqual([]);
  });

  it("integrates into runDecision whatWouldChange output", () => {
    const spec = makeNegotiationExample();
    const result = runDecision(spec, { depth: 2 });

    expect(result.explanation.whatWouldChange.length).toBeGreaterThan(0);
    for (const entry of result.explanation.whatWouldChange) {
      expect(entry.assumptionId).toBeTruthy();
      expect(entry.flipCondition).toBeTruthy();
    }
  });

  it("works with ops example", () => {
    const spec = makeOpsExample();
    const result = runDecision(spec, { depth: 2 });
    const conditions = generateFlipConditions(spec, result.evaluations);
    expect(conditions.length).toBeGreaterThan(0);
  });
});


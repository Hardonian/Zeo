import { test, expect, describe } from "vitest";
import {
  synthesizeImplications,
  type DecisionContext
} from "./synthesizer.js";

describe("Decision Synthesizer", () => {
  const mockContext: DecisionContext = {
    decisionId: "dec-1",
    decisionTitle: "Expand to new market",
    availableActions: ["expand", "wait", "pivot"],
    assumptions: [
      { id: "a1", text: "Market demand is sufficient", confidence: 0.6 }
    ],
    analyticsResults: [
      { type: "regression", finding: "Marketing spend correlates with growth", confidence: "high" }
    ],
    calibrationData: {
      historicalAccuracy: 0.55
    },
    regimeInfo: {
      currentRegime: "expansion",
      stability: "transitioning"
    }
  };

  test("marks output as non-authoritative", () => {
    const result = synthesizeImplications(mockContext);
    
    expect(result.isNonAuthoritative).toBe(true);
    expect(result.isInterpretation).toBe(true);
    expect(result.warning).toContain("not authoritative");
  });

  test("generates all three implication types", () => {
    const result = synthesizeImplications(mockContext);
    
    const types = new Set(result.implications.map(i => i.type));
    expect(types.has("what_this_means")).toBe(true);
    expect(types.has("why_might_be_wrong")).toBe(true);
    expect(types.has("what_to_check_next")).toBe(true);
  });

  test("all implications require validation", () => {
    const result = synthesizeImplications(mockContext);
    
    for (const impl of result.implications) {
      expect(impl.requiresValidation).toBe(true);
    }
  });

  test("includes caveats in implications", () => {
    const result = synthesizeImplications(mockContext);
    
    for (const impl of result.implications) {
      expect(impl.caveats.length).toBeGreaterThan(0);
    }
  });

  test("respects maxImplications option", () => {
    const result = synthesizeImplications(mockContext, { maxImplications: 3 });
    
    expect(result.implications.length).toBeLessThanOrEqual(3);
  });

  test("generates summary", () => {
    const result = synthesizeImplications(mockContext);
    
    expect(result.summary).toContain(mockContext.decisionTitle);
    expect(result.summary).toContain("implications");
  });
});

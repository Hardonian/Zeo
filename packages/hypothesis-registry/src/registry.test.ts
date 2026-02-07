import { test, expect, describe } from "vitest";
import {
  createRegistry,
  addHypothesis,
  recordTest,
  addEvidence,
  linkToDecision,
  queryHypotheses,
  getRegistryStats,
  createReplayIntegration
} from "./registry.js";

describe("Hypothesis Registry", () => {
  test("creates empty registry", () => {
    const registry = createRegistry();
    
    expect(registry.id).toBeDefined();
    expect(registry.hypotheses.size).toBe(0);
    expect(registry.createdAt).toBeDefined();
  });

  test("adds hypothesis with correct defaults", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "analytics",
      domain: "causal",
      statement: "Marketing spend causes revenue increase",
      variables: ["marketing_spend", "revenue"]
    });
    
    expect(hypothesis.id).toBeDefined();
    expect(hypothesis.status).toBe("untested");
    expect(hypothesis.confidenceBand).toBe("low");
    expect(hypothesis.neverBecomesFact).toBe(true);
    expect(hypothesis.epistemicWarnings.length).toBeGreaterThan(0);
    expect(hypothesis.tests).toEqual([]);
    expect(hypothesis.evidence).toEqual([]);
  });

  test("includes epistemic warnings for causal hypotheses", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "analytics",
      domain: "causal",
      statement: "X causes Y",
      variables: ["X", "Y"]
    });
    
    expect(hypothesis.epistemicWarnings.some(w => w.includes("causal"))).toBe(true);
    expect(hypothesis.epistemicWarnings.some(w => w.includes("hypothesis, not a fact"))).toBe(true);
  });

  test("includes warnings for AI-proposed hypotheses", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "ai_proposal",
      domain: "correlational",
      statement: "A correlates with B",
      variables: ["A", "B"]
    });
    
    expect(hypothesis.epistemicWarnings.some(w => w.includes("AI-proposed"))).toBe(true);
  });

  test("records test and updates status", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "user_note",
      domain: "predictive",
      statement: "X predicts Y",
      variables: ["X", "Y"]
    });
    
    recordTest(registry, hypothesis.id, {
      timestamp: new Date().toISOString(),
      testType: "regression",
      description: "Linear regression test",
      controls: [],
      result: {
        outcome: "passed",
        pValue: 0.01
      },
      limitations: ["Small sample size"],
      provenance: []
    });
    
    const updated = registry.hypotheses.get(hypothesis.id)!;
    expect(updated.tests.length).toBe(1);
    expect(updated.status).toBe("weakly_supported");
  });

  test("falsifies hypothesis on failed test", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "analytics",
      domain: "correlational",
      statement: "X correlates with Y",
      variables: ["X", "Y"]
    });
    
    recordTest(registry, hypothesis.id, {
      timestamp: new Date().toISOString(),
      testType: "correlation",
      description: "Pearson correlation",
      controls: [],
      result: {
        outcome: "failed",
        pValue: 0.5
      },
      limitations: [],
      provenance: []
    });
    
    const updated = registry.hypotheses.get(hypothesis.id)!;
    expect(updated.status).toBe("falsified");
    expect(updated.confidenceBand).toBe("low");
  });

  test("adds evidence to hypothesis", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "literature",
      domain: "descriptive",
      statement: "Description",
      variables: ["X"]
    });
    
    addEvidence(registry, hypothesis.id, {
      testId: "test-1",
      timestamp: new Date().toISOString(),
      result: "supporting",
      strength: 0.8,
      provenance: [],
      notes: ["Strong evidence"]
    });
    
    const updated = registry.hypotheses.get(hypothesis.id)!;
    expect(updated.evidence.length).toBe(1);
    expect(updated.evidence[0].strength).toBe(0.8);
  });

  test("links hypothesis to decision", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "expert_judgment",
      domain: "causal",
      statement: "X causes Y",
      variables: ["X", "Y"]
    });
    
    linkToDecision(registry, hypothesis.id, "decision-123");
    
    const updated = registry.hypotheses.get(hypothesis.id)!;
    expect(updated.decisionIds).toContain("decision-123");
    expect(registry.byDecision.get("decision-123")).toContain(hypothesis.id);
  });

  test("queries by status", () => {
    const registry = createRegistry();
    
    const h1 = addHypothesis(registry, {
      source: "analytics",
      domain: "correlational",
      statement: "H1",
      variables: ["A"]
    });
    
    const h2 = addHypothesis(registry, {
      source: "analytics",
      domain: "correlational",
      statement: "H2",
      variables: ["B"]
    });
    
    // Falsify h1
    recordTest(registry, h1.id, {
      timestamp: new Date().toISOString(),
      testType: "test",
      description: "Test",
      controls: [],
      result: { outcome: "failed" },
      limitations: [],
      provenance: []
    });
    
    const untested = queryHypotheses(registry, { status: ["untested"] });
    expect(untested.length).toBe(1);
    expect(untested[0].id).toBe(h2.id);
    
    const falsified = queryHypotheses(registry, { status: ["falsified"] });
    expect(falsified.length).toBe(1);
    expect(falsified[0].id).toBe(h1.id);
  });

  test("queries by decision", () => {
    const registry = createRegistry();
    
    const h1 = addHypothesis(registry, {
      source: "analytics",
      domain: "correlational",
      statement: "H1",
      variables: ["A"],
      decisionIds: ["decision-1"]
    });
    
    addHypothesis(registry, {
      source: "analytics",
      domain: "correlational",
      statement: "H2",
      variables: ["B"],
      decisionIds: ["decision-2"]
    });
    
    const results = queryHypotheses(registry, { decisionId: "decision-1" });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(h1.id);
  });

  test("computes registry stats", () => {
    const registry = createRegistry();
    
    addHypothesis(registry, {
      source: "analytics",
      domain: "causal",
      statement: "H1",
      variables: ["A"]
    });
    
    addHypothesis(registry, {
      source: "ai_proposal",
      domain: "correlational",
      statement: "H2",
      variables: ["B"]
    });
    
    const stats = getRegistryStats(registry);
    
    expect(stats.total).toBe(2);
    expect(stats.bySource.analytics).toBe(1);
    expect(stats.bySource.ai_proposal).toBe(1);
    expect(stats.byDomain.causal).toBe(1);
    expect(stats.byDomain.correlational).toBe(1);
    expect(stats.untestedCount).toBe(2);
  });

  test("replay integration retrieves decision hypotheses", () => {
    const registry = createRegistry();
    
    const h1 = addHypothesis(registry, {
      source: "analytics",
      domain: "causal",
      statement: "H1",
      variables: ["A"],
      decisionIds: ["decision-1"]
    });
    
    const integration = createReplayIntegration(registry);
    const hypotheses = integration.getHypothesesForDecision("decision-1");
    
    expect(hypotheses.length).toBe(1);
    expect(hypotheses[0].id).toBe(h1.id);
  });

  test("replay integration tracks hypothesis history", () => {
    const registry = createRegistry();
    
    const hypothesis = addHypothesis(registry, {
      source: "analytics",
      domain: "causal",
      statement: "H1",
      variables: ["A"]
    });
    
    recordTest(registry, hypothesis.id, {
      timestamp: new Date().toISOString(),
      testType: "test",
      description: "Test 1",
      controls: [],
      result: { outcome: "passed" },
      limitations: [],
      provenance: []
    });
    
    const integration = createReplayIntegration(registry);
    const history = integration.getHypothesisHistory(hypothesis.id);
    
    expect(history.tests.length).toBe(1);
    expect(history.statusChanges.length).toBeGreaterThan(0);
  });
});

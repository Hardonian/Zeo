import { describe, expect, it } from "vitest";
import { CausalEngine } from "./engine.js";

describe("causal", () => {
  it("creates deterministic DAG ids for identical input", () => {
    const engine = new CausalEngine();

    const nodes = [
      { name: "Treatment", kind: "treatment", observed: true, dataType: "binary" },
      { name: "Outcome", kind: "outcome", observed: true, dataType: "continuous" },
      { name: "Confounder", kind: "confounder", observed: true, dataType: "continuous" },
    ] as const;

    const edges = [
      { from: "Confounder", to: "Treatment", mechanism: "direct" },
      { from: "Confounder", to: "Outcome", mechanism: "direct" },
      { from: "Treatment", to: "Outcome", mechanism: "direct" },
    ] as const;

    const dagA = engine.buildDAG("procurement", [...nodes], [...edges]);
    const dagB = engine.buildDAG("procurement", [...nodes], [...edges]);

    expect(dagA.id).toBe(dagB.id);
    expect(dagA.nodes.map((node) => node.id)).toEqual(dagB.nodes.map((node) => node.id));
    expect(dagA.edges).toEqual(dagB.edges);
  });

  it("validates inputs and reports interval boundary errors", () => {
    const engine = new CausalEngine();

    expect(() => engine.buildDAG("", [], [])).toThrow("DAG name must be non-empty");

    const dag = engine.buildDAG(
      "ops",
      [
        { name: "Treatment", kind: "treatment", observed: true, dataType: "binary" },
        { name: "Outcome", kind: "outcome", observed: true, dataType: "continuous" },
        { name: "Confounder", kind: "confounder", observed: true, dataType: "continuous" },
      ],
      [
        { from: "Confounder", to: "Treatment", mechanism: "direct" },
        { from: "Confounder", to: "Outcome", mechanism: "direct" },
        { from: "Treatment", to: "Outcome", mechanism: "direct" },
      ],
    );

    expect(() => {
      engine.createPredictiveClaim(dag, dag.nodes[0].id, dag.nodes[1].id, { low: 0.8, high: 0.2 });
    }).toThrow("Association interval is invalid: low must be <= high");
  });

  it("returns stable causal estimates with rounded bounds", () => {
    const engine = new CausalEngine();
    const dag = engine.buildDAG(
      "negotiation",
      [
        { name: "Treatment", kind: "treatment", observed: true, dataType: "binary" },
        { name: "Outcome", kind: "outcome", observed: true, dataType: "continuous" },
        { name: "Confounder", kind: "confounder", observed: true, dataType: "continuous" },
      ],
      [
        { from: "Confounder", to: "Treatment", mechanism: "direct" },
        { from: "Confounder", to: "Outcome", mechanism: "direct" },
        { from: "Treatment", to: "Outcome", mechanism: "direct" },
      ],
    );

    const treatmentId = dag.nodes.find((n) => n.kind === "treatment")!.id;
    const outcomeId = dag.nodes.find((n) => n.kind === "outcome")!.id;

    const dagWithoutBackdoor = { ...dag, backdoorPaths: [] };

    const claim = engine.createCausalClaim(dagWithoutBackdoor, treatmentId, outcomeId, {
      [treatmentId]: [1, 1, 0, 0],
      [outcomeId]: [0.9, 1.1, 0.3, 0.4],
    });

    expect(claim.estimate).toEqual({ low: 0.495048, high: 0.804952 });
  });
});

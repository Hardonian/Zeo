import { describe, it, expect, beforeEach } from "vitest";
import {
  createConstraintGraph,
  addNode,
  addEdge,
  addConstraint,
  propagateConstraints,
  createHardConstraint,
  createSoftConstraint,
  createTemporalConstraint,
  createBudgetConstraint,
  createIrreversibilityConstraint,
  createLegalConstraint,
  createEthicalConstraint,
  createActionNode,
  createDependencyEdge,
  createConsumptionEdge,
  createExclusionEdge,
  filterInfeasibleActions,
  applySoftPenalties,
} from "../src/index.js";
import type { ConstraintGraph, ConstraintContext } from "../src/index.js";

describe("Constraint Propagation Engine", () => {
  let graph: ConstraintGraph;
  const baseContext: Omit<ConstraintContext, "actionId" | "actionType"> = {
    variables: {},
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    graph = createConstraintGraph();
  });

  describe("Graph Construction", () => {
    it("should create an empty graph", () => {
      expect(graph.nodes.size).toBe(0);
      expect(graph.edges.size).toBe(0);
      expect(graph.constraints.size).toBe(0);
    });

    it("should add nodes to the graph", () => {
      const node = createActionNode("action1", "test");
      addNode(graph, node);
      expect(graph.nodes.has("action1")).toBe(true);
    });

    it("should add edges to the graph", () => {
      const edge = createDependencyEdge("action1", "action2");
      addEdge(graph, edge);
      expect(graph.edges.size).toBe(1);
    });
  });

  describe("Hard Constraints", () => {
    it("should mark actions violating hard constraints as infeasible", () => {
      const constraint = createHardConstraint(
        "c1",
        "Value must be positive",
        (ctx) => (ctx.variables.value as number) > 0,
        "Value must be positive"
      );
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", { value: -5 }, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, baseContext);
      expect(result.infeasibleActions).toContain("action1");
      expect(result.constraintViolations.length).toBeGreaterThan(0);
    });

    it("should allow actions satisfying hard constraints", () => {
      const constraint = createHardConstraint(
        "c1",
        "Value must be positive",
        (ctx) => (ctx.variables.value as number) > 0,
        "Value must be positive"
      );
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", { value: 5 }, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, baseContext);
      expect(result.infeasibleActions).not.toContain("action1");
    });
  });

  describe("Soft Constraints", () => {
    it("should apply penalties for soft constraint violations", () => {
      const constraint = createSoftConstraint(
        "c1",
        "Prefer high values",
        0.2,
        (ctx) => (ctx.variables.value as number) > 10
      );
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", { value: 5 }, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, baseContext);
      expect(result.softPenalties.get("action1")).toBe(0.2);
    });

    it("should not apply penalties when soft constraints are satisfied", () => {
      const constraint = createSoftConstraint(
        "c1",
        "Prefer high values",
        0.2,
        (ctx) => (ctx.variables.value as number) > 10
      );
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", { value: 15 }, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, baseContext);
      expect(result.softPenalties.get("action1")).toBeUndefined();
    });
  });

  describe("Temporal Constraints", () => {
    it("should reject actions before notBefore time", () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      const constraint = createTemporalConstraint("c1", "Not before tomorrow", {
        notBefore: future,
      });
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", {}, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, { ...baseContext, timestamp: new Date().toISOString() });
      expect(result.infeasibleActions).toContain("action1");
    });

    it("should allow actions after notBefore time", () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      const constraint = createTemporalConstraint("c1", "Not before yesterday", {
        notBefore: past,
      });
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", {}, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, { ...baseContext, timestamp: new Date().toISOString() });
      expect(result.infeasibleActions).not.toContain("action1");
    });
  });

  describe("Budget Constraints", () => {
    it("should reject actions exceeding budget", () => {
      const constraint = createBudgetConstraint("c1", "Budget limit", "money", 100, 80, "USD");
      addConstraint(graph, constraint);

      const resourceNode = { id: "money", type: "resource" as const, capacity: 100, allocated: 80, unit: "USD" };
      addNode(graph, resourceNode);

      const actionNode = createActionNode("action1", "test", {}, ["c1"]);
      addNode(graph, actionNode);

      const edge = createConsumptionEdge("action1", "money", 30);
      addEdge(graph, edge);

      const result = propagateConstraints(graph, baseContext);
      expect(result.infeasibleActions).toContain("action1");
    });
  });

  describe("Legal Constraints", () => {
    it("should reject actions violating legal constraints", () => {
      const constraint = createLegalConstraint(
        "c1",
        "GDPR compliance",
        "EU",
        "GDPR",
        (ctx) => (ctx.variables.hasConsent as boolean) === true
      );
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", { hasConsent: false }, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, baseContext);
      expect(result.infeasibleActions).toContain("action1");
    });
  });

  describe("Ethical Constraints", () => {
    it("should reject blocking ethical violations", () => {
      const constraint = createEthicalConstraint(
        "c1",
        "Do no harm",
        "do_no_harm",
        (ctx) => (ctx.variables.harmScore as number) < 5,
        "blocking"
      );
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", { harmScore: 10 }, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, baseContext);
      expect(result.infeasibleActions).toContain("action1");
    });

    it("should warn but not block warning-level violations", () => {
      const constraint = createEthicalConstraint(
        "c1",
        "Transparency preferred",
        "transparency",
        (ctx) => (ctx.variables.isTransparent as boolean) === true,
        "warning"
      );
      addConstraint(graph, constraint);

      const node = createActionNode("action1", "test", { isTransparent: false }, ["c1"]);
      addNode(graph, node);

      const result = propagateConstraints(graph, baseContext);
      expect(result.infeasibleActions).not.toContain("action1");
      expect(result.constraintViolations.length).toBeGreaterThan(0);
    });
  });

  describe("Dependency Propagation", () => {
    it("should mark dependent actions as dominated when dependency is infeasible", () => {
      const constraint = createHardConstraint(
        "c1",
        "Must be positive",
        (ctx) => (ctx.variables.value as number) > 0,
        "Must be positive"
      );
      addConstraint(graph, constraint);

      const depNode = createActionNode("dep", "dependency", { value: -5 }, ["c1"]);
      addNode(graph, depNode);

      const actionNode = createActionNode("action1", "test", { value: 5 }, []);
      addNode(graph, actionNode);

      const edge = createDependencyEdge("dep", "action1");
      addEdge(graph, edge);

      const result = propagateConstraints(graph, baseContext);
      expect(result.infeasibleActions).toContain("dep");
      // action1 depends on dep, so when dep is infeasible, action1 is dominated
      expect(result.dominatedActions.some(d => d.actionId === "action1")).toBe(true);
      expect(result.dominatedActions.some(d => d.dominatedBy === "dep")).toBe(true);
    });
  });

  describe("Exclusion Handling", () => {
    it("should identify mutually exclusive actions", () => {
      const action1 = createActionNode("action1", "test");
      const action2 = createActionNode("action2", "test");
      addNode(graph, action1);
      addNode(graph, action2);

      const edge = createExclusionEdge("action1", "action2");
      addEdge(graph, edge);

      const result = propagateConstraints(graph, baseContext);
      expect(result.dominatedActions.some(d => d.actionId === "action2")).toBe(true);
    });
  });

  describe("Ranking Utilities", () => {
    it("should filter infeasible actions from ranking", () => {
      const ranking = [
        { id: "a1", score: 0.9 },
        { id: "a2", score: 0.8 },
        { id: "a3", score: 0.7 },
      ];
      const infeasible = new Set(["a2"]);

      const filtered = filterInfeasibleActions(ranking, infeasible);
      expect(filtered.length).toBe(2);
      expect(filtered.map(a => a.id)).toEqual(["a1", "a3"]);
    });

    it("should apply soft penalties to scores", () => {
      const ranking = [
        { id: "a1", score: 0.9 },
        { id: "a2", score: 0.8 },
      ];
      const penalties = new Map([["a1", 0.2]]);

      const penalized = applySoftPenalties(ranking, penalties);
      expect(penalized[0].score).toBe(0.7);
      expect(penalized[1].score).toBe(0.8);
    });
  });

  describe("Integration: Infeasible Action Never Ranked First", () => {
    it("should ensure infeasible action cannot be top ranked", () => {
      const constraint = createHardConstraint(
        "c1",
        "Must be positive",
        (ctx) => (ctx.variables.value as number) > 0,
        "Must be positive"
      );
      addConstraint(graph, constraint);

      const infeasibleAction = createActionNode("bad", "test", { value: -10 }, ["c1"]);
      const feasibleAction = createActionNode("good", "test", { value: 10 }, ["c1"]);
      addNode(graph, infeasibleAction);
      addNode(graph, feasibleAction);

      const result = propagateConstraints(graph, baseContext);
      const infeasibleSet = new Set(result.infeasibleActions);

      expect(infeasibleSet.has("bad")).toBe(true);
      expect(infeasibleSet.has("good")).toBe(false);

      // After filtering, only good action remains
      const ranking = [
        { id: "bad", score: 1.0 },
        { id: "good", score: 0.5 },
      ];
      const filtered = filterInfeasibleActions(ranking, infeasibleSet);
      expect(filtered[0].id).toBe("good");
    });
  });
});

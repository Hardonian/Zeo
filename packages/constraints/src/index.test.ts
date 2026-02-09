/**
 * Tests for @zeo/constraints package
 */

import { test, expect, describe } from "vitest";
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
  type ConstraintGraph,
  type ActionNode,
  type ConstraintContext,
} from "./index";

describe("Constraint Graph", () => {
  describe("createConstraintGraph", () => {
    test("creates empty graph with all collections", () => {
      const graph = createConstraintGraph();
      expect(graph.nodes).toBeInstanceOf(Map);
      expect(graph.edges).toBeInstanceOf(Map);
      expect(graph.constraints).toBeInstanceOf(Map);
      expect(graph.nodes.size).toBe(0);
      expect(graph.edges.size).toBe(0);
      expect(graph.constraints.size).toBe(0);
    });
  });

  describe("addNode", () => {
    test("adds action node to graph", () => {
      const graph = createConstraintGraph();
      const node = createActionNode("action-1", "purchase", { cost: 100 }, []);
      addNode(graph, node);
      expect(graph.nodes.size).toBe(1);
      expect(graph.nodes.get("action-1")).toBeDefined();
    });

    test("adds multiple nodes to graph", () => {
      const graph = createConstraintGraph();
      const node1 = createActionNode("action-1", "purchase", { cost: 100 }, []);
      const node2 = createActionNode("action-2", "purchase", { cost: 200 }, []);
      addNode(graph, node1);
      addNode(graph, node2);
      expect(graph.nodes.size).toBe(2);
    });

    test("overwrites node with same id", () => {
      const graph = createConstraintGraph();
      const node1 = createActionNode("action-1", "purchase", { cost: 100 }, []);
      const node2 = createActionNode("action-1", "purchase", { cost: 200 }, []);
      addNode(graph, node1);
      addNode(graph, node2);
      expect(graph.nodes.size).toBe(1);
      expect((graph.nodes.get("action-1") as ActionNode).variables.cost).toBe(200);
    });
  });

  describe("addEdge", () => {
    test("adds dependency edge to graph", () => {
      const graph = createConstraintGraph();
      const edge = createDependencyEdge("action-1", "action-2");
      addEdge(graph, edge);
      expect(graph.edges.size).toBe(1);
      expect(graph.edges.get("action-1-depends-action-2")).toBeDefined();
    });

    test("adds consumption edge to graph", () => {
      const graph = createConstraintGraph();
      const edge = createConsumptionEdge("action-1", "budget", 50);
      addEdge(graph, edge);
      expect(graph.edges.size).toBe(1);
    });

    test("adds exclusion edge to graph", () => {
      const graph = createConstraintGraph();
      const edge = createExclusionEdge("action-1", "action-2");
      addEdge(graph, edge);
      expect(graph.edges.size).toBe(1);
    });
  });

  describe("addConstraint", () => {
    test("adds hard constraint to graph", () => {
      const graph = createConstraintGraph();
      const constraint = createHardConstraint(
        "budget-limit",
        "Cannot exceed budget",
        () => true,
        "Budget exceeded"
      );
      addConstraint(graph, constraint);
      expect(graph.constraints.size).toBe(1);
      expect(graph.constraints.get("budget-limit")).toBeDefined();
    });

    test("adds multiple constraints to graph", () => {
      const graph = createConstraintGraph();
      const constraint1 = createHardConstraint("c1", "Desc 1", () => true, "Error 1");
      const constraint2 = createSoftConstraint("c2", "Desc 2", 0.5, () => false);
      addConstraint(graph, constraint1);
      addConstraint(graph, constraint2);
      expect(graph.constraints.size).toBe(2);
    });
  });
});

describe("Constraint Creators", () => {
  describe("createHardConstraint", () => {
    test("creates hard constraint with all fields", () => {
      const predicate = (ctx: ConstraintContext) => (ctx.variables.cost as number) <= 100;
      const constraint = createHardConstraint(
        "budget-limit",
        "Budget must not exceed 100",
        predicate,
        "Budget exceeded limit"
      );
      expect(constraint.id).toBe("budget-limit");
      expect(constraint.type).toBe("hard");
      expect(constraint.description).toBe("Budget must not exceed 100");
      expect(constraint.violationMessage).toBe("Budget exceeded limit");
      expect(constraint.createdAt).toBeDefined();
      expect(constraint.predicate).toBe(predicate);
    });

    test("predicate evaluates correctly", () => {
      const constraint = createHardConstraint(
        "budget-check",
        "Check budget",
        (ctx) => (ctx.variables.cost as number) <= 100,
        "Over budget"
      );
      expect(constraint.predicate({ actionId: "a", actionType: "t", variables: { cost: 50 }, timestamp: "2024-01-01T00:00:00Z" })).toBe(true);
      expect(constraint.predicate({ actionId: "a", actionType: "t", variables: { cost: 150 }, timestamp: "2024-01-01T00:00:00Z" })).toBe(false);
    });
  });

  describe("createSoftConstraint", () => {
    test("creates soft constraint with penalty", () => {
      const constraint = createSoftConstraint(
        "prefer-short",
        "Prefer shorter timelines",
        0.3,
        (ctx) => (ctx.variables.duration as number) <= 30
      );
      expect(constraint.id).toBe("prefer-short");
      expect(constraint.type).toBe("soft");
      expect(constraint.penalty).toBe(0.3);
    });
  });

  describe("createTemporalConstraint", () => {
    test("creates temporal constraint with time bounds", () => {
      const constraint = createTemporalConstraint(
        "deadline",
        "Must complete before deadline",
        {
          notBefore: "2024-01-01T00:00:00Z",
          notAfter: "2024-12-31T23:59:59Z",
        }
      );
      expect(constraint.id).toBe("deadline");
      expect(constraint.type).toBe("temporal");
      expect(constraint.notBefore).toBe("2024-01-01T00:00:00Z");
      expect(constraint.notAfter).toBe("2024-12-31T23:59:59Z");
    });

    test("creates temporal constraint with only notBefore", () => {
      const constraint = createTemporalConstraint(
        "start-date",
        "Cannot start before date",
        { notBefore: "2024-01-01T00:00:00Z" }
      );
      expect(constraint.notBefore).toBeDefined();
      expect(constraint.notAfter).toBeUndefined();
    });

    test("creates temporal constraint with only notAfter", () => {
      const constraint = createTemporalConstraint(
        "deadline",
        "Must complete by date",
        { notAfter: "2024-12-31T23:59:59Z" }
      );
      expect(constraint.notBefore).toBeUndefined();
      expect(constraint.notAfter).toBeDefined();
    });
  });

  describe("createBudgetConstraint", () => {
    test("creates budget constraint with all fields", () => {
      const constraint = createBudgetConstraint(
        "project-budget",
        "Total project budget",
        "USD",
        10000,
        5000,
        "dollars"
      );
      expect(constraint.id).toBe("project-budget");
      expect(constraint.type).toBe("budget");
      expect(constraint.resource).toBe("USD");
      expect(constraint.maxAmount).toBe(10000);
      expect(constraint.currentAmount).toBe(5000);
      expect(constraint.unit).toBe("dollars");
    });
  });

  describe("createIrreversibilityConstraint", () => {
    test("creates irreversibility constraint", () => {
      const constraint = createIrreversibilityConstraint(
        "contract-sign",
        "Signing contract is irreversible",
        "sign",
        true,
        0.9
      );
      expect(constraint.id).toBe("contract-sign");
      expect(constraint.type).toBe("irreversibility");
      expect(constraint.actionPattern).toBe("sign");
      expect(constraint.requiresConfirmation).toBe(true);
      expect(constraint.confirmationThreshold).toBe(0.9);
    });

    test("creates irreversibility constraint with defaults", () => {
      const constraint = createIrreversibilityConstraint(
        "delete",
        "Deletion is irreversible",
        "delete"
      );
      expect(constraint.requiresConfirmation).toBe(true);
      expect(constraint.confirmationThreshold).toBeUndefined();
    });
  });

  describe("createLegalConstraint", () => {
    test("creates legal constraint", () => {
      const constraint = createLegalConstraint(
        "gdpr-compliance",
        "Must comply with GDPR",
        "EU",
        "GDPR",
        () => true
      );
      expect(constraint.id).toBe("gdpr-compliance");
      expect(constraint.type).toBe("legal");
      expect(constraint.jurisdiction).toBe("EU");
      expect(constraint.regulation).toBe("GDPR");
    });
  });

  describe("createEthicalConstraint", () => {
    test("creates ethical constraint with blocking severity", () => {
      const constraint = createEthicalConstraint(
        "do-no-harm",
        "Must not cause harm",
        "do_no_harm",
        () => true,
        "blocking"
      );
      expect(constraint.id).toBe("do-no-harm");
      expect(constraint.type).toBe("ethical");
      expect(constraint.principle).toBe("do_no_harm");
      expect(constraint.severity).toBe("blocking");
    });

    test("creates ethical constraint with warning severity", () => {
      const constraint = createEthicalConstraint(
        "transparency",
        "Should be transparent",
        "transparency",
        () => true,
        "warning"
      );
      expect(constraint.severity).toBe("warning");
    });

    test("creates ethical constraint with default warning severity", () => {
      const constraint = createEthicalConstraint(
        "fairness",
        "Should be fair",
        "fairness",
        () => true
      );
      expect(constraint.severity).toBe("warning");
    });
  });

  describe("createActionNode", () => {
    test("creates action node with all fields", () => {
      const node = createActionNode(
        "action-1",
        "purchase",
        { cost: 100, duration: 5 },
        ["budget-limit"]
      );
      expect(node.id).toBe("action-1");
      expect(node.type).toBe("action");
      expect(node.actionType).toBe("purchase");
      expect(node.variables.cost).toBe(100);
      expect(node.variables.duration).toBe(5);
      expect(node.constraints).toEqual(["budget-limit"]);
      expect(node.infeasible).toBe(false);
    });

    test("creates action node with defaults", () => {
      const node = createActionNode("action-1", "purchase");
      expect(node.variables).toEqual({});
      expect(node.constraints).toEqual([]);
      expect(node.infeasible).toBe(false);
    });
  });

  describe("createDependencyEdge", () => {
    test("creates dependency edge", () => {
      const edge = createDependencyEdge("action-1", "action-2");
      expect(edge.id).toBe("action-1-depends-action-2");
      expect(edge.from).toBe("action-1");
      expect(edge.to).toBe("action-2");
      expect(edge.type).toBe("dependency");
    });
  });

  describe("createConsumptionEdge", () => {
    test("creates consumption edge with amount", () => {
      const edge = createConsumptionEdge("action-1", "budget", 50);
      expect(edge.id).toBe("action-1-consumes-budget-50");
      expect(edge.from).toBe("action-1");
      expect(edge.to).toBe("budget");
      expect(edge.type).toBe("consumption");
      expect(edge.weight).toBe(50);
    });
  });

  describe("createExclusionEdge", () => {
    test("creates exclusion edge", () => {
      const edge = createExclusionEdge("action-1", "action-2");
      expect(edge.id).toBe("action-1-excludes-action-2");
      expect(edge.from).toBe("action-1");
      expect(edge.to).toBe("action-2");
      expect(edge.type).toBe("exclusion");
    });
  });
});

describe("Constraint Propagation", () => {
  describe("propagateConstraints - hard constraints", () => {
    test("identifies actions violating hard constraints", () => {
      const graph = createConstraintGraph();
      const constraint = createHardConstraint(
        "budget-limit",
        "Budget must be <= 100",
        (ctx) => (ctx.variables.cost as number) <= 100,
        "Budget exceeded"
      );
      addConstraint(graph, constraint);

      const action1 = createActionNode("action-1", "purchase", { cost: 50 }, ["budget-limit"]);
      const action2 = createActionNode("action-2", "purchase", { cost: 150 }, ["budget-limit"]);
      addNode(graph, action1);
      addNode(graph, action2);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-2");
      expect(result.infeasibleActions).not.toContain("action-1");
    });

    test("handles predicate evaluation errors as violations", () => {
      const graph = createConstraintGraph();
      const constraint = createHardConstraint(
        "error-prone",
        "May throw error",
        () => {
          throw new Error("Predicate error");
        },
        "Constraint failed"
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "test", {}, ["error-prone"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-1");
      expect(result.constraintViolations[0].message).toContain("evaluation failed");
    });
  });

  describe("propagateConstraints - soft constraints", () => {
    test("applies soft penalties for constraint violations", () => {
      const graph = createConstraintGraph();
      const constraint = createSoftConstraint(
        "prefer-short",
        "Prefer duration <= 10",
        0.2,
        (ctx) => (ctx.variables.duration as number) <= 10
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "task", { duration: 20 }, ["prefer-short"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.softPenalties.get("action-1")).toBe(0.2);
    });

    test("accumulates multiple soft penalties", () => {
      const graph = createConstraintGraph();
      const constraint1 = createSoftConstraint("c1", "C1", 0.1, () => false);
      const constraint2 = createSoftConstraint("c2", "C2", 0.2, () => false);
      addConstraint(graph, constraint1);
      addConstraint(graph, constraint2);

      const action = createActionNode("action-1", "task", {}, ["c1", "c2"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.softPenalties.get("action-1")).toBeCloseTo(0.3, 5);
    });
  });

  describe("propagateConstraints - temporal constraints", () => {
    test("enforces notBefore constraint", () => {
      const graph = createConstraintGraph();
      const constraint = createTemporalConstraint(
        "future-only",
        "Cannot execute before 2024-06-01",
        { notBefore: "2024-06-01T00:00:00Z" }
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "task", {}, ["future-only"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-1");
    });

    test("enforces notAfter constraint", () => {
      const graph = createConstraintGraph();
      const constraint = createTemporalConstraint(
        "deadline",
        "Must complete before 2024-06-01",
        { notAfter: "2024-06-01T00:00:00Z" }
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "task", {}, ["deadline"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-12-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-1");
    });

    test("allows action within temporal window", () => {
      const graph = createConstraintGraph();
      const constraint = createTemporalConstraint(
        "window",
        "Execute between June and December",
        {
          notBefore: "2024-06-01T00:00:00Z",
          notAfter: "2024-12-31T23:59:59Z",
        }
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "task", {}, ["window"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-09-15T00:00:00Z",
      });

      expect(result.infeasibleActions).not.toContain("action-1");
    });
  });

  describe("propagateConstraints - budget constraints", () => {
    test("enforces budget limits", () => {
      const graph = createConstraintGraph();
      const constraint = createBudgetConstraint(
        "budget",
        "Project budget",
        "budget",
        1000,
        800,
        "USD"
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "purchase", {}, ["budget"]);
      addNode(graph, action);

      const edge = createConsumptionEdge("action-1", "budget", 300);
      addEdge(graph, edge);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-1");
    });

    test("allows action within budget", () => {
      const graph = createConstraintGraph();
      const constraint = createBudgetConstraint(
        "budget",
        "Project budget",
        "budget",
        1000,
        800,
        "USD"
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "purchase", {}, ["budget"]);
      addNode(graph, action);

      const edge = createConsumptionEdge("action-1", "budget", 100);
      addEdge(graph, edge);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).not.toContain("action-1");
    });
  });

  describe("propagateConstraints - legal constraints", () => {
    test("enforces legal constraints", () => {
      const graph = createConstraintGraph();
      const constraint = createLegalConstraint(
        "compliance",
        "Must be compliant",
        "US",
        "SOX",
        (ctx) => (ctx.variables.compliant as boolean) === true
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "transaction", { compliant: false }, ["compliance"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-1");
    });
  });

  describe("propagateConstraints - ethical constraints", () => {
    test("blocks actions violating blocking ethical constraints", () => {
      const graph = createConstraintGraph();
      const constraint = createEthicalConstraint(
        "no-harm",
        "Must not cause harm",
        "do_no_harm",
        (ctx) => (ctx.variables.harm as boolean) !== true,
        "blocking"
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "action", { harm: true }, ["no-harm"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-1");
    });

    test("warns but does not block warning-level ethical constraints", () => {
      const graph = createConstraintGraph();
      const constraint = createEthicalConstraint(
        "prefer-fair",
        "Should be fair",
        "fairness",
        (ctx) => (ctx.variables.fair as boolean) === true,
        "warning"
      );
      addConstraint(graph, constraint);

      const action = createActionNode("action-1", "action", { fair: false }, ["prefer-fair"]);
      addNode(graph, action);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).not.toContain("action-1");
      expect(result.constraintViolations.length).toBeGreaterThan(0);
    });
  });

  describe("propagateConstraints - dependency propagation", () => {
    test("marks dependent actions as dominated when dependency is infeasible", () => {
      const graph = createConstraintGraph();

      // Budget constraint that action-1 will violate
      const constraint = createHardConstraint(
        "budget",
        "Budget limit",
        () => false,
        "Over budget"
      );
      addConstraint(graph, constraint);

      // Action 1 (infeasible)
      const action1 = createActionNode("action-1", "step1", {}, ["budget"]);
      addNode(graph, action1);

      // Action 2 depends on action 1
      const action2 = createActionNode("action-2", "step2", {}, []);
      addNode(graph, action2);

      const depEdge = createDependencyEdge("action-1", "action-2");
      addEdge(graph, depEdge);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toContain("action-1");
      expect(result.dominatedActions.some((d) => d.actionId === "action-2")).toBe(true);
    });
  });

  describe("propagateConstraints - exclusion handling", () => {
    test("identifies mutually exclusive actions", () => {
      const graph = createConstraintGraph();

      const action1 = createActionNode("action-1", "option-a", {}, []);
      const action2 = createActionNode("action-2", "option-b", {}, []);
      addNode(graph, action1);
      addNode(graph, action2);

      const exclusionEdge = createExclusionEdge("action-1", "action-2");
      addEdge(graph, exclusionEdge);

      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.dominatedActions.length).toBeGreaterThan(0);
    });
  });

  describe("propagateConstraints - empty graph", () => {
    test("handles empty graph gracefully", () => {
      const graph = createConstraintGraph();
      const result = propagateConstraints(graph, {
        variables: {},
        timestamp: "2024-01-01T00:00:00Z",
      });

      expect(result.infeasibleActions).toHaveLength(0);
      expect(result.dominatedActions).toHaveLength(0);
      expect(result.softPenalties.size).toBe(0);
      expect(result.constraintViolations).toHaveLength(0);
    });
  });
});

describe("Utility Functions", () => {
  describe("filterInfeasibleActions", () => {
    test("removes infeasible actions from ranking", () => {
      const ranking = [{ id: "a", score: 1 }, { id: "b", score: 2 }, { id: "c", score: 3 }];
      const infeasible = new Set(["b"]);

      const filtered = filterInfeasibleActions(ranking, infeasible);

      expect(filtered).toHaveLength(2);
      expect(filtered.some((r) => r.id === "b")).toBe(false);
    });

    test("returns empty array when all actions infeasible", () => {
      const ranking = [{ id: "a", score: 1 }, { id: "b", score: 2 }];
      const infeasible = new Set(["a", "b"]);

      const filtered = filterInfeasibleActions(ranking, infeasible);

      expect(filtered).toHaveLength(0);
    });

    test("returns all actions when none infeasible", () => {
      const ranking = [{ id: "a", score: 1 }, { id: "b", score: 2 }];
      const infeasible = new Set<string>();

      const filtered = filterInfeasibleActions(ranking, infeasible);

      expect(filtered).toHaveLength(2);
    });
  });

  describe("applySoftPenalties", () => {
    test("applies penalties to action scores", () => {
      const ranking = [
        { id: "a", score: 1.0 },
        { id: "b", score: 1.0 },
      ];
      const penalties = new Map([["a", 0.3]]);

      const adjusted = applySoftPenalties(ranking, penalties);

      expect(adjusted.find((r) => r.id === "a")?.score).toBe(0.7);
      expect(adjusted.find((r) => r.id === "b")?.score).toBe(1.0);
    });

    test("does not allow negative scores", () => {
      const ranking = [{ id: "a", score: 0.2 }];
      const penalties = new Map([["a", 0.5]]);

      const adjusted = applySoftPenalties(ranking, penalties);

      expect(adjusted[0].score).toBe(0);
    });

    test("handles zero penalty", () => {
      const ranking = [{ id: "a", score: 1.0 }];
      const penalties = new Map([["a", 0]]);

      const adjusted = applySoftPenalties(ranking, penalties);

      expect(adjusted[0].score).toBe(1.0);
    });
  });
});

describe("Integration Tests", () => {
  test("complex constraint scenario with multiple constraint types", () => {
    const graph = createConstraintGraph();

    // Budget constraint
    const budgetConstraint = createBudgetConstraint("budget", "Budget", "money", 1000, 0, "USD");
    addConstraint(graph, budgetConstraint);

    // Temporal constraint
    const temporalConstraint = createTemporalConstraint(
      "deadline",
      "Deadline",
      { notAfter: "2024-12-31T23:59:59Z" }
    );
    addConstraint(graph, temporalConstraint);

    // Hard constraint
    const hardConstraint = createHardConstraint(
      "approval",
      "Requires approval",
      (ctx) => (ctx.variables.approved as boolean) === true,
      "Not approved"
    );
    addConstraint(graph, hardConstraint);

    // Actions
    const action1 = createActionNode(
      "cheap-approved",
      "purchase",
      { approved: true },
      ["budget", "deadline", "approval"]
    );
    const action2 = createActionNode(
      "expensive",
      "purchase",
      { approved: true },
      ["budget", "deadline", "approval"]
    );
    const action3 = createActionNode(
      "unapproved",
      "purchase",
      { approved: false },
      ["budget", "deadline", "approval"]
    );

    addNode(graph, action1);
    addNode(graph, action2);
    addNode(graph, action3);

    // Consumption edges
    addEdge(graph, createConsumptionEdge("cheap-approved", "money", 100));
    addEdge(graph, createConsumptionEdge("expensive", "money", 2000));
    addEdge(graph, createConsumptionEdge("unapproved", "money", 50));

    const result = propagateConstraints(graph, {
      variables: {},
      timestamp: "2024-06-15T00:00:00Z",
    });

    // cheap-approved: passes all constraints
    expect(result.infeasibleActions).not.toContain("cheap-approved");

    // expensive: violates budget
    expect(result.infeasibleActions).toContain("expensive");

    // unapproved: violates approval constraint
    expect(result.infeasibleActions).toContain("unapproved");
  });

  test("infeasible action never ranked first invariant", () => {
    const graph = createConstraintGraph();

    const constraint = createHardConstraint(
      "block-action-1",
      "Blocks action 1",
      (ctx) => ctx.actionId !== "action-1",
      "Action 1 is blocked"
    );
    addConstraint(graph, constraint);

    const action1 = createActionNode("action-1", "type", {}, ["block-action-1"]);
    const action2 = createActionNode("action-2", "type", {}, ["block-action-1"]);
    addNode(graph, action1);
    addNode(graph, action2);

    const result = propagateConstraints(graph, {
      variables: {},
      timestamp: "2024-01-01T00:00:00Z",
    });

    // Remove infeasible from ranking
    const ranking = [
      { id: "action-1", score: 100 },
      { id: "action-2", score: 50 },
    ];
    const infeasibleIds = new Set(result.infeasibleActions);
    const validRanking = filterInfeasibleActions(ranking, infeasibleIds);

    // Invariant: infeasible action never ranked first
    if (validRanking.length > 0) {
      expect(validRanking[0].id).not.toBe("action-1");
    }
  });
});


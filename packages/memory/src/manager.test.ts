import { describe, it, expect, beforeEach } from "vitest";
import { nanoid } from "nanoid";
import type { DecisionSpec, BranchGraph } from "@zeo/contracts";
import { InMemoryStorageAdapter } from "../src/storage.js";
import { DecisionMemoryManager } from "../src/manager.js";
import type { ResolutionStatus, DecisionRecord } from "../src/types.js";

describe("DecisionMemoryManager", () => {
  let storage: InMemoryStorageAdapter;
  let manager: DecisionMemoryManager;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
    manager = new DecisionMemoryManager(storage);
  });

  const createMockSpec = (): DecisionSpec => ({
    id: nanoid(),
    title: "Test Decision",
    context: "Test context",
    createdAt: new Date().toISOString(),
    horizon: "days",
    agents: [{ id: nanoid(), name: "Test Agent", role: "self" }],
    actions: [{ id: nanoid(), label: "Test Action", actorId: "agent1", kind: "communicate" }],
    constraints: [],
    assumptions: [
      { id: nanoid(), text: "Test assumption", status: "assumption", confidence: "medium", tags: ["test"] },
    ],
  });

  const createMockGraph = (decisionId: string): BranchGraph => ({
    id: nanoid(),
    decisionId,
    createdAt: new Date().toISOString(),
    nodes: [{ id: nanoid(), label: "Root", kind: "state", notes: [], dependencies: [] }],
    edges: [],
  });

  describe("recordDecision", () => {
    it("should create immutable decision record", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      const actionId = spec.actions[0].id;
      const branchId = graph.nodes[0].id;

      const record = await manager.recordDecision(spec, graph, actionId, branchId, {
        userId: "user123",
        domain: "negotiation",
        tags: ["test"],
      });

      expect(record.id).toBe(spec.id);
      expect(record.userId).toBe("user123");
      expect(record.domain).toBe("negotiation");
      expect(record.outcomes).toEqual([]);
      expect(record.immutable).toBe(true);
    });

    it("should preserve context snapshot at decision time", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);

      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user123",
        domain: "ops",
        urgency: "high",
      });

      expect(record.branchRecord.contextSnapshot.assumptions).toEqual(spec.assumptions);
      expect(record.branchRecord.contextSnapshot.horizon).toBe("days");
      expect(record.branchRecord.contextSnapshot.urgency).toBe("high");
    });
  });

  describe("recordOutcome", () => {
    it("should add outcome without modifying original record", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      
      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user123",
        domain: "negotiation",
      });

      const originalOutcomeCount = record.outcomes.length;

      await manager.recordOutcome(record.id, graph.nodes[0].id, {
        description: "Test outcome",
        status: "resolved" as ResolutionStatus,
        confidence: { level: "high", rationale: "Clear evidence", contradictions: [] },
      });

      // Original record reference unchanged
      expect(record.outcomes.length).toBe(originalOutcomeCount);
      
      // But retrieved record has new outcome
      const retrieved = await manager.getDecision(record.id);
      expect(retrieved!.outcomes.length).toBe(1);
      expect(retrieved!.outcomes[0]!.status).toBe("resolved");
    });

    it("should preserve ambiguous outcomes", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      
      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user123",
        domain: "negotiation",
      });

      const outcome = await manager.recordOutcome(record.id, graph.nodes[0].id, {
        description: "Partial result achieved",
        status: "partially_resolved" as ResolutionStatus,
        confidence: { level: "medium", rationale: "Some aspects unclear", contradictions: ["Source A says X", "Source B says Y"] },
        knownUnknowns: ["Long-term impact", "Secondary effects"],
      });

      expect(outcome.status).toBe("partially_resolved");
      expect(outcome.knownUnknowns.length).toBe(2);
    });

    it("should track unknown outcomes", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      
      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user123",
        domain: "negotiation",
      });

      const outcome = await manager.recordOutcome(record.id, graph.nodes[0].id, {
        description: "Outcome not yet determined",
        status: "unresolved" as ResolutionStatus,
        confidence: { level: "unknown", rationale: "Waiting for data", contradictions: [] },
      });

      expect(outcome.status).toBe("unresolved");
    });
  });

  describe("temporal context", () => {
    it("should support 'at_time' replay mode", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      
      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user123",
        domain: "negotiation",
      });

      const atTimeView = await manager.getDecision(record.id, {
        mode: "at_time",
        timestamp: record.createdAt,
      });

      // Should show assumptions as they were at decision time
      expect(atTimeView?.spec.assumptions).toEqual(record.provenance.assumptionsAtTime);
    });

    it("should support 'today' replay mode", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      
      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user123",
        domain: "negotiation",
      });

      const todayView = await manager.getDecision(record.id, {
        mode: "today",
        timestamp: new Date().toISOString(),
      });

      // Should show current state
      expect(todayView!.spec.assumptions).toEqual(spec.assumptions);
    });
  });

  describe("queryDecisions", () => {
    it("should filter by domain", async () => {
      const spec1 = createMockSpec();
      const graph1 = createMockGraph(spec1.id);
      await manager.recordDecision(spec1, graph1, spec1.actions[0].id, graph1.nodes[0].id, {
        userId: "user1",
        domain: "negotiation",
      });

      const spec2 = createMockSpec();
      const graph2 = createMockGraph(spec2.id);
      await manager.recordDecision(spec2, graph2, spec2.actions[0].id, graph2.nodes[0].id, {
        userId: "user1",
        domain: "ops",
      });

      const negotiations = await manager.queryDecisions({
        userId: undefined,
        domain: "negotiation",
        status: undefined,
        dateRange: undefined,
        tags: undefined,
        hasOutcome: undefined,
        temporalContext: undefined,
      });

      expect(negotiations.length).toBe(1);
      expect(negotiations[0]!.domain).toBe("negotiation");
    });

    it("should filter by outcome status", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      
      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user1",
        domain: "negotiation",
      });

      await manager.recordOutcome(record.id, graph.nodes[0].id, {
        description: "Resolved outcome",
        status: "resolved" as ResolutionStatus,
        confidence: { level: "high", rationale: "Done", contradictions: [] },
      });

      const resolved = await manager.queryDecisions({
        userId: undefined,
        domain: undefined,
        status: "resolved" as ResolutionStatus,
        dateRange: undefined,
        tags: undefined,
        hasOutcome: undefined,
        temporalContext: undefined,
      });

      expect(resolved.length).toBe(1);
    });
  });

  describe("immutability guarantees", () => {
    it("should not allow mutation of stored records", async () => {
      const spec = createMockSpec();
      const graph = createMockGraph(spec.id);
      
      const record = await manager.recordDecision(spec, graph, spec.actions[0].id, graph.nodes[0].id, {
        userId: "user123",
        domain: "negotiation",
      });

      const retrieved1 = await manager.getDecision(record.id);
      
      // Attempt to mutate
      try {
        (retrieved1 as DecisionRecord).domain = "modified";
      } catch {
        // Expected - should be frozen
      }

      const retrieved2 = await manager.getDecision(record.id);
      expect(retrieved2?.domain).toBe("negotiation");
    });
  });
});

describe("InMemoryStorageAdapter", () => {
  let storage: InMemoryStorageAdapter;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
  });

  it("should compute stats correctly", async () => {
    // Empty stats
    const emptyStats = await storage.getStats({
      userId: undefined,
      domain: undefined,
      status: undefined,
      dateRange: undefined,
      tags: undefined,
      hasOutcome: undefined,
      temporalContext: undefined,
    });
    
    expect(emptyStats.totalDecisions).toBe(0);
    expect(emptyStats.averageResolutionTime).toBeUndefined();
  });
});

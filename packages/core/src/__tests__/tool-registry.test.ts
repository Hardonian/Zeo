/**
 * Tool Registry — Unit Tests
 *
 * Verifies:
 * - Tool registration and retrieval
 * - Duplicate registration rejection
 * - Input schema validation at runtime
 * - Tool invocation with audit records
 * - Error propagation (no silent catch-all)
 * - Registry hash computation (deterministic)
 * - Default registry creation
 */

import { describe, it, expect } from "vitest";
import {
  ToolRegistry,
  ToolRegistryError,
  validateToolSchema,
  createDefaultToolRegistry,
  type ToolDefinition,
  type JsonSchemaDescriptor,
} from "../tool-registry.js";

function makeEchoTool(): ToolDefinition {
  return {
    name: "echo",
    version: "1.0.0",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
    outputSchema: { type: "object" },
    deterministic: true,
    sideEffects: false,
    handler: (input: any) => ({ echoed: input.message }),
  };
}

describe("ToolRegistry", () => {
  it("registers and retrieves tools", () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());
    expect(registry.size).toBe(1);
    expect(registry.get("echo")).toBeDefined();
    expect(registry.get("echo")!.name).toBe("echo");
  });

  it("rejects duplicate registration", () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());
    expect(() => registry.register(makeEchoTool())).toThrow("Tool already registered: echo");
  });

  it("rejects tools without name or version", () => {
    const registry = new ToolRegistry();
    expect(() =>
      registry.register({ ...makeEchoTool(), name: "" }),
    ).toThrow("Tool must have name and version");
    expect(() =>
      registry.register({ ...makeEchoTool(), version: "" }),
    ).toThrow("Tool must have name and version");
  });

  it("lists tools sorted by name", () => {
    const registry = new ToolRegistry();
    registry.register({ ...makeEchoTool(), name: "beta" });
    registry.register({ ...makeEchoTool(), name: "alpha" });
    registry.register({ ...makeEchoTool(), name: "gamma" });
    const names = registry.list().map(t => t.name);
    expect(names).toEqual(["alpha", "beta", "gamma"]);
  });

  it("invokes a tool with valid input", async () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());

    const { output, record } = await registry.invoke("echo", { message: "hello" });
    expect(output).toEqual({ echoed: "hello" });
    expect(record.success).toBe(true);
    expect(record.toolName).toBe("echo");
    expect(record.toolVersion).toBe("1.0.0");
    expect(record.deterministic).toBe(true);
    expect(record.sideEffects).toBe(false);
    expect(record.inputHash).toBeTruthy();
    expect(record.outputHash).toBeTruthy();
    expect(record.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("rejects invocation of unknown tool", async () => {
    const registry = new ToolRegistry();
    await expect(registry.invoke("nonexistent", {})).rejects.toThrow("Unknown tool: nonexistent");
  });

  it("rejects invocation with invalid input schema", async () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());
    // Missing required field "message"
    await expect(registry.invoke("echo", {})).rejects.toThrow("Input validation failed");
  });

  it("propagates handler errors as ToolRegistryError", async () => {
    const registry = new ToolRegistry();
    registry.register({
      ...makeEchoTool(),
      name: "failing",
      handler: () => { throw new Error("boom"); },
    });

    try {
      await registry.invoke("failing", { message: "test" });
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ToolRegistryError);
      expect((err as ToolRegistryError).code).toBe("TOOL_EXECUTION_FAILED");
    }
  });

  it("computes deterministic registry hash", () => {
    const r1 = new ToolRegistry();
    const r2 = new ToolRegistry();
    r1.register(makeEchoTool());
    r2.register(makeEchoTool());
    expect(r1.computeRegistryHash()).toBe(r2.computeRegistryHash());
  });

  it("different registries have different hashes", () => {
    const r1 = new ToolRegistry();
    const r2 = new ToolRegistry();
    r1.register(makeEchoTool());
    r2.register({ ...makeEchoTool(), name: "other" });
    expect(r1.computeRegistryHash()).not.toBe(r2.computeRegistryHash());
  });

  it("serializes to state object", () => {
    const registry = new ToolRegistry();
    registry.register(makeEchoTool());
    const state = registry.toState();
    expect(state.tools).toHaveLength(1);
    expect(state.tools[0].name).toBe("echo");
    expect(state.registryHash).toBeTruthy();
  });
});

describe("createDefaultToolRegistry", () => {
  it("creates registry with 7 core tools", () => {
    const registry = createDefaultToolRegistry();
    expect(registry.size).toBe(7);
    expect(registry.get("branch_generator")).toBeDefined();
    expect(registry.get("robustness_evaluator")).toBeDefined();
    expect(registry.get("evidence_ranker")).toBeDefined();
  });

  it("all core tools are deterministic with no side effects", () => {
    const registry = createDefaultToolRegistry();
    for (const tool of registry.list()) {
      expect(tool.deterministic).toBe(true);
      expect(tool.sideEffects).toBe(false);
    }
  });

  it("produces stable registry hash", () => {
    const h1 = createDefaultToolRegistry().computeRegistryHash();
    const h2 = createDefaultToolRegistry().computeRegistryHash();
    expect(h1).toBe(h2);
  });
});

describe("validateToolSchema", () => {
  it("validates required fields", () => {
    const schema: JsonSchemaDescriptor = {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    };
    expect(validateToolSchema({ name: "test" }, schema)).toEqual([]);
    expect(validateToolSchema({}, schema).length).toBeGreaterThan(0);
  });

  it("reports unknown fields", () => {
    const schema: JsonSchemaDescriptor = {
      type: "object",
      properties: { name: { type: "string" } },
    };
    const errors = validateToolSchema({ name: "test", extra: true }, schema);
    expect(errors.some(e => e.includes("unknown field"))).toBe(true);
  });

  it("validates nested types", () => {
    const schema: JsonSchemaDescriptor = {
      type: "object",
      properties: { count: { type: "number" } },
    };
    expect(validateToolSchema({ count: 5 }, schema)).toEqual([]);
    expect(validateToolSchema({ count: "five" }, schema).length).toBeGreaterThan(0);
  });
});

/**
 * @zeo/modules — Phase D Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  ModuleRegistry,
  validateManifest,
  computeManifestHash,
  topologicalSort,
  detectCycles,
  ManifestValidationError,
  CapabilityDeniedError,
  CyclicDependencyError,
  SandboxedContext,
  formatModuleList,
} from "../src/index.js";
import type { ModuleManifest, DependencyNode } from "../src/index.js";

describe("Phase D: Extension + Module Sandbox", () => {
  let registry: ModuleRegistry;

  const validManifest: ModuleManifest = {
    moduleId: "mod-1",
    name: "test-module",
    version: "1.0.0",
    entrypoint: "./index.js",
    capabilities: ["read_evidence", "read_config"],
    dependencies: [],
    author: "test",
    description: "A test module",
    deterministic: true,
    hash: "",
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    registry = new ModuleRegistry();
  });

  describe("Manifest Validation", () => {
    it("passes valid manifest", () => {
      expect(validateManifest(validManifest)).toHaveLength(0);
    });

    it("fails on missing fields", () => {
      const errors = validateManifest({});
      expect(errors.length).toBeGreaterThan(0);
    });

    it("fails on unknown capability", () => {
      const errors = validateManifest({
        ...validManifest,
        capabilities: ["read_evidence", "launch_missiles" as any],
      });
      expect(errors.some((e) => e.includes("Unknown capability"))).toBe(true);
    });
  });

  describe("Module Registry", () => {
    it("registers and retrieves modules", () => {
      registry.register({ ...validManifest, hash: "" });
      expect(registry.get("mod-1")).not.toBeNull();
    });

    it("lists all modules", () => {
      registry.register({ ...validManifest, hash: "" });
      expect(registry.list()).toHaveLength(1);
    });

    it("unregisters modules", () => {
      registry.register({ ...validManifest, hash: "" });
      registry.unregister("mod-1");
      expect(registry.get("mod-1")).toBeNull();
    });

    it("rejects invalid manifest", () => {
      expect(() =>
        registry.register({ ...validManifest, moduleId: "", hash: "" })
      ).toThrow(ManifestValidationError);
    });
  });

  describe("Sandboxed Execution", () => {
    it("executes with granted capabilities", async () => {
      registry.register({ ...validManifest, hash: "" });
      const result = await registry.execute(
        "mod-1",
        {
          moduleId: "mod-1",
          grantedCapabilities: ["read_evidence"],
          timeout: 5000,
          maxMemoryMb: 128,
        },
        async (ctx) => {
          ctx.requireCapability("read_evidence", "read data");
          return { data: "ok" };
        }
      );
      expect(result.status).toBe("success");
      expect(result.auditTrail).toHaveLength(1);
      expect(result.auditTrail[0].granted).toBe(true);
    });

    it("denies unganted capability", async () => {
      registry.register({ ...validManifest, hash: "" });
      const result = await registry.execute(
        "mod-1",
        {
          moduleId: "mod-1",
          grantedCapabilities: ["read_config"],
          timeout: 5000,
          maxMemoryMb: 128,
        },
        async (ctx) => {
          ctx.requireCapability("write_evidence", "write data");
        }
      );
      expect(result.status).toBe("capability_denied");
    });

    it("handles timeout", async () => {
      registry.register({ ...validManifest, hash: "" });
      const result = await registry.execute(
        "mod-1",
        {
          moduleId: "mod-1",
          grantedCapabilities: [],
          timeout: 50,
          maxMemoryMb: 128,
        },
        async () => {
          await new Promise((r) => setTimeout(r, 200));
        }
      );
      expect(result.status).toBe("timeout");
    });
  });

  describe("Dependency Graph", () => {
    it("topological sort on DAG", () => {
      const nodes = new Map<string, DependencyNode>();
      nodes.set("a", { moduleId: "a", dependencies: [] });
      nodes.set("b", { moduleId: "b", dependencies: ["a"] });
      nodes.set("c", { moduleId: "c", dependencies: ["a", "b"] });
      const order = topologicalSort(nodes);
      expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
      expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
    });

    it("detects cycles", () => {
      const nodes = new Map<string, DependencyNode>();
      nodes.set("a", { moduleId: "a", dependencies: ["b"] });
      nodes.set("b", { moduleId: "b", dependencies: ["a"] });
      expect(() => topologicalSort(nodes)).toThrow(CyclicDependencyError);
    });
  });

  describe("Formatting", () => {
    it("formats module list", () => {
      registry.register({ ...validManifest, hash: "" });
      const output = formatModuleList(registry.list());
      expect(output).toContain("Module Registry");
      expect(output).toContain("test-module");
    });
  });
});

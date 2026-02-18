/**
 * @zeo/modules — Phase D Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
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
  computeModuleSignature,
  addLocalModule,
  isModuleRevoked,
  listRevokedModules,
  listLocalModules,
  removeLocalModule,
  revokeModule,
  parsePipelineDefinition,
  validatePipelineCompatibility,
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

    it("fails safe on undeclared tool access", async () => {
      registry.register({ ...validManifest, hash: "" });
      const result = await registry.execute(
        "mod-1",
        {
          moduleId: "mod-1",
          grantedCapabilities: ["execute_tools"],
          declaredTools: ["tool.safe"],
          timeout: 5000,
          maxMemoryMb: 128,
        },
        async (ctx) => {
          ctx.assertToolAccess("tool.shell");
          return "unexpected";
        }
      );
      expect(result.status).toBe("error");
      expect(result.error).toContain("Undeclared tool access denied");
    });

    it("fails safe on environment access", async () => {
      registry.register({ ...validManifest, hash: "" });
      const result = await registry.execute(
        "mod-1",
        {
          moduleId: "mod-1",
          grantedCapabilities: [],
          timeout: 5000,
          maxMemoryMb: 128,
        },
        async (ctx) => {
          ctx.readEnv("SECRET_KEY");
        }
      );
      expect(result.status).toBe("error");
      expect(result.error).toContain("Environment access is denied");
    });

    it("fails safe on sandbox path escape", async () => {
      registry.register({ ...validManifest, hash: "" });
      const result = await registry.execute(
        "mod-1",
        {
          moduleId: "mod-1",
          grantedCapabilities: [],
          timeout: 5000,
          maxMemoryMb: 128,
          sandboxRoot: "/tmp/zeo-safe",
        },
        async (ctx) => {
          ctx.assertSandboxPath("../../etc/passwd");
        }
      );
      expect(result.status).toBe("error");
      expect(result.error).toContain("Path escapes sandbox root");
    });

    it("fails safe when module mutates global registry", async () => {
      registry.register({ ...validManifest, hash: "" });
      const result = await registry.execute(
        "mod-1",
        {
          moduleId: "mod-1",
          grantedCapabilities: [],
          timeout: 5000,
          maxMemoryMb: 128,
        },
        async () => {
          registry.unregister("mod-1");
          return "mutated";
        }
      );
      expect(result.status).toBe("error");
      expect(result.error).toContain("Global registry mutation detected");
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

  describe("Local module marketplace", () => {
    it("installs, lists, and removes signed modules", () => {
      const root = mkdtempSync(join(tmpdir(), "zeo-mods-"));
      const specNoSig = {
        moduleId: "demo.mod",
        version: "1.0.0",
        declaredCapabilities: ["read_evidence"],
        declaredTools: ["tool.a"],
        deterministicSupport: true,
      };
      const spec = { ...specNoSig, signatureHash: computeModuleSignature(specNoSig) };
      const src = join(root, "module.json");
      writeFileSync(src, JSON.stringify(spec), "utf8");

      addLocalModule(src, root);
      expect(listLocalModules(root)).toHaveLength(1);
      expect(removeLocalModule("demo.mod", root)).toBe(true);
      expect(listLocalModules(root)).toHaveLength(0);

      rmSync(root, { recursive: true, force: true });
    });

    it("validates pipeline compatibility", () => {
      const pipeline = parsePipelineDefinition(`modules:
- demo.mod@1.0.0
executionOrder:
- demo.mod
`);
      const issues = validatePipelineCompatibility(pipeline, [
        {
          moduleId: "demo.mod",
          version: "1.0.0",
          declaredCapabilities: ["read_evidence"],
          declaredTools: ["tool.a"],
          deterministicSupport: true,
          signatureHash: "abc",
        },
      ]);
      expect(issues).toHaveLength(0);
    });

    it("tracks revoked modules", () => {
      const root = mkdtempSync(join(tmpdir(), "zeo-mods-revoke-"));
      const registryPath = join(root, "revocations.json");

      expect(revokeModule("demo.mod", registryPath)).toBe(true);
      expect(revokeModule("demo.mod", registryPath)).toBe(false);
      expect(isModuleRevoked("demo.mod", registryPath)).toBe(true);
      expect(listRevokedModules(registryPath)).toEqual(["demo.mod"]);

      rmSync(root, { recursive: true, force: true });
    });

    it("blocks installation of revoked modules", () => {
      const root = mkdtempSync(join(tmpdir(), "zeo-mods-revoked-install-"));
      const specNoSig = {
        moduleId: "demo.revoked",
        version: "1.0.0",
        declaredCapabilities: ["read_evidence"],
        declaredTools: ["tool.a"],
        deterministicSupport: true,
      };
      const spec = { ...specNoSig, signatureHash: computeModuleSignature(specNoSig) };
      const src = join(root, "module.json");
      writeFileSync(src, JSON.stringify(spec), "utf8");
      revokeModule("demo.revoked", join(root, "revocations.json"));

      expect(() => addLocalModule(src, root)).toThrow(/revoked and cannot be installed/);

      rmSync(root, { recursive: true, force: true });
    });
  });

});

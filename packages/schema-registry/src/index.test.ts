/**
 * @zeo/schema-registry — Phase C Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  SchemaRegistry,
  SchemaValidationError,
  formatSchemaList,
  formatMigrationResult,
} from "../src/index.js";

describe("Phase C: Data Contract + Schema Evolution", () => {
  let registry: SchemaRegistry;

  beforeEach(() => {
    registry = new SchemaRegistry();
  });

  describe("Schema Registration", () => {
    it("has v1 baselines pre-registered", () => {
      const schemas = registry.listSchemas();
      expect(schemas.length).toBeGreaterThanOrEqual(4);
      expect(schemas.map((s) => s.name)).toContain("EvidenceNode");
      expect(schemas.map((s) => s.name)).toContain("RunSnapshot");
    });

    it("registers a new schema version", () => {
      registry.registerSchema("EvidenceNode", 2, [
        { name: "id", type: "string", required: true },
        { name: "label", type: "string", required: true },
        { name: "status", type: "string", required: true },
        { name: "confidence", type: "number", required: true },
        { name: "sourceId", type: "string", required: false },
        { name: "capturedAt", type: "string", required: true },
        { name: "checksum", type: "string", required: true },
        { name: "tags", type: "string[]", required: false },
        { name: "tenantId", type: "string", required: true },
        { name: "quality", type: "number", required: true },
      ]);
      expect(registry.getLatestVersion("EvidenceNode")).toBe(2);
    });
  });

  describe("Contract Enforcement", () => {
    it("validates a compliant record", () => {
      const result = registry.validateContract("EvidenceNode", {
        id: "ev-1",
        label: "Test",
        status: "active",
        confidence: 0.9,
        capturedAt: "2025-01-01",
        checksum: "abc123",
        tenantId: "t-1",
      }, 1);
      expect(result.valid).toBe(true);
    });

    it("fails on missing required field", () => {
      const result = registry.validateContract("EvidenceNode", {
        id: "ev-1",
        label: "Test",
        // missing status, confidence, etc.
      }, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("hard-fail enforceContract throws", () => {
      expect(() =>
        registry.enforceContract("EvidenceNode", { id: "ev-1" }, 1)
      ).toThrow(SchemaValidationError);
    });

    it("detects version mismatch", () => {
      const result = registry.validateContract("EvidenceNode", {
        id: "ev-1",
        label: "Test",
        status: "active",
        confidence: 0.9,
        capturedAt: "2025-01-01",
        checksum: "abc123",
        tenantId: "t-1",
        schemaVersion: 2,
      }, 1);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("version mismatch");
    });
  });

  describe("Migration Engine", () => {
    it("migrates data from v1 to v2", () => {
      registry.registerSchema("TestSchema", 1, [
        { name: "id", type: "string", required: true },
        { name: "value", type: "number", required: true },
      ]);
      registry.registerSchema("TestSchema", 2, [
        { name: "id", type: "string", required: true },
        { name: "value", type: "number", required: true },
        { name: "label", type: "string", required: true },
      ]);
      registry.registerMigration({
        id: "mig-1",
        fromVersion: 1,
        toVersion: 2,
        schemaName: "TestSchema",
        transform: (data) => ({ ...data, label: `Record ${data["id"]}` }),
        description: "Add label field",
        createdAt: new Date().toISOString(),
        reversible: true,
      });

      const data = [
        { id: "r1", value: 10 },
        { id: "r2", value: 20 },
      ];
      const result = registry.migrate("TestSchema", data, 1, 2);
      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(2);
      expect(data[0]).toHaveProperty("label", "Record r1");
      expect(data[0]).toHaveProperty("schemaVersion", 2);
    });

    it("fails on missing migration path", () => {
      const result = registry.migrate("EvidenceNode", [], 1, 5);
      expect(result.success).toBe(false);
    });
  });

  describe("Lineage Tracking", () => {
    it("tracks lineage after migration", () => {
      registry.registerSchema("X", 1, [{ name: "id", type: "string", required: true }]);
      registry.registerSchema("X", 2, [{ name: "id", type: "string", required: true }]);
      registry.registerMigration({
        id: "m1",
        fromVersion: 1,
        toVersion: 2,
        schemaName: "X",
        transform: (d) => d,
        description: "noop",
        createdAt: "",
        reversible: true,
      });
      const data = [{ id: "item-1" }];
      registry.migrate("X", data, 1, 2);
      const lineage = registry.getLineage("item-1");
      expect(lineage).toHaveLength(1);
      expect(lineage[0].migratedFrom).toBe(1);
    });
  });

  describe("Formatting", () => {
    it("formats schema list", () => {
      const output = formatSchemaList(registry.listSchemas());
      expect(output).toContain("Schema Registry");
      expect(output).toContain("EvidenceNode");
    });
  });
});

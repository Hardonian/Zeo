/**
 * @zeo/tenant — Phase A Tests
 * Validates tenancy, RBAC, policy enforcement, and usage metering.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  TenantStore,
  requireTenantContext,
  enforceNamespaceIsolation,
  enforceRbac,
  hasPermission,
  validatePolicy,
  validateUsageLimits,
  enforcePreExecution,
  TenantAccessDeniedError,
  CrossTenantAccessError,
  PolicyViolationError,
  TenantNotFoundError,
  formatUsage,
  formatPolicy,
} from "../src/index.js";

describe("Phase A: Tenancy + Policy Isolation", () => {
  let store: TenantStore;

  beforeEach(() => {
    store = new TenantStore();
  });

  describe("Tenant Registration", () => {
    it("creates a tenant with correct defaults", () => {
      const reg = store.createTenant("Acme Corp", "user-1");
      expect(reg.tenantId).toMatch(/^tenant_/);
      expect(reg.name).toBe("Acme Corp");
      expect(reg.status).toBe("active");
    });

    it("lists all tenants", () => {
      store.createTenant("A", "u1");
      store.createTenant("B", "u2");
      expect(store.listTenants()).toHaveLength(2);
    });

    it("suspends a tenant", () => {
      const reg = store.createTenant("X", "u1");
      store.suspendTenant(reg.tenantId);
      expect(store.getTenant(reg.tenantId).status).toBe("suspended");
    });

    it("throws on unknown tenant", () => {
      expect(() => store.getTenant("nonexistent")).toThrow(TenantNotFoundError);
    });
  });

  describe("RBAC", () => {
    it("owner has all permissions", () => {
      expect(hasPermission("owner", "runs", "execute")).toBe(true);
      expect(hasPermission("owner", "anything", "delete")).toBe(true);
    });

    it("viewer cannot execute runs", () => {
      expect(hasPermission("viewer", "runs", "execute")).toBe(false);
    });

    it("operator can execute runs", () => {
      expect(hasPermission("operator", "runs", "execute")).toBe(true);
    });

    it("enforceRbac throws for unauthorized access", () => {
      expect(() =>
        enforceRbac(
          { tenantId: "t1", userId: "u1", role: "viewer" },
          "runs",
          "execute"
        )
      ).toThrow(TenantAccessDeniedError);
    });

    it("enforceRbac passes for authorized access", () => {
      expect(() =>
        enforceRbac(
          { tenantId: "t1", userId: "u1", role: "admin" },
          "runs",
          "execute"
        )
      ).not.toThrow();
    });
  });

  describe("Namespace Isolation", () => {
    it("blocks cross-tenant access", () => {
      expect(() =>
        enforceNamespaceIsolation("tenant-A", {
          tenantId: "tenant-B",
          userId: "u1",
          role: "admin",
        })
      ).toThrow(CrossTenantAccessError);
    });

    it("allows same-tenant access", () => {
      expect(() =>
        enforceNamespaceIsolation("tenant-A", {
          tenantId: "tenant-A",
          userId: "u1",
          role: "admin",
        })
      ).not.toThrow();
    });
  });

  describe("Policy Validation", () => {
    it("passes valid params", () => {
      const policy = store.createTenant("T", "u1");
      const result = validatePolicy(store.getPolicy(policy.tenantId), {
        estimatedTokens: 100,
        isDeterministic: false,
      });
      expect(result.valid).toBe(true);
    });

    it("fails on deterministic requirement", () => {
      const reg = store.createTenant("T", "u1");
      store.updatePolicy(reg.tenantId, { deterministicRequired: true });
      const result = validatePolicy(store.getPolicy(reg.tenantId), {
        isDeterministic: false,
      });
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain("deterministic");
    });

    it("fails on disallowed tools", () => {
      const reg = store.createTenant("T", "u1");
      store.updatePolicy(reg.tenantId, { allowedTools: ["read-only"] });
      const result = validatePolicy(store.getPolicy(reg.tenantId), {
        requestedTools: ["write-db"],
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("Usage Metering", () => {
    it("records and tracks usage", () => {
      const reg = store.createTenant("T", "u1");
      store.recordRun(reg.tenantId, 1000, 500);
      const usage = store.getUsage(reg.tenantId);
      expect(usage.runCount).toBe(1);
      expect(usage.tokenUsage).toBe(1000);
      expect(usage.computeTimeMs).toBe(500);
    });

    it("resets usage", () => {
      const reg = store.createTenant("T", "u1");
      store.recordRun(reg.tenantId, 1000, 500);
      store.resetUsage(reg.tenantId);
      expect(store.getUsage(reg.tenantId).runCount).toBe(0);
    });
  });

  describe("Pre-Execution Enforcement", () => {
    it("passes for valid tenant + role + policy", () => {
      const reg = store.createTenant("T", "u1");
      expect(() =>
        enforcePreExecution(store, {
          tenantId: reg.tenantId,
          userId: "u1",
          role: "owner",
        }, {})
      ).not.toThrow();
    });

    it("fails for suspended tenant", () => {
      const reg = store.createTenant("T", "u1");
      store.suspendTenant(reg.tenantId);
      expect(() =>
        enforcePreExecution(store, {
          tenantId: reg.tenantId,
          userId: "u1",
          role: "owner",
        }, {})
      ).toThrow("suspended");
    });
  });

  describe("Formatting", () => {
    it("formats usage correctly", () => {
      const reg = store.createTenant("T", "u1");
      const output = formatUsage(store.getUsage(reg.tenantId));
      expect(output).toContain("Runs:");
      expect(output).toContain("Tokens:");
    });

    it("formats policy correctly", () => {
      const reg = store.createTenant("T", "u1");
      const output = formatPolicy(store.getPolicy(reg.tenantId));
      expect(output).toContain("Max Budget:");
      expect(output).toContain("Deterministic:");
    });
  });
});

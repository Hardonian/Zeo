
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZeoRunner } from "./runner.js";
import { createTrustContext } from "./trust-integration.js";
import { createDefaultConsentScope } from "@zeo/trust";
import type { DecisionSpec, DecisionResult, KpiMeasurement } from "@zeo/contracts";
import type { KpiWarehouseStorage } from "@zeo/warehouse";

// Mock storage adapter
const mockStorage: any = {
    storeMeasurement: vi.fn().mockResolvedValue(undefined),
    getMeasurement: vi.fn(),
    queryMeasurements: vi.fn().mockResolvedValue([]),
    getStats: vi.fn(),
};

describe("ZeoRunner", () => {
    const userId = "test-user";
    let runner: ZeoRunner;
    let trustContext = createTrustContext(userId);

    const mockSpec: DecisionSpec = {
        id: "test-decision",
        title: "Test Decision",
        context: "Context",
        agents: [{ id: "user", name: "User", role: "self" }],
        actions: [{ id: "a1", label: "Action 1", kind: "other", actorId: "user" }],
        assumptions: [],
        constraints: [],
        horizon: "days",
        objectives: [],
        createdAt: new Date().toISOString(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        trustContext = createTrustContext(userId);
        // Initialize with permissive consent for testing execution
        trustContext.consentScope.aiAssistanceLevel = "autonomous";
        runner = new ZeoRunner(trustContext, mockStorage);
    });

    it("should enforce trust boundaries by default", async () => {
        // Reset consent to restrictive default
        trustContext.consentScope = createDefaultConsentScope();
        runner = new ZeoRunner(trustContext, mockStorage);

        // Should fail because default "auto-execution" requires autonomous consent
        await expect(runner.run(mockSpec)).rejects.toThrow("Trust boundary violation");
    });

    it("should allow execution when consent is granted", async () => {
        // Grant necessary consent
        trustContext.consentScope.aiAssistanceLevel = "autonomous";
        runner = new ZeoRunner(trustContext, mockStorage);

        const result = await runner.run(mockSpec);
        expect(result).toBeDefined();
        expect(result.graph).toBeDefined();
    });

    it("should store KPIs after successful execution", async () => {
        await runner.run(mockSpec);

        // Verify storage was called
        expect(mockStorage.storeMeasurement).toHaveBeenCalled();

        // Check if decision coverage KPI was stored (enabled by default)
        const calls = (mockStorage.storeMeasurement as any).mock.calls;
        const coverageCall = calls.find((call: any) => call[0].kpiId === "decision-coverage");
        expect(coverageCall).toBeDefined();
    });

    it("should skip trust check if disabled in config", async () => {
        // Restrictive consent
        trustContext.consentScope = createDefaultConsentScope();

        // Disable enforcement
        runner = new ZeoRunner(trustContext, mockStorage, { enforceTrust: false });

        // Should verify lack of error (execution proceeds)
        await expect(runner.run(mockSpec)).resolves.not.toThrow();
    });
});



/**
 * Zeo Runner
 * 
 * Orchestrates the execution of the Zeo decision engine with:
 * 1. Trust & Consent enforcement (Pre-execution)
 * 2. Core Engine execution
 * 3. KPI Telemetry & Storage (Post-execution)
 */

import type { DecisionSpec, DecisionResult } from "@zeo/contracts";
import type { KpiWarehouseStorage } from "@zeo/warehouse";
import { runDecision, type RunDecisionOpts } from "./engine.js";
import {
    enforceTrustBoundary,
    type TrustContext,
    type OperationType
} from "./trust-integration.js";
import {
    KpiIntegration,
    type KpiIntegrationConfig,
    createKpiIntegration
} from "./kpi-integration.js";

/**
 * Configuration for the Zeo Runner
 */
export interface ZeoRunnerConfig {
    /**
     * Enforce trust boundaries before execution.
     * Default: true
     */
    enforceTrust: boolean;

    /**
     * Configuration for KPI integration
     */
    kpiConfig?: Partial<KpiIntegrationConfig>;
}

const DEFAULT_RUNNER_CONFIG: ZeoRunnerConfig = {
    enforceTrust: true,
};

/**
 * ZeoRunner orchestrates the decision lifecycle.
 */
export class ZeoRunner {
    private kpiIntegration: KpiIntegration;
    private trustContext: TrustContext;
    private config: ZeoRunnerConfig;

    constructor(
        trustContext: TrustContext,
        storage?: KpiWarehouseStorage,
        config: Partial<ZeoRunnerConfig> = {}
    ) {
        this.trustContext = trustContext;
        this.config = { ...DEFAULT_RUNNER_CONFIG, ...config };

        this.kpiIntegration = createKpiIntegration(this.config.kpiConfig);

        if (storage) {
            this.kpiIntegration.initialize(storage);
        }
    }

    /**
     * Execute a decision with full lifecycle managment.
     * 
     * 1. Checks Trust/Consent (if enabled)
     * 2. Runs the Decision Engine
     * 3. Computes and Stores KPIs (if storage initialized)
     */
    async run(
        spec: DecisionSpec,
        options?: RunDecisionOpts & { operationType?: OperationType }
    ): Promise<DecisionResult> {
        // 1. Trust Enforcement
        if (this.config.enforceTrust) {
            // Default to "auto-execution" if not specified, as this is the engine running
            const operation = options?.operationType || "auto-execution";

            // This will throw if conset is not granted
            enforceTrustBoundary(operation, this.trustContext);
        }

        // 2. Engine Execution
        // We run this synchronously as the core engine is currently sync,
        // but the runner method is async to support future async engine/storage.
        const result = runDecision(spec, options);

        // 3. KPI Integration
        if (this.kpiIntegration.isInitialized) {
            try {
                await this.kpiIntegration.processDecision(spec, result, {
                    depth: options?.depth,
                    useQuantEngine: options?.useQuantEngine
                });
            } catch (error) {
                // We log but do not fail the decision if KPI storage fails
                console.warn("Failed to store KPI metrics:", error);
            }
        }

        return result;
    }

    /**
     * Access the underlying KPI integration for direct queries
     */
    get kpi(): KpiIntegration {
        return this.kpiIntegration;
    }
}

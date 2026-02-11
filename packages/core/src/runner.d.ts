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
import { type RunDecisionOpts } from "./engine.js";
import { type TrustContext, type OperationType } from "./trust-integration.js";
import { KpiIntegration, type KpiIntegrationConfig } from "./kpi-integration.js";
import { type EvidenceStorage } from "./evidence-storage.js";
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
    /**
     * Evidence Storage (optional)
     */
    evidenceStorage?: EvidenceStorage;
}
/**
 * ZeoRunner orchestrates the decision lifecycle.
 */
export declare class ZeoRunner {
    private kpiIntegration;
    private trustContext;
    private config;
    private evidenceStorage?;
    constructor(trustContext: TrustContext, storage?: KpiWarehouseStorage, config?: Partial<ZeoRunnerConfig>, evidenceStorage?: EvidenceStorage);
    /**
     * Execute a decision with full lifecycle managment.
     *
     * 1. Checks Trust/Consent (if enabled)
     * 2. Runs the Decision Engine
     * 3. Computes and Stores KPIs (if storage initialized)
     */
    run(spec: DecisionSpec, options?: RunDecisionOpts & {
        operationType?: OperationType;
    }): Promise<DecisionResult>;
    /**
     * Access the underlying KPI integration for direct queries
     */
    get kpi(): KpiIntegration;
}
//# sourceMappingURL=runner.d.ts.map
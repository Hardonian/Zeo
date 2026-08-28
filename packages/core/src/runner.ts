import { generateId } from "@zeo/kernel";

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
import { cacheKey } from "@zeo/kernel";
import { globalCache } from "./cache-layer.js";
import { type EvidenceStorage } from "./evidence-storage.js";
import { buildReproPackZip, buildReproPackContents } from "@zeo/repro-pack";
import { computeManifestHash, computeTreeHash, EvidenceFile, sha256 } from "./evidence-attestation.js";


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
    private evidenceStorage?: EvidenceStorage;

    constructor(
        trustContext: TrustContext,
        storage?: KpiWarehouseStorage,
        config: Partial<ZeoRunnerConfig> = {},
        evidenceStorage?: EvidenceStorage
    ) {
        this.trustContext = trustContext;
        this.config = { ...DEFAULT_RUNNER_CONFIG, ...config };
        this.evidenceStorage = evidenceStorage || config.evidenceStorage;

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

        // retrieval hook: context augmentation (RAG)
        // const context = retrieveRelevantEvidence(...)

        // 2. Engine Execution (with Caching)
        // Generate deterministic cache key
        const cKey = globalCache.generateKey(
            cacheKey(spec),
            JSON.stringify({
                depth: options?.depth,
                pruning: options?.pruning,
                useQuantEngine: options?.useQuantEngine
            })
        );

        let result: DecisionResult;
        const cached = globalCache.get(cKey);

        if (cached) {
            result = {
                ...cached.result,
                performance: {
                    cacheHit: true,
                    stageTimings: cached.result.performance?.stageTimings
                },
                // For cache hits, wall time is negligible, but we preserve computational cost metrics
                usage: {
                    ...cached.result.usage!,
                    wallMs: 0
                }
            };
        } else {
            const start = Date.now();
            result = runDecision(spec, options);
            const duration = Date.now() - start;

            // Enrich with performance metrics
            result.performance = {
                cacheHit: false,
                stageTimings: { total: duration }
            };

            // Cache if successful and complete
            if (result.status === "completed") {
                globalCache.set(cKey, result);
            }
        }

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

        // 4. Evidence Attestation
        if (this.evidenceStorage && result.status === "completed") {
            try {
                const runId = generateId();
                const runDataValues: any = { // Construct RunData
                    inputs: { decisionSpec: spec },
                    assumptions: result.assumptions || [],
                    uncertaintyMap: result.uncertaintyMap || {},
                    artifacts: {
                        flipDistance: result.explanation?.whatWouldChange || [],
                        voiRankings: result.nextBestEvidence || [],
                        evidencePlan: []
                    },
                    outputs: {
                        evaluations: result.evaluations,
                        explanation: result.explanation
                    },
                    events: [],
                    budget: result.budget as any,
                    usage: result.usage as any
                };

                const reproParams = {
                    runId,
                    tenantId: this.trustContext.organizationId || "default-org",
                    actor: this.trustContext.userId,
                    requestId: generateId()
                };

                const contents = buildReproPackContents(reproParams, runDataValues);
                const zipBytes = buildReproPackZip(contents);
                const zipBuffer = Buffer.from(zipBytes);

                const bundleHash = sha256(zipBuffer);
                const treeHash = bundleHash;

                const manifest = {
                    schemaVersion: 1,
                    createdAt: new Date().toISOString(),
                    organizationId: this.trustContext.organizationId || "default-org",
                    repositoryId: this.trustContext.repositoryId || "default-repo",
                    runId: runId,
                    files: [{ path: "bundle.zip", sha256: bundleHash, size: zipBuffer.length }]
                };

                const manifestHash = computeManifestHash(manifest);

                await this.evidenceStorage.storeEvidence(
                    manifest.runId,
                    manifest.organizationId,
                    manifest.repositoryId,
                    zipBuffer,
                    manifest,
                    {
                        manifestHash,
                        bundleHash,
                        treeHash,
                        signingMode: "none"
                    }
                );
            } catch (error) {
                console.warn("Failed to generate/store evidence attestation:", error);
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

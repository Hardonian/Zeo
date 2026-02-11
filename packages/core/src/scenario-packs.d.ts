import type { Scenario, DecisionSpec } from "@zeo/contracts";
export interface ScenarioPackManifest {
    schemaVersion: "1.0.0";
    name: string;
    description: string;
    createdAt: string;
    scenarios: string[];
    hasEvalFixtures: boolean;
}
export interface ImportedPackContent {
    manifest: ScenarioPackManifest;
    scenarios: Array<{
        meta: Omit<Scenario, "spec">;
        spec: DecisionSpec;
    }>;
    fixtures?: unknown[];
}
/**
 * Export a set of scenarios to a ZIP pack.
 */
export declare function exportScenarioPack(scenarios: Scenario[], options?: {
    includeEvalFixtures?: boolean;
    packName?: string;
    description?: string;
}): Promise<Uint8Array>;
/**
 * Import and validate a scenario pack.
 */
export declare function importScenarioPack(buffer: Uint8Array): Promise<ImportedPackContent>;
//# sourceMappingURL=scenario-packs.d.ts.map
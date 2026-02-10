import { createZip, sha256, readReproPackZip } from "@zeo/repro-pack";
import type { Scenario, DecisionSpec } from "@zeo/contracts";

export interface ScenarioPackManifest {
    schemaVersion: "1.0.0";
    name: string;
    description: string;
    createdAt: string;
    scenarios: string[]; // IDs
    hasEvalFixtures: boolean;
}

export interface ImportedPackContent {
    manifest: ScenarioPackManifest;
    scenarios: Array<{
        meta: Omit<Scenario, "spec">;
        spec: DecisionSpec;
    }>;
    fixtures?: unknown[]; // Placeholder for eval fixtures
}

/**
 * Export a set of scenarios to a ZIP pack.
 */
export async function exportScenarioPack(
    scenarios: Scenario[],
    options: { includeEvalFixtures?: boolean; packName?: string; description?: string } = {}
): Promise<Uint8Array> {
    const files: Record<string, string> = {};
    const scenarioIds: string[] = [];

    for (const s of scenarios) {
        scenarioIds.push(s.id);

        // Scenario metadata + spec
        files[`scenarios/${s.id}/spec.json`] = JSON.stringify(s.spec, null, 2);

        const meta: Omit<Scenario, "spec"> = {
            id: s.id,
            name: s.name,
            description: s.description,
            version: s.version,
            tags: s.tags,
            createdAt: s.createdAt
        };
        files[`scenarios/${s.id}/meta.json`] = JSON.stringify(meta, null, 2);

        // TODO: Include eval fixtures if options.includeEvalFixtures is true
        // This would require fetching run results or separate fixture objects.
    }

    const manifest: ScenarioPackManifest = {
        schemaVersion: "1.0.0",
        name: options.packName || "Scenario Pack",
        description: options.description || `Export of ${scenarios.length} scenarios`,
        createdAt: new Date().toISOString(),
        scenarios: scenarioIds,
        hasEvalFixtures: !!options.includeEvalFixtures
    };

    files["manifest.json"] = JSON.stringify(manifest, null, 2);

    // Checksums
    const lines: string[] = [];
    for (const [name, content] of Object.entries(files)) {
        lines.push(`${sha256(content)}  ${name}`);
    }
    files["checksums.txt"] = lines.join("\n");

    return createZip(files);
}

/**
 * Import and validate a scenario pack.
 */
export async function importScenarioPack(buffer: Uint8Array): Promise<ImportedPackContent> {
    // Read zip contents (using Buffer generic from repro-pack which uses AdmZip wrapped or browser compatible?)
    // readReproPackZip expects Buffer (Node). We might need to convert Uint8Array to Buffer in Node env.
    // If we are in browser, readReproPackZip (using adm-zip) might fail if it's node-only.
    // However, repro-pack uses 'adm-zip' which is node-only usually.
    // For pure JS environments, we need a different reader.
    // Assuming Node context for now as per "repro-pack" usage.

    // Convert Uint8Array to Buffer
    const buf = Buffer.from(buffer);
    const files = readReproPackZip(buf); // returns Record<string, string>

    // Validate checksums
    const checksumsTxt = files["checksums.txt"];
    if (!checksumsTxt) throw new Error("Missing checksums.txt");

    const lines = checksumsTxt.split("\n").filter((line: string) => line.trim());
    for (const line of lines) {
        const [hash, filename] = line.split("  ");
        if (!files[filename]) throw new Error(`Missing file listed in checksums: ${filename}`);
        const actualHash = sha256(files[filename]);
        if (actualHash !== hash) throw new Error(`Checksum mismatch for ${filename}`);
    }

    // Parse manifest
    const manifestJson = files["manifest.json"];
    if (!manifestJson) throw new Error("Missing manifest.json");
    const manifest = JSON.parse(manifestJson) as ScenarioPackManifest;

    if (manifest.schemaVersion !== "1.0.0") {
        throw new Error(`Unsupported schema version: ${manifest.schemaVersion}`);
    }

    const result: ImportedPackContent = {
        manifest,
        scenarios: [],
        fixtures: []
    };

    // Load scenarios
    for (const id of manifest.scenarios) {
        const specJson = files[`scenarios/${id}/spec.json`];
        const metaJson = files[`scenarios/${id}/meta.json`];

        if (!specJson || !metaJson) {
            console.warn(`Missing data for scenario ${id}, skipping.`);
            continue;
        }

        const spec = JSON.parse(specJson) as DecisionSpec;
        const meta = JSON.parse(metaJson) as Omit<Scenario, "spec">;

        result.scenarios.push({ meta, spec });
    }

    return result;
}

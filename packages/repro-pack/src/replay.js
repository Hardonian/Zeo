/**
 * Replay & Verify
 *
 * Validates a repro pack structure + checksums,
 * re-runs the pipeline with identical inputs + assumptions + seed,
 * and compares outputs for exact reproducibility.
 */
import { createHash } from "node:crypto";
/**
 * Exit codes for replay verification.
 */
export const EXIT_CODES = {
    MATCH: 0,
    MISMATCH: 10,
    INVALID_PACK: 2,
    VALIDATION_ERROR: 3,
    INTERNAL_SAFE: 5,
};
/**
 * Expected files in a repro pack.
 */
const REQUIRED_FILES = [
    "manifest.json",
    "inputs.json",
    "assumptions.json",
    "artifacts/flip_distance.json",
    "artifacts/voi_rankings.json",
    "artifacts/evidence_plan.json",
    "outputs.json",
    "events.jsonl",
    "checksums.txt",
];
function sha256(content) {
    return createHash("sha256").update(content, "utf8").digest("hex");
}
/**
 * Validate pack structure and checksums.
 */
export function validatePack(files) {
    const errors = [];
    // Check required files
    for (const name of REQUIRED_FILES) {
        if (!(name in files)) {
            errors.push(`Missing required file: ${name}`);
        }
    }
    if (errors.length > 0) {
        return { valid: false, errors };
    }
    // Verify checksums
    const checksumContent = files["checksums.txt"];
    const checksumLines = checksumContent.split("\n").filter((l) => l.trim());
    for (const line of checksumLines) {
        const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/);
        if (!match) {
            errors.push(`Invalid checksum line: ${line}`);
            continue;
        }
        const [, expectedHash, filename] = match;
        const fileContent = files[filename];
        if (fileContent === undefined) {
            errors.push(`Checksum references missing file: ${filename}`);
            continue;
        }
        const actualHash = sha256(fileContent);
        if (actualHash !== expectedHash) {
            errors.push(`Checksum mismatch for ${filename}: expected ${expectedHash}, got ${actualHash}`);
        }
    }
    // Validate JSON parse
    for (const name of REQUIRED_FILES) {
        if (name === "checksums.txt" || name === "events.jsonl")
            continue;
        try {
            JSON.parse(files[name]);
        }
        catch (e) {
            errors.push(`Invalid JSON in ${name}: ${e.message}`);
        }
    }
    // Validate manifest schema
    try {
        const manifest = JSON.parse(files["manifest.json"]);
        if (manifest.schemaVersion !== "1.0.0") {
            errors.push(`Unsupported schema version: ${manifest.schemaVersion}`);
        }
        if (!manifest.runId)
            errors.push("manifest.runId is required");
        if (!manifest.requestId)
            errors.push("manifest.requestId is required");
    }
    catch {
        // Already caught above
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Parse a validated pack into structured data.
 */
export function parsePack(files) {
    const manifest = JSON.parse(files["manifest.json"]);
    const inputs = JSON.parse(files["inputs.json"]);
    const assumptionsData = JSON.parse(files["assumptions.json"]);
    const flipDistance = JSON.parse(files["artifacts/flip_distance.json"]);
    const voiRankings = JSON.parse(files["artifacts/voi_rankings.json"]);
    const evidencePlan = JSON.parse(files["artifacts/evidence_plan.json"]);
    const outputs = JSON.parse(files["outputs.json"]);
    const eventsRaw = files["events.jsonl"]
        .split("\n")
        .filter((l) => l.trim())
        .map((line) => JSON.parse(line));
    return {
        manifest,
        inputs,
        assumptions: assumptionsData.assumptions,
        uncertaintyMap: assumptionsData.uncertaintyMap,
        artifacts: { flipDistance, voiRankings, evidencePlan },
        outputs,
        events: eventsRaw,
    };
}
/**
 * Deep-compare two values and produce JSON-pointer diff entries.
 */
export function deepDiff(expected, actual, path = "") {
    const diffs = [];
    if (expected === actual)
        return diffs;
    if (expected === null ||
        actual === null ||
        typeof expected !== typeof actual) {
        diffs.push({ path: path || "/", expected, actual });
        return diffs;
    }
    if (typeof expected !== "object") {
        if (expected !== actual) {
            diffs.push({ path: path || "/", expected, actual });
        }
        return diffs;
    }
    if (Array.isArray(expected) && Array.isArray(actual)) {
        const maxLen = Math.max(expected.length, actual.length);
        for (let i = 0; i < maxLen; i++) {
            diffs.push(...deepDiff(i < expected.length ? expected[i] : undefined, i < actual.length ? actual[i] : undefined, `${path}/${i}`));
        }
        return diffs;
    }
    if (Array.isArray(expected) !== Array.isArray(actual)) {
        diffs.push({ path: path || "/", expected, actual });
        return diffs;
    }
    const expectedObj = expected;
    const actualObj = actual;
    const allKeys = new Set([
        ...Object.keys(expectedObj),
        ...Object.keys(actualObj),
    ]);
    for (const key of allKeys) {
        diffs.push(...deepDiff(expectedObj[key], actualObj[key], `${path}/${key}`));
    }
    return diffs;
}
/**
 * Replay a pack and verify outputs match.
 */
export async function replayFromPack(files, pipeline, options = { verify: true }) {
    // 1. Validate structure + checksums
    const validation = validatePack(files);
    if (!validation.valid) {
        return {
            match: false,
            exitCode: EXIT_CODES.INVALID_PACK,
            diffs: [],
            errors: validation.errors,
        };
    }
    // 2. Parse
    let pack;
    try {
        pack = parsePack(files);
    }
    catch (e) {
        return {
            match: false,
            exitCode: EXIT_CODES.VALIDATION_ERROR,
            diffs: [],
            errors: [`Failed to parse pack: ${e.message}`],
        };
    }
    if (!options.verify) {
        return {
            match: true,
            exitCode: EXIT_CODES.MATCH,
            diffs: [],
            errors: [],
        };
    }
    // 3. Re-run pipeline
    let rerunData;
    try {
        rerunData = await pipeline(pack.inputs, pack.assumptions, pack.seed);
    }
    catch (e) {
        return {
            match: false,
            exitCode: EXIT_CODES.INTERNAL_SAFE,
            diffs: [],
            errors: [`Pipeline re-run failed: ${e.message}`],
        };
    }
    // 4. Compare artifacts and outputs
    const diffs = [];
    diffs.push(...deepDiff(pack.artifacts.flipDistance, rerunData.artifacts.flipDistance, "/artifacts/flip_distance"));
    diffs.push(...deepDiff(pack.artifacts.voiRankings, rerunData.artifacts.voiRankings, "/artifacts/voi_rankings"));
    diffs.push(...deepDiff(pack.artifacts.evidencePlan, rerunData.artifacts.evidencePlan, "/artifacts/evidence_plan"));
    diffs.push(...deepDiff(pack.outputs, rerunData.outputs, "/outputs"));
    if (diffs.length > 0) {
        return {
            match: false,
            exitCode: EXIT_CODES.MISMATCH,
            diffs,
            errors: [],
        };
    }
    return {
        match: true,
        exitCode: EXIT_CODES.MATCH,
        diffs: [],
        errors: [],
    };
}
//# sourceMappingURL=replay.js.map
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as contracts from "../index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const typesPath = resolve(__dirname, "../types.ts");

/**
 * Validates that current contracts match the expected structural hashes.
 * If this test fails, it means the contracts have been modified.
 * Modify the hash ONLY if you are explicitly bumping the minor/major version.
 */
describe("Contract Compliance (Breaking Change Detector)", () => {
    it("should match the canonical structural hash", () => {
        if (!existsSync(typesPath)) {
            throw new Error(`Contracts types file not found at: ${typesPath}`);
        }

        const content = readFileSync(typesPath, "utf8");

        // We compute a hash of the file content (normalized whitespace)
        const normalized = content.replace(/\s+/g, " ").trim();
        const currentHash = createHash("sha256").update(normalized).digest("hex");

        // The "Canonical Hash" of the v1.1.0 contract state.
        // If you change the contract, this test will fail. 
        // You MUST update this hash ONLY after ensuring compatibility or bumping version.
        const CANONICAL_HASH_V1_1_0 = "cfe935762e7db5a6c3e11ba211f67e72e407f2a36fbaa25b0c72f7db0910b66a";

        expect(currentHash).toBe(CANONICAL_HASH_V1_1_0);
    });

    it("should validate sample historical evidence bundles", () => {
        // This will eventually load JSON files from a 'fixtures' directory
        // For now, we'll check that basic guards don't throw on current shapes.
        const mockManifest = {
            id: "test",
            title: "Test",
            route: "/test",
            slot: "rightInspector",
            kind: "react",
            entry: "./index.js",
            version: "1.0.0",
            capabilities: {},
            dataDeps: [],
            permissions: {},
        };

        const manifestAssert = (contracts as { assertUiPanelManifest?: (input: unknown) => void }).assertUiPanelManifest;
        expect(typeof manifestAssert).toBe('function');
        expect(() => manifestAssert?.(mockManifest)).not.toThrow();
    });
});

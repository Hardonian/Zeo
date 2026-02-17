import { createHmac } from "node:crypto";
import { describe, it, expect, beforeEach } from "vitest";
import {
    sha256,
    computeManifestHash,
    computeTreeHash,
    signManifest,
    verifyManifestSignature,
    Manifest
} from "./evidence-attestation.js";
import {
    computePolicyPackHash,
    validatePolicyPackSchema,
    PolicyPackContent
} from "./policy-packs.js";
import { WebhookSecurity } from "./webhooks-security.js";
import { encodeCanonicalJson } from "@zeo/kernel";

describe("Enterprise Defensibility Trifecta", () => {

    describe("Tamper-evident Evidence Chain", () => {
        const mockManifest: Manifest = {
            schemaVersion: 1,
            createdAt: "2024-01-01T00:00:00Z",
            organizationId: "org-1",
            repositoryId: "repo-1",
            runId: "run-1",
            files: [
                { path: "a.txt", sha256: "hash-a", size: 10 },
                { path: "b.txt", sha256: "hash-b", size: 20 }
            ]
        };

        it("should produce deterministic manifest hashes regardless of key order", () => {
            const h1 = computeManifestHash(mockManifest);
            const rearranged = {
                ...mockManifest,
                files: [...mockManifest.files].reverse() // This actually changes the content, but let's test fixed order
            };
            const h2 = computeManifestHash({
                runId: "run-1",
                organizationId: "org-1",
                schemaVersion: 1,
                createdAt: "2024-01-01T00:00:00Z",
                repositoryId: "repo-1",
                files: [
                    { path: "a.txt", sha256: "hash-a", size: 10 },
                    { path: "b.txt", sha256: "hash-b", size: 20 }
                ]
            });
            expect(h1).toBe(h2);
        });

        it("should produce deterministic tree hashes via sorted file paths", () => {
            const f1 = { path: "a.txt", sha256: "h1", size: 1 };
            const f2 = { path: "b.txt", sha256: "h2", size: 1 };
            const t1 = computeTreeHash([f1, f2]);
            const t2 = computeTreeHash([f2, f1]);
            expect(t1).toBe(t2);
        });

        it("should sign and verify using HMAC", () => {
            const secret = "super-secret";
            const hash = computeManifestHash(mockManifest);
            const signature = signManifest(hash, "hmac", secret);
            expect(signature).toBeDefined();
            const isValid = verifyManifestSignature(hash, signature!, "hmac", secret);
            expect(isValid).toBe(true);

            const isInvalid = verifyManifestSignature(hash, signature!, "hmac", "wrong-secret");
            expect(isInvalid).toBe(false);
        });
    });

    describe("Policy Packs", () => {
        const validPack: PolicyPackContent = {
            schemaVersion: 1,
            name: "Standard Compliance",
            version: "1.0.0",
            policies: {
                "rule-1": { severity: "block" }
            }
        };

        it("should compute hash and validate schema", () => {
            const content = validatePolicyPackSchema(validPack);
            const hash = computePolicyPackHash(content);
            expect(hash).toMatch(/^[a-f0-9]{64}$/);
        });

        it("should fail on invalid schema", () => {
            expect(() => validatePolicyPackSchema({ schemaVersion: 2 })).toThrow();
            expect(() => validatePolicyPackSchema({ schemaVersion: 1, name: "Missing version" })).toThrow();
        });
    });

    describe("Webhook Security", () => {
        const payload = JSON.stringify({ event: "push" });
        const secret = "webhook-secret";

        it("should verify GitHub signatures", () => {
            // Manual HMAC-SHA256 for testing
            const hmac = createHmac("sha256", secret);
            const sig = "sha256=" + hmac.update(payload).digest("hex");

            const isValid = WebhookSecurity.verifyGithubSignature(payload, sig, secret);
            expect(isValid).toBe(true);

            const isInvalid = WebhookSecurity.verifyGithubSignature(payload, sig, "wrong");
            expect(isInvalid).toBe(false);
        });

        it("should compute stable body hashes", () => {
            const h1 = WebhookSecurity.computeBodyHash(payload);
            const h2 = WebhookSecurity.computeBodyHash(payload);
            expect(h1).toBe(h2);
        });
    });
});

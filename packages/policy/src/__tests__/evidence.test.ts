import { describe, it, expect } from "vitest";
import { policyEngineService, EvidenceInputs, EvidenceOutputs, EffectivePolicy } from "../index.js";

describe("Policy Engine Evidence Production", () => {
    it("should include contractVersionHash in produced evidence", async () => {
        const inputs: EvidenceInputs = { commitSha: "test-sha" };
        const outputs: EvidenceOutputs = {
            findings: [],
            evaluationResult: {
                blocked: false,
                score: 100,
                rulesFired: [],
                waivedFindings: [],
                nonWaivedFindings: [],
            },
        };

        const mockPolicy: EffectivePolicy = {
            pack: {
                id: "test-pack",
                organizationId: "org-1",
                repositoryId: "repo-1",
                version: "1.0.0",
                source: "test",
                checksum: "test-sum",
                rules: [],
            },
            rules: new Map(),
            waivers: [],
        };

        const bundle = await policyEngineService.produceEvidence(inputs, outputs, mockPolicy);

        expect(bundle).toBeDefined();
        expect(bundle.contractVersionHash).toBeDefined();
        expect(bundle.contractVersionHash).toMatch(/^v1\.1\.0-[a-f0-9]{40}$/);
        console.log(`Produced Evidence Bundle with Hash: ${bundle.contractVersionHash}`);
    });
});

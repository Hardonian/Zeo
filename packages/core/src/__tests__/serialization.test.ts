import { describe, it, expect } from "vitest";
import { encodeCanonicalJson, computeTranscriptHash } from "@zeo/kernel";

describe("Contract Serialization Round-trip", () => {
    it("should maintain structural integrity across canonical JSON encoding", () => {
        const complexObject = {
            id: "test-1",
            meta: {
                version: "1.0.0",
                tags: ["a", "c", "b"], // Will be sorted by canonicalizer if deep sorting is on, or just preserved
            },
            data: {
                value: 42,
                active: true,
                nothing: null as null,
            }
        };

        const encoded = encodeCanonicalJson(complexObject);
        const decoded = JSON.parse(new TextDecoder().decode(encoded));

        // Check that we don't lose information
        expect(decoded.id).toBe(complexObject.id);
        expect(decoded.data.value).toBe(42);
        expect(decoded.data.active).toBe(true);
        expect(decoded.data.nothing).toBe(null);

        // Verify hash stability
        const hash1 = computeTranscriptHash(complexObject);
        const hash2 = computeTranscriptHash(decoded);
        expect(hash1).toBe(hash2);
    });
});

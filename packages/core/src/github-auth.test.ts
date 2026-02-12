import { generateKeyPairSync, createVerify } from "node:crypto";
import { describe, expect, it } from "vitest";
import { generateGitHubAppJwt } from "./github-auth.js";

function decodeBase64Url(segment: string): string {
    const padding = "=".repeat((4 - (segment.length % 4)) % 4);
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/") + padding;
    return Buffer.from(base64, "base64").toString("utf8");
}

describe("generateGitHubAppJwt", () => {
    it("emits header.payload.signature with base64url-safe segments and verifiable RS256 signature", () => {
        const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
        const jwt = generateGitHubAppJwt("12345", privateKey.export({ type: "pkcs1", format: "pem" }).toString());

        const parts = jwt.split(".");
        expect(parts).toHaveLength(3);

        const [headerSegment, payloadSegment, signatureSegment] = parts;
        for (const segment of parts) {
            expect(segment).toMatch(/^[A-Za-z0-9_-]+$/);
        }

        const header = JSON.parse(decodeBase64Url(headerSegment));
        const payload = JSON.parse(decodeBase64Url(payloadSegment));

        expect(header).toMatchObject({ alg: "RS256", typ: "JWT" });
        expect(payload.iss).toBe("12345");
        expect(typeof payload.iat).toBe("number");
        expect(typeof payload.exp).toBe("number");
        expect(payload.exp).toBeGreaterThan(payload.iat);

        const verifier = createVerify("RSA-SHA256");
        verifier.update(`${headerSegment}.${payloadSegment}`);
        verifier.end();

        const signatureBase64 = signatureSegment.replace(/-/g, "+").replace(/_/g, "/");
        const isValid = verifier.verify(
            publicKey.export({ type: "pkcs1", format: "pem" }),
            Buffer.from(signatureBase64, "base64")
        );

        expect(isValid).toBe(true);
    });
});

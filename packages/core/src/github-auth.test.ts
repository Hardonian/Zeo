import { createPublicKey, createVerify, generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { generateGitHubAppJwt } from "./github-auth.ts";

function decodeBase64Url(segment: string): string {
  const pad = (4 - (segment.length % 4)) % 4;
  const normalized = `${segment}${"=".repeat(pad)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

describe("generateGitHubAppJwt", () => {
  it("creates a 3-segment RS256 JWT with expected header/payload claims", () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pemPrivateKey = privateKey.export({ type: "pkcs1", format: "pem" }).toString();

    const before = Math.floor(Date.now() / 1000);
    const token = generateGitHubAppJwt("12345", pemPrivateKey, 600);
    const after = Math.floor(Date.now() / 1000);

    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    expect(encodedHeader).toBeTruthy();
    expect(encodedPayload).toBeTruthy();
    expect(encodedSignature).toBeTruthy();

    const header = JSON.parse(decodeBase64Url(encodedHeader!)) as { alg: string; typ: string };
    const payload = JSON.parse(decodeBase64Url(encodedPayload!)) as {
      iat: number;
      exp: number;
      iss: string;
    };

    expect(header).toEqual({ alg: "RS256", typ: "JWT" });
    expect(payload.iss).toBe("12345");

    // GitHub App JWT acceptance semantics: issued-at can be slightly backdated,
    // and expiration should be short-lived (default implementation uses +600s).
    expect(payload.iat).toBeGreaterThanOrEqual(before - 120);
    expect(payload.iat).toBeLessThanOrEqual(after);
    expect(payload.exp - payload.iat).toBe(660); // (now+600) - (now-60)
  });

  it("produces a signature verifiable by the paired public key", () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pemPrivateKey = privateKey.export({ type: "pkcs1", format: "pem" }).toString();
    const publicKey = createPublicKey(pemPrivateKey);

    const token = generateGitHubAppJwt("99999", pemPrivateKey, 300);
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();

    const signatureBuffer = Buffer.from(
      encodedSignature!.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    );

    expect(verifier.verify(publicKey, signatureBuffer)).toBe(true);
  });
});


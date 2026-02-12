import { createSign } from "node:crypto";
function base64UrlEncode(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
function signRs256(payload, privateKey) {
    const header = { alg: "RS256", typ: "JWT" };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signingInput);
    signer.end();
    const signature = signer
        .sign(privateKey)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    return `${signingInput}.${signature}`;
}
/**
 * Generate a GitHub App JWT
 */
export function generateGitHubAppJwt(appId, privateKey, expirationSeconds = 600) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iat: now - 60,
        exp: now + expirationSeconds,
        iss: appId,
    };
    return signRs256(payload, privateKey);
}
/**
 * Get an installation access token
 */
export async function getInstallationAccessToken(appJwt, installationId) {
    const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${appJwt}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Zeo-Sync",
        },
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get installation access token: ${response.statusText} - ${errorBody}`);
    }
    return (await response.json());
}
//# sourceMappingURL=github-auth.js.map

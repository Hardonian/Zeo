import { encodeCanonicalJson } from "./canonical-json.js";
/**
 * Sign an evidence bundle using WebCrypto Subtle
 */
export async function signEvidenceBundle(bundle, privateKey) {
    // Use canonical JSON to ensure deterministic payload
    const payload = encodeCanonicalJson(bundle);
    const payloadArray = new Uint8Array(payload);
    const signatureBuffer = await crypto.subtle.sign({
        name: "ECDSA",
        hash: { name: "SHA-256" },
    }, privateKey, payloadArray);
    return {
        signature: Buffer.from(signatureBuffer).toString("base64"),
        algorithm: "ECDSA-P256-SHA256",
    };
}
/**
 * Verify an evidence bundle signature
 */
export async function verifyEvidenceBundle(bundle, signatureBase64, publicKey) {
    const payload = encodeCanonicalJson(bundle);
    const payloadArray = new Uint8Array(payload);
    const signature = new Uint8Array(Buffer.from(signatureBase64, "base64"));
    return await crypto.subtle.verify({
        name: "ECDSA",
        hash: { name: "SHA-256" },
    }, publicKey, signature, payloadArray);
}
/**
 * Generate a key pair for signing evidence bundles
 */
export async function generateEvidenceKeyPair() {
    return await crypto.subtle.generateKey({
        name: "ECDSA",
        namedCurve: "P-256",
    }, true, ["sign", "verify"]);
}
/**
 * Export a public key to SPKI format (base64)
 */
export async function exportEvidencePublicKey(key) {
    const exported = await crypto.subtle.exportKey("spki", key);
    return Buffer.from(exported).toString("base64");
}
/**
 * Import a public key from SPKI format (base64)
 */
export async function importEvidencePublicKey(spkiBase64) {
    const buffer = new Uint8Array(Buffer.from(spkiBase64, "base64"));
    return await crypto.subtle.importKey("spki", buffer, {
        name: "ECDSA",
        namedCurve: "P-256",
    }, true, ["verify"]);
}
//# sourceMappingURL=evidence-signing.js.map
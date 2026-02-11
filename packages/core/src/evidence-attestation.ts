import { createHash, createHmac, sign, verify } from "crypto";
import { encodeCanonicalJson } from "./canonical-json.js";

export interface EvidenceFile {
    path: string;
    sha256: string;
    size: number;
}

export interface Manifest {
    schemaVersion: number;
    createdAt: string;
    organizationId: string;
    repositoryId: string;
    runId: string;
    files: EvidenceFile[];
}

export interface AttestationResult {
    manifestHash: string;
    bundleHash: string;
    treeHash: string;
    signature?: string;
    signingMode: "none" | "hmac" | "ed25519";
}

/**
 * Computes the SHA-256 hash of a buffer or string.
 */
export function sha256(data: string | Buffer): string {
    return createHash("sha256").update(data).digest("hex");
}

/**
 * Normalizes and hashes the manifest.
 */
export function computeManifestHash(manifest: Manifest): string {
    const normalized = encodeCanonicalJson(manifest);
    return sha256(normalized);
}

/**
 * Computes a deterministic tree hash from file hashes.
 * Sorts by path to ensure determinism.
 */
export function computeTreeHash(files: EvidenceFile[]): string {
    // Sort by path to ensure deterministic order
    const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

    // Create a Merkle-ish root by hashing the concatenation of all file hashes
    // A simple approach: sha256(hash1 + hash2 + ... + hashN)
    const concatHashes = sorted.map(f => f.sha256).join("");
    return sha256(concatHashes);
}

/**
 * Signs the manifest hash.
 */
export function signManifest(
    manifestHash: string,
    mode: "none" | "hmac" | "ed25519",
    secretOrPrivateKey?: string
): string | undefined {
    if (mode === "none") return undefined;
    if (!secretOrPrivateKey) throw new Error("Missing secret for signing");

    if (mode === "hmac") {
        return createHmac("sha256", secretOrPrivateKey).update(manifestHash).digest("hex");
    }

    if (mode === "ed25519") {
        // Assuming secretOrPrivateKey is a valid PEM or key object for crypto.sign
        // For Ed25519, we usually need a specific format. 
        // Simplified strictly for this implementation: assuming key is adequate.
        return sign(null, Buffer.from(manifestHash), secretOrPrivateKey).toString("hex");
    }

    throw new Error(`Unsupported signing mode: ${mode}`);
}

/**
 * Verifies the signature.
 */
export function verifyManifestSignature(
    manifestHash: string,
    signature: string,
    mode: "hmac" | "ed25519",
    secretOrPublicKey: string
): boolean {
    if (mode === "hmac") {
        const expected = createHmac("sha256", secretOrPublicKey).update(manifestHash).digest("hex");
        return expected === signature;
    }

    if (mode === "ed25519") {
        return verify(null, Buffer.from(manifestHash), secretOrPublicKey, Buffer.from(signature, "hex"));
    }

    return false;
}

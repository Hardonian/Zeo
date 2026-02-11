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
export declare function sha256(data: string | Buffer): string;
/**
 * Normalizes and hashes the manifest.
 */
export declare function computeManifestHash(manifest: Manifest): string;
/**
 * Computes a deterministic tree hash from file hashes.
 * Sorts by path to ensure determinism.
 */
export declare function computeTreeHash(files: EvidenceFile[]): string;
/**
 * Signs the manifest hash.
 */
export declare function signManifest(manifestHash: string, mode: "none" | "hmac" | "ed25519", secretOrPrivateKey?: string): string | undefined;
/**
 * Verifies the signature.
 */
export declare function verifyManifestSignature(manifestHash: string, signature: string, mode: "hmac" | "ed25519", secretOrPublicKey: string): boolean;
//# sourceMappingURL=evidence-attestation.d.ts.map
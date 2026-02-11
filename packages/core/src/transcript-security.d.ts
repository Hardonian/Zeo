export type CanonicalJson = null | boolean | number | string | CanonicalJson[] | {
    [k: string]: CanonicalJson;
};
export interface TranscriptEnvelope {
    envelope_version: "1";
    transcript: Record<string, unknown>;
    transcript_hash: string;
    signatures: TranscriptSignature[];
    attestations: TranscriptAttestation[];
    metadata: Record<string, unknown>;
    parent_envelope_hash?: string;
}
export interface TranscriptSignature {
    algorithm: "ed25519";
    identity_type: "local_key" | "ssh_key" | "external";
    key_fingerprint: string;
    signature_b64: string;
    signing_context: string;
    signed_payload_b64: string;
}
export interface TranscriptAttestation {
    type: string;
    statement: string;
    signer?: string;
}
export interface KeyringEntry {
    id: string;
    label?: string;
    created_at_seq: number;
    notes?: string;
    revoked: boolean;
    public_key_pem: string;
}
export interface TrustProfile {
    subject_type: "agent" | "provider" | "key" | "model";
    subject_id: string;
    counters: {
        runs_total: number;
        verify_pass: number;
        verify_fail: number;
        replay_pass: number;
        replay_fail: number;
        adjudications: {
            accepted: number;
            rejected: number;
            modified: number;
        };
    };
    last_seq: number;
    last_seen_transcript_hash?: string;
    notes?: string;
}
export interface TrustEvent {
    seq: number;
    subject_type: TrustProfile["subject_type"];
    subject_id: string;
    transcript_hash?: string;
    verify: "pass" | "fail";
    replay: "pass" | "fail";
    adjudication?: "accepted" | "rejected" | "modified";
}
export declare function canonicalizeTranscript(input: Record<string, unknown>): CanonicalJson;
export declare function canonicalTranscriptBytes(input: Record<string, unknown>): Uint8Array;
export declare function generateEd25519Keypair(privateKeyPath: string, passphrase?: string): {
    publicKeyPem: string;
    fingerprint: string;
};
export declare function fingerprintFromPublicKey(publicKeyPem: string): string;
export declare function createEnvelope(transcript: Record<string, unknown>, metadata?: Record<string, unknown>): TranscriptEnvelope;
export declare function signEnvelopeWithEd25519(envelope: TranscriptEnvelope, privateKeyPemOrPath: string, signingContext?: string, passphrase?: string): TranscriptEnvelope;
export declare function verifyEnvelope(envelope: TranscriptEnvelope, resolvePublicKey: (fingerprint: string) => string | null): {
    ok: boolean;
    errors: string[];
    signerFingerprints: string[];
};
export declare function computeEnvelopeHash(envelope: TranscriptEnvelope): string;
export declare function addPublicKeyToKeyring(keyringDir: string, publicKeyPem: string, label?: string, notes?: string): KeyringEntry;
export declare function listKeyringEntries(keyringDir: string): KeyringEntry[];
export declare function revokeKeyringEntry(keyringDir: string, fingerprint: string): KeyringEntry;
export declare function recordTrustEvent(rootDir: string, partial: Omit<TrustEvent, "seq">): TrustEvent;
export declare function readTrustEvents(rootDir: string): TrustEvent[];
export declare function compactTrustProfiles(rootDir: string): TrustProfile[];
export declare function deriveTrustTier(profile: TrustProfile, window?: number): "A" | "B" | "C" | "D";
export declare function verifyTranscriptChain(envelopes: TranscriptEnvelope[]): {
    ok: boolean;
    forks: Array<{
        parent: string;
        children: string[];
    }>;
    errors: string[];
};
export declare function loadEnvelopeFromFile(path: string): TranscriptEnvelope;
export declare function inspectEnvelope(envelope: TranscriptEnvelope): Record<string, unknown>;
export declare function keyringResolver(keyringDir: string): (fingerprint: string) => string | null;
export declare function exportPublicKeyFromPrivate(privateKeyPath: string, passphrase?: string): string;
export declare function envelopeFilesInDir(dir: string): string[];
//# sourceMappingURL=transcript-security.d.ts.map
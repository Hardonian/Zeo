import { Manifest, AttestationResult } from "./evidence-attestation.js";
export interface EvidenceStorage {
    storeEvidence(runId: string, orgId: string, repoId: string, bundleZip: Buffer, manifest: Manifest, attestation: AttestationResult): Promise<void>;
}
export declare class PrismaEvidenceStorage implements EvidenceStorage {
    storeEvidence(runId: string, orgId: string, repoId: string, bundleZip: Buffer, manifest: Manifest, attestation: AttestationResult): Promise<void>;
}
//# sourceMappingURL=evidence-storage.d.ts.map
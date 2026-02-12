import { PolicyPack, Waiver, EvidenceBundle, EvidenceInputs } from "@zeo/contracts";
import { StorageProvider } from "../storage-provider.js";
export declare class SqliteStorageProvider implements StorageProvider {
    private db;
    constructor(dbPath?: string);
    private init;
    loadLatestPolicyPack(organizationId: string, repositoryId: string | null): Promise<PolicyPack | null>;
    loadActiveWaivers(organizationId: string, repositoryId: string | null): Promise<Waiver[]>;
    storeEvidenceBundle(bundle: {
        reviewId?: string;
        testId?: string;
        docId?: string;
        inputsMetadata: EvidenceInputs;
        rulesFired: string[];
        deterministicScore: number;
        artifacts?: Record<string, string>;
        policyChecksum: string;
        toolVersions?: Record<string, string>;
        timings?: Record<string, number>;
    }): Promise<EvidenceBundle>;
    getEnforcementStrength(organizationId: string): Promise<'basic' | 'moderate' | 'maximum'>;
}
//# sourceMappingURL=sqlite.d.ts.map
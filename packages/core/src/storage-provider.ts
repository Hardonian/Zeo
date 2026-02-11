import { PolicyPack, Waiver, EvidenceBundle, EvidenceInputs, EvidenceOutputs } from "@zeo/policy";

export interface StorageProvider {
    /**
     * Load the latest policy pack for an organization/repository
     */
    loadLatestPolicyPack(organizationId: string, repositoryId: string | null): Promise<PolicyPack | null>;

    /**
     * Load active waivers for an organization/repository
     */
    loadActiveWaivers(organizationId: string, repositoryId: string | null): Promise<Waiver[]>;

    /**
     * Persist an evidence bundle
     */
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

    /**
     * Get the enforcement strength for an organization
     */
    getEnforcementStrength(organizationId: string): Promise<'basic' | 'moderate' | 'maximum'>;
}

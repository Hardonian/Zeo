import { prisma } from "@zeo/db";
import type { PolicyPack, Waiver, EvidenceBundle, EvidenceInputs } from "@zeo/policy-types";
import { StorageProvider } from "../storage-provider.js";

export class PrismaStorageProvider implements StorageProvider {
    async loadLatestPolicyPack(organizationId: string, repositoryId: string | null): Promise<PolicyPack | null> {
        const pack = await (prisma as any).policyPack.findFirst({
            where: {
                organizationId,
                repositoryId: repositoryId || null,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                rules: true,
            },
        });

        if (!pack) return null;

        return {
            id: pack.id,
            organizationId: pack.organizationId,
            repositoryId: pack.repositoryId,
            version: pack.version,
            source: pack.source,
            checksum: pack.checksum,
            rules: pack.rules.map((r: any) => ({
                id: r.id,
                ruleId: r.ruleId,
                severityMapping: r.severityMapping,
                enabled: r.enabled,
                params: r.params,
            })),
        };
    }

    async loadActiveWaivers(organizationId: string, repositoryId: string | null): Promise<Waiver[]> {
        const now = new Date();
        const waivers = await (prisma as any).waiver.findMany({
            where: {
                organizationId,
                repositoryId: repositoryId || null,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
        });

        return waivers.map((w: any) => ({
            id: w.id,
            ruleId: w.ruleId,
            scope: w.scope,
            scopeValue: w.scopeValue,
            expiresAt: w.expiresAt,
        }));
    }

    async storeEvidenceBundle(bundle: {
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
    }): Promise<EvidenceBundle> {
        const created = await (prisma as any).evidenceBundle.create({
            data: {
                ...bundle,
                inputsMetadata: bundle.inputsMetadata as any,
                rulesFired: bundle.rulesFired as any,
                artifacts: bundle.artifacts as any,
                toolVersions: bundle.toolVersions as any,
                timings: bundle.timings as any,
            },
        });

        return created;
    }

    async getEnforcementStrength(organizationId: string): Promise<'basic' | 'moderate' | 'maximum'> {
        // Fallback if billing service not easily accessible here
        // In a real app, we'd import the billing service or query the org tier
        const org = await (prisma as any).organization.findUnique({
            where: { id: organizationId },
            select: { tier: true }
        });

        const tier = org?.tier?.toLowerCase() || 'basic';
        if (tier === 'enterprise') return 'maximum';
        if (tier === 'pro') return 'moderate';
        return 'basic';
    }
}

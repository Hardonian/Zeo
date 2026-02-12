import { prisma } from "@zeo/db";
export class PrismaStorageProvider {
    async loadLatestPolicyPack(organizationId, repositoryId) {
        const pack = await prisma.policyPack.findFirst({
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
        if (!pack)
            return null;
        return {
            id: pack.id,
            organizationId: pack.organizationId,
            repositoryId: pack.repositoryId,
            version: pack.version,
            source: pack.source,
            checksum: pack.checksum,
            rules: pack.rules.map((r) => ({
                id: r.id,
                ruleId: r.ruleId,
                severityMapping: r.severityMapping,
                enabled: r.enabled,
                params: r.params,
            })),
        };
    }
    async loadActiveWaivers(organizationId, repositoryId) {
        const now = new Date();
        const waivers = await prisma.waiver.findMany({
            where: {
                organizationId,
                repositoryId: repositoryId || null,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
        });
        return waivers.map((w) => ({
            id: w.id,
            ruleId: w.ruleId,
            scope: w.scope,
            scopeValue: w.scopeValue,
            expiresAt: w.expiresAt,
        }));
    }
    async storeEvidenceBundle(bundle) {
        const created = await prisma.evidenceBundle.create({
            data: {
                ...bundle,
                inputsMetadata: bundle.inputsMetadata,
                rulesFired: bundle.rulesFired,
                artifacts: bundle.artifacts,
                toolVersions: bundle.toolVersions,
                timings: bundle.timings,
            },
        });
        return created;
    }
    async getEnforcementStrength(organizationId) {
        // Fallback if billing service not easily accessible here
        // In a real app, we'd import the billing service or query the org tier
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { tier: true }
        });
        const tier = org?.tier?.toLowerCase() || 'basic';
        if (tier === 'enterprise')
            return 'maximum';
        if (tier === 'pro')
            return 'moderate';
        return 'basic';
    }
}
//# sourceMappingURL=prisma.js.map
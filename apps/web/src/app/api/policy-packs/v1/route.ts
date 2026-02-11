import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@zeo/db";
import { validatePolicyPackSchema, computePolicyPackHash } from "@zeo/core";

export async function GET(req: NextRequest) {
    const packs = await prisma.policyPack.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(packs);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const content = validatePolicyPackSchema(body);
        const packHash = computePolicyPackHash(content);

        const pack = await prisma.policyPack.upsert({
            where: {
                organizationId_name_version: {
                    organizationId: "default-org",
                    name: content.name,
                    version: content.version
                }
            },
            update: {
                contentsJson: JSON.stringify(content),
                packHash,
                description: content.description
            },
            create: {
                organizationId: "default-org",
                name: content.name,
                version: content.version,
                description: content.description,
                contentsJson: JSON.stringify(content),
                packHash,
                signingMode: "none"
            }
        });

        return NextResponse.json(pack);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

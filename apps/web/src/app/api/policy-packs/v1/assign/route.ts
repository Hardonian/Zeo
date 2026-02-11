import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@zeo/db";

export async function POST(req: NextRequest) {
    const { policyPackId, scope, repositoryId, enabled } = await req.json();

    const assignment = await prisma.policyPackAssignment.create({
        data: {
            organizationId: "default-org",
            policyPackId,
            scope,
            repositoryId,
            enabled: enabled ?? true
        }
    });

    return NextResponse.json(assignment);
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");

    const assignments = await prisma.policyPackAssignment.findMany({
        where: {
            organizationId: "default-org",
            OR: [
                { scope: "org" },
                { repositoryId: repoId }
            ]
        },
        include: {
            policyPack: true
        }
    });

    return NextResponse.json(assignments);
}

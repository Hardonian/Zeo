import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@zeo/db";
import fs from "node:fs";
import path from "node:path";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ runId: string }> }
) {
    const { runId } = await params;

    const evidence = await prisma.evidenceObject.findFirst({
        where: { runId, kind: "zip" }
    });

    if (!evidence) {
        return NextResponse.json({ error: "Evidence bundle not found" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "storage", evidence.storageKey);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Physical file missing on server" }, { status: 410 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="evidence-${runId}.zip"`,
            "X-Manifest-Hash": (await prisma.evidenceAttestation.findUnique({ where: { runId } }))?.manifestHash || ""
        }
    });
}

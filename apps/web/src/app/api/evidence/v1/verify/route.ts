import { NextRequest, NextResponse } from "next/server";
import { verifyManifestSignature, computeManifestHash } from "@zeo/core";

export async function POST(req: NextRequest) {
    const { runId, manifest, signature, mode, publicKey } = await req.json();

    if (!manifest) {
        return NextResponse.json({ error: "Missing manifest" }, { status: 400 });
    }

    const computedHash = computeManifestHash(manifest);

    let isValid = true;
    if (signature && mode !== "none") {
        isValid = verifyManifestSignature(computedHash, signature, mode, publicKey);
    }

    return NextResponse.json({
        valid: isValid,
        manifestHash: computedHash,
        match: manifest.runId === runId
    });
}

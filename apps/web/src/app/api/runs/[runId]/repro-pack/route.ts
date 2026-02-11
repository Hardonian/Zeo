
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ runId: string }> }
) {
    const { runId } = await params;

    // Repro packs are currently generated via CLI 'zeo pack' or client-side export.
    // Server-side generation is restricted in this version.

    return NextResponse.json(
        {
            error: "Repro pack generation via API not yet implemented. Please use CLI 'zeo pack' or client-side export.",
            runId
        },
        { status: 501 }
    );
}

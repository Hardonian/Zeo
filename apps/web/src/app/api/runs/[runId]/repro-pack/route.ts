
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { runId: string } }
) {
    const { runId } = params;

    // TODO: integrate with run storage service once available.
    // Currently runs are stored client-side in localStorage or via CLI in filesystem.

    return NextResponse.json(
        {
            error: "Repro pack generation via API not yet implemented. Please use CLI 'zeo pack' or client-side export.",
            runId
        },
        { status: 501 }
    );
}

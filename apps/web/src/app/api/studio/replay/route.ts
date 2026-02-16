import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.runId) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_RUN_ID", message: "runId is required", hint: "Provide a valid run_id from 'zeo snapshots'." } },
        { status: 400 }
      );
    }
    const { replayRun } = await import("@/lib/studio-api");
    const result = await replayRun(body.runId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.runIdA || !body.runIdB) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_PARAMS", message: "runIdA and runIdB are required" } },
        { status: 400 }
      );
    }
    const { diffRuns } = await import("@/lib/studio-api");
    const result = await diffRuns(body.runIdA, body.runIdB);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

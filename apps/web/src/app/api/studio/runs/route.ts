import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenant = req.nextUrl.searchParams.get("tenant") || undefined;
    const { listRuns } = await import("@/lib/studio-api");
    const result = await listRuns(tenant);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message, hint: "Check server logs." } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { executeRun } = await import("@/lib/studio-api");
    const result = await executeRun(
      {
        example: body.example || "negotiation",
        depth: body.depth,
        deterministic: body.deterministic,
        seed: body.seed,
      },
      body.tenant,
      body.policy
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

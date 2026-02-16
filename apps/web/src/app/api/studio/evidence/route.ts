import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenant = req.nextUrl.searchParams.get("tenant") || undefined;
    const stale = req.nextUrl.searchParams.get("stale") === "true";
    const highRegret = req.nextUrl.searchParams.get("highRegret") === "true";
    const tag = req.nextUrl.searchParams.get("tag") || undefined;

    const { listEvidence } = await import("@/lib/studio-api");
    const result = await listEvidence(tenant, { stale, highRegret, tag });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenant = req.nextUrl.searchParams.get("tenant") || undefined;
    const { complianceReport } = await import("@/lib/studio-api");
    const result = await complianceReport(tenant);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { getEvidence } = await import("@/lib/studio-api");
    const result = await getEvidence(id);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

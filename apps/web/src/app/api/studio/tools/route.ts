import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { listTools } = await import("@/lib/studio-api");
    const result = await listTools();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.tool) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_TOOL", message: "tool name is required" } },
        { status: 400 }
      );
    }
    const { invokeTool } = await import("@/lib/studio-api");
    const result = await invokeTool(body.tool, body.args || {}, body.tenant, body.policy);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL", message: (e as Error).message } },
      { status: 500 }
    );
  }
}

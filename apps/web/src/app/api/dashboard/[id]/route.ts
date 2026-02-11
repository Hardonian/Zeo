import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const path = resolve(process.cwd(), "..", "..", ".zeo", "viewmodels", `${id}.json`);
  if (!existsSync(path)) {
    return NextResponse.json({ error: "dashboard viewmodel not found", hint: `Run: zeo view ${id}` }, { status: 404 });
  }
  return new NextResponse(readFileSync(path, "utf8"), { headers: { "content-type": "application/json" } });
}

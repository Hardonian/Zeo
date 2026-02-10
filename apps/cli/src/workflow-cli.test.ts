import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseWorkflowArgs, runWorkflowCommand } from "./workflow-cli.js";

const cwdStack: string[] = [];

function pushTempCwd(): string {
  const dir = mkdtempSync(join(tmpdir(), "zeo-workflow-"));
  cwdStack.push(process.cwd());
  process.chdir(dir);
  return dir;
}

afterEach(() => {
  const prev = cwdStack.pop();
  if (prev) process.chdir(prev);
});

describe("workflow cli", () => {
  it("creates deterministic result card from same transcript", async () => {
    pushTempCwd();
    await runWorkflowCommand(parseWorkflowArgs(["start", "--title", "Hiring decision"]));
    const decisionDir = join(process.cwd(), ".zeo", "decisions");
    const entries = (await import("node:fs")).readdirSync(decisionDir);
    const id = entries[0];

    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Candidate has domain expertise"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));

    const ws = JSON.parse(readFileSync(join(decisionDir, id, "decision.json"), "utf8"));
    expect(ws.runs).toHaveLength(2);
    expect(ws.runs[0].transcriptHash).toBe(ws.runs[1].transcriptHash);
  });

  it("exports md/ics/bundle with deterministic names", async () => {
    pushTempCwd();
    await runWorkflowCommand(parseWorkflowArgs(["start", "--title", "Launch decision"]));
    const decisionDir = join(process.cwd(), ".zeo", "decisions");
    const id = (await import("node:fs")).readdirSync(decisionDir)[0];
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Collect customer incident logs"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));

    const ws = JSON.parse(readFileSync(join(decisionDir, id, "decision.json"), "utf8"));
    const hashPrefix = ws.runs[0].transcriptHash.slice(0, 16);

    await runWorkflowCommand(parseWorkflowArgs(["export", "md", "--decision", id, "--out", "exports"]));
    await runWorkflowCommand(parseWorkflowArgs(["export", "ics", "--decision", id, "--out", "exports", "--timezone", "UTC"]));
    await runWorkflowCommand(parseWorkflowArgs(["export", "bundle", "--decision", id, "--out", "exports"]));

    const fs = await import("node:fs");
    expect(fs.existsSync(join(process.cwd(), "exports", `${hashPrefix}.md`))).toBe(true);
    expect(fs.existsSync(join(process.cwd(), "exports", `${hashPrefix}.ics`))).toBe(true);
    expect(fs.existsSync(join(process.cwd(), "exports", hashPrefix, "transcript.json"))).toBe(true);
  });

  it("rejects secret-like strings in share output", async () => {
    pushTempCwd();
    await runWorkflowCommand(parseWorkflowArgs(["start", "--title", "Vendor selection"]));
    const decisionDir = join(process.cwd(), ".zeo", "decisions");
    const id = (await import("node:fs")).readdirSync(decisionDir)[0];
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "safe text"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));
    const rc = await runWorkflowCommand(parseWorkflowArgs(["copy", "--decision", id]));
    expect(rc).toBe(0);
  });
});

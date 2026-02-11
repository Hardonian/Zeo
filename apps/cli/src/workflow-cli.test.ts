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

async function setupDecision(title: string): Promise<string> {
  await runWorkflowCommand(parseWorkflowArgs(["start", "--title", title]));
  const decisionDir = join(process.cwd(), ".zeo", "decisions");
  return (await import("node:fs")).readdirSync(decisionDir)[0];
}

describe("workflow cli", () => {
  it("creates deterministic result card from same transcript", async () => {
    pushTempCwd();
    const id = await setupDecision("Hiring decision");

    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Candidate has domain expertise"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));

    const ws = JSON.parse(readFileSync(join(process.cwd(), ".zeo", "decisions", id, "decision.json"), "utf8"));
    expect(ws.runs).toHaveLength(2);
    expect(ws.runs[0].transcriptHash).toBe(ws.runs[1].transcriptHash);
  });

  it("classifies evidence decay deterministically", async () => {
    pushTempCwd();
    const id = await setupDecision("Decay decision");
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Old note", "--asserted-at", "2024-01-01", "--expires-at", "2024-03-01"]));
    const out: string[] = [];
    const origWrite = process.stdout.write;
    process.stdout.write = ((chunk: string | Uint8Array) => { out.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id, "--as-of", "2024-04-01", "--json"]));
    process.stdout.write = origWrite;
    const payload = JSON.parse(out.join(""));
    expect(payload.decaySummary.expired).toBe(1);
  });

  it("detects graph cycles", async () => {
    pushTempCwd();
    const id = await setupDecision("Graph decision");
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Signal"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id, "--depends-on", "a", "--informs", "a"]));
    await expect(runWorkflowCommand(parseWorkflowArgs(["graph", "fragility", "--json"]))).rejects.toThrow(/Cycle detected/);
  });

  it("renders deterministic lens views", async () => {
    pushTempCwd();
    const id = await setupDecision("Lens decision");
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Constraint one"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));
    const ws = JSON.parse(readFileSync(join(process.cwd(), ".zeo", "decisions", id, "decision.json"), "utf8"));
    const hash = ws.runs[0].transcriptHash;
    const origWrite = process.stdout.write;
    const out1: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out1.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["view", "executive", hash, "--json"]));
    const first = JSON.parse(out1.join(""));
    const out2: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out2.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["view", "executive", hash, "--json"]));
    process.stdout.write = origWrite;
    const second = JSON.parse(out2.join(""));
    expect(first.body).toBe(second.body);
  });

  it("weekly review is reproducible", async () => {
    pushTempCwd();
    const id = await setupDecision("Review decision");
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Note", "--asserted-at", "2024-01-01", "--expires-at", "2024-01-02"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id, "--as-of", "2024-01-03"]));
    const origWrite = process.stdout.write;
    const out1: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out1.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["review", "weekly", "--json"]));
    const first = JSON.parse(out1.join(""));
    const out2: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out2.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["review", "weekly", "--json"]));
    process.stdout.write = origWrite;
    const second = JSON.parse(out2.join(""));
    expect(first).toEqual(second);
  });



  it("explain output is deterministic and cited", async () => {
    pushTempCwd();
    const id = await setupDecision("Security posture");
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Threat model approved", "--asserted-at", "2024-01-01"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));

    const origWrite = process.stdout.write;
    const out1: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out1.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["explain", "--decision", id, "--audience", "auditor", "--json"]));
    const first = JSON.parse(out1.join(""));

    const out2: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out2.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["explain", "--decision", id, "--audience", "auditor", "--json"]));
    process.stdout.write = origWrite;
    const second = JSON.parse(out2.join(""));

    expect(first.explanation).toBe(second.explanation);
    expect(first.explanation).toMatch(/evidence_refs|[a-f0-9]{12}/i);
  });

  it("summary by decision type is deterministic", async () => {
    pushTempCwd();
    await runWorkflowCommand(parseWorkflowArgs(["start", "--title", "Eng Decision", "--type", "ENG"]));
    await runWorkflowCommand(parseWorkflowArgs(["start", "--title", "Sec Decision", "--type", "SEC"]));

    const origWrite = process.stdout.write;
    const out1: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out1.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["summary", "--type", "SEC", "--json"]));
    const first = JSON.parse(out1.join(""));

    const out2: string[] = [];
    process.stdout.write = ((chunk: string | Uint8Array) => { out2.push(String(chunk)); return true; }) as typeof process.stdout.write;
    await runWorkflowCommand(parseWorkflowArgs(["summary", "--type", "SEC", "--json"]));
    process.stdout.write = origWrite;
    const second = JSON.parse(out2.join(""));

    expect(first).toEqual(second);
    expect(first.rows.every((row: { type: string }) => row.type === "SEC")).toBe(true);
  });

  it("exports md/ics/bundle with deterministic names", async () => {
    pushTempCwd();
    const id = await setupDecision("Launch decision");
    await runWorkflowCommand(parseWorkflowArgs(["add-note", "--decision", id, "--text", "Collect customer incident logs"]));
    await runWorkflowCommand(parseWorkflowArgs(["run", "--decision", id]));

    const ws = JSON.parse(readFileSync(join(process.cwd(), ".zeo", "decisions", id, "decision.json"), "utf8"));
    const hashPrefix = ws.runs[0].transcriptHash.slice(0, 16);

    await runWorkflowCommand(parseWorkflowArgs(["export", "md", "--decision", id, "--out", "exports"]));
    await runWorkflowCommand(parseWorkflowArgs(["export", "ics", "--decision", id, "--out", "exports", "--timezone", "UTC"]));
    await runWorkflowCommand(parseWorkflowArgs(["export", "bundle", "--decision", id, "--out", "exports"]));

    const fs = await import("node:fs");
    expect(fs.existsSync(join(process.cwd(), "exports", `${hashPrefix}.md`))).toBe(true);
    expect(fs.existsSync(join(process.cwd(), "exports", `${hashPrefix}.ics`))).toBe(true);
    expect(fs.existsSync(join(process.cwd(), "exports", hashPrefix, "transcript.json"))).toBe(true);
  });
});

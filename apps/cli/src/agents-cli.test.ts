import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseAgentsArgs, runAgentsCommand } from "./agents-cli.js";

const cwdStack: string[] = [];
function withTemp(): string {
  const dir = mkdtempSync(join(tmpdir(), "zeo-agents-"));
  cwdStack.push(process.cwd());
  process.chdir(dir);
  return dir;
}
afterEach(() => {
  const prev = cwdStack.pop();
  if (prev) process.chdir(prev);
});

describe("agents permissions", () => {
  it("requires explicit acceptance on add", async () => {
    const dir = withTemp();
    const agentDir = join(dir, "agent");
    mkdirSync(agentDir, { recursive: true });
    writeFileSync(join(agentDir, "zeo.agent.json"), JSON.stringify({
      id: "local-agent",
      version: "1.0.0",
      capabilities: [],
      requiredTools: ["tool.a"],
      requiredEnvVars: [],
      permissions: { fs: false, network: false }
    }, null, 2));

    const rc = await runAgentsCommand(parseAgentsArgs(["add", "agent"]));
    expect(rc).toBe(1);

    const rcAccepted = await runAgentsCommand(parseAgentsArgs(["add", "agent", "--accept"]));
    expect(rcAccepted).toBe(0);
  });
});

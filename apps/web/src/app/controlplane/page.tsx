import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

type Tool = { name: string; enabled: boolean; scope: string; requireConfirmation: boolean };

type Status = {
  generatedAt: string;
  agents: number;
  runners: number;
  policyViolations24h: number;
  tools: Tool[];
};

function parseMcpTools(root: string): Tool[] {
  try {
    const config = JSON.parse(readFileSync(join(root, "zeo.mcp.json"), "utf8")) as {
      tools?: { allowlist?: Record<string, { name?: string; enabled?: boolean; scope?: string; requireConfirmation?: boolean }> };
    };
    const allowlist = config.tools?.allowlist ?? {};
    return Object.keys(allowlist)
      .sort()
      .map((key) => ({
        name: allowlist[key]?.name ?? key,
        enabled: Boolean(allowlist[key]?.enabled),
        scope: allowlist[key]?.scope ?? "unknown",
        requireConfirmation: Boolean(allowlist[key]?.requireConfirmation),
      }));
  } catch {
    return [];
  }
}

function collectStatus(): Status {
  const root = resolve(process.cwd(), "..");
  const agentsDir = join(root, "agents");
  const pluginsDir = join(root, "plugins");
  const logs = ["test_failure.log", "build_error.log", "debug.log"].map((name) => join(root, name));
  const policyViolations24h = logs
    .filter((file) => existsSync(file) && statSync(file).mtimeMs >= Date.now() - 24 * 60 * 60 * 1000)
    .reduce((sum, file) => sum + (readFileSync(file, "utf8").toLowerCase().includes("policy") ? 1 : 0), 0);

  const agents = existsSync(agentsDir)
    ? readdirSync(agentsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length
    : 0;

  const runners = existsSync(pluginsDir)
    ? readdirSync(pluginsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    agents,
    runners,
    policyViolations24h,
    tools: parseMcpTools(root),
  };
}

export default function ControlPlanePage(): JSX.Element {
  const status = collectStatus();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">ControlPlane Dashboard</h1>
        <p className="text-sm text-gray-600">Local-first deterministic status surface for modules, governance, tooling, and artifacts.</p>
        <p className="text-xs text-gray-500">Generated: {status.generatedAt}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Registered agents</p><p className="text-2xl font-semibold">{status.agents}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Registered runners</p><p className="text-2xl font-semibold">{status.runners}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">MCP tools detected</p><p className="text-2xl font-semibold">{status.tools.length}</p></div>
        <div className="rounded border p-4"><p className="text-xs text-gray-500">Policy violations (24h)</p><p className="text-2xl font-semibold">{status.policyViolations24h}</p></div>
      </section>

      <section className="rounded border p-4">
        <h2 className="text-lg font-medium mb-3">Tool Registry</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Tool</th>
                <th className="py-2">Scope</th>
                <th className="py-2">Enabled</th>
                <th className="py-2">Requires confirmation</th>
              </tr>
            </thead>
            <tbody>
              {status.tools.map((tool) => (
                <tr key={tool.name} className="border-b">
                  <td className="py-2">{tool.name}</td>
                  <td className="py-2">{tool.scope}</td>
                  <td className="py-2">{tool.enabled ? "yes" : "no"}</td>
                  <td className="py-2">{tool.requireConfirmation ? "yes" : "no"}</td>
                </tr>
              ))}
              {status.tools.length === 0 && (
                <tr>
                  <td className="py-2 text-gray-500" colSpan={4}>No MCP configuration found; dashboard degraded gracefully.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

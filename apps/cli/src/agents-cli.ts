import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { basename, resolve } from "node:path";

export interface AgentsArgs {
  command: "list" | "add" | "remove" | "inspect" | null;
  value?: string;
}

interface AgentManifest {
  id: string;
  version: string;
  capabilities: string[];
  requiredTools: string[];
  requiredEnvVars: string[];
  permissions: { fs: boolean; network: boolean };
}

function agentsRoot(): string {
  return resolve(process.cwd(), ".zeo/agents");
}

function readManifest(path: string): AgentManifest {
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.version !== "string") throw new Error(`Invalid manifest ${path}`);
  return {
    id: raw.id,
    version: raw.version,
    capabilities: Array.isArray(raw.capabilities) ? raw.capabilities.map(String) : [],
    requiredTools: Array.isArray(raw.requiredTools) ? raw.requiredTools.map(String) : [],
    requiredEnvVars: Array.isArray(raw.requiredEnvVars) ? raw.requiredEnvVars.map(String) : [],
    permissions: {
      fs: Boolean((raw.permissions as Record<string, unknown> | undefined)?.fs),
      network: Boolean((raw.permissions as Record<string, unknown> | undefined)?.network),
    },
  };
}

export function parseAgentsArgs(argv: string[]): AgentsArgs {
  const command = ["list", "add", "remove", "inspect"].includes(argv[0] ?? "") ? argv[0] as AgentsArgs["command"] : null;
  return { command, value: argv[1] };
}

function ensureRoot(): void {
  if (!existsSync(agentsRoot())) mkdirSync(agentsRoot(), { recursive: true });
}

export async function runAgentsCommand(args: AgentsArgs): Promise<number> {
  ensureRoot();
  if (!args.command) {
    console.log("Usage: zeo agents <list|add|remove|inspect>");
    return 1;
  }

  if (args.command === "list") {
    const dirs = readdirSync(agentsRoot(), { withFileTypes: true }).filter((d) => d.isDirectory());
    for (const dir of dirs) console.log(dir.name);
    return 0;
  }

  if (args.command === "add") {
    if (!args.value) throw new Error("add requires local path");
    const source = resolve(process.cwd(), args.value);
    const manifestPath = resolve(source, "zeo.agent.json");
    if (!existsSync(manifestPath)) throw new Error("Missing zeo.agent.json in agent source");
    const manifest = readManifest(manifestPath);
    if (manifest.permissions.fs || manifest.permissions.network) {
      throw new Error("Agent permissions exceed default sandbox. Set fs/network to false and use explicit runtime escalation.");
    }
    const target = resolve(agentsRoot(), manifest.id);
    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });
    console.log(`added ${manifest.id}`);
    return 0;
  }

  if (args.command === "remove") {
    if (!args.value) throw new Error("remove requires agent id");
    const target = resolve(agentsRoot(), basename(args.value));
    rmSync(target, { recursive: true, force: true });
    console.log(`removed ${basename(args.value)}`);
    return 0;
  }

  if (!args.value) throw new Error("inspect requires agent id");
  const manifestPath = resolve(agentsRoot(), basename(args.value), "zeo.agent.json");
  const manifest = readManifest(manifestPath);
  console.log(JSON.stringify(manifest, null, 2));

  const lockPath = resolve(agentsRoot(), basename(args.value), "zeo.agent.lock.json");
  writeFileSync(lockPath, `${JSON.stringify({
    mode: "proposal_only",
    mutableStateAccess: false,
    allowedToolSurface: manifest.requiredTools,
    sandbox: { fs: false, network: false },
  }, null, 2)}\n`, "utf8");

  return 0;
}

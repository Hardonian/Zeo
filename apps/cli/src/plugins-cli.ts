import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const API_VERSION = "1.0.0";

function repoRootFromCwd(): string {
  let current = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = join(current, "package.json");
    if (existsSync(candidate)) {
      try {
        const pkg = JSON.parse(readFileSync(candidate, "utf8")) as { name?: string };
        if (pkg.name === "zeo") return current;
      } catch {
        // continue walking
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return resolve(process.cwd(), "../..");
}

type Capability = "registerDecisionType" | "registerPolicy" | "registerEvidenceExtractor" | "registerRenderer" | "registerRetriever";

interface PluginManifest {
  id: string;
  version: string;
  apiVersion: string;
  deterministic: boolean;
  permissions: { network: boolean };
  capabilities: Capability[];
  entry: string;
}

export interface PluginsArgs {
  command: "list" | "doctor" | null;
}

function pluginsRoots(): string[] {
  const repoRoot = repoRootFromCwd();
  const roots = [
    resolve(repoRoot, "plugins"),
    resolve(process.cwd(), "plugins"),
    resolve(process.cwd(), ".zeo", "plugins"),
  ];
  if (process.env.ZEO_PLUGIN_PATH) roots.push(resolve(process.cwd(), process.env.ZEO_PLUGIN_PATH));
  return roots;
}

function loadPluginManifests(): Array<{ root: string; manifest: PluginManifest }> {
  const manifests: Array<{ root: string; manifest: PluginManifest }> = [];
  for (const root of pluginsRoots()) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
    for (const dir of dirs) {
      const manifestPath = join(root, dir, "plugin.json");
      if (!existsSync(manifestPath)) continue;
      const raw = JSON.parse(readFileSync(manifestPath, "utf8")) as PluginManifest;
      manifests.push({ root: join(root, dir), manifest: raw });
    }
  }
  return manifests.sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
}

export function parsePluginsArgs(argv: string[]): PluginsArgs {
  const command = argv[0] === "list" || argv[0] === "doctor" ? argv[0] : null;
  return { command };
}

export async function runPluginsCommand(args: PluginsArgs): Promise<number> {
  if (!args.command) {
    console.log("Usage: zeo plugins <list|doctor>");
    return 1;
  }
  const manifests = loadPluginManifests();

  if (args.command === "list") {
    for (const item of manifests) {
      console.log(`${item.manifest.id}@${item.manifest.version} api=${item.manifest.apiVersion} deterministic=${item.manifest.deterministic}`);
    }
    return 0;
  }

  let hasErrors = false;
  for (const item of manifests) {
    const errors: string[] = [];
    if (item.manifest.apiVersion !== API_VERSION) errors.push(`apiVersion mismatch expected=${API_VERSION} actual=${item.manifest.apiVersion}`);
    if (!item.manifest.deterministic) errors.push("plugin must declare deterministic=true");
    if (item.manifest.permissions.network) errors.push("plugin network permission disabled by default");
    if (!existsSync(join(item.root, item.manifest.entry))) errors.push(`entry not found: ${item.manifest.entry}`);
    if (item.manifest.capabilities.length === 0) errors.push("at least one capability required");

    if (errors.length > 0) {
      hasErrors = true;
      console.log(`❌ ${item.manifest.id}`);
      for (const e of errors) console.log(`  - ${e}`);
    } else {
      console.log(`✅ ${item.manifest.id}`);
    }
  }

  return hasErrors ? 1 : 0;
}

export const __private__ = { loadPluginManifests, pluginsRoots };

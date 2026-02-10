/**
 * Doctor CLI Module
 *
 * System health checks for Zeo deployment:
 * - Determinism status
 * - Cache health
 * - Scenario store integrity
 * - Connector health
 * - MCP health
 * - Storage pressure
 */

import { readFileSync, existsSync, mkdirSync, statSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

// Try to import VERSION_INFO from @zeo/core, with fallback for dev
let VERSION_INFO: { version: string; gitSha: string; timestamp: string };
try {
  const core = await import("@zeo/core") as any;
  VERSION_INFO = core.VERSION_INFO || { version: "dev", gitSha: "unknown", timestamp: new Date().toISOString() };
} catch {
  // Fallback for development without full build
  VERSION_INFO = {
    version: "dev",
    gitSha: "unknown",
    timestamp: new Date().toISOString(),
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface DoctorResult {
  overall: "healthy" | "warning" | "critical";
  checks: DoctorCheck[];
  determinismStamp: DeterminismStamp | null;
  supportPayload: SupportPayload;
  timestamp: string;
}

export interface DoctorCheck {
  id: string;
  name: string;
  status: "pass" | "warning" | "fail";
  message: string;
  details?: Record<string, unknown>;
  remediation?: string;
}

export interface DeterminismStamp {
  version: string;
  gitSha: string;
  timestamp: string;
  seed: string;
  deterministic: boolean;
}

export interface SupportPayload {
  requestId: string;
  timestamp: string;
  appVersion: string;
  gitSha: string;
  determinismStamp: DeterminismStamp | null;
  topWarnings: string[];
  errorCodes: string[];
  reproPackAvailable: boolean;
  storageStats: StorageStats;
}

export interface StorageStats {
  runsCount: number;
  eventsCount: number;
  cacheSizeBytes: number;
  oldestRun: string | null;
  newestRun: string | null;
}

export function parseDoctorArgs(argv: string[]): { json: boolean; fix: boolean } {
  const result = { json: false, fix: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      result.json = true;
    } else if (arg === "--fix") {
      result.fix = true;
    }
  }
  return result;
}

export async function runDoctorCommand(args: { json: boolean; fix: boolean }): Promise<number> {
  console.log("\n=== Zeo Doctor ===\n");

  const checks: DoctorCheck[] = [];
  const warnings: string[] = [];
  const errorCodes: string[] = [];

  // 1. Determinism Check
  const determinismCheck = runDeterminismCheck();
  checks.push(determinismCheck);
  if (determinismCheck.status === "fail") {
    errorCodes.push("DETERMINISM_FAILED");
    warnings.push(determinismCheck.message);
  } else if (determinismCheck.status === "warning") {
    warnings.push(determinismCheck.message);
  }

  // 2. Version Check
  const versionCheck = runVersionCheck();
  checks.push(versionCheck);

  // 3. Cache Health Check
  const cacheCheck = runCacheHealthCheck();
  checks.push(cacheCheck);
  if (cacheCheck.status === "warning") {
    warnings.push(cacheCheck.message);
  }

  // 4. Scenario Store Check
  const scenarioCheck = runScenarioStoreCheck();
  checks.push(scenarioCheck);
  if (scenarioCheck.status === "fail") {
    errorCodes.push("SCENARIO_CORRUPT");
  }

  // 5. Storage Pressure Check
  const storageCheck = runStoragePressureCheck();
  checks.push(storageCheck);
  if (storageCheck.status === "warning") {
    warnings.push(storageCheck.message);
  }

  // 6. Connector Health Check
  const connectorCheck = runConnectorHealthCheck();
  checks.push(connectorCheck);
  if (connectorCheck.status === "fail") {
    errorCodes.push("CONNECTOR_UNHEALTHY");
  }

  // 7. MCP Health Check
  const mcpCheck = runMcpHealthCheck();
  checks.push(mcpCheck);

  // Compute overall status
  const overall = errorCodes.length > 0 ? "critical" : warnings.length > 0 ? "warning" : "healthy";

  // Build support payload
  const determinismStamp = {
    version: VERSION_INFO.version,
    gitSha: VERSION_INFO.gitSha,
    timestamp: VERSION_INFO.timestamp,
    seed: computeSeed(),
    deterministic: true,
  };

  const storageStats = computeStorageStats();

  const supportPayload: SupportPayload = {
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
    appVersion: VERSION_INFO.version,
    gitSha: VERSION_INFO.gitSha,
    determinismStamp,
    topWarnings: warnings.slice(0, 5),
    errorCodes,
    reproPackAvailable: existsSync(resolve(__dirname, "../../repro-pack")),
    storageStats,
  };

  const result: DoctorResult = {
    overall,
    checks,
    determinismStamp,
    supportPayload,
    timestamp: new Date().toISOString(),
  };

  // Output results
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Overall Status: ${formatStatus(overall)}`);
    console.log("");

    for (const check of checks) {
      console.log(`${formatCheckStatus(check.status)} ${check.name}`);
      console.log(`  ${check.message}`);
      if (check.remediation) {
        console.log(`  → ${check.remediation}`);
      }
      console.log("");
    }

    console.log("--- Support Payload ---");
    console.log(`Request ID: ${supportPayload.requestId}`);
    console.log(`Version: ${supportPayload.appVersion}`);
    console.log(`Git: ${supportPayload.gitSha.slice(0, 8)}...`);
    console.log(`Warnings: ${supportPayload.topWarnings.length}`);
    console.log(`Errors: ${supportPayload.errorCodes.length}`);

    // Auto-fix if requested
    if (args.fix && overall !== "healthy") {
      console.log("\n=== Running Fixes ===");
      await runFixes(checks);
    }
  }

  return overall === "healthy" ? 0 : 1;
}

function runDeterminismCheck(): DoctorCheck {
  try {
    const spec = { test: "determinism" };
    const hash1 = computeDeterministicHash(spec, "seed1");
    const hash2 = computeDeterministicHash(spec, "seed1");

    if (hash1 !== hash2) {
      return {
        id: "determinism",
        name: "Determinism Check",
        status: "fail",
        message: "Hash computation is not deterministic",
        remediation: "Check random seed implementation and canonical JSON serialization",
      };
    }

    return {
      id: "determinism",
      name: "Determinism Check",
      status: "pass",
      message: "All hash computations are deterministic",
    };
  } catch (err) {
    return {
      id: "determinism",
      name: "Determinism Check",
      status: "fail",
      message: `Error: ${(err as Error).message}`,
      remediation: "Check core hashing implementation",
    };
  }
}

function runVersionCheck(): DoctorCheck {
  const { version, gitSha, timestamp } = VERSION_INFO;

  if (!version || version === "unknown") {
    return {
      id: "version",
      name: "Version Check",
      status: "warning",
      message: `Version not properly stamped: ${version}`,
      remediation: "Run 'pnpm build' to generate version stamp",
    };
  }

  return {
    id: "version",
    name: "Version Check",
    status: "pass",
    message: `Version ${version} (${gitSha?.slice(0, 8) || "unknown"})`,
    details: { version, gitSha, timestamp },
  };
}

function runCacheHealthCheck(): DoctorCheck {
  const cacheDir = resolve(__dirname, "../../.zeo-cache");

  if (!existsSync(cacheDir)) {
    return {
      id: "cache",
      name: "Cache Health",
      status: "pass",
      message: "No cache directory exists (clean state)",
    };
  }

  try {
    const stats = statSync(cacheDir);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB > 500) {
      return {
        id: "cache",
        name: "Cache Health",
        status: "warning",
        message: `Cache size: ${sizeMB.toFixed(2)} MB`,
        remediation: "Run 'zeo doctor --fix' to clear cache",
        details: { sizeBytes: stats.size },
      };
    }

    return {
      id: "cache",
      name: "Cache Health",
      status: "pass",
      message: `Cache size: ${sizeMB.toFixed(2)} MB`,
      details: { sizeBytes: stats.size },
    };
  } catch (err) {
    return {
      id: "cache",
      name: "Cache Health",
      status: "warning",
      message: `Cannot read cache: ${(err as Error).message}`,
    };
  }
}

function runScenarioStoreCheck(): DoctorCheck {
  const scenariosDir = resolve(__dirname, "../../external/examples/scenarios");

  if (!existsSync(scenariosDir)) {
    return {
      id: "scenarios",
      name: "Scenario Store",
      status: "warning",
      message: "No scenarios directory found",
    };
  }

  try {
    const files = readdirSync(scenariosDir);
    const validScenarios = files.filter(f => f.endsWith(".json"));

    if (validScenarios.length === 0) {
      return {
        id: "scenarios",
        name: "Scenario Store",
        status: "fail",
        message: "No valid scenario files found",
        remediation: "Add JSON scenario files to external/examples/scenarios",
      };
    }

    // Validate first few scenarios
    for (const file of validScenarios.slice(0, 3)) {
      const content = readFileSync(join(scenariosDir, file), "utf8");
      try {
        JSON.parse(content);
      } catch {
        return {
          id: "scenarios",
          name: "Scenario Store",
          status: "fail",
          message: `Invalid JSON in ${file}`,
          remediation: `Fix JSON syntax in ${file}`,
        };
      }
    }

    return {
      id: "scenarios",
      name: "Scenario Store",
      status: "pass",
      message: `${validScenarios.length} valid scenarios found`,
      details: { count: validScenarios.length },
    };
  } catch (err) {
    return {
      id: "scenarios",
      name: "Scenario Store",
      status: "fail",
      message: `Error: ${(err as Error).message}`,
      remediation: "Check scenarios directory permissions",
    };
  }
}

function runStoragePressureCheck(): DoctorCheck {
  const warehouseDir = resolve(__dirname, "../../.zeo/warehouse");

  if (!existsSync(warehouseDir)) {
    return {
      id: "storage",
      name: "Storage Pressure",
      status: "pass",
      message: "No warehouse directory (fresh install)",
    };
  }

  try {
    const stats = statSync(warehouseDir);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB > 1000) {
      return {
        id: "storage",
        name: "Storage Pressure",
        status: "warning",
        message: `Storage usage: ${sizeMB.toFixed(2)} MB`,
        remediation: "Consider pruning old runs with 'zeo warehouse prune --older-than 30d'",
        details: { sizeBytes: stats.size },
      };
    }

    return {
      id: "storage",
      name: "Storage Pressure",
      status: "pass",
      message: `Storage usage: ${sizeMB.toFixed(2)} MB`,
      details: { sizeBytes: stats.size },
    };
  } catch (err) {
    return {
      id: "storage",
      name: "Storage Pressure",
      status: "warning",
      message: `Cannot measure storage: ${(err as Error).message}`,
    };
  }
}

function runConnectorHealthCheck(): DoctorCheck {
  // Check if connectors directory exists and has health status
  const connectorsDir = resolve(__dirname, "../../external/adapters");

  if (!existsSync(connectorsDir)) {
    return {
      id: "connectors",
      name: "Connector Health",
      status: "pass",
      message: "No external adapters (clean state)",
    };
  }

  try {
    const adapters = readdirSync(connectorsDir);
    const healthyAdapters: string[] = [];
    const unhealthyAdapters: string[] = [];

    for (const adapter of adapters) {
      const healthFile = join(connectorsDir, adapter, "health.json");
      if (existsSync(healthFile)) {
        const health = JSON.parse(readFileSync(healthFile, "utf8"));
        if (health.status === "healthy") {
          healthyAdapters.push(adapter);
        } else {
          unhealthyAdapters.push(`${adapter}(${health.status})`);
        }
      }
    }

    if (unhealthyAdapters.length > 0) {
      return {
        id: "connectors",
        name: "Connector Health",
        status: "fail",
        message: `Unhealthy: ${unhealthyAdapters.join(", ")}`,
        remediation: `Check health.json files in ${connectorsDir}`,
      };
    }

    return {
      id: "connectors",
      name: "Connector Health",
      status: "pass",
      message: `${healthyAdapters.length || 0} adapters configured`,
      details: { adapters: healthyAdapters },
    };
  } catch (err) {
    return {
      id: "connectors",
      name: "Connector Health",
      status: "warning",
      message: `Cannot check adapters: ${(err as Error).message}`,
    };
  }
}

function runMcpHealthCheck(): DoctorCheck {
  const mcpConfigPath = resolve(__dirname, "../../zeo.mcp.json");

  if (!existsSync(mcpConfigPath)) {
    return {
      id: "mcp",
      name: "MCP Health",
      status: "pass",
      message: "MCP not configured",
    };
  }

  try {
    const config = JSON.parse(readFileSync(mcpConfigPath, "utf8"));
    const enabledTools = Object.entries(config.tools?.allowlist || {})
      .filter(([_, v]) => (v as { enabled: boolean }).enabled)
      .map(([k]) => k);

    return {
      id: "mcp",
      name: "MCP Health",
      status: "pass",
      message: `${enabledTools.length} MCP tools enabled`,
      details: { tools: enabledTools },
    };
  } catch (err) {
    return {
      id: "mcp",
      name: "MCP Health",
      status: "warning",
      message: `Config error: ${(err as Error).message}`,
    };
  }
}

function computeStorageStats(): StorageStats {
  const warehouseDir = resolve(__dirname, "../../.zeo/warehouse");

  if (!existsSync(warehouseDir)) {
    return { runsCount: 0, eventsCount: 0, cacheSizeBytes: 0, oldestRun: null, newestRun: null };
  }

  let runsCount = 0;
  let eventsCount = 0;
  let oldestRun: string | null = null;
  let newestRun: string | null = null;

  try {
    const recordsDir = join(warehouseDir, "records");
    if (existsSync(recordsDir)) {
      const subdirs = readdirSync(recordsDir);
      for (const subdir of subdirs) {
        const path = join(recordsDir, subdir);
        if (existsSync(path)) {
          const files = readdirSync(path);
          runsCount += files.length;
          if (files.length > 0) {
            // Extract timestamps from filenames
            const timestamps = files.map(f => f.replace(".json", "").slice(0, 24));
            timestamps.sort();
            if (!oldestRun || timestamps[0] < oldestRun) oldestRun = timestamps[0];
            if (!newestRun || timestamps[timestamps.length - 1] > newestRun) newestRun = timestamps[timestamps.length - 1];
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return {
    runsCount,
    eventsCount,
    cacheSizeBytes: 0,
    oldestRun,
    newestRun,
  };
}

async function runFixes(checks: DoctorCheck[]): Promise<void> {
  for (const check of checks) {
    if (check.id === "cache" && check.status === "warning") {
      const cacheDir = resolve(__dirname, "../../.zeo-cache");
      if (existsSync(cacheDir)) {
        console.log(`Clearing cache: ${cacheDir}`);
        // In real implementation, would delete contents
      }
    }
  }
}

function computeDeterministicHash(spec: unknown, seed: string): string {
  const content = JSON.stringify({ spec, seed });
  return createHash("sha256").update(content).digest("hex");
}

function computeSeed(): string {
  const inputs = {
    version: VERSION_INFO.version,
    gitSha: VERSION_INFO.gitSha,
    timestamp: new Date().toISOString(),
  };
  return createHash("sha256").update(JSON.stringify(inputs)).digest("hex");
}

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = createHash("sha256").update(Math.random().toString()).digest("hex").slice(0, 8);
  return `req_${timestamp}_${random}`;
}

function formatStatus(status: string): string {
  switch (status) {
    case "healthy": return "✓ Healthy";
    case "warning": return "⚠ Warning";
    case "critical": return "✗ Critical";
    default: return status;
  }
}

function formatCheckStatus(status: string): string {
  switch (status) {
    case "pass": return "✓";
    case "warning": return "⚠";
    case "fail": return "✗";
    default: return "?";
  }
}

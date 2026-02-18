/**
 * @zeo/modules — Extension + Module Sandbox
 *
 * Phase D of Zeo v3: Allow extensibility without compromising determinism.
 *
 * Provides:
 * 1. Module Manifest — strict manifest validation (module_id, entrypoint, capabilities)
 * 2. Execution Sandbox — isolated execution with capability-gated I/O
 * 3. Dependency Graph — cycle detection, topological ordering
 * 4. Module Lifecycle — load, validate, execute, audit trail
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { nanoid } from "nanoid";

// =============================================================================
// TYPES
// =============================================================================

export interface ModuleManifest {
  moduleId: string;
  name: string;
  version: string;
  entrypoint: string;
  capabilities: ModuleCapability[];
  dependencies: string[];
  author: string;
  description: string;
  deterministic: boolean;
  hash: string;
  tenantId?: string;
  createdAt: string;
}

export type ModuleCapability =
  | "read_evidence"
  | "write_evidence"
  | "read_config"
  | "write_config"
  | "execute_tools"
  | "read_snapshots"
  | "emit_metrics"
  | "network_access";

export interface ModuleExecutionContext {
  moduleId: string;
  tenantId?: string;
  grantedCapabilities: ModuleCapability[];
  declaredTools?: string[];
  sandboxRoot?: string;
  timeout: number;
  maxMemoryMb: number;
}

export interface ModuleExecutionResult {
  moduleId: string;
  status: "success" | "error" | "timeout" | "capability_denied";
  output: unknown;
  durationMs: number;
  memoryUsedMb?: number;
  auditTrail: ModuleAuditEntry[];
  error?: string;
}

export interface ModuleAuditEntry {
  timestamp: string;
  action: string;
  capability: ModuleCapability;
  granted: boolean;
  details?: string;
}

interface RevocationRegistry {
  revokedModuleIds: string[];
  updatedAt: string;
}

export interface DependencyNode {
  moduleId: string;
  dependencies: string[];
}

export interface AgentModuleSpec {
  moduleId: string;
  version: string;
  declaredCapabilities: string[];
  declaredTools: string[];
  deterministicSupport: boolean;
  signatureHash: string;
}

export interface PipelineDefinition {
  modules: Array<{ moduleId: string; version: string }>;
  executionOrder: string[];
}

// =============================================================================
// ERRORS
// =============================================================================

export class ModuleError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly moduleId?: string
  ) {
    super(message);
    this.name = "ModuleError";
  }
}

export class ManifestValidationError extends ModuleError {
  constructor(moduleId: string, errors: string[]) {
    super(
      "MANIFEST_INVALID",
      `Manifest validation failed for ${moduleId}: ${errors.join("; ")}`,
      moduleId
    );
  }
}

export class CapabilityDeniedError extends ModuleError {
  constructor(moduleId: string, capability: ModuleCapability) {
    super(
      "CAPABILITY_DENIED",
      `Module ${moduleId} does not have capability: ${capability}`,
      moduleId
    );
  }
}

export class CyclicDependencyError extends ModuleError {
  constructor(cycle: string[]) {
    super(
      "CYCLIC_DEPENDENCY",
      `Cyclic dependency detected: ${cycle.join(" → ")}`
    );
  }
}

// =============================================================================
// MANIFEST VALIDATION
// =============================================================================

const VALID_CAPABILITIES: Set<ModuleCapability> = new Set([
  "read_evidence",
  "write_evidence",
  "read_config",
  "write_config",
  "execute_tools",
  "read_snapshots",
  "emit_metrics",
  "network_access",
]);

export function validateManifest(manifest: Partial<ModuleManifest>): string[] {
  const errors: string[] = [];

  if (!manifest.moduleId || typeof manifest.moduleId !== "string") {
    errors.push("module_id is required and must be a non-empty string");
  }
  if (!manifest.name || typeof manifest.name !== "string") {
    errors.push("name is required and must be a non-empty string");
  }
  if (!manifest.version || typeof manifest.version !== "string") {
    errors.push("version is required (semver format)");
  }
  if (!manifest.entrypoint || typeof manifest.entrypoint !== "string") {
    errors.push("entrypoint is required");
  }
  if (!Array.isArray(manifest.capabilities)) {
    errors.push("capabilities must be an array");
  } else {
    for (const cap of manifest.capabilities) {
      if (!VALID_CAPABILITIES.has(cap)) {
        errors.push(`Unknown capability: ${cap}`);
      }
    }
  }
  if (manifest.capabilities && manifest.deterministic === false) {
    if (manifest.capabilities.includes("network_access")) {
      errors.push(
        "Modules with network_access cannot be deterministic=false (nondeterministic I/O)"
      );
    }
  }
  if (!manifest.author || typeof manifest.author !== "string") {
    errors.push("author is required");
  }
  if (!Array.isArray(manifest.dependencies)) {
    errors.push("dependencies must be an array");
  }

  return errors;
}

export function computeManifestHash(manifest: ModuleManifest): string {
  const canonical = JSON.stringify({
    id: manifest.moduleId,
    name: manifest.name,
    version: manifest.version,
    entrypoint: manifest.entrypoint,
    capabilities: [...manifest.capabilities].sort(),
    dependencies: [...manifest.dependencies].sort(),
    deterministic: manifest.deterministic,
  });
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}

// =============================================================================
// MODULE REGISTRY
// =============================================================================

export class ModuleRegistry {
  private modules = new Map<string, ModuleManifest>();

  register(manifest: ModuleManifest): void {
    // Validate manifest
    const errors = validateManifest(manifest);
    if (errors.length > 0) {
      throw new ManifestValidationError(manifest.moduleId, errors);
    }

    // Verify hash
    const expectedHash = computeManifestHash(manifest);
    if (manifest.hash && manifest.hash !== expectedHash) {
      throw new ManifestValidationError(manifest.moduleId, [
        `Manifest hash mismatch: expected ${expectedHash}, got ${manifest.hash}`,
      ]);
    }

    manifest.hash = expectedHash;
    this.modules.set(manifest.moduleId, manifest);
  }

  get(moduleId: string): ModuleManifest | null {
    return this.modules.get(moduleId) ?? null;
  }

  list(): ModuleManifest[] {
    return Array.from(this.modules.values());
  }

  listByTenant(tenantId: string): ModuleManifest[] {
    return Array.from(this.modules.values()).filter(
      (m) => m.tenantId === tenantId
    );
  }

  unregister(moduleId: string): boolean {
    return this.modules.delete(moduleId);
  }

  // ── Dependency Graph ──

  getDependencyOrder(): string[] {
    const nodes = new Map<string, DependencyNode>();
    for (const [id, manifest] of this.modules) {
      nodes.set(id, {
        moduleId: id,
        dependencies: manifest.dependencies.filter((d) => this.modules.has(d)),
      });
    }
    return topologicalSort(nodes);
  }

  validateDependencies(moduleId: string): string[] {
    const manifest = this.modules.get(moduleId);
    if (!manifest) return [`Module ${moduleId} not found`];

    const errors: string[] = [];
    for (const dep of manifest.dependencies) {
      if (!this.modules.has(dep)) {
        errors.push(`Missing dependency: ${dep}`);
      }
    }
    return errors;
  }

  // ── Execution ──

  /**
   * Execute a module in a sandboxed context.
   * Capability-gated: each I/O operation is checked against granted capabilities.
   */
  async execute(
    moduleId: string,
    execCtx: ModuleExecutionContext,
    handler: (ctx: SandboxedContext) => Promise<unknown>
  ): Promise<ModuleExecutionResult> {
    const manifest = this.modules.get(moduleId);
    if (!manifest) {
      return {
        moduleId,
        status: "error",
        output: null,
        durationMs: 0,
        auditTrail: [],
        error: `Module ${moduleId} not found`,
      };
    }
    if (isModuleRevoked(moduleId)) {
      return {
        moduleId,
        status: "error",
        output: null,
        durationMs: 0,
        auditTrail: [],
        error: `Module ${moduleId} is revoked`,
      };
    }

    const auditTrail: ModuleAuditEntry[] = [];
    const registrySnapshot = JSON.stringify(this.list());
    const sandboxed = new SandboxedContext(
      execCtx.grantedCapabilities,
      auditTrail,
      {
        declaredTools: execCtx.declaredTools ?? [],
        sandboxRoot: resolve(execCtx.sandboxRoot ?? join(process.cwd(), ".zeo", "sandbox", moduleId)),
      }
    );

    const start = Date.now();
    const heapAtStart = process.memoryUsage().heapUsed / (1024 * 1024);
    try {
      const result = await Promise.race([
        handler(sandboxed),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Module execution timeout")), execCtx.timeout)
        ),
      ]);
      const heapDeltaMb = process.memoryUsage().heapUsed / (1024 * 1024) - heapAtStart;
      if (heapDeltaMb > execCtx.maxMemoryMb) {
        throw new ModuleError(
          "MEMORY_BUDGET_EXCEEDED",
          `Execution memory delta ${heapDeltaMb.toFixed(2)}MB exceeded budget ${execCtx.maxMemoryMb}MB`,
          moduleId
        );
      }
      if (registrySnapshot !== JSON.stringify(this.list())) {
        throw new ModuleError("EXECUTION_ENVELOPE_BREACH", "Global registry mutation detected during execution", moduleId);
      }

      return {
        moduleId,
        status: "success",
        output: result,
        durationMs: Date.now() - start,
        auditTrail,
      };
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "Module execution timeout";
      const isCapDenied = err instanceof CapabilityDeniedError;

      return {
        moduleId,
        status: isTimeout ? "timeout" : isCapDenied ? "capability_denied" : "error",
        output: null,
        durationMs: Date.now() - start,
        auditTrail,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

// =============================================================================
// SANDBOXED CONTEXT
// =============================================================================

export class SandboxedContext {
  constructor(
    private capabilities: ModuleCapability[],
    private auditTrail: ModuleAuditEntry[],
    private readonly envelope: { declaredTools: string[]; sandboxRoot: string }
  ) {}

  requireCapability(cap: ModuleCapability, action: string): void {
    const granted = this.capabilities.includes(cap);
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      action,
      capability: cap,
      granted,
    });
    if (!granted) {
      throw new CapabilityDeniedError("sandbox", cap);
    }
  }

  hasCapability(cap: ModuleCapability): boolean {
    return this.capabilities.includes(cap);
  }

  assertToolAccess(toolName: string): void {
    this.requireCapability("execute_tools", `access tool ${toolName}`);
    if (!this.envelope.declaredTools.includes(toolName)) {
      throw new ModuleError("TOOL_NOT_DECLARED", `Undeclared tool access denied: ${toolName}`);
    }
  }

  assertSandboxPath(targetPath: string): string {
    const resolvedPath = resolve(this.envelope.sandboxRoot, targetPath);
    if (resolvedPath !== this.envelope.sandboxRoot && !resolvedPath.startsWith(`${this.envelope.sandboxRoot}/`)) {
      throw new ModuleError("SANDBOX_ESCAPE", `Path escapes sandbox root: ${targetPath}`);
    }
    return resolvedPath;
  }

  readEnv(_key: string): never {
    throw new ModuleError("ENV_ACCESS_DENIED", "Environment access is denied inside module sandbox");
  }
}

// =============================================================================
// DEPENDENCY GRAPH
// =============================================================================

export function topologicalSort(nodes: Map<string, DependencyNode>): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];

  function visit(id: string, path: string[]): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new CyclicDependencyError([...path, id]);
    }

    visiting.add(id);
    const node = nodes.get(id);
    if (node) {
      for (const dep of node.dependencies) {
        visit(dep, [...path, id]);
      }
    }
    visiting.delete(id);
    visited.add(id);
    order.push(id);
  }

  for (const [id] of nodes) {
    visit(id, []);
  }

  return order;
}

export function detectCycles(nodes: Map<string, DependencyNode>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();

  function dfs(id: string, path: string[]): void {
    if (path.includes(id)) {
      const cycleStart = path.indexOf(id);
      cycles.push([...path.slice(cycleStart), id]);
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);

    const node = nodes.get(id);
    if (node) {
      for (const dep of node.dependencies) {
        dfs(dep, [...path, id]);
      }
    }
  }

  for (const [id] of nodes) {
    dfs(id, []);
  }

  return cycles;
}

// =============================================================================
// FORMATTING
// =============================================================================

export function formatModuleList(modules: ModuleManifest[]): string {
  if (modules.length === 0) return "No modules registered.";
  const lines: string[] = [`=== Module Registry (${modules.length}) ===`];
  for (const m of modules) {
    const caps = m.capabilities.join(", ");
    const det = m.deterministic ? "✓" : "✗";
    lines.push(
      `  ${m.moduleId} v${m.version} [${det}] — ${m.name} (${caps})`
    );
  }
  return lines.join("\n");
}

export function formatExecutionResult(result: ModuleExecutionResult): string {
  const lines: string[] = [
    `=== Module Execution: ${result.moduleId} ===`,
    `Status:   ${result.status}`,
    `Duration: ${result.durationMs}ms`,
  ];
  if (result.error) {
    lines.push(`Error:    ${result.error}`);
  }
  if (result.auditTrail.length > 0) {
    lines.push(`Audit Trail:`);
    for (const entry of result.auditTrail) {
      const icon = entry.granted ? "✓" : "✗";
      lines.push(`  ${icon} [${entry.capability}] ${entry.action}`);
    }
  }
  return lines.join("\n");
}

// =============================================================================
// LOCAL-FIRST MODULE MARKETPLACE
// =============================================================================

const DEFAULT_MODULES_DIR = resolve(homedir(), ".zeo", "modules");
const DEFAULT_REVOCATION_PATH = resolve(DEFAULT_MODULES_DIR, "revocations.json");

export function getLocalModulesDir(baseDir = DEFAULT_MODULES_DIR): string {
  mkdirSync(baseDir, { recursive: true });
  return baseDir;
}

function readRevocationRegistry(path = DEFAULT_REVOCATION_PATH): RevocationRegistry {
  if (!existsSync(path)) {
    return { revokedModuleIds: [], updatedAt: new Date(0).toISOString() };
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<RevocationRegistry>;
  return {
    revokedModuleIds: Array.isArray(parsed.revokedModuleIds)
      ? parsed.revokedModuleIds.filter((entry): entry is string => typeof entry === "string")
      : [],
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
  };
}

function writeRevocationRegistry(registry: RevocationRegistry, path = DEFAULT_REVOCATION_PATH): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

export function revokeModule(moduleId: string, registryPath = DEFAULT_REVOCATION_PATH): boolean {
  const normalized = moduleId.trim();
  if (!normalized) {
    throw new ModuleError("REVOCATION_INVALID_MODULE", "moduleId is required for revocation");
  }
  const registry = readRevocationRegistry(registryPath);
  if (registry.revokedModuleIds.includes(normalized)) {
    return false;
  }
  registry.revokedModuleIds.push(normalized);
  registry.revokedModuleIds.sort();
  registry.updatedAt = new Date().toISOString();
  writeRevocationRegistry(registry, registryPath);
  return true;
}

export function isModuleRevoked(moduleId: string, registryPath = DEFAULT_REVOCATION_PATH): boolean {
  return readRevocationRegistry(registryPath).revokedModuleIds.includes(moduleId);
}

export function listRevokedModules(registryPath = DEFAULT_REVOCATION_PATH): string[] {
  return readRevocationRegistry(registryPath).revokedModuleIds;
}

export function computeModuleSignature(spec: Omit<AgentModuleSpec, "signatureHash">): string {
  const canonical = JSON.stringify({
    moduleId: spec.moduleId,
    version: spec.version,
    declaredCapabilities: [...spec.declaredCapabilities].sort(),
    declaredTools: [...spec.declaredTools].sort(),
    deterministicSupport: spec.deterministicSupport,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export function verifyModuleSignature(spec: AgentModuleSpec): boolean {
  return computeModuleSignature({
    moduleId: spec.moduleId,
    version: spec.version,
    declaredCapabilities: spec.declaredCapabilities,
    declaredTools: spec.declaredTools,
    deterministicSupport: spec.deterministicSupport,
  }) === spec.signatureHash;
}

function readModuleSpec(modulePath: string): AgentModuleSpec {
  const resolved = resolve(modulePath);
  const stats = statSync(resolved);
  const manifestPath = stats.isDirectory() ? join(resolved, "module.json") : resolved;
  const parsed = JSON.parse(readFileSync(manifestPath, "utf8")) as AgentModuleSpec;
  if (!parsed.moduleId || !parsed.version || !parsed.signatureHash) {
    throw new ModuleError("MODULE_SPEC_INVALID", `Invalid module spec at ${manifestPath}`);
  }
  return parsed;
}

export function addLocalModule(modulePath: string, baseDir = DEFAULT_MODULES_DIR): AgentModuleSpec {
  const spec = readModuleSpec(modulePath);
  const registryPath = join(baseDir, "revocations.json");
  if (isModuleRevoked(spec.moduleId, registryPath)) {
    throw new ModuleError("MODULE_REVOKED", `Module ${spec.moduleId} is revoked and cannot be installed`);
  }
  if (!verifyModuleSignature(spec)) {
    throw new ModuleError("MODULE_SIGNATURE_INVALID", `Signature mismatch for ${spec.moduleId}@${spec.version}`);
  }

  const root = getLocalModulesDir(baseDir);
  const installDir = join(root, spec.moduleId, spec.version);
  if (existsSync(installDir)) {
    throw new ModuleError("MODULE_IMMUTABLE", `Module already installed: ${spec.moduleId}@${spec.version}`);
  }
  mkdirSync(installDir, { recursive: true });
  writeFileSync(join(installDir, "module.json"), `${JSON.stringify(spec, null, 2)}\n`, "utf8");

  const resolved = resolve(modulePath);
  if (statSync(resolved).isFile()) {
    copyFileSync(resolved, join(installDir, basename(resolved)));
  }

  return spec;
}

export function removeLocalModule(moduleId: string, baseDir = DEFAULT_MODULES_DIR): boolean {
  const target = join(getLocalModulesDir(baseDir), moduleId);
  if (!existsSync(target)) return false;
  rmSync(target, { recursive: true, force: true });
  return true;
}

export function listLocalModules(baseDir = DEFAULT_MODULES_DIR): AgentModuleSpec[] {
  const root = getLocalModulesDir(baseDir);
  const moduleIds = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const specs: AgentModuleSpec[] = [];
  for (const moduleId of moduleIds) {
    const versions = readdirSync(join(root, moduleId), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    for (const version of versions) {
      const specPath = join(root, moduleId, version, "module.json");
      if (existsSync(specPath)) {
        specs.push(JSON.parse(readFileSync(specPath, "utf8")) as AgentModuleSpec);
      }
    }
  }
  return specs.sort((a, b) => `${a.moduleId}@${a.version}`.localeCompare(`${b.moduleId}@${b.version}`));
}

export function parsePipelineDefinition(content: string): PipelineDefinition {
  try {
    return JSON.parse(content) as PipelineDefinition;
  } catch {
    const modules: Array<{ moduleId: string; version: string }> = [];
    const executionOrder: string[] = [];
    let inModules = false;
    let inOrder = false;
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      if (line === "modules:") {
        inModules = true;
        inOrder = false;
        continue;
      }
      if (line === "executionOrder:") {
        inModules = false;
        inOrder = true;
        continue;
      }
      if (inModules && line.startsWith("-")) {
        const body = line.slice(1).trim();
        const [moduleId, version] = body.split("@");
        if (moduleId && version) modules.push({ moduleId, version });
      }
      if (inOrder && line.startsWith("-")) {
        executionOrder.push(line.slice(1).trim());
      }
    }
    return { modules, executionOrder };
  }
}

export function validatePipelineCompatibility(
  pipeline: PipelineDefinition,
  installedModules: AgentModuleSpec[]
): string[] {
  const errors: string[] = [];
  const installed = new Map(installedModules.map((m) => [`${m.moduleId}@${m.version}`, m]));
  for (const moduleRef of pipeline.modules) {
    const key = `${moduleRef.moduleId}@${moduleRef.version}`;
    if (!installed.has(key)) {
      errors.push(`Module not installed: ${key}`);
    }
  }
  for (const moduleId of pipeline.executionOrder) {
    if (!pipeline.modules.some((m) => m.moduleId === moduleId)) {
      errors.push(`Execution order references undeclared module: ${moduleId}`);
    }
  }
  const missingInOrder = pipeline.modules
    .map((m) => m.moduleId)
    .filter((moduleId) => !pipeline.executionOrder.includes(moduleId));
  if (missingInOrder.length > 0) {
    errors.push(`Execution order missing modules: ${missingInOrder.join(", ")}`);
  }
  return errors;
}

// =============================================================================
// SINGLETON
// =============================================================================

export const moduleRegistry = new ModuleRegistry();

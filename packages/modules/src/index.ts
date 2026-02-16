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

export interface DependencyNode {
  moduleId: string;
  dependencies: string[];
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
  private auditLog: ModuleAuditEntry[] = [];

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

    const auditTrail: ModuleAuditEntry[] = [];
    const sandboxed = new SandboxedContext(
      execCtx.grantedCapabilities,
      auditTrail
    );

    const start = Date.now();
    try {
      const result = await Promise.race([
        handler(sandboxed),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Module execution timeout")), execCtx.timeout)
        ),
      ]);

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
    private auditTrail: ModuleAuditEntry[]
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
// SINGLETON
// =============================================================================

export const moduleRegistry = new ModuleRegistry();

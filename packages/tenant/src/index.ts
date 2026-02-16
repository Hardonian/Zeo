/**
 * @zeo/tenant — Multi-Tenant Namespace Isolation
 *
 * Phase A of Zeo v3: Governed Multi-Tenant Decision Infrastructure
 *
 * Provides:
 * 1. Tenant Namespace Layer — hard enforcement of tenant_id in all operations
 * 2. RBAC Enforcement — role-based access control at command execution boundary
 * 3. Tenant Policy Engine — per-tenant policy schemas with fail-fast validation
 * 4. Usage Metering — per-tenant run_count, token_usage, compute_time tracking
 */

import { createHash } from "node:crypto";
import { nanoid } from "nanoid";

// =============================================================================
// TYPES
// =============================================================================

export type TenantRole = "owner" | "admin" | "operator" | "viewer";

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: TenantRole;
  sessionId?: string;
}

export interface TenantPolicy {
  tenantId: string;
  maxBudget: number;
  maxRuntimeMs: number;
  allowedTools: string[];
  deterministicRequired: boolean;
  maxRunsPerDay: number;
  maxTokensPerRun: number;
  retentionDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  tenantId: string;
  runCount: number;
  tokenUsage: number;
  computeTimeMs: number;
  lastRunAt: string;
  periodStart: string;
  periodEnd: string;
}

export interface TenantRegistration {
  tenantId: string;
  name: string;
  createdAt: string;
  status: "active" | "suspended" | "archived";
}

export interface RbacPermission {
  resource: string;
  action: "create" | "read" | "update" | "delete" | "execute";
}

// =============================================================================
// ERRORS
// =============================================================================

export class TenantError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly tenantId?: string
  ) {
    super(message);
    this.name = "TenantError";
  }
}

export class TenantNotFoundError extends TenantError {
  constructor(tenantId: string) {
    super("TENANT_NOT_FOUND", `Tenant not found: ${tenantId}`, tenantId);
  }
}

export class TenantAccessDeniedError extends TenantError {
  constructor(tenantId: string, userId: string, action: string) {
    super(
      "ACCESS_DENIED",
      `Access denied: user ${userId} cannot ${action} in tenant ${tenantId}`,
      tenantId
    );
  }
}

export class PolicyViolationError extends TenantError {
  constructor(tenantId: string, violation: string) {
    super(
      "POLICY_VIOLATION",
      `Policy violation in tenant ${tenantId}: ${violation}`,
      tenantId
    );
  }
}

export class CrossTenantAccessError extends TenantError {
  constructor(requestedTenantId: string, contextTenantId: string) {
    super(
      "CROSS_TENANT_ACCESS",
      `Cross-tenant access denied: requested ${requestedTenantId} from context ${contextTenantId}`,
      requestedTenantId
    );
  }
}

// =============================================================================
// RBAC PERMISSION MATRIX
// =============================================================================

const ROLE_PERMISSIONS: Record<TenantRole, RbacPermission[]> = {
  owner: [
    { resource: "*", action: "create" },
    { resource: "*", action: "read" },
    { resource: "*", action: "update" },
    { resource: "*", action: "delete" },
    { resource: "*", action: "execute" },
  ],
  admin: [
    { resource: "runs", action: "create" },
    { resource: "runs", action: "read" },
    { resource: "runs", action: "execute" },
    { resource: "snapshots", action: "read" },
    { resource: "snapshots", action: "create" },
    { resource: "evidence", action: "create" },
    { resource: "evidence", action: "read" },
    { resource: "evidence", action: "update" },
    { resource: "tools", action: "read" },
    { resource: "tools", action: "update" },
    { resource: "policy", action: "read" },
    { resource: "policy", action: "update" },
    { resource: "usage", action: "read" },
    { resource: "modules", action: "create" },
    { resource: "modules", action: "read" },
    { resource: "modules", action: "delete" },
    { resource: "compliance", action: "read" },
    { resource: "audit", action: "read" },
  ],
  operator: [
    { resource: "runs", action: "create" },
    { resource: "runs", action: "read" },
    { resource: "runs", action: "execute" },
    { resource: "snapshots", action: "read" },
    { resource: "snapshots", action: "create" },
    { resource: "evidence", action: "create" },
    { resource: "evidence", action: "read" },
    { resource: "tools", action: "read" },
    { resource: "policy", action: "read" },
    { resource: "usage", action: "read" },
    { resource: "modules", action: "read" },
  ],
  viewer: [
    { resource: "runs", action: "read" },
    { resource: "snapshots", action: "read" },
    { resource: "evidence", action: "read" },
    { resource: "tools", action: "read" },
    { resource: "policy", action: "read" },
    { resource: "usage", action: "read" },
    { resource: "modules", action: "read" },
    { resource: "compliance", action: "read" },
    { resource: "audit", action: "read" },
  ],
};

// =============================================================================
// DEFAULT POLICY
// =============================================================================

const DEFAULT_POLICY: Omit<TenantPolicy, "tenantId" | "createdAt" | "updatedAt"> = {
  maxBudget: 1000,
  maxRuntimeMs: 300_000, // 5 minutes
  allowedTools: ["*"],
  deterministicRequired: false,
  maxRunsPerDay: 1000,
  maxTokensPerRun: 100_000,
  retentionDays: 90,
};

// =============================================================================
// TENANT STORE (in-memory, deterministic)
// =============================================================================

export class TenantStore {
  private tenants = new Map<string, TenantRegistration>();
  private policies = new Map<string, TenantPolicy>();
  private usage = new Map<string, UsageRecord>();
  private userRoles = new Map<string, Map<string, TenantRole>>(); // tenantId -> userId -> role

  // ── Tenant Registration ──

  createTenant(name: string, ownerUserId: string): TenantRegistration {
    const tenantId = `tenant_${nanoid(12)}`;
    const now = new Date().toISOString();
    const registration: TenantRegistration = {
      tenantId,
      name,
      createdAt: now,
      status: "active",
    };

    this.tenants.set(tenantId, registration);

    // Set default policy
    this.policies.set(tenantId, {
      tenantId,
      ...DEFAULT_POLICY,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize usage
    this.usage.set(tenantId, {
      tenantId,
      runCount: 0,
      tokenUsage: 0,
      computeTimeMs: 0,
      lastRunAt: "",
      periodStart: now,
      periodEnd: "",
    });

    // Assign owner role
    const roleMap = new Map<string, TenantRole>();
    roleMap.set(ownerUserId, "owner");
    this.userRoles.set(tenantId, roleMap);

    return registration;
  }

  getTenant(tenantId: string): TenantRegistration {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new TenantNotFoundError(tenantId);
    return tenant;
  }

  listTenants(): TenantRegistration[] {
    return Array.from(this.tenants.values());
  }

  suspendTenant(tenantId: string): void {
    const tenant = this.getTenant(tenantId);
    tenant.status = "suspended";
  }

  // ── RBAC ──

  assignRole(tenantId: string, userId: string, role: TenantRole): void {
    this.getTenant(tenantId); // validate existence
    let roleMap = this.userRoles.get(tenantId);
    if (!roleMap) {
      roleMap = new Map();
      this.userRoles.set(tenantId, roleMap);
    }
    roleMap.set(userId, role);
  }

  getRole(tenantId: string, userId: string): TenantRole | null {
    const roleMap = this.userRoles.get(tenantId);
    if (!roleMap) return null;
    return roleMap.get(userId) ?? null;
  }

  // ── Policy ──

  getPolicy(tenantId: string): TenantPolicy {
    const policy = this.policies.get(tenantId);
    if (!policy) throw new TenantNotFoundError(tenantId);
    return policy;
  }

  updatePolicy(tenantId: string, updates: Partial<Omit<TenantPolicy, "tenantId" | "createdAt" | "updatedAt">>): TenantPolicy {
    const existing = this.getPolicy(tenantId);
    const updated: TenantPolicy = {
      ...existing,
      ...updates,
      tenantId,
      updatedAt: new Date().toISOString(),
    };
    this.policies.set(tenantId, updated);
    return updated;
  }

  // ── Usage ──

  getUsage(tenantId: string): UsageRecord {
    const usage = this.usage.get(tenantId);
    if (!usage) throw new TenantNotFoundError(tenantId);
    return usage;
  }

  recordRun(tenantId: string, tokenCount: number, durationMs: number): void {
    const usage = this.getUsage(tenantId);
    usage.runCount++;
    usage.tokenUsage += tokenCount;
    usage.computeTimeMs += durationMs;
    usage.lastRunAt = new Date().toISOString();
  }

  resetUsage(tenantId: string): void {
    const usage = this.getUsage(tenantId);
    const now = new Date().toISOString();
    usage.runCount = 0;
    usage.tokenUsage = 0;
    usage.computeTimeMs = 0;
    usage.periodStart = now;
    usage.periodEnd = "";
  }
}

// =============================================================================
// NAMESPACE GUARD
// =============================================================================

/**
 * Enforce that a tenant context is present and valid.
 * This is the hard boundary — called before any data access.
 */
export function requireTenantContext(ctx: TenantContext | null | undefined): asserts ctx is TenantContext {
  if (!ctx) {
    throw new TenantError("MISSING_TENANT_CONTEXT", "Tenant context is required for this operation");
  }
  if (!ctx.tenantId || typeof ctx.tenantId !== "string") {
    throw new TenantError("INVALID_TENANT_ID", "tenant_id is required and must be a non-empty string");
  }
  if (!ctx.userId || typeof ctx.userId !== "string") {
    throw new TenantError("INVALID_USER_ID", "user_id is required and must be a non-empty string");
  }
  if (!ctx.role || !["owner", "admin", "operator", "viewer"].includes(ctx.role)) {
    throw new TenantError("INVALID_ROLE", `Invalid role: ${ctx.role}`);
  }
}

/**
 * Enforce namespace isolation — prevent cross-tenant data access.
 */
export function enforceNamespaceIsolation(
  requestedTenantId: string,
  ctx: TenantContext
): void {
  requireTenantContext(ctx);
  if (requestedTenantId !== ctx.tenantId) {
    throw new CrossTenantAccessError(requestedTenantId, ctx.tenantId);
  }
}

// =============================================================================
// RBAC ENFORCEMENT
// =============================================================================

/**
 * Check if a role has permission for a specific resource/action pair.
 */
export function hasPermission(
  role: TenantRole,
  resource: string,
  action: RbacPermission["action"]
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.some(
    (p) =>
      (p.resource === "*" || p.resource === resource) &&
      (p.action === action)
  );
}

/**
 * Enforce RBAC at the command execution boundary.
 * Throws on unauthorized access.
 */
export function enforceRbac(
  ctx: TenantContext,
  resource: string,
  action: RbacPermission["action"]
): void {
  requireTenantContext(ctx);
  if (!hasPermission(ctx.role, resource, action)) {
    throw new TenantAccessDeniedError(ctx.tenantId, ctx.userId, `${action} ${resource}`);
  }
}

/**
 * Get all permissions for a role.
 */
export function getRolePermissions(role: TenantRole): RbacPermission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// =============================================================================
// TENANT POLICY ENGINE
// =============================================================================

export interface PolicyValidationResult {
  valid: boolean;
  violations: string[];
}

/**
 * Validate a run request against the tenant's policy.
 * Fails fast on any violation.
 */
export function validatePolicy(
  policy: TenantPolicy,
  params: {
    estimatedTokens?: number;
    estimatedRuntimeMs?: number;
    requestedTools?: string[];
    isDeterministic?: boolean;
  }
): PolicyValidationResult {
  const violations: string[] = [];

  // Check deterministic requirement
  if (policy.deterministicRequired && !params.isDeterministic) {
    violations.push("Tenant policy requires deterministic execution mode");
  }

  // Check token budget
  if (params.estimatedTokens !== undefined && params.estimatedTokens > policy.maxTokensPerRun) {
    violations.push(
      `Estimated tokens (${params.estimatedTokens}) exceeds per-run limit (${policy.maxTokensPerRun})`
    );
  }

  // Check runtime budget
  if (params.estimatedRuntimeMs !== undefined && params.estimatedRuntimeMs > policy.maxRuntimeMs) {
    violations.push(
      `Estimated runtime (${params.estimatedRuntimeMs}ms) exceeds limit (${policy.maxRuntimeMs}ms)`
    );
  }

  // Check tool allowlist
  if (params.requestedTools && policy.allowedTools[0] !== "*") {
    const disallowed = params.requestedTools.filter(
      (t) => !policy.allowedTools.includes(t)
    );
    if (disallowed.length > 0) {
      violations.push(`Disallowed tools: ${disallowed.join(", ")}`);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Validate usage limits against the tenant's policy.
 */
export function validateUsageLimits(
  policy: TenantPolicy,
  usage: UsageRecord
): PolicyValidationResult {
  const violations: string[] = [];

  if (usage.runCount >= policy.maxRunsPerDay) {
    violations.push(
      `Daily run limit reached (${usage.runCount}/${policy.maxRunsPerDay})`
    );
  }

  if (usage.tokenUsage >= policy.maxBudget * 1000) {
    violations.push(
      `Token budget exhausted (${usage.tokenUsage}/${policy.maxBudget * 1000})`
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Full pre-execution validation: tenant context + RBAC + policy + usage limits.
 * This is the single enforcement point called before any run.
 */
export function enforcePreExecution(
  store: TenantStore,
  ctx: TenantContext,
  params: {
    estimatedTokens?: number;
    estimatedRuntimeMs?: number;
    requestedTools?: string[];
    isDeterministic?: boolean;
  }
): void {
  // 1. Validate tenant context
  requireTenantContext(ctx);

  // 2. Validate tenant exists and is active
  const tenant = store.getTenant(ctx.tenantId);
  if (tenant.status !== "active") {
    throw new TenantError(
      "TENANT_SUSPENDED",
      `Tenant ${ctx.tenantId} is ${tenant.status}`,
      ctx.tenantId
    );
  }

  // 3. Validate RBAC
  enforceRbac(ctx, "runs", "execute");

  // 4. Validate policy
  const policy = store.getPolicy(ctx.tenantId);
  const policyResult = validatePolicy(policy, params);
  if (!policyResult.valid) {
    throw new PolicyViolationError(ctx.tenantId, policyResult.violations[0]);
  }

  // 5. Validate usage limits
  const usage = store.getUsage(ctx.tenantId);
  const usageResult = validateUsageLimits(policy, usage);
  if (!usageResult.valid) {
    throw new PolicyViolationError(ctx.tenantId, usageResult.violations[0]);
  }
}

// =============================================================================
// USAGE FORMATTING (for `zeo usage` command)
// =============================================================================

export function formatUsage(usage: UsageRecord): string {
  const lines: string[] = [
    `=== Tenant Usage: ${usage.tenantId} ===`,
    `Runs:         ${usage.runCount}`,
    `Tokens:       ${usage.tokenUsage.toLocaleString()}`,
    `Compute:      ${(usage.computeTimeMs / 1000).toFixed(2)}s`,
    `Last Run:     ${usage.lastRunAt || "never"}`,
    `Period Start: ${usage.periodStart}`,
  ];
  return lines.join("\n");
}

/**
 * Format tenant policy for display.
 */
export function formatPolicy(policy: TenantPolicy): string {
  const lines: string[] = [
    `=== Tenant Policy: ${policy.tenantId} ===`,
    `Max Budget:        ${policy.maxBudget}`,
    `Max Runtime:       ${policy.maxRuntimeMs}ms`,
    `Deterministic:     ${policy.deterministicRequired ? "REQUIRED" : "optional"}`,
    `Max Runs/Day:      ${policy.maxRunsPerDay}`,
    `Max Tokens/Run:    ${policy.maxTokensPerRun}`,
    `Retention:         ${policy.retentionDays} days`,
    `Allowed Tools:     ${policy.allowedTools.join(", ")}`,
    `Updated:           ${policy.updatedAt}`,
  ];
  return lines.join("\n");
}

// =============================================================================
// GLOBAL STORE SINGLETON
// =============================================================================

export const tenantStore = new TenantStore();

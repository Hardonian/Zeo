/**
 * Policy-as-Constraints Engine (v12)
 *
 * Declarative constraint definitions that can be:
 * - evaluated against a context
 * - explained (why blocked)
 * - diffed (policy A vs policy B)
 * - simulated (would this pass?)
 *
 * Replaces or wraps scattered "if policy…" checks with a structured evaluator.
 */

// ─── Schema ─────────────────────────────────────────────────────────────

export const POLICY_CONSTRAINT_SCHEMA_VERSION = "1.0.0";

export type ConstraintSeverity = "BLOCK" | "WARN";

export type ConstraintType =
  | "MAX_BUDGET"
  | "MAX_RUNTIME_MS"
  | "ALLOWED_TOOLS"
  | "DETERMINISM_REQUIRED"
  | "TENANT_SCOPE"
  | "ROLE_REQUIRED"
  | "PAYLOAD_SIZE_LIMIT"
  | "MAX_RUNS_PER_DAY"
  | "MAX_TOKENS_PER_RUN";

export interface PolicyConstraint {
  id: string;
  type: ConstraintType;
  params: Record<string, unknown>;
  severity: ConstraintSeverity;
  message: string;
  version: string;
}

export interface PolicyConstraintSet {
  id: string;
  name: string;
  version: string;
  constraints: PolicyConstraint[];
}

// ─── Evaluation Context ─────────────────────────────────────────────────

export interface ConstraintEvaluationContext {
  tenantId?: string;
  userId?: string;
  role?: string;
  estimatedBudget?: number;
  estimatedRuntimeMs?: number;
  estimatedTokens?: number;
  requestedTools?: string[];
  isDeterministic?: boolean;
  payloadSizeBytes?: number;
  currentRunCount?: number;
  maxBudget?: number;
  maxRuntimeMs?: number;
  maxRunsPerDay?: number;
  maxTokensPerRun?: number;
  allowedTools?: string[];
  deterministicRequired?: boolean;
  payloadSizeLimit?: number;
  requiredRole?: string;
  currentTenantId?: string;
}

// ─── Violation ──────────────────────────────────────────────────────────

export interface ConstraintViolation {
  constraintId: string;
  constraintType: ConstraintType;
  severity: ConstraintSeverity;
  message: string;
  remediation: string;
  actual?: unknown;
  limit?: unknown;
}

// ─── Evaluation Result ──────────────────────────────────────────────────

export interface ConstraintEvaluationResult {
  allowed: boolean;
  violations: ConstraintViolation[];
  evaluatedAt: string;
  constraintSetId: string;
  constraintSetVersion: string;
}

// ─── Diff Result ────────────────────────────────────────────────────────

export interface ConstraintDiffEntry {
  constraintId: string;
  change: "added" | "removed" | "modified";
  before?: PolicyConstraint;
  after?: PolicyConstraint;
}

export interface PolicyDiffResult {
  policyA: string;
  policyB: string;
  changes: ConstraintDiffEntry[];
  summary: string;
}

// ─── Evaluator ──────────────────────────────────────────────────────────

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  operator: 1,
  admin: 2,
  owner: 3,
};

type ConstraintChecker = (
  constraint: PolicyConstraint,
  ctx: ConstraintEvaluationContext,
) => ConstraintViolation | null;

const CHECKERS: Record<ConstraintType, ConstraintChecker> = {
  MAX_BUDGET: (c, ctx) => {
    const limit = (c.params.value as number) ?? ctx.maxBudget;
    if (limit !== undefined && ctx.estimatedBudget !== undefined && ctx.estimatedBudget > limit) {
      return {
        constraintId: c.id,
        constraintType: c.type,
        severity: c.severity,
        message: c.message || `Budget ${ctx.estimatedBudget} exceeds limit ${limit}`,
        remediation: "Reduce estimated budget or increase the MAX_BUDGET constraint.",
        actual: ctx.estimatedBudget,
        limit,
      };
    }
    return null;
  },

  MAX_RUNTIME_MS: (c, ctx) => {
    const limit = (c.params.value as number) ?? ctx.maxRuntimeMs;
    if (limit !== undefined && ctx.estimatedRuntimeMs !== undefined && ctx.estimatedRuntimeMs > limit) {
      return {
        constraintId: c.id,
        constraintType: c.type,
        severity: c.severity,
        message: c.message || `Runtime ${ctx.estimatedRuntimeMs}ms exceeds limit ${limit}ms`,
        remediation: "Reduce estimated runtime or increase the MAX_RUNTIME_MS constraint.",
        actual: ctx.estimatedRuntimeMs,
        limit,
      };
    }
    return null;
  },

  ALLOWED_TOOLS: (c, ctx) => {
    const allowed = (c.params.value as string[]) ?? ctx.allowedTools;
    if (allowed && allowed[0] !== "*" && ctx.requestedTools) {
      const disallowed = ctx.requestedTools.filter(t => !allowed.includes(t));
      if (disallowed.length > 0) {
        return {
          constraintId: c.id,
          constraintType: c.type,
          severity: c.severity,
          message: c.message || `Disallowed tools: ${disallowed.join(", ")}`,
          remediation: `Remove disallowed tools or add them to the ALLOWED_TOOLS constraint: ${disallowed.join(", ")}`,
          actual: disallowed,
          limit: allowed,
        };
      }
    }
    return null;
  },

  DETERMINISM_REQUIRED: (c, ctx) => {
    const required = (c.params.value as boolean) ?? ctx.deterministicRequired;
    if (required && !ctx.isDeterministic) {
      return {
        constraintId: c.id,
        constraintType: c.type,
        severity: c.severity,
        message: c.message || "Deterministic execution is required but not enabled",
        remediation: "Enable deterministic mode (--deterministic flag or policy setting).",
        actual: false,
        limit: true,
      };
    }
    return null;
  },

  TENANT_SCOPE: (c, ctx) => {
    const requiredTenant = (c.params.value as string) ?? ctx.currentTenantId;
    if (requiredTenant && ctx.tenantId && ctx.tenantId !== requiredTenant) {
      return {
        constraintId: c.id,
        constraintType: c.type,
        severity: c.severity,
        message: c.message || `Tenant scope mismatch: expected ${requiredTenant}, got ${ctx.tenantId}`,
        remediation: "Ensure the operation runs within the correct tenant scope.",
        actual: ctx.tenantId,
        limit: requiredTenant,
      };
    }
    return null;
  },

  ROLE_REQUIRED: (c, ctx) => {
    const requiredRole = (c.params.value as string) ?? ctx.requiredRole;
    if (requiredRole && ctx.role) {
      const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
      const actualLevel = ROLE_HIERARCHY[ctx.role] ?? 0;
      if (actualLevel < requiredLevel) {
        return {
          constraintId: c.id,
          constraintType: c.type,
          severity: c.severity,
          message: c.message || `Role ${ctx.role} insufficient; requires ${requiredRole} or higher`,
          remediation: `Request role elevation to ${requiredRole} or higher.`,
          actual: ctx.role,
          limit: requiredRole,
        };
      }
    }
    return null;
  },

  PAYLOAD_SIZE_LIMIT: (c, ctx) => {
    const limit = (c.params.value as number) ?? ctx.payloadSizeLimit;
    if (limit !== undefined && ctx.payloadSizeBytes !== undefined && ctx.payloadSizeBytes > limit) {
      return {
        constraintId: c.id,
        constraintType: c.type,
        severity: c.severity,
        message: c.message || `Payload size ${ctx.payloadSizeBytes} bytes exceeds limit ${limit} bytes`,
        remediation: "Reduce payload size or increase the PAYLOAD_SIZE_LIMIT constraint.",
        actual: ctx.payloadSizeBytes,
        limit,
      };
    }
    return null;
  },

  MAX_RUNS_PER_DAY: (c, ctx) => {
    const limit = (c.params.value as number) ?? ctx.maxRunsPerDay;
    if (limit !== undefined && ctx.currentRunCount !== undefined && ctx.currentRunCount >= limit) {
      return {
        constraintId: c.id,
        constraintType: c.type,
        severity: c.severity,
        message: c.message || `Daily run limit reached (${ctx.currentRunCount}/${limit})`,
        remediation: "Wait until the next period or increase the MAX_RUNS_PER_DAY constraint.",
        actual: ctx.currentRunCount,
        limit,
      };
    }
    return null;
  },

  MAX_TOKENS_PER_RUN: (c, ctx) => {
    const limit = (c.params.value as number) ?? ctx.maxTokensPerRun;
    if (limit !== undefined && ctx.estimatedTokens !== undefined && ctx.estimatedTokens > limit) {
      return {
        constraintId: c.id,
        constraintType: c.type,
        severity: c.severity,
        message: c.message || `Estimated tokens ${ctx.estimatedTokens} exceeds limit ${limit}`,
        remediation: "Reduce token usage or increase the MAX_TOKENS_PER_RUN constraint.",
        actual: ctx.estimatedTokens,
        limit,
      };
    }
    return null;
  },
};

/**
 * Evaluate a constraint set against a context.
 * Returns structured result with violations and remediation hints.
 */
export function evaluateConstraints(
  constraintSet: PolicyConstraintSet,
  ctx: ConstraintEvaluationContext,
): ConstraintEvaluationResult {
  const violations: ConstraintViolation[] = [];

  for (const constraint of constraintSet.constraints) {
    const checker = CHECKERS[constraint.type];
    if (!checker) continue;
    const violation = checker(constraint, ctx);
    if (violation) {
      violations.push(violation);
    }
  }

  const hasBlocker = violations.some(v => v.severity === "BLOCK");

  return {
    allowed: !hasBlocker,
    violations,
    evaluatedAt: new Date().toISOString(),
    constraintSetId: constraintSet.id,
    constraintSetVersion: constraintSet.version,
  };
}

// ─── Policy Diff ────────────────────────────────────────────────────────

/**
 * Diff two policy constraint sets.
 * Returns added, removed, and modified constraints.
 */
export function diffPolicies(
  a: PolicyConstraintSet,
  b: PolicyConstraintSet,
): PolicyDiffResult {
  const aMap = new Map(a.constraints.map(c => [c.id, c]));
  const bMap = new Map(b.constraints.map(c => [c.id, c]));
  const changes: ConstraintDiffEntry[] = [];

  // Check removed and modified
  for (const [id, ac] of aMap) {
    const bc = bMap.get(id);
    if (!bc) {
      changes.push({ constraintId: id, change: "removed", before: ac });
    } else if (JSON.stringify(ac) !== JSON.stringify(bc)) {
      changes.push({ constraintId: id, change: "modified", before: ac, after: bc });
    }
  }

  // Check added
  for (const [id, bc] of bMap) {
    if (!aMap.has(id)) {
      changes.push({ constraintId: id, change: "added", after: bc });
    }
  }

  // Sort changes by constraintId for determinism
  changes.sort((x, y) => x.constraintId.localeCompare(y.constraintId));

  const summaryParts: string[] = [];
  const added = changes.filter(c => c.change === "added").length;
  const removed = changes.filter(c => c.change === "removed").length;
  const modified = changes.filter(c => c.change === "modified").length;
  if (added) summaryParts.push(`${added} added`);
  if (removed) summaryParts.push(`${removed} removed`);
  if (modified) summaryParts.push(`${modified} modified`);

  return {
    policyA: a.id,
    policyB: b.id,
    changes,
    summary: summaryParts.length > 0 ? summaryParts.join(", ") : "no changes",
  };
}

// ─── Explain ────────────────────────────────────────────────────────────

/**
 * Generate a human-readable explanation of constraint evaluation.
 */
export function explainConstraints(result: ConstraintEvaluationResult): string {
  const lines: string[] = [];

  if (result.allowed) {
    lines.push(`Policy ${result.constraintSetId} (v${result.constraintSetVersion}): ALLOWED`);
  } else {
    lines.push(`Policy ${result.constraintSetId} (v${result.constraintSetVersion}): BLOCKED`);
  }

  if (result.violations.length === 0) {
    lines.push("  No violations.");
  } else {
    lines.push("");
    lines.push("  Violations:");
    for (const v of result.violations) {
      lines.push(`  [${v.severity}] ${v.constraintId} (${v.constraintType})`);
      lines.push(`    ${v.message}`);
      lines.push(`    Remediation: ${v.remediation}`);
      if (v.actual !== undefined) lines.push(`    Actual: ${JSON.stringify(v.actual)}`);
      if (v.limit !== undefined) lines.push(`    Limit: ${JSON.stringify(v.limit)}`);
    }
  }

  return lines.join("\n");
}

// ─── Simulate ───────────────────────────────────────────────────────────

/**
 * Simulate constraint evaluation without side effects.
 * Returns the same result as evaluateConstraints but formatted for preview.
 */
export function simulateConstraints(
  constraintSet: PolicyConstraintSet,
  ctx: ConstraintEvaluationContext,
): { result: ConstraintEvaluationResult; explanation: string } {
  const result = evaluateConstraints(constraintSet, ctx);
  const explanation = explainConstraints(result);
  return { result, explanation };
}

// ─── Format Diff ────────────────────────────────────────────────────────

/**
 * Format a policy diff for CLI output.
 */
export function formatPolicyDiff(diff: PolicyDiffResult): string {
  const lines: string[] = [];
  lines.push(`Policy Diff: ${diff.policyA} vs ${diff.policyB}`);
  lines.push(`Summary: ${diff.summary}`);

  if (diff.changes.length > 0) {
    lines.push("");
    for (const c of diff.changes) {
      lines.push(`  [${c.change}] ${c.constraintId}`);
      if (c.before) lines.push(`    Before: ${c.before.type} ${JSON.stringify(c.before.params)} (${c.before.severity})`);
      if (c.after) lines.push(`    After:  ${c.after.type} ${JSON.stringify(c.after.params)} (${c.after.severity})`);
    }
  }

  return lines.join("\n");
}

// ─── Helpers: Build constraint sets from tenant policy ───────────────────

/**
 * Convert a tenant policy object into a PolicyConstraintSet.
 * Bridges existing @zeo/tenant TenantPolicy to the declarative constraint engine.
 */
export function tenantPolicyToConstraintSet(
  tenantId: string,
  policy: {
    maxBudget: number;
    maxRuntimeMs: number;
    allowedTools: string[];
    deterministicRequired: boolean;
    maxRunsPerDay: number;
    maxTokensPerRun: number;
  },
): PolicyConstraintSet {
  return {
    id: `tenant-policy-${tenantId}`,
    name: `Tenant Policy for ${tenantId}`,
    version: POLICY_CONSTRAINT_SCHEMA_VERSION,
    constraints: [
      {
        id: `${tenantId}/max-budget`,
        type: "MAX_BUDGET",
        params: { value: policy.maxBudget },
        severity: "BLOCK",
        message: `Budget must not exceed ${policy.maxBudget}`,
        version: POLICY_CONSTRAINT_SCHEMA_VERSION,
      },
      {
        id: `${tenantId}/max-runtime`,
        type: "MAX_RUNTIME_MS",
        params: { value: policy.maxRuntimeMs },
        severity: "BLOCK",
        message: `Runtime must not exceed ${policy.maxRuntimeMs}ms`,
        version: POLICY_CONSTRAINT_SCHEMA_VERSION,
      },
      {
        id: `${tenantId}/allowed-tools`,
        type: "ALLOWED_TOOLS",
        params: { value: policy.allowedTools },
        severity: "BLOCK",
        message: `Only allowed tools may be used`,
        version: POLICY_CONSTRAINT_SCHEMA_VERSION,
      },
      {
        id: `${tenantId}/determinism`,
        type: "DETERMINISM_REQUIRED",
        params: { value: policy.deterministicRequired },
        severity: policy.deterministicRequired ? "BLOCK" : "WARN",
        message: policy.deterministicRequired
          ? "Deterministic execution is required"
          : "Deterministic execution is recommended",
        version: POLICY_CONSTRAINT_SCHEMA_VERSION,
      },
      {
        id: `${tenantId}/max-runs`,
        type: "MAX_RUNS_PER_DAY",
        params: { value: policy.maxRunsPerDay },
        severity: "BLOCK",
        message: `Daily run limit: ${policy.maxRunsPerDay}`,
        version: POLICY_CONSTRAINT_SCHEMA_VERSION,
      },
      {
        id: `${tenantId}/max-tokens`,
        type: "MAX_TOKENS_PER_RUN",
        params: { value: policy.maxTokensPerRun },
        severity: "BLOCK",
        message: `Per-run token limit: ${policy.maxTokensPerRun}`,
        version: POLICY_CONSTRAINT_SCHEMA_VERSION,
      },
      {
        id: `${tenantId}/payload-size`,
        type: "PAYLOAD_SIZE_LIMIT",
        params: { value: 10 * 1024 * 1024 }, // 10MB default
        severity: "BLOCK",
        message: "Payload size must not exceed 10MB",
        version: POLICY_CONSTRAINT_SCHEMA_VERSION,
      },
    ],
  };
}

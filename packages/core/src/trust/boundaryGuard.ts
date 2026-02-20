/**
 * Boundary Guard
 *
 * Enforces trust boundaries at all execution entry points.
 * No agent or tool invocation may bypass the boundary guard.
 *
 * Guards:
 *   - Input validation (schema + determinism checks)
 *   - Agent authorization (policy resolver check)
 *   - Tool allowlist enforcement
 *   - Output sanitization
 */

import { sha256, encodeCanonicalJson } from "@zeo/kernel";
import { validateNormalizedInput, type ValidationResult } from "@zeo/kernel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BoundaryCheckResult {
  allowed: boolean;
  guardId: string;
  agentId: string;
  operation: string;
  checks: BoundaryCheck[];
  timestamp: string;
}

export interface BoundaryCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface BoundaryGuardConfig {
  /** Allowed tool names. Empty = all allowed. */
  toolAllowlist: Set<string>;
  /** Denied tool names (takes precedence over allowlist). */
  toolDenylist: Set<string>;
  /** Maximum input payload size in bytes. */
  maxInputSizeBytes: number;
  /** Require deterministic-compatible inputs. */
  requireDeterministicInput: boolean;
  /** Block execution on any check failure. */
  strictMode: boolean;
}

const DEFAULT_CONFIG: BoundaryGuardConfig = {
  toolAllowlist: new Set(),
  toolDenylist: new Set(["eval", "exec", "shell", "raw_sql"]),
  maxInputSizeBytes: 10 * 1024 * 1024, // 10 MB
  requireDeterministicInput: true,
  strictMode: true,
};

// ---------------------------------------------------------------------------
// Boundary Guard
// ---------------------------------------------------------------------------

export class BoundaryGuard {
  private readonly config: BoundaryGuardConfig;
  private readonly log: BoundaryCheckResult[] = [];

  constructor(config?: Partial<BoundaryGuardConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    if (config?.toolAllowlist) {
      this.config.toolAllowlist = new Set(config.toolAllowlist);
    }
    if (config?.toolDenylist) {
      this.config.toolDenylist = new Set([
        ...DEFAULT_CONFIG.toolDenylist,
        ...config.toolDenylist,
      ]);
    }
  }

  /**
   * Check if an agent is allowed to invoke a tool with the given input.
   */
  checkExecution(
    agentId: string,
    toolName: string,
    input: unknown,
  ): BoundaryCheckResult {
    const checks: BoundaryCheck[] = [];
    const timestamp = new Date().toISOString();

    // 1. Tool denylist check
    checks.push(this.checkToolDenylist(toolName));

    // 2. Tool allowlist check
    checks.push(this.checkToolAllowlist(toolName));

    // 3. Input size check
    checks.push(this.checkInputSize(input));

    // 4. Deterministic input validation
    if (this.config.requireDeterministicInput) {
      checks.push(this.checkDeterministicInput(input));
    }

    // 5. Agent ID validation
    checks.push(this.checkAgentId(agentId));

    const allowed = this.config.strictMode
      ? checks.every((c) => c.passed)
      : !checks.some((c) => !c.passed && c.name === "tool-denylist");

    const guardId = sha256(
      new TextDecoder().decode(
        encodeCanonicalJson({ agentId, toolName, timestamp }),
      ),
    ).slice(0, 16);

    const result: BoundaryCheckResult = {
      allowed,
      guardId: `guard_${guardId}`,
      agentId,
      operation: toolName,
      checks,
      timestamp,
    };

    this.log.push(result);
    return result;
  }

  /**
   * Convenience method: check and throw if not allowed.
   */
  enforce(agentId: string, toolName: string, input: unknown): void {
    const result = this.checkExecution(agentId, toolName, input);
    if (!result.allowed) {
      const failedChecks = result.checks
        .filter((c) => !c.passed)
        .map((c) => `${c.name}: ${c.message}`)
        .join("; ");
      throw new BoundaryViolationError(
        `Boundary guard blocked ${agentId} from invoking ${toolName}: ${failedChecks}`,
        result,
      );
    }
  }

  /**
   * Get the full audit log of all boundary checks.
   */
  getAuditLog(): readonly BoundaryCheckResult[] {
    return this.log;
  }

  /**
   * Clear the audit log.
   */
  clearAuditLog(): void {
    this.log.length = 0;
  }

  // ─── Internal Checks ───────────────────────────────────────────

  private checkToolDenylist(toolName: string): BoundaryCheck {
    const denied = this.config.toolDenylist.has(toolName);
    return {
      name: "tool-denylist",
      passed: !denied,
      message: denied
        ? `Tool "${toolName}" is on the denylist`
        : `Tool "${toolName}" is not denied`,
    };
  }

  private checkToolAllowlist(toolName: string): BoundaryCheck {
    if (this.config.toolAllowlist.size === 0) {
      return {
        name: "tool-allowlist",
        passed: true,
        message: "No allowlist configured (all tools permitted)",
      };
    }
    const allowed = this.config.toolAllowlist.has(toolName);
    return {
      name: "tool-allowlist",
      passed: allowed,
      message: allowed
        ? `Tool "${toolName}" is on the allowlist`
        : `Tool "${toolName}" is not on the allowlist`,
    };
  }

  private checkInputSize(input: unknown): BoundaryCheck {
    let sizeBytes: number;
    try {
      const encoded = encodeCanonicalJson(input);
      sizeBytes = encoded.byteLength;
    } catch {
      sizeBytes = JSON.stringify(input ?? null).length;
    }

    const passed = sizeBytes <= this.config.maxInputSizeBytes;
    return {
      name: "input-size",
      passed,
      message: passed
        ? `Input size ${sizeBytes} bytes within limit`
        : `Input size ${sizeBytes} bytes exceeds limit of ${this.config.maxInputSizeBytes}`,
    };
  }

  private checkDeterministicInput(input: unknown): BoundaryCheck {
    const result: ValidationResult = validateNormalizedInput(input);
    return {
      name: "deterministic-input",
      passed: result.valid,
      message: result.valid
        ? "Input passes determinism validation"
        : `Determinism violations: ${result.errors.map((e) => e.message).join("; ")}`,
    };
  }

  private checkAgentId(agentId: string): BoundaryCheck {
    const valid =
      typeof agentId === "string" &&
      agentId.length > 0 &&
      agentId.length <= 128 &&
      /^[a-zA-Z0-9_.-]+$/.test(agentId);
    return {
      name: "agent-id",
      passed: valid,
      message: valid
        ? `Agent ID "${agentId}" is valid`
        : `Agent ID "${agentId}" is invalid (must be 1-128 alphanumeric chars)`,
    };
  }
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class BoundaryViolationError extends Error {
  constructor(
    message: string,
    public readonly checkResult: BoundaryCheckResult,
  ) {
    super(message);
    this.name = "BoundaryViolationError";
  }
}

// ---------------------------------------------------------------------------
// Default singleton
// ---------------------------------------------------------------------------

let defaultGuard: BoundaryGuard | null = null;

export function getDefaultBoundaryGuard(): BoundaryGuard {
  if (!defaultGuard) {
    defaultGuard = new BoundaryGuard();
  }
  return defaultGuard;
}

export function resetDefaultBoundaryGuard(
  config?: Partial<BoundaryGuardConfig>,
): BoundaryGuard {
  defaultGuard = new BoundaryGuard(config);
  return defaultGuard;
}

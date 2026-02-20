/**
 * Invariant Registry
 *
 * Centralized registry of system invariants that must hold true
 * across all Zeo execution paths. Violations are logged, surfaced,
 * and optionally block execution.
 *
 * Invariants are pure boolean predicates with structured metadata.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Invariant {
  id: string;
  name: string;
  description: string;
  severity: "block" | "warn" | "info";
  check: (context: InvariantContext) => boolean;
}

export interface InvariantContext {
  inputHash?: string;
  outputHash?: string;
  agentId?: string;
  toolName?: string;
  seed?: string;
  policyVersion?: string;
  [key: string]: unknown;
}

export interface InvariantViolation {
  invariantId: string;
  invariantName: string;
  severity: "block" | "warn" | "info";
  message: string;
  context: InvariantContext;
  timestamp: string;
}

export interface InvariantCheckResult {
  passed: boolean;
  violations: InvariantViolation[];
  checkedCount: number;
  passedCount: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Built-in Invariants
// ---------------------------------------------------------------------------

const BUILTIN_INVARIANTS: Invariant[] = [
  {
    id: "INV-001",
    name: "Input Hash Present",
    description: "Every execution must have a computed input hash.",
    severity: "block",
    check: (ctx) =>
      typeof ctx.inputHash === "string" && ctx.inputHash.length === 64,
  },
  {
    id: "INV-002",
    name: "Agent ID Valid",
    description: "Agent ID must be a non-empty string.",
    severity: "block",
    check: (ctx) =>
      typeof ctx.agentId === "string" && ctx.agentId.length > 0,
  },
  {
    id: "INV-003",
    name: "Output Hash Present",
    description: "Post-execution output must have a computed hash.",
    severity: "warn",
    check: (ctx) =>
      ctx.outputHash === undefined ||
      (typeof ctx.outputHash === "string" && ctx.outputHash.length === 64),
  },
  {
    id: "INV-004",
    name: "Seed Determinism",
    description: "If a seed is provided, it must be non-empty.",
    severity: "block",
    check: (ctx) =>
      ctx.seed === undefined ||
      (typeof ctx.seed === "string" && ctx.seed.length > 0),
  },
  {
    id: "INV-005",
    name: "Policy Version Format",
    description: "Policy version must follow semver-like format if present.",
    severity: "info",
    check: (ctx) =>
      ctx.policyVersion === undefined ||
      /^\d+\.\d+\.\d+/.test(ctx.policyVersion),
  },
  {
    id: "INV-006",
    name: "No Circular Agent Chain",
    description: "Agent chain must not contain duplicate agent IDs.",
    severity: "block",
    check: (ctx) => {
      const chain = ctx.agentChain;
      if (!Array.isArray(chain)) return true;
      return new Set(chain).size === chain.length;
    },
  },
];

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export class InvariantRegistry {
  private invariants: Map<string, Invariant> = new Map();
  private violations: InvariantViolation[] = [];

  constructor() {
    for (const inv of BUILTIN_INVARIANTS) {
      this.invariants.set(inv.id, inv);
    }
  }

  /**
   * Register a custom invariant.
   */
  register(invariant: Invariant): void {
    if (this.invariants.has(invariant.id)) {
      throw new Error(`Invariant ${invariant.id} already registered`);
    }
    this.invariants.set(invariant.id, invariant);
  }

  /**
   * Unregister an invariant by ID.
   */
  unregister(id: string): boolean {
    return this.invariants.delete(id);
  }

  /**
   * Check all registered invariants against the given context.
   */
  check(context: InvariantContext): InvariantCheckResult {
    const timestamp = new Date().toISOString();
    const currentViolations: InvariantViolation[] = [];
    let passedCount = 0;

    for (const invariant of this.invariants.values()) {
      let passed: boolean;
      try {
        passed = invariant.check(context);
      } catch {
        passed = false;
      }

      if (passed) {
        passedCount++;
      } else {
        const violation: InvariantViolation = {
          invariantId: invariant.id,
          invariantName: invariant.name,
          severity: invariant.severity,
          message: `Invariant "${invariant.name}" (${invariant.id}) violated: ${invariant.description}`,
          context,
          timestamp,
        };
        currentViolations.push(violation);
        this.violations.push(violation);
      }
    }

    return {
      passed: !currentViolations.some((v) => v.severity === "block"),
      violations: currentViolations,
      checkedCount: this.invariants.size,
      passedCount,
      timestamp,
    };
  }

  /**
   * Check invariants and throw on blocking violations.
   */
  enforce(context: InvariantContext): InvariantCheckResult {
    const result = this.check(context);
    if (!result.passed) {
      const blocking = result.violations
        .filter((v) => v.severity === "block")
        .map((v) => v.message)
        .join("; ");
      throw new InvariantViolationError(
        `System invariant violation: ${blocking}`,
        result.violations,
      );
    }
    return result;
  }

  /**
   * Get all violations recorded since initialization.
   */
  getViolationLog(): readonly InvariantViolation[] {
    return this.violations;
  }

  /**
   * Clear recorded violations.
   */
  clearViolationLog(): void {
    this.violations.length = 0;
  }

  /**
   * List all registered invariants.
   */
  listInvariants(): Invariant[] {
    return Array.from(this.invariants.values());
  }

  /**
   * Get count of registered invariants.
   */
  get size(): number {
    return this.invariants.size;
  }
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class InvariantViolationError extends Error {
  constructor(
    message: string,
    public readonly violations: InvariantViolation[],
  ) {
    super(message);
    this.name = "InvariantViolationError";
  }
}

// ---------------------------------------------------------------------------
// Default singleton
// ---------------------------------------------------------------------------

let defaultRegistry: InvariantRegistry | null = null;

export function getDefaultInvariantRegistry(): InvariantRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new InvariantRegistry();
  }
  return defaultRegistry;
}

export function resetInvariantRegistry(): InvariantRegistry {
  defaultRegistry = new InvariantRegistry();
  return defaultRegistry;
}

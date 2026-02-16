/**
 * Agent Capability Schema + Enforced Validation + Resource Budgeting
 *
 * Formalizes agent runtime contract:
 *   - name, input_schema, output_schema, cost_estimate, timeout_limit
 *   - Validate input before execution
 *   - Validate output after execution
 *   - Reject schema violations
 *   - Track tokens, time, cost
 *   - Enforce soft limit warnings + hard fail
 */

export interface AgentCapabilitySchema {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  costEstimate: CostEstimate;
  timeoutMs: number;
}

export interface JsonSchema {
  type: "object" | "string" | "number" | "boolean" | "array";
  properties?: Record<string, { type: string; required?: boolean; description?: string }>;
  required?: string[];
}

export interface CostEstimate {
  tokensMin: number;
  tokensMax: number;
  costUsdMin: number;
  costUsdMax: number;
}

export interface ResourceBudget {
  maxTokens: number;
  maxTimeMs: number;
  maxCostUsd: number;
  softLimitPct: number; // e.g. 0.8 = warn at 80%
  hardFail: boolean;
}

export interface ResourceUsage {
  tokensUsed: number;
  timeMs: number;
  costUsd: number;
}

export type AgentHealthStatus = "READY" | "ERROR" | "TIMEOUT";

export interface AgentHealth {
  name: string;
  status: AgentHealthStatus;
  lastChecked: string;
  error?: string;
  latencyMs?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Schema Validation ────────────────────────────────────────────────────

/**
 * Validate a value against a simple JSON schema
 */
export function validateAgainstSchema(value: unknown, schema: JsonSchema): ValidationResult {
  const errors: string[] = [];

  if (value === null || value === undefined) {
    errors.push("Value is null or undefined");
    return { valid: false, errors };
  }

  if (schema.type === "object") {
    if (typeof value !== "object" || Array.isArray(value)) {
      errors.push(`Expected object, got ${Array.isArray(value) ? "array" : typeof value}`);
      return { valid: false, errors };
    }

    const obj = value as Record<string, unknown>;

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in obj) || obj[field] === undefined) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check property types
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (key in obj && obj[key] !== undefined) {
          const actualType = Array.isArray(obj[key]) ? "array" : typeof obj[key];
          if (actualType !== prop.type) {
            errors.push(`Field '${key}': expected ${prop.type}, got ${actualType}`);
          }
        }
      }
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) {
      errors.push(`Expected array, got ${typeof value}`);
    }
  } else {
    const actualType = typeof value;
    if (actualType !== schema.type) {
      errors.push(`Expected ${schema.type}, got ${actualType}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Agent Registry ───────────────────────────────────────────────────────

const agentRegistry = new Map<string, AgentCapabilitySchema>();

export function registerAgent(schema: AgentCapabilitySchema): void {
  agentRegistry.set(schema.name, schema);
}

export function getAgent(name: string): AgentCapabilitySchema | undefined {
  return agentRegistry.get(name);
}

export function listAgents(): AgentCapabilitySchema[] {
  return Array.from(agentRegistry.values());
}

export function clearAgentRegistry(): void {
  agentRegistry.clear();
}

// ─── Resource Tracker ─────────────────────────────────────────────────────

export class ResourceTracker {
  private usage: ResourceUsage = { tokensUsed: 0, timeMs: 0, costUsd: 0 };
  private startTime = 0;
  private warnings: string[] = [];

  constructor(private readonly budget: ResourceBudget) {}

  start(): void {
    this.startTime = Date.now();
  }

  recordTokens(count: number): void {
    this.usage.tokensUsed += count;
    this.checkLimits();
  }

  recordCost(usd: number): void {
    this.usage.costUsd += usd;
    this.checkLimits();
  }

  updateTime(): void {
    if (this.startTime > 0) {
      this.usage.timeMs = Date.now() - this.startTime;
    }
  }

  getUsage(): ResourceUsage {
    this.updateTime();
    return { ...this.usage };
  }

  getWarnings(): string[] {
    return [...this.warnings];
  }

  private checkLimits(): void {
    this.updateTime();
    const softTokens = this.budget.maxTokens * this.budget.softLimitPct;
    const softTime = this.budget.maxTimeMs * this.budget.softLimitPct;
    const softCost = this.budget.maxCostUsd * this.budget.softLimitPct;

    if (this.usage.tokensUsed >= softTokens && !this.warnings.includes("tokens_soft")) {
      this.warnings.push("tokens_soft");
    }
    if (this.usage.timeMs >= softTime && !this.warnings.includes("time_soft")) {
      this.warnings.push("time_soft");
    }
    if (this.usage.costUsd >= softCost && !this.warnings.includes("cost_soft")) {
      this.warnings.push("cost_soft");
    }

    if (this.budget.hardFail) {
      if (this.usage.tokensUsed > this.budget.maxTokens) {
        throw new Error(`[BUDGET_EXCEEDED] Token limit exceeded: ${this.usage.tokensUsed}/${this.budget.maxTokens}`);
      }
      if (this.usage.timeMs > this.budget.maxTimeMs) {
        throw new Error(`[BUDGET_EXCEEDED] Time limit exceeded: ${this.usage.timeMs}ms/${this.budget.maxTimeMs}ms`);
      }
      if (this.usage.costUsd > this.budget.maxCostUsd) {
        throw new Error(`[BUDGET_EXCEEDED] Cost limit exceeded: $${this.usage.costUsd}/$${this.budget.maxCostUsd}`);
      }
    }
  }
}

// ─── Agent Execution ──────────────────────────────────────────────────────

export interface AgentExecutionResult<T = unknown> {
  output: T;
  usage: ResourceUsage;
  warnings: string[];
  validationErrors: string[];
}

/**
 * Execute an agent with full validation and resource tracking
 */
export async function executeAgent<I, O>(
  agentName: string,
  input: I,
  executeFn: (input: I) => Promise<O>,
  budget?: Partial<ResourceBudget>,
): Promise<AgentExecutionResult<O>> {
  const schema = getAgent(agentName);
  if (!schema) throw new Error(`Unknown agent: ${agentName}`);

  // Validate input
  const inputValidation = validateAgainstSchema(input, schema.inputSchema);
  if (!inputValidation.valid) {
    throw new Error(`[SCHEMA_VIOLATION] Input validation failed for agent '${agentName}': ${inputValidation.errors.join(", ")}`);
  }

  const resolvedBudget: ResourceBudget = {
    maxTokens: budget?.maxTokens ?? schema.costEstimate.tokensMax * 2,
    maxTimeMs: budget?.maxTimeMs ?? schema.timeoutMs,
    maxCostUsd: budget?.maxCostUsd ?? schema.costEstimate.costUsdMax * 2,
    softLimitPct: budget?.softLimitPct ?? 0.8,
    hardFail: budget?.hardFail ?? false,
  };

  const tracker = new ResourceTracker(resolvedBudget);
  tracker.start();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`[TIMEOUT] Agent '${agentName}' exceeded ${resolvedBudget.maxTimeMs}ms`)), resolvedBudget.maxTimeMs);
  });
  const output: O = await Promise.race([executeFn(input), timeoutPromise]);


  // Validate output
  const outputValidation = validateAgainstSchema(output, schema.outputSchema);
  const usage = tracker.getUsage();
  const warnings = tracker.getWarnings();

  return {
    output,
    usage,
    warnings,
    validationErrors: outputValidation.errors,
  };
}

// ─── Health Checks ────────────────────────────────────────────────────────

export async function checkAgentHealth(
  agentName: string,
  pingFn?: () => Promise<void>,
): Promise<AgentHealth> {
  const schema = getAgent(agentName);
  if (!schema) {
    return { name: agentName, status: "ERROR", lastChecked: new Date().toISOString(), error: "Agent not registered" };
  }

  if (!pingFn) {
    return { name: agentName, status: "READY", lastChecked: new Date().toISOString() };
  }

  const start = Date.now();
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), schema.timeoutMs);
    });
    await Promise.race([pingFn(), timeoutPromise]);
    return { name: agentName, status: "READY", lastChecked: new Date().toISOString(), latencyMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message === "timeout" ? "TIMEOUT" : "ERROR";
    return { name: agentName, status, lastChecked: new Date().toISOString(), error: message, latencyMs: Date.now() - start };
  }
}

export function formatAgentHealthList(healthResults: AgentHealth[]): string {
  const lines: string[] = [];
  lines.push("Agent Health:");
  lines.push("");

  for (const h of healthResults) {
    const statusIcon = h.status === "READY" ? "READY" : h.status === "TIMEOUT" ? "TIMEOUT" : "ERROR";
    const latency = h.latencyMs !== undefined ? ` (${h.latencyMs}ms)` : "";
    lines.push(`  [${statusIcon}] ${h.name}${latency}`);
    if (h.error) lines.push(`    Error: ${h.error}`);
  }

  return lines.join("\n");
}

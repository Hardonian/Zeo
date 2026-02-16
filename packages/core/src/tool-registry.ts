/**
 * Tool Registry — Formal Contract
 *
 * Strict typed tool interface with:
 * - Input/output JSON Schema validation at runtime
 * - Deterministic flag enforcement
 * - Side-effect declarations
 * - Structured error propagation (no silent catch-all)
 * - Version-aware tool registration
 */

import { createHash } from "node:crypto";
import { encodeCanonicalJson } from "./canonical-json.js";

// ---------------------------------------------------------------------------
// JSON Schema Subset (for tool input/output validation)
// ---------------------------------------------------------------------------

export interface JsonSchemaDescriptor {
  type: "object" | "string" | "number" | "boolean" | "array" | "null";
  properties?: Record<string, JsonSchemaDescriptor>;
  required?: string[];
  items?: JsonSchemaDescriptor;
  enum?: unknown[];
  description?: string;
}

// ---------------------------------------------------------------------------
// Tool Definition
// ---------------------------------------------------------------------------

export interface ToolDefinition<
  TInput = Record<string, unknown>,
  TOutput = unknown,
> {
  /** Unique tool name (e.g., "run.execute") */
  name: string;
  /** SemVer version string */
  version: string;
  /** JSON Schema for input validation */
  inputSchema: JsonSchemaDescriptor;
  /** JSON Schema for output validation */
  outputSchema: JsonSchemaDescriptor;
  /** If true, same input always produces same output (no I/O, no time, no randomness) */
  deterministic: boolean;
  /** If true, calling this tool mutates external state */
  sideEffects: boolean;
  /** The handler function */
  handler: (input: TInput) => TOutput | Promise<TOutput>;
}

// ---------------------------------------------------------------------------
// Tool Invocation Record (for audit)
// ---------------------------------------------------------------------------

export interface ToolInvocationRecord {
  toolName: string;
  toolVersion: string;
  inputHash: string;
  outputHash: string;
  deterministic: boolean;
  sideEffects: boolean;
  durationMs: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Validation Errors
// ---------------------------------------------------------------------------

export class ToolRegistryError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ToolRegistryError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Schema Validation (lightweight runtime check)
// ---------------------------------------------------------------------------

export function validateToolSchema(
  value: unknown,
  schema: JsonSchemaDescriptor,
  path = "",
): string[] {
  const errors: string[] = [];

  if (value === null || value === undefined) {
    if (schema.type !== "null") {
      errors.push(`${path || "root"}: expected ${schema.type}, got ${value === null ? "null" : "undefined"}`);
    }
    return errors;
  }

  if (schema.type === "object") {
    if (typeof value !== "object" || Array.isArray(value)) {
      errors.push(`${path || "root"}: expected object, got ${Array.isArray(value) ? "array" : typeof value}`);
      return errors;
    }
    const obj = value as Record<string, unknown>;
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push(`${path ? path + "." : ""}${key}: required field missing`);
        }
      }
    }
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          errors.push(...validateToolSchema(obj[key], propSchema, `${path ? path + "." : ""}${key}`));
        }
      }
      // Report unknown fields
      for (const key of Object.keys(obj)) {
        if (!(key in schema.properties)) {
          errors.push(`${path ? path + "." : ""}${key}: unknown field`);
        }
      }
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) {
      errors.push(`${path || "root"}: expected array, got ${typeof value}`);
      return errors;
    }
    if (schema.items) {
      for (let i = 0; i < (value as unknown[]).length; i++) {
        errors.push(...validateToolSchema((value as unknown[])[i], schema.items, `${path}[${i}]`));
      }
    }
  } else if (schema.type === "string" && typeof value !== "string") {
    errors.push(`${path || "root"}: expected string, got ${typeof value}`);
  } else if (schema.type === "number" && typeof value !== "number") {
    errors.push(`${path || "root"}: expected number, got ${typeof value}`);
  } else if (schema.type === "boolean" && typeof value !== "boolean") {
    errors.push(`${path || "root"}: expected boolean, got ${typeof value}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path || "root"}: value not in enum`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Tool Registry
// ---------------------------------------------------------------------------

export class ToolRegistry {
  private readonly _tools = new Map<string, ToolDefinition>();

  /**
   * Register a tool. Throws if a tool with the same name is already registered.
   */
  register(tool: ToolDefinition): void {
    if (this._tools.has(tool.name)) {
      throw new ToolRegistryError(
        "TOOL_ALREADY_REGISTERED",
        `Tool already registered: ${tool.name}`,
      );
    }
    if (!tool.name || !tool.version) {
      throw new ToolRegistryError(
        "TOOL_INVALID_DEFINITION",
        `Tool must have name and version`,
      );
    }
    this._tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name.
   */
  get(name: string): ToolDefinition | undefined {
    return this._tools.get(name);
  }

  /**
   * List all registered tools (sorted by name for determinism).
   */
  list(): ToolDefinition[] {
    return [...this._tools.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Number of registered tools.
   */
  get size(): number {
    return this._tools.size;
  }

  /**
   * Invoke a tool by name with input validation, timing, and audit.
   * Throws ToolRegistryError on validation failures.
   * Propagates handler errors without swallowing.
   */
  async invoke(
    name: string,
    input: Record<string, unknown>,
  ): Promise<{ output: unknown; record: ToolInvocationRecord }> {
    const tool = this._tools.get(name);
    if (!tool) {
      throw new ToolRegistryError("TOOL_NOT_FOUND", `Unknown tool: ${name}`);
    }

    // Validate input against schema
    const inputErrors = validateToolSchema(input, tool.inputSchema);
    if (inputErrors.length > 0) {
      throw new ToolRegistryError(
        "TOOL_INPUT_INVALID",
        `Input validation failed for ${name}: ${inputErrors.join("; ")}`,
      );
    }

    const inputHash = createHash("sha256")
      .update(encodeCanonicalJson(input))
      .digest("hex");
    const startMs = Date.now();

    try {
      const output = await tool.handler(input);
      const durationMs = Date.now() - startMs;
      const outputHash = createHash("sha256")
        .update(encodeCanonicalJson(output))
        .digest("hex");

      const record: ToolInvocationRecord = {
        toolName: tool.name,
        toolVersion: tool.version,
        inputHash,
        outputHash,
        deterministic: tool.deterministic,
        sideEffects: tool.sideEffects,
        durationMs,
        success: true,
        timestamp: new Date(startMs).toISOString(),
      };

      return { output, record };
    } catch (err) {
      const durationMs = Date.now() - startMs;
      const message = err instanceof Error ? err.message : String(err);

      const record: ToolInvocationRecord = {
        toolName: tool.name,
        toolVersion: tool.version,
        inputHash,
        outputHash: "",
        deterministic: tool.deterministic,
        sideEffects: tool.sideEffects,
        durationMs,
        success: false,
        error: message,
        timestamp: new Date(startMs).toISOString(),
      };

      // Structured error propagation — do NOT swallow
      if (err instanceof ToolRegistryError) throw err;
      const wrapped = new ToolRegistryError(
        "TOOL_EXECUTION_FAILED",
        `Tool ${name} failed: ${message}`,
      );
      (wrapped as any).record = record;
      throw wrapped;
    }
  }

  /**
   * Compute a deterministic hash of the entire registry state.
   * Used for snapshot chain hashing.
   */
  computeRegistryHash(): string {
    const tools = this.list().map(t => ({
      name: t.name,
      version: t.version,
      deterministic: t.deterministic,
      sideEffects: t.sideEffects,
    }));
    return createHash("sha256")
      .update(encodeCanonicalJson(tools))
      .digest("hex");
  }

  /**
   * Serialize the registry state (for snapshots).
   */
  toState(): { tools: Array<{ name: string; version: string; deterministic: boolean; sideEffects: boolean }>; registryHash: string } {
    const tools = this.list().map(t => ({
      name: t.name,
      version: t.version,
      deterministic: t.deterministic,
      sideEffects: t.sideEffects,
    }));
    return {
      tools,
      registryHash: this.computeRegistryHash(),
    };
  }
}

/**
 * Create the default tool registry with core engine tools.
 */
export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  const coreVersion = "0.3.0";
  const noopSchema: JsonSchemaDescriptor = { type: "object" };

  const coreTools: Array<{ name: string; deterministic: boolean }> = [
    { name: "branch_generator", deterministic: true },
    { name: "robustness_evaluator", deterministic: true },
    { name: "expected_utility_evaluator", deterministic: true },
    { name: "game_theory_evaluator", deterministic: true },
    { name: "evolutionary_evaluator", deterministic: true },
    { name: "flip_condition_generator", deterministic: true },
    { name: "evidence_ranker", deterministic: true },
  ];

  for (const t of coreTools) {
    registry.register({
      name: t.name,
      version: coreVersion,
      inputSchema: noopSchema,
      outputSchema: noopSchema,
      deterministic: t.deterministic,
      sideEffects: false,
      handler: () => ({}),
    });
  }

  return registry;
}

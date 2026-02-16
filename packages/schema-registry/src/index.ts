/**
 * @zeo/schema-registry — Data Contract + Schema Evolution
 *
 * Phase C of Zeo v3: Prevent silent breaking changes.
 *
 * Provides:
 * 1. Versioned Schemas — EvidenceNode, RunSnapshot, AgentInput, AgentOutput
 * 2. Contract Enforcement — schema mismatch → hard fail
 * 3. Migration Engine — deterministic transforms with integrity preservation
 * 4. Lineage Tracking — schema_version + evidence_version in metadata
 */

import { createHash } from "node:crypto";

// =============================================================================
// TYPES
// =============================================================================

export interface SchemaVersion {
  name: string;
  version: number;
  hash: string;
  fields: SchemaField[];
  createdAt: string;
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
}

export interface SchemaMigration {
  id: string;
  fromVersion: number;
  toVersion: number;
  schemaName: string;
  transform: (data: Record<string, unknown>) => Record<string, unknown>;
  description: string;
  createdAt: string;
  reversible: boolean;
}

export interface LineageRecord {
  entityId: string;
  schemaName: string;
  schemaVersion: number;
  evidenceVersion: number;
  createdAt: string;
  migratedFrom?: number;
  migrationId?: string;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  migratedCount: number;
  errors: string[];
  integrityHash: string;
}

export interface ContractValidation {
  valid: boolean;
  errors: string[];
  schemaName: string;
  expectedVersion: number;
  actualVersion?: number;
}

// =============================================================================
// SCHEMA DEFINITIONS (v1 baselines)
// =============================================================================

function hashSchema(fields: SchemaField[]): string {
  const canonical = JSON.stringify(fields.map(f => ({ n: f.name, t: f.type, r: f.required })));
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

const EVIDENCE_NODE_V1: SchemaField[] = [
  { name: "id", type: "string", required: true },
  { name: "label", type: "string", required: true },
  { name: "status", type: "string", required: true },
  { name: "confidence", type: "number", required: true },
  { name: "sourceId", type: "string", required: false },
  { name: "capturedAt", type: "string", required: true },
  { name: "checksum", type: "string", required: true },
  { name: "tags", type: "string[]", required: false, defaultValue: [] },
  { name: "tenantId", type: "string", required: true },
];

const RUN_SNAPSHOT_V1: SchemaField[] = [
  { name: "runId", type: "string", required: true },
  { name: "createdAt", type: "string", required: true },
  { name: "inputHash", type: "string", required: true },
  { name: "outputHash", type: "string", required: true },
  { name: "toolRegistryHash", type: "string", required: true },
  { name: "chainHash", type: "string", required: true },
  { name: "durationMs", type: "number", required: true },
  { name: "deterministic", type: "boolean", required: true },
  { name: "seed", type: "string", required: false },
  { name: "tenantId", type: "string", required: true },
  { name: "schemaVersion", type: "number", required: true },
];

const AGENT_INPUT_V1: SchemaField[] = [
  { name: "specId", type: "string", required: true },
  { name: "title", type: "string", required: true },
  { name: "context", type: "string", required: true },
  { name: "actions", type: "object[]", required: true },
  { name: "constraints", type: "object[]", required: true },
  { name: "assumptions", type: "object[]", required: true },
  { name: "tenantId", type: "string", required: true },
  { name: "schemaVersion", type: "number", required: true },
];

const AGENT_OUTPUT_V1: SchemaField[] = [
  { name: "runId", type: "string", required: true },
  { name: "evaluations", type: "object[]", required: true },
  { name: "explanation", type: "object", required: true },
  { name: "status", type: "string", required: true },
  { name: "usage", type: "object", required: false },
  { name: "tenantId", type: "string", required: true },
  { name: "schemaVersion", type: "number", required: true },
];

// =============================================================================
// SCHEMA REGISTRY
// =============================================================================

export class SchemaRegistry {
  private schemas = new Map<string, Map<number, SchemaVersion>>();
  private migrations: SchemaMigration[] = [];
  private lineage: LineageRecord[] = [];

  constructor() {
    // Register v1 baselines
    this.registerSchema("EvidenceNode", 1, EVIDENCE_NODE_V1);
    this.registerSchema("RunSnapshot", 1, RUN_SNAPSHOT_V1);
    this.registerSchema("AgentInput", 1, AGENT_INPUT_V1);
    this.registerSchema("AgentOutput", 1, AGENT_OUTPUT_V1);
  }

  // ── Schema Registration ──

  registerSchema(name: string, version: number, fields: SchemaField[]): SchemaVersion {
    let versions = this.schemas.get(name);
    if (!versions) {
      versions = new Map();
      this.schemas.set(name, versions);
    }

    const schema: SchemaVersion = {
      name,
      version,
      hash: hashSchema(fields),
      fields,
      createdAt: new Date().toISOString(),
    };

    versions.set(version, schema);
    return schema;
  }

  getSchema(name: string, version?: number): SchemaVersion | null {
    const versions = this.schemas.get(name);
    if (!versions) return null;

    if (version !== undefined) {
      return versions.get(version) ?? null;
    }

    // Return latest version
    let latest: SchemaVersion | null = null;
    for (const [, v] of versions) {
      if (!latest || v.version > latest.version) {
        latest = v;
      }
    }
    return latest;
  }

  getLatestVersion(name: string): number {
    const versions = this.schemas.get(name);
    if (!versions || versions.size === 0) return 0;
    let max = 0;
    for (const [v] of versions) {
      if (v > max) max = v;
    }
    return max;
  }

  listSchemas(): Array<{ name: string; latestVersion: number; hash: string }> {
    const result: Array<{ name: string; latestVersion: number; hash: string }> = [];
    for (const [name, versions] of this.schemas) {
      let latest: SchemaVersion | null = null;
      for (const [, v] of versions) {
        if (!latest || v.version > latest.version) latest = v;
      }
      if (latest) {
        result.push({ name, latestVersion: latest.version, hash: latest.hash });
      }
    }
    return result;
  }

  // ── Contract Enforcement ──

  validateContract(name: string, data: Record<string, unknown>, expectedVersion?: number): ContractValidation {
    const version = expectedVersion ?? this.getLatestVersion(name);
    const schema = this.getSchema(name, version);

    if (!schema) {
      return {
        valid: false,
        errors: [`Schema "${name}" v${version} not found`],
        schemaName: name,
        expectedVersion: version,
      };
    }

    const errors: string[] = [];

    // Check data has declared schemaVersion and it matches
    const declaredVersion = data["schemaVersion"] as number | undefined;
    if (declaredVersion !== undefined && declaredVersion !== version) {
      errors.push(
        `Schema version mismatch: data declares v${declaredVersion}, expected v${version}`
      );
    }

    // Validate required fields
    for (const field of schema.fields) {
      if (field.required && !(field.name in data)) {
        errors.push(`Missing required field: ${field.name}`);
      }

      if (field.name in data) {
        const val = data[field.name];
        if (val !== null && val !== undefined) {
          const actualType = Array.isArray(val)
            ? `${typeof val[0]}[]`
            : typeof val;
          // Loose type check (arrays, objects)
          const expectedBase = field.type.replace("[]", "");
          const isArray = field.type.endsWith("[]");
          if (isArray && !Array.isArray(val)) {
            errors.push(`Field "${field.name}" should be an array`);
          } else if (!isArray && expectedBase !== "object" && actualType !== expectedBase) {
            errors.push(
              `Field "${field.name}" type mismatch: expected ${field.type}, got ${actualType}`
            );
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      schemaName: name,
      expectedVersion: version,
      actualVersion: declaredVersion,
    };
  }

  /**
   * Hard-fail validation — throws on mismatch.
   */
  enforceContract(name: string, data: Record<string, unknown>, expectedVersion?: number): void {
    const result = this.validateContract(name, data, expectedVersion);
    if (!result.valid) {
      throw new SchemaValidationError(
        name,
        result.expectedVersion,
        result.errors
      );
    }
  }

  // ── Migration Engine ──

  registerMigration(migration: SchemaMigration): void {
    this.migrations.push(migration);
    // Sort by fromVersion for ordered application
    this.migrations.sort((a, b) => a.fromVersion - b.fromVersion);
  }

  /**
   * Migrate data from one schema version to another.
   * Deterministic: same input → same output.
   */
  migrate(
    schemaName: string,
    data: Record<string, unknown>[],
    fromVersion: number,
    toVersion: number
  ): MigrationResult {
    const errors: string[] = [];
    let migratedCount = 0;

    if (fromVersion >= toVersion) {
      return {
        success: false,
        fromVersion,
        toVersion,
        migratedCount: 0,
        errors: [`Cannot migrate from v${fromVersion} to v${toVersion}: target must be higher`],
        integrityHash: "",
      };
    }

    // Find migration chain
    const chain = this.findMigrationChain(schemaName, fromVersion, toVersion);
    if (chain.length === 0) {
      return {
        success: false,
        fromVersion,
        toVersion,
        migratedCount: 0,
        errors: [`No migration path from v${fromVersion} to v${toVersion} for schema "${schemaName}"`],
        integrityHash: "",
      };
    }

    // Apply migrations in order
    for (let i = 0; i < data.length; i++) {
      try {
        let record = { ...data[i] };
        for (const migration of chain) {
          record = migration.transform(record);
        }
        record["schemaVersion"] = toVersion;
        data[i] = record;
        migratedCount++;

        // Track lineage
        this.lineage.push({
          entityId: (record["id"] as string) ?? `record_${i}`,
          schemaName,
          schemaVersion: toVersion,
          evidenceVersion: (record["evidenceVersion"] as number) ?? 1,
          createdAt: new Date().toISOString(),
          migratedFrom: fromVersion,
          migrationId: chain[chain.length - 1].id,
        });
      } catch (err) {
        errors.push(`Record ${i}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Compute integrity hash of migrated data
    const integrityHash = createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex")
      .slice(0, 32);

    return {
      success: errors.length === 0,
      fromVersion,
      toVersion,
      migratedCount,
      errors,
      integrityHash,
    };
  }

  private findMigrationChain(
    schemaName: string,
    from: number,
    to: number
  ): SchemaMigration[] {
    const chain: SchemaMigration[] = [];
    let current = from;

    while (current < to) {
      const next = this.migrations.find(
        (m) => m.schemaName === schemaName && m.fromVersion === current
      );
      if (!next) break;
      chain.push(next);
      current = next.toVersion;
    }

    return current === to ? chain : [];
  }

  // ── Lineage ──

  getLineage(entityId: string): LineageRecord[] {
    return this.lineage.filter((l) => l.entityId === entityId);
  }

  getAllLineage(): LineageRecord[] {
    return [...this.lineage];
  }
}

// =============================================================================
// ERRORS
// =============================================================================

export class SchemaValidationError extends Error {
  constructor(
    public readonly schemaName: string,
    public readonly expectedVersion: number,
    public readonly validationErrors: string[]
  ) {
    super(
      `Schema contract violation for "${schemaName}" v${expectedVersion}: ${validationErrors.join("; ")}`
    );
    this.name = "SchemaValidationError";
  }
}

// =============================================================================
// FORMATTING
// =============================================================================

export function formatMigrationResult(result: MigrationResult): string {
  const lines: string[] = [
    `=== Migration Result ===`,
    `Status:    ${result.success ? "SUCCESS" : "FAILED"}`,
    `From:      v${result.fromVersion}`,
    `To:        v${result.toVersion}`,
    `Migrated:  ${result.migratedCount}`,
    `Integrity: ${result.integrityHash}`,
  ];
  if (result.errors.length > 0) {
    lines.push(`Errors:`);
    for (const e of result.errors) {
      lines.push(`  - ${e}`);
    }
  }
  return lines.join("\n");
}

export function formatSchemaList(
  schemas: Array<{ name: string; latestVersion: number; hash: string }>
): string {
  const lines: string[] = [`=== Schema Registry ===`];
  for (const s of schemas) {
    lines.push(`  ${s.name} v${s.latestVersion} (${s.hash.slice(0, 8)})`);
  }
  return lines.join("\n");
}

// =============================================================================
// SINGLETON
// =============================================================================

export const schemaRegistry = new SchemaRegistry();

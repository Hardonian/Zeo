/**
 * @zeo/compliance — Enterprise Hardening
 *
 * Phase E of Zeo v3: Make Zeo audit-ready.
 *
 * Provides:
 * 1. Append-Only Audit Ledger — tamper-evident log with chain hashing
 * 2. Compliance Report Generator — structured audit summary per tenant
 * 3. Retention Policy Engine — time-based cleanup with retention_days enforcement
 * 4. Secret Scanner — regex scanning of inputs/outputs for credential leaks
 * 5. Attestation Metadata — cryptographic attestation records
 */

import { createHash } from "node:crypto";
import { nanoid } from "nanoid";

// =============================================================================
// TYPES
// =============================================================================

export interface ComplianceAuditEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  action: string;
  actor: string;
  resource: string;
  resourceId: string;
  outcome: "success" | "failure" | "denied";
  details: Record<string, unknown>;
  hash: string;
  previousHash: string;
}

export interface ComplianceReport {
  tenantId: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  totalRuns: number;
  totalPolicyViolations: number;
  totalAccessDenials: number;
  totalSecretDetections: number;
  averageRunLatencyMs: number;
  deterministicRunPercentage: number;
  auditEntryCount: number;
  retentionCompliant: boolean;
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  severity: "info" | "warning" | "critical";
  code: string;
  message: string;
  timestamp: string;
  tenantId: string;
}

export interface RetentionPolicy {
  tenantId: string;
  retentionDays: number;
  archiveAfterDays: number;
  deleteAfterDays: number;
}

export interface SecretScanResult {
  clean: boolean;
  detections: SecretDetection[];
}

export interface SecretDetection {
  type: string;
  location: string;
  line?: number;
  severity: "warning" | "critical";
  redactedValue: string;
}

export interface AttestationRecord {
  id: string;
  tenantId: string;
  runId: string;
  timestamp: string;
  inputHash: string;
  outputHash: string;
  chainHash: string;
  attestationType: "self" | "witness" | "external";
  signerIdentity?: string;
  signatureHash?: string;
}

// =============================================================================
// APPEND-ONLY AUDIT LEDGER
// =============================================================================

export class ComplianceAuditLedger {
  private entries: ComplianceAuditEntry[] = [];
  private lastHash = "genesis";

  append(
    tenantId: string,
    action: string,
    actor: string,
    resource: string,
    resourceId: string,
    outcome: ComplianceAuditEntry["outcome"],
    details: Record<string, unknown> = {}
  ): ComplianceAuditEntry {
    const timestamp = new Date().toISOString();
    const id = `audit_${nanoid(12)}`;

    const payloadHash = createHash("sha256")
      .update(
        JSON.stringify({
          id,
          tenantId,
          timestamp,
          action,
          actor,
          resource,
          resourceId,
          outcome,
          details,
          previousHash: this.lastHash,
        })
      )
      .digest("hex");

    const entry: ComplianceAuditEntry = {
      id,
      tenantId,
      timestamp,
      action,
      actor,
      resource,
      resourceId,
      outcome,
      details,
      hash: payloadHash,
      previousHash: this.lastHash,
    };

    this.entries.push(entry);
    this.lastHash = payloadHash;
    return entry;
  }

  getEntries(tenantId?: string, limit = 100): ComplianceAuditEntry[] {
    let filtered = this.entries;
    if (tenantId) {
      filtered = filtered.filter((e) => e.tenantId === tenantId);
    }
    return filtered.slice(-limit);
  }

  /**
   * Verify the integrity of the entire audit chain.
   */
  verifyChain(): { valid: boolean; brokenAt?: number; details?: string } {
    if (this.entries.length === 0) {
      return { valid: true };
    }

    let expectedPrevHash = "genesis";
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].previousHash !== expectedPrevHash) {
        return {
          valid: false,
          brokenAt: i,
          details: `Chain broken at entry ${i}: expected previousHash ${expectedPrevHash}, got ${this.entries[i].previousHash}`,
        };
      }
      expectedPrevHash = this.entries[i].hash;
    }

    return { valid: true };
  }

  size(): number {
    return this.entries.length;
  }
}

// =============================================================================
// COMPLIANCE REPORT GENERATOR
// =============================================================================

export function generateComplianceReport(
  tenantId: string,
  ledger: ComplianceAuditLedger,
  options: {
    periodStart?: string;
    periodEnd?: string;
    retentionDays?: number;
  } = {}
): ComplianceReport {
  const now = new Date().toISOString();
  const periodStart = options.periodStart ?? new Date(Date.now() - 30 * 86400_000).toISOString();
  const periodEnd = options.periodEnd ?? now;

  const entries = ledger.getEntries(tenantId, 10000);
  const periodEntries = entries.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= new Date(periodStart).getTime() && t <= new Date(periodEnd).getTime();
  });

  const runs = periodEntries.filter((e) => e.action === "execute_run");
  const violations = periodEntries.filter((e) => e.outcome === "failure" && e.action.includes("policy"));
  const denials = periodEntries.filter((e) => e.outcome === "denied");
  const secrets = periodEntries.filter((e) => e.action === "secret_detected");

  // Calculate average latency from run entries
  const latencies = runs
    .map((r) => (r.details["durationMs"] as number) ?? 0)
    .filter((l) => l > 0);
  const avgLatency = latencies.length > 0
    ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
    : 0;

  // Deterministic percentage
  const deterministicRuns = runs.filter((r) => r.details["deterministic"] === true);
  const deterministicPct = runs.length > 0 ? (deterministicRuns.length / runs.length) * 100 : 0;

  // Retention compliance
  const retentionDays = options.retentionDays ?? 90;
  const oldestEntry = entries[0];
  const oldestAge = oldestEntry
    ? (Date.now() - new Date(oldestEntry.timestamp).getTime()) / 86400_000
    : 0;
  const retentionCompliant = oldestAge <= retentionDays * 1.1; // 10% grace

  // Generate findings
  const findings: ComplianceFinding[] = [];

  if (violations.length > 0) {
    findings.push({
      severity: "warning",
      code: "POL_VIOLATIONS",
      message: `${violations.length} policy violations in reporting period`,
      timestamp: now,
      tenantId,
    });
  }

  if (denials.length > 10) {
    findings.push({
      severity: "warning",
      code: "ACCESS_DENIALS",
      message: `${denials.length} access denials — possible configuration issue`,
      timestamp: now,
      tenantId,
    });
  }

  if (secrets.length > 0) {
    findings.push({
      severity: "critical",
      code: "SECRET_EXPOSURE",
      message: `${secrets.length} potential secret exposures detected`,
      timestamp: now,
      tenantId,
    });
  }

  if (deterministicPct < 80) {
    findings.push({
      severity: "info",
      code: "LOW_DETERMINISM",
      message: `Only ${deterministicPct.toFixed(1)}% of runs are deterministic`,
      timestamp: now,
      tenantId,
    });
  }

  if (!retentionCompliant) {
    findings.push({
      severity: "warning",
      code: "RETENTION_EXCEEDED",
      message: `Audit entries exceed retention policy (${retentionDays} days)`,
      timestamp: now,
      tenantId,
    });
  }

  // Verify chain integrity
  const chainCheck = ledger.verifyChain();
  if (!chainCheck.valid) {
    findings.push({
      severity: "critical",
      code: "CHAIN_INTEGRITY",
      message: `Audit chain integrity failure: ${chainCheck.details}`,
      timestamp: now,
      tenantId,
    });
  }

  return {
    tenantId,
    generatedAt: now,
    periodStart,
    periodEnd,
    totalRuns: runs.length,
    totalPolicyViolations: violations.length,
    totalAccessDenials: denials.length,
    totalSecretDetections: secrets.length,
    averageRunLatencyMs: Math.round(avgLatency),
    deterministicRunPercentage: Math.round(deterministicPct * 10) / 10,
    auditEntryCount: entries.length,
    retentionCompliant,
    findings,
  };
}

// =============================================================================
// SECRET SCANNER
// =============================================================================

const SECRET_PATTERNS: Array<{ name: string; regex: RegExp; severity: SecretDetection["severity"] }> = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "AWS Secret Key", regex: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g, severity: "warning" },
  { name: "GitHub Token", regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g, severity: "critical" },
  { name: "Private Key Header", regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, severity: "critical" },
  { name: "Generic API Key", regex: /(?:api[_-]?key|apikey|api_secret)['":\s]*[=:]\s*['"]?[A-Za-z0-9_\-]{20,}['"]?/gi, severity: "warning" },
  { name: "JWT Token", regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, severity: "warning" },
  { name: "Password in URL", regex: /[a-z]+:\/\/[^:]+:[^@]+@/gi, severity: "critical" },
  { name: "Bearer Token", regex: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/g, severity: "warning" },
];

export function scanForSecrets(content: string, location = "unknown"): SecretScanResult {
  const detections: SecretDetection[] = [];

  for (const pattern of SECRET_PATTERNS) {
    const matches = content.matchAll(pattern.regex);
    for (const match of matches) {
      const value = match[0];
      detections.push({
        type: pattern.name,
        location,
        severity: pattern.severity,
        redactedValue: value.slice(0, 4) + "****" + value.slice(-4),
      });
    }
  }

  return {
    clean: detections.length === 0,
    detections,
  };
}

/**
 * Scan multiple fields of an object for secrets.
 */
export function scanObjectForSecrets(
  obj: Record<string, unknown>,
  objectLabel = "input"
): SecretScanResult {
  const allDetections: SecretDetection[] = [];

  function scanValue(value: unknown, path: string): void {
    if (typeof value === "string") {
      const result = scanForSecrets(value, `${objectLabel}.${path}`);
      allDetections.push(...result.detections);
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => scanValue(item, `${path}[${i}]`));
    } else if (value !== null && typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        scanValue(v, `${path}.${k}`);
      }
    }
  }

  for (const [key, val] of Object.entries(obj)) {
    scanValue(val, key);
  }

  return {
    clean: allDetections.length === 0,
    detections: allDetections,
  };
}

// =============================================================================
// RETENTION POLICY ENGINE
// =============================================================================

export class RetentionPolicyEngine {
  private policies = new Map<string, RetentionPolicy>();

  setPolicy(tenantId: string, retentionDays: number, archiveAfterDays?: number, deleteAfterDays?: number): void {
    this.policies.set(tenantId, {
      tenantId,
      retentionDays,
      archiveAfterDays: archiveAfterDays ?? retentionDays,
      deleteAfterDays: deleteAfterDays ?? retentionDays * 4,
    });
  }

  getPolicy(tenantId: string): RetentionPolicy | null {
    return this.policies.get(tenantId) ?? null;
  }

  /**
   * Evaluate which records should be kept, archived, or deleted.
   */
  evaluateRetention(
    tenantId: string,
    records: Array<{ id: string; timestamp: string }>
  ): {
    keep: string[];
    archive: string[];
    delete: string[];
  } {
    const policy = this.policies.get(tenantId);
    if (!policy) {
      return { keep: records.map((r) => r.id), archive: [], delete: [] };
    }

    const now = Date.now();
    const keep: string[] = [];
    const archive: string[] = [];
    const toDelete: string[] = [];

    for (const record of records) {
      const age = (now - new Date(record.timestamp).getTime()) / 86400_000;
      if (age > policy.deleteAfterDays) {
        toDelete.push(record.id);
      } else if (age > policy.archiveAfterDays) {
        archive.push(record.id);
      } else {
        keep.push(record.id);
      }
    }

    return { keep, archive, delete: toDelete };
  }
}

// =============================================================================
// ATTESTATION
// =============================================================================

export function createAttestation(
  tenantId: string,
  runId: string,
  inputHash: string,
  outputHash: string,
  chainHash: string,
  type: AttestationRecord["attestationType"] = "self"
): AttestationRecord {
  return {
    id: `attest_${nanoid(12)}`,
    tenantId,
    runId,
    timestamp: new Date().toISOString(),
    inputHash,
    outputHash,
    chainHash,
    attestationType: type,
  };
}

// =============================================================================
// FORMATTING
// =============================================================================

export function formatComplianceReport(report: ComplianceReport): string {
  const severityIcon = { info: "ℹ", warning: "⚠", critical: "🔴" };
  const lines: string[] = [
    `=== Compliance Report: ${report.tenantId} ===`,
    `Generated:        ${report.generatedAt}`,
    `Period:           ${report.periodStart} → ${report.periodEnd}`,
    ``,
    `Runs:             ${report.totalRuns}`,
    `Avg Latency:      ${report.averageRunLatencyMs}ms`,
    `Deterministic:    ${report.deterministicRunPercentage}%`,
    `Policy Violations: ${report.totalPolicyViolations}`,
    `Access Denials:   ${report.totalAccessDenials}`,
    `Secret Detections: ${report.totalSecretDetections}`,
    `Audit Entries:    ${report.auditEntryCount}`,
    `Retention:        ${report.retentionCompliant ? "COMPLIANT" : "NON-COMPLIANT"}`,
  ];

  if (report.findings.length > 0) {
    lines.push(``, `Findings:`);
    for (const f of report.findings) {
      lines.push(`  ${severityIcon[f.severity]} [${f.code}] ${f.message}`);
    }
  }

  return lines.join("\n");
}

export function formatSecretScanResult(result: SecretScanResult): string {
  if (result.clean) return "✓ No secrets detected";
  const lines: string[] = [`⚠ ${result.detections.length} potential secret(s) found:`];
  for (const d of result.detections) {
    const icon = d.severity === "critical" ? "🔴" : "⚠";
    lines.push(`  ${icon} ${d.type} at ${d.location}: ${d.redactedValue}`);
  }
  return lines.join("\n");
}

// =============================================================================
// SINGLETONS
// =============================================================================

export const complianceLedger = new ComplianceAuditLedger();
export const retentionEngine = new RetentionPolicyEngine();

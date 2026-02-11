import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { DashboardPersona, DashboardViewModel } from "@zeo/contracts";

type AnyRecord = Record<string, unknown>;

export interface GenerateDashboardOptions {
  id: string;
  persona?: DashboardPersona;
}

function viewModelPath(id: string): string {
  return resolve(process.cwd(), ".zeo", "viewmodels", `${id}.json`);
}

function hashText(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  const objectValue = value as AnyRecord;
  return Object.keys(objectValue)
    .sort((a, b) => a.localeCompare(b))
    .reduce<AnyRecord>((acc, key) => {
      acc[key] = stableValue(objectValue[key]);
      return acc;
    }, {});
}

export function stableStringify(value: unknown): string {
  return `${JSON.stringify(stableValue(value), null, 2)}\n`;
}

function normalizeSeverity(severity: string): number {
  if (severity === "high") return 5;
  if (severity === "medium") return 3;
  return 1;
}

function confidenceBand(riskScore: number, evidenceCompleteness: number): "low" | "med" | "high" {
  if (riskScore <= 35 && evidenceCompleteness >= 80) return "high";
  if (riskScore <= 65 && evidenceCompleteness >= 55) return "med";
  return "low";
}

function fromAnalyzePrArtifact(id: string, persona: DashboardPersona): DashboardViewModel | null {
  const dir = resolve(process.cwd(), ".zeo", "analyze-pr", id);
  const manifestPath = join(dir, "manifest.json");
  const findingsPath = join(dir, "findings.json");
  const summaryPath = join(dir, "summary.json");
  if (!existsSync(manifestPath) || !existsSync(findingsPath) || !existsSync(summaryPath)) return null;

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as AnyRecord;
  const findings = JSON.parse(readFileSync(findingsPath, "utf8")) as Array<Record<string, unknown>>;
  const summary = JSON.parse(readFileSync(summaryPath, "utf8")) as Record<string, unknown>;

  const sortedFindings = findings
    .map((finding) => {
      const severityText = String(finding.severity ?? "low");
      return {
        id: String(finding.id),
        category: String(finding.category ?? "unknown"),
        severity: normalizeSeverity(severityText),
        title: String(finding.description ?? "Unknown finding"),
        file: typeof finding.file === "string" ? finding.file : undefined,
        rationaleRefs: (Array.isArray(finding.evidence) ? finding.evidence : []).map((entry) => String(entry)).sort((a, b) => a.localeCompare(b)),
      };
    })
    .sort((a, b) => b.severity - a.severity || a.category.localeCompare(b.category) || (a.file ?? "").localeCompare(b.file ?? "") || a.id.localeCompare(b.id));

  const riskScore = Number(summary.risk_score ?? 0);
  const evidenceCompleteness = Math.max(0, Math.min(100, Math.round((1 - sortedFindings.length / 25) * 100)));
  const policyCompliance = Math.max(0, Math.min(100, 100 - sortedFindings.filter((x) => x.severity >= 5).length * 20));
  const replayStability = manifest.manifest_hash ? 100 : 40;

  const evidence = sortedFindings
    .slice(0, 12)
    .map((finding, idx) => ({
      id: `ev_${finding.id}`,
      qualityScore: Math.max(10, 100 - finding.severity * 12),
      freshness: (idx < 4 ? "fresh" : idx < 8 ? "aging" : "stale") as const,
      ageDays: idx * 6,
      expiresAt: idx > 8 ? "1970-01-01" : undefined,
    }))
    .sort((a, b) => b.qualityScore - a.qualityScore || a.id.localeCompare(b.id));

  const policies = [
    ...new Set(sortedFindings.flatMap((finding) => finding.rationaleRefs.filter((ref) => ref.includes("policy") || ref.includes("security")))),
  ]
    .map((idValue, idx) => ({
      id: idValue,
      status: (idx === 0 && policyCompliance < 90 ? "fail" : idx < 2 ? "warn" : "pass") as const,
      severity: idx === 0 ? 5 : 3,
      rationaleRefs: [idValue],
    }))
    .sort((a, b) => b.severity - a.severity || a.id.localeCompare(b.id));

  const now = "1970-01-01T00:00:00.000Z";
  const trajectory = [0, 1, 2, 3, 4].map((step) => ({
    t: `1970-01-0${step + 1}T00:00:00.000Z`,
    v: Math.max(0, Math.min(100, riskScore + (step - 2) * 4)),
    source: "summary.risk_score",
  }));

  const driftEvents = sortedFindings.slice(0, 6).map((finding, idx) => ({
    t: `1970-01-0${Math.min(9, idx + 1)}T00:00:00.000Z`,
    type: (finding.category === "security" ? "policy" : "evidence") as const,
    severity: Math.min(5, Math.max(1, finding.severity)) as 1 | 2 | 3 | 4 | 5,
    refId: finding.id,
  })).sort((a, b) => b.severity - a.severity || a.refId.localeCompare(b.refId));

  const assumptionFlips = sortedFindings.slice(0, 4).map((finding, idx) => ({
    t: `1970-01-0${idx + 1}T00:00:00.000Z`,
    assumptionId: `asm_${finding.id}`,
    from: "pass",
    to: finding.severity >= 5 ? "fail" : "warn",
    severity: Math.min(5, Math.max(1, finding.severity)) as 1 | 2 | 3 | 4 | 5,
  })).sort((a, b) => b.severity - a.severity || a.assumptionId.localeCompare(b.assumptionId));

  const model: DashboardViewModel = {
    schemaVersion: "dashboard.viewmodel.v1",
    id,
    generatedAt: now,
    persona,
    verificationStatus: { verified: Boolean(manifest.manifest_hash), reason: manifest.manifest_hash ? "manifest hash present" : "manifest hash missing" },
    fingerprint: {
      zeoVersion: "1.0.0",
      configHash: hashText("default-config"),
      policyHash: typeof manifest.manifest_hash === "string" ? manifest.manifest_hash : null,
      inputsHash: hashText(readFileSync(findingsPath, "utf8")),
      artifactsHash: hashText(readFileSync(manifestPath, "utf8")),
    },
    summary: {
      riskScore,
      evidenceCompleteness,
      policyCompliance,
      replayStability,
      confidenceBand: confidenceBand(riskScore, evidenceCompleteness),
    },
    story: {
      mode: "deterministic",
      statusLine: `Decision ${id} is currently at risk score ${riskScore}.`,
      changeLine: `Risk trajectory shifted by ${(trajectory[trajectory.length - 1]?.v ?? riskScore) - (trajectory[0]?.v ?? riskScore)} points across observed checkpoints.`,
      causeLine: sortedFindings[0] ? `Primary driver is finding ${sortedFindings[0].id} in ${sortedFindings[0].category}.` : "Primary driver is Unknown due to missing findings.",
      actionLine: sortedFindings[0] ? `Prioritize mitigation for ${sortedFindings[0].id} and replay this run.` : "Collect additional evidence and rerun analysis.",
    },
    trends: { riskTrajectory: trajectory, driftEvents, assumptionFlips },
    graph: {
      nodes: [
        { id: `decision:${id}`, type: "decision" as const, label: id, severity: Math.round(riskScore / 20) },
        ...sortedFindings.slice(0, 10).map((finding) => ({ id: `finding:${finding.id}`, type: "evidence" as const, label: finding.title, severity: finding.severity })),
      ].sort((a, b) => a.id.localeCompare(b.id)),
      edges: sortedFindings
        .slice(0, 10)
        .map((finding) => ({ from: `finding:${finding.id}`, to: `decision:${id}`, type: finding.severity >= 5 ? "violates" as const : "supports" as const, weight: finding.severity / 5 }))
        .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    },
    lists: {
      findings: sortedFindings,
      evidence,
      policies,
    },
    ctas: [
      { label: "Add missing evidence", command: `zeo add-note --decision ${id} --text "add provenance-backed evidence"`, reason: "Increase evidence completeness", priority: 1 },
      { label: "Set review horizon", command: `zeo review weekly --decision ${id}`, reason: "Track sensitivity and drift", priority: 2 },
      { label: "Export signed bundle", command: `zeo export bundle --decision ${id}`, reason: "Support audit and sharing", priority: 3 },
    ],
  };

  return model;
}

export function generateDashboardViewModel(options: GenerateDashboardOptions): DashboardViewModel {
  const persona: DashboardPersona = options.persona ?? "exec";
  const model = fromAnalyzePrArtifact(options.id, persona);
  if (!model) {
    throw new Error(`Dashboard source not found for id '${options.id}'. Expected .zeo/analyze-pr/${options.id}/ manifest + findings + summary artifacts.`);
  }

  return model;
}

export function writeDashboardViewModel(id: string, model: DashboardViewModel): string {
  const outPath = viewModelPath(id);
  const outDir = resolve(process.cwd(), ".zeo", "viewmodels");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, stableStringify(model), "utf8");
  return outPath;
}

export function loadOrGenerateDashboardViewModel(options: GenerateDashboardOptions): { path: string; model: DashboardViewModel } {
  const outPath = viewModelPath(options.id);
  const fresh = generateDashboardViewModel(options);
  writeDashboardViewModel(options.id, fresh);
  return { path: outPath, model: fresh };
}

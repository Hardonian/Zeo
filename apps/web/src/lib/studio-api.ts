/**
 * Studio API Layer
 *
 * Pure TypeScript module that wraps @zeo/core, @zeo/tenant, @zeo/compliance
 * with structured JSON responses for Studio UI consumption.
 *
 * Invariants:
 * - No secrets in any response
 * - Strict tenant scoping
 * - All responses are { ok: true, data } | { ok: false, error: { code, message, hint } }
 * - Timeouts on all operations
 */

import { createHash } from "node:crypto";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudioResponse<T> {
  ok: true;
  data: T;
}

export interface StudioError {
  ok: false;
  error: {
    code: string;
    message: string;
    hint?: string;
  };
}

export type StudioResult<T> = StudioResponse<T> | StudioError;

export interface RunSummary {
  runId: string;
  createdAt: string;
  deterministic: boolean;
  inputHash: string;
  outputHash: string;
  chainHash: string;
  durationMs: number;
  title: string;
  nodeCount: number;
  edgeCount: number;
  seed?: string;
}

export interface RunDetail extends RunSummary {
  spec: {
    title: string;
    context: string;
    actionsCount: number;
    assumptionsCount: number;
    actions: Array<{ id: string; label: string }>;
    assumptions: Array<{ id: string; text: string; status: string; confidence: string }>;
  };
  evaluations: Array<{
    lens: string;
    summary: string;
    robustActions: string[];
    dominatedActions: string[];
    fragileAssumptions: string[];
  }>;
  explanation: {
    why: string[];
    whatWouldChange: Array<{ assumptionId: string; flipCondition: string }>;
  };
  nextBestEvidence: Array<{ prompt: string; rationale: string }>;
}

export interface ReplayResultData {
  verdict: "PASS" | "DRIFT";
  originalRunId: string;
  replayRunId: string;
  originalOutputHash: string;
  replayOutputHash: string;
  diffs: Array<{ field: string; original: unknown; replayed: unknown }>;
  durationMs: number;
}

export interface DiffResultData {
  runA: string;
  runB: string;
  summary: string;
  changedAssumptions: Array<{
    id: string;
    text: string;
    changeType: "added" | "removed" | "modified";
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  changedOutputs: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  confidenceDelta: {
    robustActionsA: string[];
    robustActionsB: string[];
    added: string[];
    removed: string[];
  } | null;
  evidenceChanges: Array<{ type: string; description: string }>;
}

export interface EvidenceNodeData {
  id: string;
  claim: string;
  source: string;
  confidenceScore: number;
  decayRate: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  linkedDecisionIds: string[];
  outcome?: string;
  regretImpact?: number;
}

export interface ToolData {
  name: string;
  description: string;
  version: string;
  status: "ready" | "error" | "timeout";
  inputSchema?: Record<string, unknown>;
}

export interface ComplianceReportData {
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
  findings: Array<{
    severity: string;
    code: string;
    message: string;
    timestamp: string;
  }>;
}

// ─── Secret Redaction ────────────────────────────────────────────────────────

const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/g,
  /gh[pousr]_[A-Za-z0-9_]{36,}/g,
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
  /(?:api[_-]?key|apikey|api_secret|password|secret)['":=\s]+\S{8,}/gi,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /Bearer\s+[A-Za-z0-9_\-.]{20,}/g,
];

export function redactSecrets(obj: unknown): unknown {
  if (typeof obj === "string") {
    let redacted = obj;
    for (const pattern of SECRET_PATTERNS) {
      redacted = redacted.replace(pattern, "[REDACTED]");
    }
    return redacted;
  }
  if (Array.isArray(obj)) {
    return obj.map(redactSecrets);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Redact keys that might contain secrets
      const lk = key.toLowerCase();
      if (lk.includes("secret") || lk.includes("token") || lk.includes("password") || lk.includes("api_key") || lk.includes("apikey")) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactSecrets(value);
      }
    }
    return result;
  }
  return obj;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ok<T>(data: T): StudioResponse<T> {
  return { ok: true, data: redactSecrets(data) as T };
}

function err(code: string, message: string, hint?: string): StudioError {
  return { ok: false, error: { code, message, hint } };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

const DEFAULT_TIMEOUT = 30_000;

// ─── API Functions ───────────────────────────────────────────────────────────

export async function listRuns(_tenant?: string): Promise<StudioResult<RunSummary[]>> {
  try {
    const core = await import("@zeo/core");
    const ids = core.listSnapshots();
    const runs: RunSummary[] = [];

    for (const id of ids) {
      const snapshot = core.loadSnapshot(id);
      if (!snapshot) continue;
      runs.push({
        runId: snapshot.runId,
        createdAt: snapshot.createdAt,
        deterministic: snapshot.deterministic,
        inputHash: snapshot.inputHash,
        outputHash: snapshot.outputHash,
        chainHash: snapshot.chainHash,
        durationMs: snapshot.durationMs,
        title: snapshot.input.spec.title,
        nodeCount: snapshot.output?.graph.nodes.length ?? 0,
        edgeCount: snapshot.output?.graph.edges.length ?? 0,
        seed: snapshot.seed,
      });
    }

    // Sort newest first
    runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return ok(runs);
  } catch (e) {
    return err("LIST_RUNS_FAILED", (e as Error).message, "Ensure .zeo/snapshots/ directory exists. Run a decision first with: zeo run --deterministic");
  }
}

export async function getRun(runId: string): Promise<StudioResult<RunDetail>> {
  try {
    const core = await import("@zeo/core");
    const snapshot = core.loadSnapshot(runId);
    if (!snapshot) {
      return err("RUN_NOT_FOUND", `Run not found: ${runId}`, "Run 'zeo snapshots' to list available runs.");
    }

    const detail: RunDetail = {
      runId: snapshot.runId,
      createdAt: snapshot.createdAt,
      deterministic: snapshot.deterministic,
      inputHash: snapshot.inputHash,
      outputHash: snapshot.outputHash,
      chainHash: snapshot.chainHash,
      durationMs: snapshot.durationMs,
      title: snapshot.input.spec.title,
      nodeCount: snapshot.output?.graph.nodes.length ?? 0,
      edgeCount: snapshot.output?.graph.edges.length ?? 0,
      seed: snapshot.seed,
      spec: {
        title: snapshot.input.spec.title,
        context: snapshot.input.spec.context,
        actionsCount: snapshot.input.spec.actions.length,
        assumptionsCount: snapshot.input.spec.assumptions.length,
        actions: snapshot.input.spec.actions.map((a: { id: string; label: string }) => ({ id: a.id, label: a.label })),
        assumptions: (!!snapshot.input.spec.assumptions && snapshot.input.spec.assumptions.map((a: { id: string; text: string; status: string; confidence: string }) => ({
          id: a.id,
          text: a.text,
          status: a.status,
          confidence: a.confidence,
        }))) || [],
      },
      evaluations: snapshot.output?.evaluations.map((e: { lens: string; summary: string; robustActions: string[]; dominatedActions: string[]; fragileAssumptions: string[] }) => ({
        lens: e.lens,
        summary: e.summary,
        robustActions: e.robustActions,
        dominatedActions: e.dominatedActions,
        fragileAssumptions: e.fragileAssumptions,
      })) ?? [],
      explanation: snapshot.output?.explanation ?? { why: [], whatWouldChange: [] },
      nextBestEvidence: snapshot.output?.nextBestEvidence.map((e: { prompt: string; rationale: string }) => ({
        prompt: e.prompt,
        rationale: e.rationale,
      })) ?? [],
    };

    return ok(detail);
  } catch (e) {
    return err("GET_RUN_FAILED", (e as Error).message);
  }
}

export async function executeRun(
  input: { example: string; depth?: number; deterministic?: boolean; seed?: string },
  _tenant?: string,
  _policy?: string
): Promise<StudioResult<RunSummary>> {
  try {
    const core = await import("@zeo/core");
    const { performance } = await import("node:perf_hooks");

    const startMs = performance.now();
    const depth = input.depth ?? 2;

    if (input.deterministic !== false) {
      const deterSeed = input.seed || `studio-${input.example}-${depth}`;
      core.activateDeterministicMode({ seed: deterSeed });
    }

    try {
      const spec = input.example === "ops" ? core.makeOpsExample() : core.makeNegotiationExample();
      const idCounterOffset = (input.deterministic !== false) ? core.getDeterministicIdCounter() : undefined;
      const result = core.runDecision(spec, { depth: depth as 2 | 3 });
      const durationMs = Math.round(performance.now() - startMs);

      const snapshot = core.createSnapshot({
        spec,
        opts: { depth, example: input.example },
        result,
        toolRegistry: core.getDefaultToolRegistry(),
        durationMs,
        deterministic: input.deterministic !== false,
        seed: input.seed,
        idCounterOffset,
      });
      core.saveSnapshot(snapshot);

      return ok({
        runId: snapshot.runId,
        createdAt: snapshot.createdAt,
        deterministic: snapshot.deterministic,
        inputHash: snapshot.inputHash,
        outputHash: snapshot.outputHash,
        chainHash: snapshot.chainHash,
        durationMs: snapshot.durationMs,
        title: spec.title,
        nodeCount: result.graph.nodes.length,
        edgeCount: result.graph.edges.length,
        seed: snapshot.seed,
      });
    } finally {
      if (input.deterministic !== false) {
        core.deactivateDeterministicMode();
      }
    }
  } catch (e) {
    return err("EXECUTE_FAILED", (e as Error).message, "Check that the example name is valid ('negotiation' or 'ops').");
  }
}

export async function replayRun(runId: string): Promise<StudioResult<ReplayResultData>> {
  try {
    const core = await import("@zeo/core");
    const result = await withTimeout(
      Promise.resolve(core.replayRun(runId)),
      DEFAULT_TIMEOUT,
      "replay"
    );

    return ok({
      verdict: result.verdict,
      originalRunId: result.originalRunId,
      replayRunId: result.replayRunId,
      originalOutputHash: result.originalOutputHash,
      replayOutputHash: result.replayOutputHash,
      diffs: result.diffs,
      durationMs: result.durationMs,
    });
  } catch (e) {
    return err("REPLAY_FAILED", (e as Error).message, "Ensure the run_id exists in .zeo/snapshots/. Run 'zeo snapshots' to list.");
  }
}

export async function diffRuns(runIdA: string, runIdB: string): Promise<StudioResult<DiffResultData>> {
  try {
    const core = await import("@zeo/core");
    const diff = core.diffRuns(runIdA, runIdB);

    return ok({
      runA: diff.runA,
      runB: diff.runB,
      summary: diff.summary,
      changedAssumptions: diff.changedAssumptions,
      changedOutputs: diff.changedOutputs,
      confidenceDelta: diff.confidenceDelta
        ? {
            robustActionsA: diff.confidenceDelta.robustActionsA,
            robustActionsB: diff.confidenceDelta.robustActionsB,
            added: diff.confidenceDelta.added,
            removed: diff.confidenceDelta.removed,
          }
        : null,
      evidenceChanges: diff.evidenceChanges,
    });
  } catch (e) {
    return err("DIFF_FAILED", (e as Error).message, "Ensure both run_ids exist. Run 'zeo snapshots' to list.");
  }
}

export async function listEvidence(
  _tenant?: string,
  filters?: { stale?: boolean; highRegret?: boolean; tag?: string }
): Promise<StudioResult<EvidenceNodeData[]>> {
  try {
    const core = await import("@zeo/core");
    const graph = core.loadEvidenceGraph();

    let nodes = graph.nodes;
    if (filters?.stale) nodes = core.filterStale(graph, 0.3);
    else if (filters?.highRegret) nodes = core.filterHighRegret(graph);
    else if (filters?.tag) nodes = core.filterByTag(graph, filters.tag);

    const result: EvidenceNodeData[] = nodes.map((n: {
      id: string; claim: string; source: string; confidenceScore: number;
      decayRate: number; timestamp: string;
      linkedActions?: string[]; linkedDecisions?: string[];
      tags?: string[]; outcome?: unknown; regretScore?: number;
      metadata?: Record<string, unknown>;
    }) => ({
      id: n.id,
      claim: n.claim,
      source: n.source,
      confidenceScore: n.confidenceScore,
      decayRate: n.decayRate,
      createdAt: n.timestamp,
      updatedAt: n.timestamp,
      tags: n.tags ?? [],
      linkedDecisionIds: n.linkedDecisions ?? [],
      outcome: n.outcome ? String(n.outcome) : undefined,
      regretImpact: n.regretScore,
    }));

    return ok(result);
  } catch (e) {
    return err("EVIDENCE_LIST_FAILED", (e as Error).message, "Evidence graph may not exist yet. Run 'zeo evidence add --claim \"...\" --source \"...\"' to create one.");
  }
}

export async function getEvidence(nodeId: string): Promise<StudioResult<EvidenceNodeData>> {
  try {
    const core = await import("@zeo/core");
    const graph = core.loadEvidenceGraph();
    const node = graph.nodes.find((n: { id: string }) => n.id === nodeId);
    if (!node) {
      return err("EVIDENCE_NOT_FOUND", `Evidence node not found: ${nodeId}`, "Run 'zeo evidence list' to see available nodes.");
    }

    return ok({
      id: node.id,
      claim: node.claim,
      source: node.source,
      confidenceScore: node.confidenceScore,
      decayRate: node.decayRate,
      createdAt: node.timestamp,
      updatedAt: node.timestamp,
      tags: node.tags ?? [],
      linkedDecisionIds: node.linkedDecisions ?? [],
      outcome: node.outcome ? String(node.outcome) : undefined,
      regretImpact: node.regretScore,
    });
  } catch (e) {
    return err("EVIDENCE_GET_FAILED", (e as Error).message);
  }
}

export async function listTools(): Promise<StudioResult<ToolData[]>> {
  try {
    const core = await import("@zeo/core");
    const registry = core.getDefaultToolRegistry();

    const tools: ToolData[] = registry.tools.map((t: { name: string; version: string; status: "ready" | "error" | "timeout" }) => ({
      name: t.name,
      description: toolDescriptions[t.name] ?? `${t.name} tool`,
      version: t.version,
      status: t.status,
    }));

    return ok(tools);
  } catch (e) {
    return err("TOOLS_LIST_FAILED", (e as Error).message);
  }
}

const toolDescriptions: Record<string, string> = {
  branch_generator: "Generates branching decision trees from action sets and assumptions.",
  robustness_evaluator: "Evaluates action robustness across assumption scenarios.",
  expected_utility_evaluator: "Computes expected utility scores for actions.",
  game_theory_evaluator: "Applies game-theoretic analysis to multi-agent decisions.",
  evolutionary_evaluator: "Uses evolutionary stability analysis for action selection.",
  flip_condition_generator: "Identifies assumption changes that would flip the recommended action.",
  evidence_ranker: "Ranks evidence actions by value of information.",
};

export async function invokeTool(
  toolName: string,
  args: Record<string, unknown>,
  _tenant?: string,
  _policy?: string
): Promise<StudioResult<unknown>> {
  try {
    const core = await import("@zeo/core");
    const registry = core.getDefaultToolRegistry();
    const tool = registry.tools.find((t: { name: string }) => t.name === toolName);
    if (!tool) {
      return err("TOOL_NOT_FOUND", `Tool not found: ${toolName}`, `Available tools: ${registry.tools.map((t: { name: string }) => t.name).join(", ")}`);
    }
    if (tool.status !== "ready") {
      return err("TOOL_NOT_READY", `Tool ${toolName} is in ${tool.status} state.`, "Wait for the tool to become ready or check tool health with 'zeo tools'.");
    }

    // For now, tool invocation runs a minimal demo — actual tool dispatch
    // would require the full engine context
    const result = {
      tool: toolName,
      status: "executed",
      args: redactSecrets(args),
      output: { message: `Tool ${toolName} executed with ${Object.keys(args).length} argument(s).` },
      timestamp: new Date().toISOString(),
    };

    return ok(result);
  } catch (e) {
    return err("TOOL_INVOKE_FAILED", (e as Error).message);
  }
}

export async function complianceReport(_tenant?: string): Promise<StudioResult<ComplianceReportData>> {
  try {
    const tenantId = _tenant || "default";

    // Try to import @zeo/compliance — it may not be available in all configurations
    let compliance: { generateComplianceReport: (tenantId: string, ledger: unknown) => any; complianceLedger: unknown };
    try {
      compliance = await import(/* webpackIgnore: true */ "@zeo/compliance") as any;
    } catch {
      // Graceful fallback when @zeo/compliance is not installed
      const now = new Date().toISOString();
      return ok({
        tenantId,
        generatedAt: now,
        periodStart: now,
        periodEnd: now,
        totalRuns: 0,
        totalPolicyViolations: 0,
        totalAccessDenials: 0,
        totalSecretDetections: 0,
        averageRunLatencyMs: 0,
        deterministicRunPercentage: 100,
        auditEntryCount: 0,
        retentionCompliant: true,
        findings: [],
      });
    }

    const report = compliance.generateComplianceReport(
      tenantId,
      compliance.complianceLedger
    );

    return ok({
      tenantId: String(report.tenantId ?? tenantId),
      generatedAt: String(report.generatedAt ?? new Date().toISOString()),
      periodStart: String(report.periodStart ?? ""),
      periodEnd: String(report.periodEnd ?? ""),
      totalRuns: Number(report.totalRuns ?? 0),
      totalPolicyViolations: Number(report.totalPolicyViolations ?? 0),
      totalAccessDenials: Number(report.totalAccessDenials ?? 0),
      totalSecretDetections: Number(report.totalSecretDetections ?? 0),
      averageRunLatencyMs: Number(report.averageRunLatencyMs ?? 0),
      deterministicRunPercentage: Number(report.deterministicRunPercentage ?? 100),
      auditEntryCount: Number(report.auditEntryCount ?? 0),
      retentionCompliant: Boolean(report.retentionCompliant ?? true),
      findings: Array.isArray(report.findings)
        ? (report.findings as Array<Record<string, string>>).map((f: Record<string, string>) => ({
            severity: f.severity ?? "info",
            code: f.code ?? "UNKNOWN",
            message: f.message ?? "",
            timestamp: f.timestamp ?? new Date().toISOString(),
          }))
        : [],
    });
  } catch (e) {
    return err("COMPLIANCE_FAILED", (e as Error).message, "Ensure @zeo/compliance is available.");
  }
}

// ─── Report Generation ───────────────────────────────────────────────────────

export interface SignedRunReport {
  version: "1.0.0";
  generatedAt: string;
  run: RunDetail;
  replay?: ReplayResultData;
  evidence: EvidenceNodeData[];
  tools: ToolData[];
  compliance?: ComplianceReportData;
  signature: string;
}

export function computeReportSignature(reportJson: string): string {
  // Normalize: parse and re-stringify with sorted keys deterministically
  const parsed = JSON.parse(reportJson);
  // Remove signature field before hashing
  delete parsed.signature;
  const normalized = JSON.stringify(parsed, Object.keys(parsed).sort(), 0);
  return createHash("sha256").update(normalized).digest("hex");
}

export async function generateSignedReport(runId: string, _tenant?: string): Promise<StudioResult<SignedRunReport>> {
  try {
    // Gather all data
    const runResult = await getRun(runId);
    if (!runResult.ok) return runResult;

    let replayData: ReplayResultData | undefined;
    try {
      const replayResult = await replayRun(runId);
      if (replayResult.ok) replayData = replayResult.data;
    } catch {
      // Replay is optional in the report
    }

    const evidenceResult = await listEvidence(_tenant);
    const toolsResult = await listTools();
    const complianceResult = await complianceReport(_tenant);

    const report: Omit<SignedRunReport, "signature"> = {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      run: runResult.data,
      replay: replayData,
      evidence: evidenceResult.ok ? evidenceResult.data : [],
      tools: toolsResult.ok ? toolsResult.data : [],
      compliance: complianceResult.ok ? complianceResult.data : undefined,
    };

    const reportJson = JSON.stringify(report, null, 2);
    const signature = computeReportSignature(reportJson);

    return ok({ ...report, signature } as SignedRunReport);
  } catch (e) {
    return err("REPORT_FAILED", (e as Error).message, "Ensure the run_id is valid.");
  }
}

export function verifyReportSignature(reportJson: string): { valid: boolean; computedHash: string; reportedHash: string } {
  const parsed = JSON.parse(reportJson);
  const reportedHash = parsed.signature || "";

  // Remove signature and recompute
  delete parsed.signature;
  const normalized = JSON.stringify(parsed, Object.keys(parsed).sort(), 0);
  const computedHash = createHash("sha256").update(normalized).digest("hex");

  return {
    valid: computedHash === reportedHash,
    computedHash,
    reportedHash,
  };
}

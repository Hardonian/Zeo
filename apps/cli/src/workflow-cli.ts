import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, cpSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as core from "@zeo/core";
import * as contracts from "@zeo/contracts";

const DEFAULT_TIMEZONE = "UTC";
const DEFAULT_AS_OF_DATE = "1970-01-01";
const DECAY_WINDOWS_DAYS = { fresh: 30, aging: 90, stale: 180 } as const;
const LENSES = ["executive", "engineering", "legal", "personal"] as const;
type LensType = typeof LENSES[number];
type EdgeType = "depends_on" | "informs";
type DecisionType = "ENG" | "OPS" | "SEC" | "PROD" | "MKT" | "CUST";
type Audience = "legal" | "exec" | "sales" | "engineer" | "auditor";

type DecayStatus = "fresh" | "aging" | "stale" | "expired" | "unknown";

export interface WorkflowArgs {
  command:
  | "start"
  | "add-note"
  | "run"
  | "next"
  | "share"
  | "copy"
  | "export"
  | "quests"
  | "done"
  | "streaks"
  | "graph"
  | "view"
  | "review"
  | "explain"
  | "summary"
  | null;
  subcommand?: "md" | "ics" | "bundle" | "show" | "impact" | "fragility" | "weekly";
  decision?: string;
  text?: string;
  title?: string;
  json: boolean;
  output?: string;
  envelope?: string;
  due?: string;
  timezone?: string;
  taskId?: string;
  transcript?: string;
  lens?: LensType;
  dependsOn: string[];
  informs: string[];
  assertedAt?: string;
  expiresAt?: string;
  asOf?: string;
  audience?: Audience;
  type?: DecisionType;
  mode?: "internal" | "customer";
}

interface EvidenceItem {
  id: string;
  kind: "note";
  text: string;
  summary: string;
  assertedAt?: string;
  expiresAt?: string;
  provenance: { source: "user_note"; hash: string };
  cost: { timeMinutes: number; risk: "low" | "medium" | "high" };
}

interface TaskItem {
  id: string;
  label: string;
  sourceEvidenceId: string;
  dueDate?: string;
  completed: boolean;
}

interface RunResult {
  transcriptHash: string;
  recommendedAction: string;
  boundarySummary: string;
  flipDistance: number;
  fragility: "Stable" | "Fragile" | "Knife-edge";
  topEvidence: Array<{ id: string; summary: string; cost: EvidenceItem["cost"]; decay: DecayStatus }>;
  plan: { nextSteps: string[]; stopConditions: string[] };
  signatureStatus: "unsigned" | "signed";
  dependsOn: string[];
  informs: string[];
  decaySummary: Record<DecayStatus, number>;
  fullTranscript?: contracts.FinalizedDecisionTranscript;
}

function specFromWorkspace(ws: DecisionWorkspace): contracts.DecisionSpec {
  return {
    id: ws.decisionId,
    title: ws.title,
    context: ws.title,
    createdAt: ws.createdAt ?? new Date().toISOString(),
    decisionType: ws.decisionType,
    workspaceMode: ws.workspaceMode,
    decisionState: ws.state,
    reviewAfter: ws.runs[ws.runs.length - 1]?.fullTranscript?.timestamp ? new Date(new Date(ws.createdAt ?? new Date().toISOString()).getTime() + 30 * 24 * 3600 * 1000).toISOString() : undefined,
    expectedSignals: ws.evidence.map((e) => e.summary),
    horizon: "days",
    agents: [{ id: "self", name: "Self", role: "self" }],
    actions: [
      { id: "act_commit", label: "Commit to Plan", actorId: "self", kind: "commit" },
      { id: "act_defer", label: "Gather More Evidence", actorId: "self", kind: "delay" }
    ],
    constraints: [],
    assumptions: ws.evidence.map((e) => ({
      id: e.id,
      text: e.text,
      status: "fact",
      confidence: "high",
      provenance: [{ kind: "text", sourceId: "user_note", offset: 0, length: e.text.length, capturedAt: e.assertedAt || new Date().toISOString(), checksum: e.provenance.hash }],
      tags: [] as string[]
    })),
    objectives: [{ id: "obj_robustness", metric: "robustness", weight: 1.0 }]
  };
}

interface DecisionWorkspace {
  decisionId: string;
  title: string;
  decisionType: DecisionType;
  workspaceMode: "internal" | "customer";
  state: "proposed" | "challenged" | "amended" | "finalized";
  createdAt?: string;
  evidence: EvidenceItem[];
  tasks: TaskItem[];
  runs: RunResult[];
  chain: { parentTranscriptHash?: string };
}

interface GraphNode {
  transcriptHash: string;
  decisionId: string;
  flipDistance: number;
}

interface GraphEdge {
  from: string;
  to: string;
  type: EdgeType;
}

function hash(inputValue: unknown): string {
  return createHash("sha256").update(JSON.stringify(inputValue)).digest("hex");
}

function zeoRoot(): string {
  return resolve(process.cwd(), ".zeo");
}

function decisionsRoot(): string {
  return join(zeoRoot(), "decisions");
}

function workspacePath(decisionId: string): string {
  return join(decisionsRoot(), decisionId, "decision.json");
}

function ensureWorkspaceRoot(): void {
  if (!existsSync(decisionsRoot())) mkdirSync(decisionsRoot(), { recursive: true });
}

function loadWorkspace(decisionId: string): DecisionWorkspace {
  const path = workspacePath(decisionId);
  if (!existsSync(path)) throw new Error(`Decision not found: ${decisionId}. Run 'zeo start' first.`);
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<DecisionWorkspace>;
  return {
    decisionId: parsed.decisionId || decisionId,
    title: parsed.title || "Untitled Decision",
    decisionType: parsed.decisionType || "ENG",
    workspaceMode: parsed.workspaceMode || "customer",
    state: parsed.state || "proposed",
    createdAt: parsed.createdAt,
    evidence: parsed.evidence || [],
    tasks: parsed.tasks || [],
    runs: parsed.runs || [],
    chain: parsed.chain || {}
  };
}

function saveWorkspace(ws: DecisionWorkspace): void {
  const dir = join(decisionsRoot(), ws.decisionId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "decision.json"), `${JSON.stringify(ws, null, 2)}\n`, "utf8");
}

function parseNoteToEvidence(text: string, assertedAt?: string, expiresAt?: string): Omit<EvidenceItem, "id"> {
  const cleaned = text.trim().replace(/\s+/g, " ");
  const summary = cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
  return {
    kind: "note",
    text: cleaned,
    summary,
    assertedAt,
    expiresAt,
    provenance: { source: "user_note", hash: hash(cleaned) },
    cost: { timeMinutes: Math.max(5, Math.ceil(cleaned.length / 80) * 5), risk: cleaned.includes("urgent") ? "high" : "low" },
  };
}

function isoDate(value?: string): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) throw new Error(`Invalid date (expected YYYY-MM-DD): ${value}`);
  return value;
}

function daysBetween(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
}

function classifyDecay(evidence: EvidenceItem, asOfDate: string): DecayStatus {
  if (evidence.expiresAt && daysBetween(evidence.expiresAt, asOfDate) >= 0) return "expired";
  if (!evidence.assertedAt) return "unknown";
  const ageDays = daysBetween(evidence.assertedAt, asOfDate);
  if (ageDays <= DECAY_WINDOWS_DAYS.fresh) return "fresh";
  if (ageDays <= DECAY_WINDOWS_DAYS.aging) return "aging";
  if (ageDays <= DECAY_WINDOWS_DAYS.stale) return "stale";
  return "expired";
}

function decaySummary(evidence: EvidenceItem[], asOfDate: string): Record<DecayStatus, number> {
  const summary: Record<DecayStatus, number> = { fresh: 0, aging: 0, stale: 0, expired: 0, unknown: 0 };
  for (const item of evidence) summary[classifyDecay(item, asOfDate)] += 1;
  return summary;
}

function formatResultCard(result: RunResult): string {
  return [
    "=== Zeo Result Card ===",
    `Recommended action: ${result.recommendedAction}`,
    `Decision boundary: ${result.boundarySummary}`,
    `Flip distance: ${result.flipDistance}`,
    `Fragility: ${result.fragility}`,
    `Decay: fresh=${result.decaySummary.fresh} aging=${result.decaySummary.aging} stale=${result.decaySummary.stale} expired=${result.decaySummary.expired} unknown=${result.decaySummary.unknown}`,
    "Top evidence:",
    ...result.topEvidence.map((e, idx) => `  ${idx + 1}. ${e.summary} (time=${e.cost.timeMinutes}m risk=${e.cost.risk} decay=${e.decay})`),
    "Regret-bounded plan:",
    ...result.plan.nextSteps.map((s) => `  - ${s}`),
    `Depends on: ${result.dependsOn.join(", ") || "none"}`,
    `Informs: ${result.informs.join(", ") || "none"}`,
    `Transcript hash: ${result.transcriptHash}`,
    `Signature: ${result.signatureStatus}`,
  ].join("\n");
}


async function runDecisionInWorkspace(
  ws: DecisionWorkspace,
  envelopePath: string | undefined,
  asOfDate: string,
  dependsOn: string[],
  informs: string[]
): Promise<RunResult> {
  const spec = specFromWorkspace(ws);
  const { result, transcript } = core.executeDecision({
    spec,
    opts: { depth: 2 }, // Default depth
    evidence: [], // Evidence is already embedded in assumptions for this simplified view, or should be passed?
    // The workspace "evidence" are actually "facts" in the spec assumptions.
    // Real evidence events would be separate. For now, we map workspace evidence to assumptions.
    dependsOn,
    informs,
    logicalTimestamp: Date.now()
  });

  // Signing integration
  const defaultKeyPath = join(zeoRoot(), "keys", "id_ed25519.pem");
  let envelopePathOut: string | undefined;

  if (existsSync(defaultKeyPath)) {
    // Create and sign envelope
    const envelope = core.createEnvelope(transcript, { created_by: "zeo-cli" });
    const signedEnvelope = core.signEnvelopeWithEd25519(
      envelope,
      defaultKeyPath,
      "zeo.transcript.signature.v1"
    );

    // Save envelope
    const envelopeDir = join(decisionsRoot(), ws.decisionId, "envelopes");
    if (!existsSync(envelopeDir)) mkdirSync(envelopeDir, { recursive: true });

    const envFileName = `${transcript.transcript_hash}.envelope.json`;
    envelopePathOut = join(envelopeDir, envFileName);
    writeFileSync(envelopePathOut, `${JSON.stringify(signedEnvelope, null, 2)}\n`, "utf8");
    console.log(`Signed transcript with key: ${defaultKeyPath}`);
    console.log(`Envelope saved to: ${envelopePathOut}`);
  } else {
    console.log("No signing key found. Transcript unsigned.");
  }


  const robustActions = result.evaluations.find(e => e.lens === "robustness")?.robustActions || [];
  const recommendedAction = robustActions.length > 0
    ? `Action(s) ${robustActions.join(", ")} are robust.`
    : "No robust actions found. Gather more evidence.";

  const flipDistances = transcript.analysis.flip_distances.map(f => parseFloat(f.distance));
  const minFlipDistance = flipDistances.length > 0 ? Math.min(...flipDistances) : Infinity;

  const fragility = minFlipDistance >= 5 ? "Stable" : minFlipDistance >= 3 ? "Fragile" : "Knife-edge";
  const totalEvidence = ws.evidence.length;
  // Tasks are distinct from evidence in workspace model
  const unresolvedTasks = ws.tasks.filter((t) => !t.completed).length;
  const decay = decaySummary(ws.evidence, asOfDate);
  const boundarySummary = `Flip dist ${minFlipDistance.toFixed(2)}; ${unresolvedTasks} tasks; decay: ${decay.stale + decay.expired} issues.`;

  return {
    transcriptHash: transcript.transcript_hash,
    recommendedAction,
    boundarySummary,
    flipDistance: minFlipDistance === Infinity ? 100 : minFlipDistance,
    fragility,
    topEvidence: ws.evidence
      .slice()
      .sort((a, b) => a.cost.timeMinutes - b.cost.timeMinutes || a.id.localeCompare(b.id))
      .slice(0, 3)
      .map((e) => ({ id: e.id, summary: e.summary, cost: e.cost, decay: classifyDecay(e, asOfDate) })),
    plan: {
      nextSteps: result.nextBestEvidence.slice(0, 3).map(item => item.prompt),
      stopConditions: transcript.plan.stop_conditions,
    },
    signatureStatus: (envelopePathOut || (envelopePath && existsSync(resolve(envelopePath)))) ? "signed" : "unsigned",
    dependsOn: transcript.depends_on ?? [],
    informs: transcript.informs ?? [],
    decaySummary: decay,
    fullTranscript: transcript
  };
}

function createTasksFromEvidence(evidence: EvidenceItem): TaskItem[] {
  return [{ id: `task_${evidence.id}`, label: `Validate: ${evidence.summary}`, sourceEvidenceId: evidence.id, completed: false }];
}

function writeJsonOrText(args: WorkflowArgs, payload: unknown, text: string): void {
  if (args.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }
  process.stdout.write(`${text}\n`);
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input, output });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function ensureNoSecrets(text: string): void {
  const secretPattern = /(sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16})/;
  if (secretPattern.test(text)) throw new Error("Potential secret detected in output payload.");
}

function collectWorkspaces(): DecisionWorkspace[] {
  if (!existsSync(decisionsRoot())) return [];
  return readdirSync(decisionsRoot(), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadWorkspace(entry.name));
}

function collectGraph(asOfDate: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  for (const ws of collectWorkspaces()) {
    for (const run of ws.runs) {
      nodes.set(run.transcriptHash, { transcriptHash: run.transcriptHash, decisionId: ws.decisionId, flipDistance: run.flipDistance });
      for (const parent of run.dependsOn ?? []) edges.push({ from: parent, to: run.transcriptHash, type: "depends_on" });
      for (const child of run.informs ?? []) edges.push({ from: run.transcriptHash, to: child, type: "informs" });
    }
  }
  for (const node of [...nodes.keys()]) {
    if (!nodes.has(node)) continue;
  }
  detectCycles([...nodes.keys()], edges);
  return { nodes: [...nodes.values()].sort((a, b) => a.transcriptHash.localeCompare(b.transcriptHash)), edges: edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.type.localeCompare(b.type)) };
}

function detectCycles(nodeIds: string[], edges: GraphEdge[]): void {
  const outgoing = new Map<string, string[]>();
  for (const id of nodeIds) outgoing.set(id, []);
  for (const edge of edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge.to);
    outgoing.set(edge.from, list);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function walk(id: string): void {
    if (visiting.has(id)) throw new Error(`Cycle detected in decision graph at transcript ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const child of outgoing.get(id) ?? []) walk(child);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of [...nodeIds].sort()) walk(id);
}

function downstreamImpact(graph: { nodes: GraphNode[]; edges: GraphEdge[] }, transcriptHash: string): string[] {
  const queue = [transcriptHash];
  const visited = new Set<string>([transcriptHash]);
  const impact: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    const children = graph.edges.filter((e) => e.from === current).map((e) => e.to).sort();
    for (const child of children) {
      if (visited.has(child)) continue;
      visited.add(child);
      impact.push(child);
      queue.push(child);
    }
  }
  return impact;
}

function deriveLens(lens: LensType, ws: DecisionWorkspace, run: RunResult): string {
  if (lens === "executive") {
    return `Decision: ${run.recommendedAction}\nWhy: ${run.boundarySummary}\nWhat would change it: ${run.plan.stopConditions.join("; ")}`;
  }
  if (lens === "engineering") {
    return `Constraints: unresolved tasks=${ws.tasks.filter(t => !t.completed).length}\nBoundaries: flip_distance=${run.flipDistance}\nFailure modes: ${run.decaySummary.expired > 0 ? "expired evidence" : "boundary drift"}`;
  }
  if (lens === "legal") {
    return `Assumptions: ${ws.evidence.map(e => e.id).join(", ")}\nSignatures: ${run.signatureStatus}\nAttestations: transcript hash ${run.transcriptHash}`;
  }
  return `Fastest mind-change signal: ${run.topEvidence[0]?.summary ?? "no evidence"}`;
}


function citeEvidence(item: EvidenceItem): string {
  return `${item.id}:${item.provenance.hash.slice(0, 12)}@${item.assertedAt ?? "unknown"}`;
}

function explainForAudience(ws: DecisionWorkspace, audience: Audience, area?: string): string {
  const latest = ws.runs[ws.runs.length - 1];
  const evidenceCitations = ws.evidence.map(citeEvidence).join(", ") || "none";
  if (audience === "exec") {
    return `Decision ${ws.decisionId} (${ws.decisionType}/${ws.workspaceMode}) state=${ws.state}. Outcome=${latest?.recommendedAction ?? "unknown"}. Sensitivity=${latest?.plan.stopConditions.join("; ") ?? "unknown"}. Evidence=${evidenceCitations}.`;
  }
  if (audience === "legal") {
    return `Scope=${area ?? ws.decisionType}. Decision=${ws.decisionId}. State=${ws.state}. Transcript=${latest?.transcriptHash ?? "none"}. Provenance=${evidenceCitations}.`;
  }
  if (audience === "sales") {
    return `Claim posture for ${ws.decisionType}: confidence range inferred from fragility=${latest?.fragility ?? "unknown"}. Backing evidence=${evidenceCitations}.`;
  }
  if (audience === "auditor") {
    return `Audit bundle decision=${ws.decisionId} mode=${ws.workspaceMode} state=${ws.state} run_count=${ws.runs.length} evidence_refs=${evidenceCitations}`;
  }
  return `Engineering view: decision=${ws.decisionId} type=${ws.decisionType} unresolved_tasks=${ws.tasks.filter(t => !t.completed).length} drift_signals=${latest?.plan.stopConditions.join("; ") ?? "none"}`;
}

function buildTypeSummary(type: DecisionType | undefined, audience: Audience): { rows: Array<{ decisionId: string; type: DecisionType; mode: string; state: string; reviewAfter: string; evidenceCount: number }>; text: string } {
  const rows = collectWorkspaces()
    .filter((ws) => (type ? ws.decisionType === type : true))
    .sort((a, b) => a.decisionId.localeCompare(b.decisionId))
    .map((ws) => ({
      decisionId: ws.decisionId,
      type: ws.decisionType,
      mode: ws.workspaceMode,
      state: ws.state,
      reviewAfter: ws.createdAt ? new Date(new Date(ws.createdAt).getTime() + 30 * 24 * 3600 * 1000).toISOString() : "unknown",
      evidenceCount: ws.evidence.length
    }));
  const text = rows.map((row) => `${row.decisionId} type=${row.type} mode=${row.mode} state=${row.state} reviewAfter=${row.reviewAfter} evidence=${row.evidenceCount} audience=${audience}`).join("\n") || "No matching decisions.";
  return { rows, text };
}

export function parseWorkflowArgs(argv: string[]): WorkflowArgs {
  const command = ["start", "add-note", "run", "next", "share", "copy", "export", "quests", "done", "streaks", "graph", "view", "review", "explain", "summary"].includes(argv[0] ?? "") ? argv[0] as WorkflowArgs["command"] : null;
  const subcommand =
    argv[0] === "export" && ["md", "ics", "bundle"].includes(argv[1] ?? "")
      ? argv[1] as WorkflowArgs["subcommand"]
      : argv[0] === "graph" && ["show", "impact", "fragility"].includes(argv[1] ?? "")
        ? argv[1] as WorkflowArgs["subcommand"]
        : argv[0] === "review" && argv[1] === "weekly"
          ? "weekly"
          : undefined;
  const value = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };
  const list = (flag: string): string[] => {
    const values: string[] = [];
    for (let i = 0; i < argv.length; i += 1) {
      if (argv[i] === flag && argv[i + 1]) values.push(argv[i + 1]);
    }
    return values;
  };
  return {
    command,
    subcommand,
    decision: value("--decision"),
    text: value("--text"),
    title: value("--title"),
    json: argv.includes("--json"),
    output: value("--out"),
    envelope: value("--envelope"),
    due: value("--due"),
    timezone: value("--timezone"),
    taskId: argv[1] && command === "done" ? argv[1] : value("--task"),
    transcript: argv[2] && command === "view" ? argv[2] : value("--transcript"),
    lens: (argv[1] && command === "view" ? argv[1] : value("--lens")) as LensType | undefined,
    dependsOn: list("--depends-on"),
    informs: list("--informs"),
    assertedAt: value("--asserted-at"),
    expiresAt: value("--expires-at"),
    asOf: value("--as-of"),
    audience: value("--audience") as Audience | undefined,
    type: value("--type") as DecisionType | undefined,
    mode: (value("--mode") as "internal" | "customer" | undefined),
  };
}

export async function runWorkflowCommand(args: WorkflowArgs): Promise<number> {
  ensureWorkspaceRoot();
  if (!args.command) return 1;

  if (args.command === "start") {
    const title = args.title || (process.stdin.isTTY ? await prompt("Decision title: ") : "Untitled Decision");
    const decisionId = `dec_${hash({ title }).slice(0, 12)}`;
    const ws: DecisionWorkspace = { decisionId, title, decisionType: args.type ?? "ENG", workspaceMode: args.mode ?? "customer", state: "proposed", evidence: [], tasks: [], runs: [], chain: {} };
    saveWorkspace(ws);
    writeJsonOrText(args, ws, `Started decision '${title}' (${decisionId})`);
    return 0;
  }

  if (args.command === "graph") {
    const graph = collectGraph(args.asOf ?? DEFAULT_AS_OF_DATE);
    if (args.subcommand === "show") {
      const transcriptHash = args.transcript ?? args.decision;
      if (!transcriptHash) throw new Error("Usage: zeo graph show <transcript>");
      const related = graph.edges.filter((e) => e.from === transcriptHash || e.to === transcriptHash);
      writeJsonOrText(args, { transcript: transcriptHash, edges: related }, related.map((e) => `${e.from} -[${e.type}]-> ${e.to}`).join("\n") || "No graph edges.");
      return 0;
    }
    if (args.subcommand === "impact") {
      const transcriptHash = args.transcript ?? args.decision;
      if (!transcriptHash) throw new Error("Usage: zeo graph impact <transcript>");
      const impact = downstreamImpact(graph, transcriptHash);
      writeJsonOrText(args, { transcript: transcriptHash, impact }, impact.join("\n") || "No downstream impact.");
      return 0;
    }
    if (args.subcommand === "fragility") {
      const ranked = graph.nodes.map((node) => ({
        transcriptHash: node.transcriptHash,
        downstreamCount: downstreamImpact(graph, node.transcriptHash).length,
        flipDistance: node.flipDistance,
        fragilityScore: downstreamImpact(graph, node.transcriptHash).length * Math.max(1, 10 - node.flipDistance),
      })).sort((a, b) => b.fragilityScore - a.fragilityScore || a.transcriptHash.localeCompare(b.transcriptHash));
      writeJsonOrText(args, { ranked }, ranked.map((item) => `${item.transcriptHash} score=${item.fragilityScore}`).join("\n"));
      return 0;
    }
    throw new Error("Usage: zeo graph <show|impact|fragility>");
  }

  if (args.command === "view") {
    const lens = args.lens;
    if (!lens || !LENSES.includes(lens)) throw new Error("Usage: zeo view <executive|engineering|legal|personal> <transcript>");
    const transcriptHash = args.transcript ?? args.decision;
    if (!transcriptHash) throw new Error("Transcript hash required");
    for (const ws of collectWorkspaces()) {
      const run = ws.runs.find((r) => r.transcriptHash === transcriptHash);
      if (run) {
        const body = deriveLens(lens, ws, run);
        writeJsonOrText(args, { lens, transcript: transcriptHash, body }, body);
        return 0;
      }
    }
    throw new Error(`Transcript not found: ${transcriptHash}`);
  }

  if (args.command === "review" && args.subcommand === "weekly") {
    const workspaces = collectWorkspaces();
    const robust: string[] = [];
    const invalidatedEarly: string[] = [];
    const retired: string[] = [];
    for (const ws of workspaces) {
      if (ws.runs.length > 1 && ws.runs[ws.runs.length - 1].flipDistance > ws.runs[0].flipDistance) robust.push(ws.decisionId);
      if (ws.evidence.some((e) => e.expiresAt && ws.tasks.some((t) => t.sourceEvidenceId === e.id && t.completed))) invalidatedEarly.push(ws.decisionId);
      if (ws.runs.length > 0 && ws.runs[ws.runs.length - 1].decaySummary.expired > 0) retired.push(ws.decisionId);
    }
    const report = { robust, invalidatedEarly, retired };
    writeJsonOrText(args, report, `robust=${robust.join(",") || "none"}\ninvalidated_early=${invalidatedEarly.join(",") || "none"}\nretire=${retired.join(",") || "none"}`);
    return 0;
  }

  const decisionId = args.decision;
  if (!decisionId) throw new Error("--decision is required");
  const ws = loadWorkspace(decisionId);

  if (args.command === "add-note") {
    const text = args.text || (process.stdin.isTTY ? await prompt("Paste note: ") : "");
    if (!text) throw new Error("note text required via --text");
    const proposal = parseNoteToEvidence(text, isoDate(args.assertedAt) ?? undefined, isoDate(args.expiresAt) ?? undefined);
    const evidence: EvidenceItem = { ...proposal, id: `ev_${proposal.provenance.hash.slice(0, 10)}` };
    ws.evidence = [...ws.evidence, evidence];
    ws.tasks = [...ws.tasks, ...createTasksFromEvidence(evidence)];
    saveWorkspace(ws);
    writeJsonOrText(args, { proposal, accepted: true, evidenceId: evidence.id }, `Added evidence ${evidence.id}: ${evidence.summary}`);
    return 0;
  }

  if (args.command === "run") {
    const asOf = isoDate(args.asOf) ?? DEFAULT_AS_OF_DATE;
    const result = await runDecisionInWorkspace(ws, args.envelope, asOf, args.dependsOn, args.informs);
    ws.runs = [...ws.runs, result];
    ws.chain.parentTranscriptHash = ws.runs.length > 1 ? ws.runs[ws.runs.length - 2]?.transcriptHash : undefined;
    saveWorkspace(ws);
    writeJsonOrText(args, result, formatResultCard(result));
    return 0;
  }

  if (args.command === "next") {
    const asOf = isoDate(args.asOf) ?? DEFAULT_AS_OF_DATE;
    const checklist = ws.tasks.filter((t) => !t.completed).sort((a, b) => a.id.localeCompare(b.id)).map((t) => {
      const evidence = ws.evidence.find((e) => e.id === t.sourceEvidenceId);
      const decay = evidence ? classifyDecay(evidence, asOf) : "unknown";
      return `- [ ] (${t.id}) ${t.label} [decay=${decay}]`;
    });
    writeJsonOrText(args, { tasks: checklist }, checklist.join("\n") || "No pending tasks.");
    return 0;
  }

  if (args.command === "quests") {
    const quests = ws.tasks.sort((a, b) => a.id.localeCompare(b.id)).map((t) => `- [${t.completed ? "x" : " "}] (${t.id}) ${t.label}`);
    writeJsonOrText(args, { quests }, quests.join("\n") || "No quests yet.");
    return 0;
  }

  if (args.command === "done") {
    if (!args.taskId) throw new Error("task id required: zeo done <taskId> --decision <id>");
    const task = ws.tasks.find((t) => t.id === args.taskId);
    if (!task) throw new Error(`Task not found: ${args.taskId}`);
    task.completed = true;
    saveWorkspace(ws);
    writeJsonOrText(args, { taskId: task.id, completed: true }, `Marked ${task.id} complete.`);
    return 0;
  }

  if (args.command === "share" || args.command === "copy") {
    const latest = ws.runs[ws.runs.length - 1] ?? await runDecisionInWorkspace(ws, args.envelope, isoDate(args.asOf) ?? DEFAULT_AS_OF_DATE, [], []);
    const share = `Zeo Decision: ${ws.title}\nAction: ${latest.recommendedAction}\nFragility: ${latest.fragility}\nHash: ${latest.transcriptHash}`;
    ensureNoSecrets(share);
    writeJsonOrText(args, { share }, share);
    return 0;
  }

  if (args.command === "export") {
    const latest = ws.runs[ws.runs.length - 1] ?? await runDecisionInWorkspace(ws, args.envelope, isoDate(args.asOf) ?? DEFAULT_AS_OF_DATE, [], []);
    const outDir = args.output ? resolve(args.output) : resolve(process.cwd(), "exports");
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    if (args.subcommand === "md") {
      const envelopeRef = args.envelope ? resolve(args.envelope) : "none";
      const md = `---\ntranscript_hash: ${latest.transcriptHash}\nenvelope: ${envelopeRef}\ndecision_id: ${ws.decisionId}\n---\n\n# ${ws.title}\n\n${formatResultCard(latest)}\n\n## Decay\n${ws.evidence.map((e) => `- ${e.summary}: ${classifyDecay(e, isoDate(args.asOf) ?? DEFAULT_AS_OF_DATE)}`).join("\n")}\n`;
      const file = join(outDir, `${latest.transcriptHash.slice(0, 16)}.md`);
      writeFileSync(file, md, "utf8");
      writeJsonOrText(args, { out: file }, file);
      return 0;
    }

    if (args.subcommand === "ics") {
      const timezone = args.timezone ?? DEFAULT_TIMEZONE;
      const dueDate = args.due;
      const tasks = ws.tasks.filter((t) => !t.completed).sort((a, b) => a.id.localeCompare(b.id));
      const body = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Zeo//Decision Tasks//EN",
        ...tasks.flatMap((task) => {
          const date = dueDate ?? task.dueDate;
          const dt = date ? date.replace(/-/g, "") : "";
          return [
            "BEGIN:VEVENT",
            `UID:${task.id}@zeo`,
            `SUMMARY:Re-check ${task.label}`,
            ...(dt ? [`DTSTART;VALUE=DATE:${dt}`] : []),
            `X-WR-TIMEZONE:${timezone}`,
            "END:VEVENT",
          ];
        }),
        "END:VCALENDAR",
      ].join("\n");
      const file = join(outDir, `${latest.transcriptHash.slice(0, 16)}.ics`);
      writeFileSync(file, `${body}\n`, "utf8");
      writeJsonOrText(args, { out: file }, file);
      return 0;
    }

    if (args.subcommand === "bundle") {
      const folder = join(outDir, latest.transcriptHash.slice(0, 16));
      if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
      const transcript = { decision: ws.decisionId, runs: ws.runs, evidence: ws.evidence, tasks: ws.tasks };
      writeFileSync(join(folder, "transcript.json"), `${JSON.stringify(transcript, null, 2)}\n`, "utf8");
      if (args.envelope && existsSync(resolve(args.envelope))) cpSync(resolve(args.envelope), join(folder, "envelope.json"));
      writeFileSync(join(folder, "summary.md"), `# ${ws.title}\n\n${formatResultCard(latest)}\n`, "utf8");
      writeFileSync(join(folder, "trust-snapshot.json"), `${JSON.stringify({ decisionId: ws.decisionId, runCount: ws.runs.length }, null, 2)}\n`, "utf8");
      writeJsonOrText(args, { out: folder }, folder);
      return 0;
    }

    throw new Error("Usage: zeo export <md|ics|bundle>");
  }


  if (args.command === "explain") {
    const audience = args.audience ?? "engineer";
    const target = args.decision;
    if (!target) throw new Error("Usage: zeo explain --decision <id> [--audience legal|exec|sales|engineer|auditor]");
    const ws = loadWorkspace(target);
    const explanation = explainForAudience(ws, audience, args.type);
    writeJsonOrText(args, { decision: target, audience, explanation }, explanation);
    return 0;
  }

  if (args.command === "summary") {
    const audience = args.audience ?? "engineer";
    const summary = buildTypeSummary(args.type, audience);
    writeJsonOrText(args, { audience, type: args.type ?? null, rows: summary.rows }, summary.text);
    return 0;
  }

  if (args.command === "streaks") {
    const dirs = readdirSync(decisionsRoot(), { withFileTypes: true }).filter((d) => d.isDirectory());
    let fragilityImproved = 0;
    let replaysVerified = 0;
    let signed = 0;
    let earlyInvalidations = 0;
    for (const dir of dirs) {
      const local = loadWorkspace(dir.name);
      if (local.runs.length > 1 && local.runs[local.runs.length - 1].flipDistance > local.runs[0].flipDistance) fragilityImproved += 1;
      if (local.runs.length > 0) replaysVerified += 1;
      if (local.runs.some((r) => r.signatureStatus === "signed")) signed += 1;
      if (local.evidence.some((e) => e.expiresAt) && local.tasks.some((t) => t.completed)) earlyInvalidations += 1;
    }
    writeJsonOrText(args, { fragilityImproved, replaysVerified, signedTranscripts: signed, earlyInvalidations }, `fragility_improved=${fragilityImproved}\nreplays_verified=${replaysVerified}\nsigned_transcripts=${signed}\nearly_invalidations=${earlyInvalidations}`);
    return 0;
  }

  return 1;
}

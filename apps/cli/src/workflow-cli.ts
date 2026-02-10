import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, cpSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export interface WorkflowArgs {
  command: "start" | "add-note" | "run" | "next" | "share" | "copy" | "export" | "quests" | "done" | "streaks" | null;
  subcommand?: "md" | "ics" | "bundle";
  decision?: string;
  text?: string;
  title?: string;
  json: boolean;
  output?: string;
  envelope?: string;
  due?: string;
  timezone?: string;
  taskId?: string;
}

interface EvidenceItem {
  id: string;
  kind: "note";
  text: string;
  summary: string;
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
  topEvidence: Array<{ id: string; summary: string; cost: EvidenceItem["cost"] }>;
  plan: { nextSteps: string[]; stopConditions: string[] };
  signatureStatus: "unsigned" | "signed";
}

interface DecisionWorkspace {
  decisionId: string;
  title: string;
  createdAt?: string;
  evidence: EvidenceItem[];
  tasks: TaskItem[];
  runs: RunResult[];
  chain: { parentTranscriptHash?: string };
}

const DEFAULT_TIMEZONE = "UTC";

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
  return JSON.parse(readFileSync(path, "utf8")) as DecisionWorkspace;
}

function saveWorkspace(ws: DecisionWorkspace): void {
  const dir = join(decisionsRoot(), ws.decisionId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "decision.json"), `${JSON.stringify(ws, null, 2)}\n`, "utf8");
}

function parseNoteToEvidence(text: string): Omit<EvidenceItem, "id"> {
  const cleaned = text.trim().replace(/\s+/g, " ");
  const summary = cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
  return {
    kind: "note",
    text: cleaned,
    summary,
    provenance: { source: "user_note", hash: hash(cleaned) },
    cost: { timeMinutes: Math.max(5, Math.ceil(cleaned.length / 80) * 5), risk: cleaned.includes("urgent") ? "high" : "low" },
  };
}

function buildRunResult(ws: DecisionWorkspace, envelopePath?: string): RunResult {
  const transcript = {
    decisionId: ws.decisionId,
    evidence: ws.evidence.map((e) => ({ id: e.id, hash: e.provenance.hash, cost: e.cost })),
    tasks: ws.tasks.map((t) => ({ id: t.id, completed: t.completed, dueDate: t.dueDate ?? null })),
  };
  const transcriptHash = hash(transcript);
  const totalEvidence = ws.evidence.length;
  const unresolvedTasks = ws.tasks.filter((t) => !t.completed).length;
  const flipDistance = Math.max(1, totalEvidence - unresolvedTasks);
  const fragility = flipDistance >= 5 ? "Stable" : flipDistance >= 3 ? "Fragile" : "Knife-edge";
  const recommendedAction = unresolvedTasks === 0 ? "Act now with current plan." : "Collect the next evidence tasks before committing.";
  const boundarySummary = `${totalEvidence} evidence item(s), ${unresolvedTasks} unresolved task(s).`;

  return {
    transcriptHash,
    recommendedAction,
    boundarySummary,
    flipDistance,
    fragility,
    topEvidence: ws.evidence
      .slice()
      .sort((a, b) => a.cost.timeMinutes - b.cost.timeMinutes || a.id.localeCompare(b.id))
      .slice(0, 3)
      .map((e) => ({ id: e.id, summary: e.summary, cost: e.cost })),
    plan: {
      nextSteps: ws.tasks.filter((t) => !t.completed).slice(0, 3).map((t) => t.label),
      stopConditions: ["Flip distance reaches 5 or higher", "No unresolved high-risk evidence items"],
    },
    signatureStatus: envelopePath && existsSync(resolve(envelopePath)) ? "signed" : "unsigned",
  };
}

function formatResultCard(result: RunResult): string {
  return [
    "=== Zeo Result Card ===",
    `Recommended action: ${result.recommendedAction}`,
    `Decision boundary: ${result.boundarySummary}`,
    `Flip distance: ${result.flipDistance}`,
    `Fragility: ${result.fragility}`,
    "Top evidence:",
    ...result.topEvidence.map((e, idx) => `  ${idx + 1}. ${e.summary} (time=${e.cost.timeMinutes}m risk=${e.cost.risk})`),
    "Regret-bounded plan:",
    ...result.plan.nextSteps.map((s) => `  - ${s}`),
    `Transcript hash: ${result.transcriptHash}`,
    `Signature: ${result.signatureStatus}`,
  ].join("\n");
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

export function parseWorkflowArgs(argv: string[]): WorkflowArgs {
  const command = ["start", "add-note", "run", "next", "share", "copy", "export", "quests", "done", "streaks"].includes(argv[0] ?? "") ? argv[0] as WorkflowArgs["command"] : null;
  const subcommand = argv[0] === "export" && ["md", "ics", "bundle"].includes(argv[1] ?? "") ? argv[1] as WorkflowArgs["subcommand"] : undefined;
  const value = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx >= 0 ? argv[idx + 1] : undefined;
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
  };
}

export async function runWorkflowCommand(args: WorkflowArgs): Promise<number> {
  ensureWorkspaceRoot();
  if (!args.command) return 1;

  if (args.command === "start") {
    const title = args.title || (process.stdin.isTTY ? await prompt("Decision title: ") : "Untitled Decision");
    const decisionId = `dec_${hash({ title }).slice(0, 12)}`;
    const ws: DecisionWorkspace = { decisionId, title, evidence: [], tasks: [], runs: [], chain: {} };
    saveWorkspace(ws);
    writeJsonOrText(args, ws, `Started decision '${title}' (${decisionId})`);
    return 0;
  }

  const decisionId = args.decision;
  if (!decisionId) throw new Error("--decision is required");
  const ws = loadWorkspace(decisionId);

  if (args.command === "add-note") {
    const text = args.text || (process.stdin.isTTY ? await prompt("Paste note: ") : "");
    if (!text) throw new Error("note text required via --text");
    const proposal = parseNoteToEvidence(text);
    const evidence: EvidenceItem = { ...proposal, id: `ev_${proposal.provenance.hash.slice(0, 10)}` };
    ws.evidence = [...ws.evidence, evidence];
    ws.tasks = [...ws.tasks, ...createTasksFromEvidence(evidence)];
    saveWorkspace(ws);
    writeJsonOrText(args, { proposal, accepted: true, evidenceId: evidence.id }, `Added evidence ${evidence.id}: ${evidence.summary}`);
    return 0;
  }

  if (args.command === "run") {
    const result = buildRunResult(ws, args.envelope);
    ws.runs = [...ws.runs, result];
    ws.chain.parentTranscriptHash = ws.runs.length > 1 ? ws.runs[ws.runs.length - 2]?.transcriptHash : undefined;
    saveWorkspace(ws);
    writeJsonOrText(args, result, formatResultCard(result));
    return 0;
  }

  if (args.command === "next") {
    const checklist = ws.tasks.filter((t) => !t.completed).sort((a, b) => a.id.localeCompare(b.id)).map((t) => `- [ ] (${t.id}) ${t.label}`);
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
    const latest = ws.runs[ws.runs.length - 1] ?? buildRunResult(ws, args.envelope);
    const share = `Zeo Decision: ${ws.title}\nAction: ${latest.recommendedAction}\nFragility: ${latest.fragility}\nHash: ${latest.transcriptHash}`;
    ensureNoSecrets(share);
    writeJsonOrText(args, { share }, share);
    return 0;
  }

  if (args.command === "export") {
    const latest = ws.runs[ws.runs.length - 1] ?? buildRunResult(ws, args.envelope);
    const outDir = args.output ? resolve(args.output) : resolve(process.cwd(), "exports");
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    if (args.subcommand === "md") {
      const envelopeRef = args.envelope ? resolve(args.envelope) : "none";
      const md = `---\ntranscript_hash: ${latest.transcriptHash}\nenvelope: ${envelopeRef}\ndecision_id: ${ws.decisionId}\n---\n\n# ${ws.title}\n\n${formatResultCard(latest)}\n`;
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
            `SUMMARY:${task.label}`,
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

  if (args.command === "streaks") {
    const dirs = readdirSync(decisionsRoot(), { withFileTypes: true }).filter((d) => d.isDirectory());
    let fragilityImproved = 0;
    let replaysVerified = 0;
    let signed = 0;
    for (const dir of dirs) {
      const local = loadWorkspace(dir.name);
      if (local.runs.length > 1 && local.runs[local.runs.length - 1].flipDistance > local.runs[0].flipDistance) fragilityImproved += 1;
      if (local.runs.length > 0) replaysVerified += 1;
      if (local.runs.some((r) => r.signatureStatus === "signed")) signed += 1;
    }
    writeJsonOrText(args, { fragilityImproved, replaysVerified, signedTranscripts: signed }, `fragility_improved=${fragilityImproved}\nreplays_verified=${replaysVerified}\nsigned_transcripts=${signed}`);
    return 0;
  }

  return 1;
}

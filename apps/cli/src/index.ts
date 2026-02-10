import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import type { WorldModelSpec, EvidenceCandidate, PosteriorState, VoiReport } from "@zeo/contracts";
import { parseArgs, type CliArgs } from "./args.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedVersion: string | null = null;
function getCliVersion(): string {
  if (cachedVersion) return cachedVersion;
  try {
    const pkgPath = resolve(__dirname, "../package.json");
    cachedVersion = JSON.parse(readFileSync(pkgPath, "utf8")).version ?? "1.0.0";
  } catch {
    cachedVersion = "1.0.0";
  }
  return cachedVersion;
}

function printHelp(): void {
  console.log(`
Zeo CLI - Epistemic Decision Engine v${getCliVersion()}

Usage: zeo [options]

Commands:
  start                      Start guided decision workspace
  add-note                   Add plain-language note as evidence proposal
  run                        Run deterministic analysis and print result card
  next                       Show next evidence tasks checklist
  share                      Export compact share summary
  copy                       Print clipboard-friendly share block
  export <md|ics|bundle>     Offline export commands
  quests                     Show evidence tasks as checkboxes
  done <taskId>              Mark checklist task as complete
  streaks                    Show epistemic streak metrics
  graph <show|impact|fragility> Decision graph utilities
  view <lens> <transcript>   Derived lens view from a transcript
  review weekly              Weekly epistemic review
  signals <file>              Process external signal payloads (JSON)
  --signals <file>            Process external signal payloads (JSON)
  --replay <file>             Run replay dataset for calibration testing
  --case <id>                 Run specific case from replay dataset
  --report-out <dir>          Write replay reports to directory
  --warehouse <cmd>           Warehouse management (export/import/list)
  --analytics <cmd>           Analytics pipeline (build-dataset/run)
  --regimes <cmd>             Regimes and policy control
  adapters <cmd>              Adapter runtime (run/ingest/quarantine)
  ingest                      Ingest from all enabled adapters
  eval                        Run epistemic evaluation suite
  pack                        Zeo pack commands
  doctor                      Environment diagnostics
  perf                        Performance commands
  mcp                         MCP commands (serve/ping/tools)
  llm                         LLM commands (doctor)
  agents                      Agent plugin commands
  zeolite <op>                Zeolite deterministic operations
  transcript <cmd>            Transcript signing and verification
  keys <cmd>                  Local keyring operations
  trust <cmd>                 Trust profile operations

Options:
  --catalog <dir>             Catalog directory (default: external/catalog)
  --example <name>            Example to run: "negotiation" or "ops" (default: negotiation)
  --depth <n>                 Branching depth: 1-5 (default: 2)
  --json-only                 Output JSON only, no summary
  --out <path>                Write JSON result to file
  --seed <string>             Random seed for deterministic runs (optional)
  --strict false              Continue on invariant violations
  --packet-out <path>         Write evidence packet (JSON + MD) to directory
  --voi                       Print Value of Information (VOI) ranked list
  --world                     Print World Model posterior state
  --emit-transcript           Emit deterministic decision transcript
  --help, -h                  Show this help message
`);
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function printError(code: string, message: string, details?: unknown): void {
  console.error(`[${code}] ${message}`);
  if (details && process.env.DEBUG) {
    console.error("Details:", JSON.stringify(details, null, 2));
  }
}

async function writePacketFiles(packetDir: string, json: string, markdown: string): Promise<void> {
  if (!existsSync(packetDir)) mkdirSync(packetDir, { recursive: true });
  const jsonPath = join(packetDir, "evidence.json");
  const mdPath = join(packetDir, "evidence.md");
  writeFileSync(jsonPath, `${json}\n`, "utf8");
  writeFileSync(mdPath, markdown, "utf8");
  console.log(`Evidence packet written to: ${packetDir}`);
}

function shouldReportPerf(): boolean {
  return process.env.ZEO_PERF === "1";
}

function reportPerf(startMs: number, label: string): void {
  if (!shouldReportPerf()) return;
  const total = performance.now() - startMs;
  process.stderr.write(`[zeo perf] ${label} ${total.toFixed(2)}ms\n`);
}

async function runDefaultCommand(args: CliArgs, startedMs: number): Promise<number> {
  const core = await import("@zeo/core");
  const contracts = await import("@zeo/contracts");
  const models = await import("@zeo/models");

  const spec = args.example === "ops" ? core.makeOpsExample() : core.makeNegotiationExample();
  const errors: Array<InstanceType<typeof contracts.ZeoError>> = [];
  const startedAt = new Date().toISOString();

  let result;
  let transcript;
  try {
    if (args.emitTranscript) {
      const executed = core.executeDecision({ spec, opts: { depth: args.depth === 3 ? 3 : 2 }, logicalTimestamp: 0 });
      result = executed.result;
      transcript = executed.transcript;
    } else {
      result = core.runDecision(spec, { depth: args.depth === 3 ? 3 : 2 });
    }
  } catch (err) {
    if (args.strict) {
      const zeError = contracts.ZeoError.from(err);
      printError(zeError.code, zeError.message, zeError.details);
      return 1;
    }
    errors.push(contracts.ZeoError.from(err));
  }

  const finishedAt = new Date().toISOString();
  const decisionHash = core.hashDecisionSpec(core.canonicalizeDecisionSpec(spec));
  const seed = args.seed || core.computeDeterministicSeed(decisionHash, undefined, args.depth);

  const packet = core.buildEvidencePacket({
    decisionSpec: spec,
    decisionResult: result!,
    runMeta: {
      seed,
      depth: args.depth,
      limits: { maxBranches: 100, maxDepth: args.depth },
      startedAt,
      finishedAt,
    },
    errors,
  });

  if (args.packetOut) {
    await writePacketFiles(args.packetOut, formatJson(packet), core.buildEvidencePacketMarkdown(packet));
  }

  if (args.jsonOnly) {
    const payload = args.emitTranscript ? { packet, transcript } : packet;
    process.stdout.write(`${formatJson(payload)}\n`);
    reportPerf(startedMs, "default-json");
    return 0;
  }

  console.log("\n=== Zeo CLI ===");
  console.log(`Decision: ${spec.title}`);
  console.log(`Depth: ${args.depth}`);
  console.log(`Decision Hash: ${decisionHash.slice(0, 16)}...`);

  if (errors.length > 0) {
    console.log("\nWarnings:");
    for (const err of errors) printError(err.code, err.message);
  }

  if (result) {
    console.log(`\nBranches: ${result.graph.nodes.length} nodes, ${result.graph.edges.length} edges`);
    if (transcript) console.log(`Transcript: ${transcript.transcript_id} (${transcript.transcript_hash.slice(0, 16)}...)`);
    const robustness = result.evaluations.find(e => e.lens === "robustness");
    if (robustness) {
      console.log(`Robust actions (ids): ${robustness.robustActions.join(", ") || "none"}`);
      console.log(`Dominated actions (ids): ${robustness.dominatedActions.join(", ") || "none"}`);
    }
  }

  if (args.world) {
    const posterior = models.inferPosterior(createDemoWorldModel(), [], seed);
    printWorldState(posterior);
  }

  if (args.voi) {
    const worldSpec = createDemoWorldModel();
    const posterior = models.inferPosterior(worldSpec, [], seed);
    const voiReport = models.computeVoi(worldSpec, posterior, createDemoEvidenceCandidates(), seed, { numSimulations: 30 });
    printVoiReport(voiReport);
  }

  if (args.out) {
    writeFileSync(resolve(process.cwd(), args.out), `${formatJson(result)}\n`, "utf8");
    console.log(`\nJSON written to: ${args.out}`);
  } else {
    process.stdout.write(`\n--- Full JSON ---\n\n${formatJson(result)}\n`);
  }

  reportPerf(startedMs, "default");
  return 0;
}

async function runSignalsCommand(inputPath: string, catalogDir: string | undefined): Promise<number> {
  const resolvedPath = resolve(inputPath);
  const payload = JSON.parse(readFileSync(resolvedPath, "utf8"));
  console.log("\n=== Zeo Signals ===");
  console.log(`Input: ${inputPath}`);
  console.log(`Catalog: ${catalogDir || "default"}`);
  console.log(`Type: ${payload.type || "unknown"}`);
  console.log(`Items: ${payload.items?.length || 0}`);
  process.stdout.write(`\n--- Full Payload JSON ---\n\n${formatJson(payload)}\n`);
  return 0;
}

async function main(): Promise<void> {
  const startedMs = performance.now();
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    reportPerf(startedMs, "help");
    process.exit(0);
  }
  if (argv.includes("--version") || argv.includes("-v")) {
    console.log(getCliVersion());
    reportPerf(startedMs, "version");
    process.exit(0);
  }

  if (argv[0] === "mcp") {
    const { parseMcpArgs, runMcpCommand } = await import("./mcp-cli.js");
    process.exit(await runMcpCommand(parseMcpArgs(argv.slice(1))));
  }

  if (argv[0] === "perf") {
    const { parsePerfArgs, runPerfCommand } = await import("./perf-cli.js");
    process.exit(await runPerfCommand(parsePerfArgs(argv)));
  }

  const delegatedFlags = [
    ["--warehouse", "./warehouse-cli.js", "parseWarehouseArgs", "runWarehouseCommand"],
    ["--analytics", "./warehouse-cli.js", "parseAnalyticsArgs", "runAnalyticsCommand"],
    ["--regimes", "./regimes-cli.js", "parseRegimesArgs", "runRegimesCommand"],
  ] as const;

  for (const [flag, modulePath, parseFn, runFn] of delegatedFlags) {
    const idx = argv.indexOf(flag);
    if (idx !== -1) {
      const mod = await import(modulePath);
      process.exit(await mod[runFn](mod[parseFn](argv.slice(idx + 1))));
    }
  }

  if (argv[0] === "adapters" || argv[0] === "ingest") {
    const mod = await import("./adapters-runtime-cli.js");
    process.exit(await mod.runAdaptersRuntimeCommand(mod.parseAdaptersRuntimeArgs(argv[0] === "ingest" ? argv : argv.slice(1))));
  }

  if (argv[0] === "eval") {
    const mod = await import("./eval-cli.js");
    process.exit(await mod.runEvalCommand(mod.parseEvalArgs(argv.slice(1))));
  }

  if (argv[0] === "pack") {
    const mod = await import("./pack-cli.js");
    process.exit(await mod.runPackCommand(mod.parsePackArgs(argv.slice(1))));
  }

  if (argv[0] === "doctor") {
    const mod = await import("./doctor-cli.js");
    process.exit(await mod.runDoctorCommand(mod.parseDoctorArgs(argv.slice(1))));
  }

  if (argv[0] === "llm") {
    const mod = await import("./llm-cli.js");
    process.exit(await mod.runLlmCommand(mod.parseLlmArgs(argv.slice(1))));
  }

  if (argv[0] === "agents") {
    const mod = await import("./agents-cli.js");
    process.exit(await mod.runAgentsCommand(mod.parseAgentsArgs(argv.slice(1))));
  }

  if (["start", "add-note", "run", "next", "share", "copy", "export", "quests", "done", "streaks", "view", "review"].includes(argv[0] ?? "")) {
    const mod = await import("./workflow-cli.js");
    process.exit(await mod.runWorkflowCommand(mod.parseWorkflowArgs(argv)));
  }

  if (argv[0] === "graph") {
    const mod = await import("./graph-cli.js");
    process.exit(await mod.runGraphCommand(argv));
  }


  if (["transcript", "keys", "trust", "keygen", "key"].includes(argv[0] ?? "")) {
    const mod = await import("./transcript-cli.js");
    process.exit(await mod.runTranscriptCommand(argv));
  }

  if (argv[0] === "zeolite") {
    const mod = await import("./zeolite-cli.js");
    process.exit(await mod.runZeoliteCommand(mod.parseZeoliteArgs(argv.slice(1))));
  }

  if (argv[0] === "transcript") {
    const mod = await import("./transcript-cli.js");
    process.exit(await mod.runTranscriptCommand(mod.parseTranscriptArgs(argv.slice(1))));
  }

  const args = parseArgs(argv);
  if (args.replay || args.pack) {
    const mod = await import("./replay-cli.js");
    process.exit(await mod.runReplayCommand(args));
  }

  try {
    if (args.signals) {
      process.exit(await runSignalsCommand(args.signals, args.catalog));
    }
    process.exit(await runDefaultCommand(args, startedMs));
  } catch (err) {
    const contracts = await import("@zeo/contracts");
    const zeError = contracts.ZeoError.from(err);
    printError(zeError.code, zeError.message, zeError.details);
    process.exit(1);
  }
}

function createDemoWorldModel(): WorldModelSpec {
  return {
    id: "demo-world",
    version: "0.3.0",
    variables: [
      { id: "market_stress", label: "Market Stress Level", domain: "market", priorBand: { low: 0.2, high: 0.8 }, volatilityHint: "medium" },
      { id: "counterparty_trust", label: "Counterparty Trust", domain: "ops", priorBand: { low: 0.4, high: 0.9 } },
      { id: "timeline_pressure", label: "Timeline Pressure", domain: "ops", priorBand: { low: 0.1, high: 0.6 } },
    ],
    observationModels: [
      { id: "market_obs", label: "Market Observation", targetVariableIds: ["market_stress"], effect: "narrow", strength: 0.5, minQualityThreshold: 0.3, provenancePattern: "market:*" },
      { id: "news_obs", label: "News Observation", targetVariableIds: ["market_stress"], effect: "widen", strength: 0.3, minQualityThreshold: 0.2, provenancePattern: "news:*" },
    ],
  };
}

function createDemoEvidenceCandidates(): EvidenceCandidate[] {
  return [
    { id: "cand1", label: "Check VIX index", kind: "market_check", targetVariableIds: ["market_stress"], expectedCost: { timeMinutes: 5, cognitiveLoad: "low" }, reliabilityBand: { low: 0.7, high: 0.9 }, provenancePlan: { wouldHavePointer: true, sourceKinds: ["bloomberg"] } },
    { id: "cand2", label: "Ask counterparty about timeline", kind: "question", targetVariableIds: ["timeline_pressure", "counterparty_trust"], expectedCost: { timeMinutes: 15, cognitiveLoad: "medium" }, reliabilityBand: { low: 0.4, high: 0.7 }, provenancePlan: { wouldHavePointer: false, sourceKinds: ["counterparty"] } },
    { id: "cand3", label: "Review past deal history", kind: "document", targetVariableIds: ["counterparty_trust"], expectedCost: { timeMinutes: 30, cognitiveLoad: "low" }, reliabilityBand: { low: 0.6, high: 0.8 }, provenancePlan: { wouldHavePointer: true, sourceKinds: ["crm", "contracts"] } },
  ];
}

function printWorldState(posterior: PosteriorState): void {
  console.log("\n=== World State (Posterior) ===");
  for (const variable of posterior.variables) {
    console.log(`${variable.variableId}: [${variable.posteriorBand.low.toFixed(2)}, ${variable.posteriorBand.high.toFixed(2)}]`);
  }
}

function printVoiReport(report: VoiReport): void {
  console.log("\n=== Value of Information (VOI) ===");
  for (const candidate of report.candidates) {
    console.log(`${candidate.candidateId}: gain=${candidate.expectedGain.toFixed(4)} score=${candidate.costAdjustedScore.toFixed(4)}`);
  }
}

const isMainModule = process.argv[1] && import.meta.url.replace(/\\/g, "/").endsWith(process.argv[1].replace(/\\/g, "/"));
if (isMainModule) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

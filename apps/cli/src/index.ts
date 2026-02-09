import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  makeNegotiationExample,
  makeOpsExample,
  runDecision,
  canonicalizeDecisionSpec,
  hashDecisionSpec,
  buildEvidencePacket,
  buildEvidencePacketMarkdown,
  computeDeterministicSeed,
  type RunMeta,
} from "@zeo/core";
import { DecisionSpec, ZeoError } from "@zeo/contracts";
import { inferPosterior, computeVoi } from "@zeo/models";
import type { WorldModelSpec, EvidenceCandidate, PosteriorState, VoiReport } from "@zeo/contracts";
import { parseReplayArgs, runReplayCommand, type ReplayCliArgs } from "./replay-cli.js";
import {
  parseWarehouseArgs,
  parseAnalyticsArgs,
  runWarehouseCommand,
  runAnalyticsCommand,
} from "./warehouse-cli.js";
import {
  parseRegimesArgs,
  runRegimesCommand,
} from "./regimes-cli.js";
import {
  parseAdaptersRuntimeArgs,
  runAdaptersRuntimeCommand,
} from "./adapters-runtime-cli.js";
import { parseEvalArgs, runEvalCommand, type EvalCliArgs } from "./eval-cli.js";
import { parsePackArgs, runPackCommand } from "./pack-cli.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read version from package.json
let CLI_VERSION = "1.0.0";
try {
  const pkgPath = resolve(__dirname, "../package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  CLI_VERSION = pkg.version || CLI_VERSION;
} catch {
  // Use default version
}

interface CliArgs extends ReplayCliArgs {
  example: "negotiation" | "ops";
  depth: number;
  jsonOnly: boolean;
  out: string | undefined;
  seed: string | undefined;
  packetOut: string | undefined;
  signals: string | undefined;
  catalog: string | undefined;
  voi: boolean;
  world: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {
    example: "negotiation",
    depth: 2,
    jsonOnly: false,
    out: undefined,
    seed: undefined,
    strict: true,
    packetOut: undefined,
    signals: undefined,
    catalog: undefined,
    voi: false,
    world: false,
    replay: undefined,
    case: undefined,
    reportOut: undefined,
    pack: undefined,
    verify: false,
  };

  // Parse replay-specific args first
  const replayArgs = parseReplayArgs(argv);
  result.replay = replayArgs.replay;
  result.case = replayArgs.case;
  result.reportOut = replayArgs.reportOut;
  result.pack = replayArgs.pack;
  result.verify = replayArgs.verify;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "signals" && next) {
      result.signals = next;
      i++;
    } else if (arg === "--signals" && next) {
      result.signals = next;
      i++;
    } else if (arg === "--catalog" && next) {
      result.catalog = next;
      i++;
    } else if (arg === "--example" && next) {
      if (next === "negotiation" || next === "ops") result.example = next;
      i++;
    } else if (arg === "--depth" && next) {
      const d = parseInt(next, 10);
      if (d >= 1 && d <= 5) result.depth = d;
      i++;
    } else if (arg === "--json-only") {
      result.jsonOnly = true;
    } else if (arg === "--out" && next) {
      result.out = next;
      i++;
    } else if (arg === "--seed" && next) {
      result.seed = next;
      i++;
    } else if (arg === "--strict") {
      const val = next;
      if (val && (val === "false" || val === "0")) {
        result.strict = false;
        i++;
      } else {
        result.strict = true;
      }
    } else if (arg === "--packet-out" && next) {
      result.packetOut = next;
      i++;
    } else if (arg === "--voi") {
      result.voi = true;
    } else if (arg === "--world") {
      result.world = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--version" || arg === "-v") {
      console.log(CLI_VERSION);
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
Zeo CLI - Epistemic Decision Engine v${CLI_VERSION}

Usage: zeo [options]

Commands:
  signals <file>              Process external signal payloads (JSON)
  --signals <file>            Process external signal payloads (JSON)
  --replay <file>             Run replay dataset for calibration testing
  --case <id>                 Run specific case from replay dataset
  --report-out <dir>          Write replay reports to directory
  --warehouse <cmd>           Warehouse management (export/import/list)
  --analytics <cmd>           Analytics pipeline (build-dataset/run)
  adapters <cmd>               Adapter runtime (run/ingest/quarantine)
  ingest                      Ingest from all enabled adapters
  eval                        Run epistemic evaluation suite

Options:
  --catalog <dir>             Catalog directory (default: external/catalog)
  --example <name>            Example to run: "negotiation" or "ops" (default: negotiation)
  --depth <n>                 Branching depth: 1-5 (default: 2)
  --json-only                 Output JSON only, no summary
  --out <path>                Write JSON result to file
  --seed <string>              Random seed for deterministic runs (optional)
  --strict                     Exit non-zero on invariant violations (default: true)
  --packet-out <path>          Write evidence packet (JSON + MD) to directory
  --voi                        Print Value of Information (VOI) ranked list
  --world                      Print World Model posterior state
  --help, -h                   Show this help message

Examples:
  zeo --example negotiation --depth 3
  zeo --example ops --seed my-seed --packet-out ./output
  zeo --example negotiation --voi --world
  zeo signals ./data/market_signals.json --catalog ./catalog
  zeo --replay external/examples/replay/sample_dataset.json --report-out ./reports
  zeo --warehouse export --out ./backup.json
  zeo --analytics build-dataset --out ./analysis
  zeo --analytics run --dataset ./analysis/dataset.csv --out ./analysis --target outcome --features f1,f2
  zeo eval --suite external/examples/eval/core-eval.json --output ./eval-results

For warehouse/analytics help:
   zeo --warehouse
   zeo --analytics

For adapter runtime help:
   zeo adapters --help
   zeo ingest --help

For eval help:
   zeo eval --help
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
  if (!existsSync(packetDir)) {
    mkdirSync(packetDir, { recursive: true });
  }

  const jsonPath = join(packetDir, "evidence.json");
  const mdPath = join(packetDir, "evidence.md");

  writeFileSync(jsonPath, json + "\n", "utf8");
  writeFileSync(mdPath, markdown, "utf8");

  console.log(`Evidence packet written to: ${packetDir}`);
  console.log(`  - ${jsonPath}`);
  console.log(`  - ${mdPath}`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  // Check for warehouse command
  const warehouseIdx = argv.indexOf("--warehouse");
  if (warehouseIdx !== -1) {
    const warehouseArgs = parseWarehouseArgs(argv.slice(warehouseIdx + 1));
    const exitCode = await runWarehouseCommand(warehouseArgs);
    process.exit(exitCode);
  }

  // Check for analytics command
  const analyticsIdx = argv.indexOf("--analytics");
  if (analyticsIdx !== -1) {
    const analyticsArgs = parseAnalyticsArgs(argv.slice(analyticsIdx + 1));
    const exitCode = await runAnalyticsCommand(analyticsArgs);
    process.exit(exitCode);
  }

  // Check for regimes command
  const regimesIdx = argv.indexOf("--regimes");
  if (regimesIdx !== -1) {
    const regimesArgs = parseRegimesArgs(argv.slice(regimesIdx + 1));
    const exitCode = await runRegimesCommand(regimesArgs);
    process.exit(exitCode);
  }

  // Check for adapters command
  const adaptersIdx = argv.indexOf("adapters");
  if (adaptersIdx !== -1) {
    const adaptersArgs = parseAdaptersRuntimeArgs(argv.slice(adaptersIdx + 1));
    const exitCode = await runAdaptersRuntimeCommand(adaptersArgs);
    process.exit(exitCode);
  }

  // Check for eval command
  const evalIdx = argv.indexOf("eval");
  if (evalIdx !== -1) {
    const evalArgs = parseEvalArgs(argv.slice(evalIdx + 1));
    const exitCode = await runEvalCommand(evalArgs);
    process.exit(exitCode);
  }

  // Check for ingest command
  const ingestIdx = argv.indexOf("ingest");
  if (ingestIdx !== -1 && ingestIdx === 0) {
    const ingestArgs = parseAdaptersRuntimeArgs(argv);
    const exitCode = await runAdaptersRuntimeCommand(ingestArgs);
    process.exit(exitCode);
  }

  // Check for pack command
  const packIdx = argv.indexOf("pack");
  if (packIdx !== -1) {
    const packArgs = parsePackArgs(argv.slice(packIdx + 1));
    const exitCode = await runPackCommand(packArgs);
    process.exit(exitCode);
  }

  const args = parseArgs(argv);

  if (args.replay || args.pack) {
    const exitCode = await runReplayCommand(args);
    process.exit(exitCode);
  }

  if (args.signals) {
    await runSignalsCommand(args.signals, args.catalog);
    return;
  }

  const spec = args.example === "ops" ? makeOpsExample() : makeNegotiationExample();

  const errors: ZeoError[] = [];
  const startedAt = new Date().toISOString();

  let result;
  try {
    result = runDecision(spec, { depth: args.depth === 2 ? 2 : args.depth === 3 ? 3 : 2 });
  } catch (err) {
    if (args.strict) {
      const zeError = ZeoError.from(err);
      printError(zeError.code, zeError.message, zeError.details);
      process.exit(1);
    }
    errors.push(ZeoError.from(err));
  }

  const finishedAt = new Date().toISOString();

  const canonicalSpec = canonicalizeDecisionSpec(spec);
  const decisionHash = hashDecisionSpec(canonicalSpec);
  const seed = args.seed || computeDeterministicSeed(decisionHash, undefined, args.depth);

  const runMeta: RunMeta = {
    seed,
    depth: args.depth,
    limits: {
      maxBranches: 100,
      maxDepth: args.depth,
    },
    startedAt,
    finishedAt,
  };

  const packet = buildEvidencePacket({
    decisionSpec: spec,
    decisionResult: result!,
    runMeta,
    errors,
  });

  const packetJson = formatJson(packet);
  const packetMarkdown = buildEvidencePacketMarkdown(packet);

  if (args.packetOut) {
    await writePacketFiles(args.packetOut, packetJson, packetMarkdown);
  }

  if (args.jsonOnly) {
    process.stdout.write(packetJson + "\n");
    return;
  }

  console.log("\n=== Zeo CLI ===");
  console.log(`Engine: v0.2.7`);
  console.log(`Decision: ${spec.title}`);
  console.log(`Horizon: ${spec.horizon}`);
  console.log(`Depth: ${args.depth}`);
  console.log(`Decision Hash: ${decisionHash.slice(0, 16)}...`);
  console.log(`Seed: ${seed.slice(0, 16)}...`);

  if (errors.length > 0) {
    console.log("\nWarnings:");
    for (const err of errors) {
      printError(err.code, err.message);
    }
  }

  if (result) {
    console.log(`\nBranches: ${result.graph.nodes.length} nodes, ${result.graph.edges.length} edges`);

    const robustness = result.evaluations.find(e => e.lens === "robustness");
    if (robustness) {
      console.log(`Robust actions (ids): ${robustness.robustActions.join(", ") || "none"}`);
      console.log(`Dominated actions (ids): ${robustness.dominatedActions.join(", ") || "none"}`);
    }

    console.log("\nTop evidence pulls:");
    for (const n of result.nextBestEvidence) console.log(`- ${n.prompt} — ${n.rationale}`);

    if (result.explanation.whatWouldChange.length > 0) {
      console.log("\nWhat would change the answer:");
      for (const wc of result.explanation.whatWouldChange) {
        console.log(`- [${wc.assumptionId}] ${wc.flipCondition}`);
      }
    }
  }

  // v0.3.0: World Model and VOI output
  if (args.world) {
    const worldSpec = createDemoWorldModel();
    const posterior = inferPosterior(worldSpec, [], seed);
    printWorldState(posterior);
  }

  if (args.voi) {
    const worldSpec = createDemoWorldModel();
    const posterior = inferPosterior(worldSpec, [], seed);
    const candidates = createDemoEvidenceCandidates();
    const voiReport = computeVoi(worldSpec, posterior, candidates, seed, {
      numSimulations: 30,
    });
    printVoiReport(voiReport);
  }

  console.log("\nDeterminism Info:");
  console.log(`  Decision Hash: ${decisionHash}`);
  console.log(`  Observation Hash: none`);
  console.log(`  Seed: ${seed}`);

  if (args.out) {
    const outPath = resolve(process.cwd(), args.out);
    writeFileSync(outPath, formatJson(result) + "\n", "utf8");
    console.log(`\nJSON written to: ${args.out}`);
  } else {
    console.log("\n--- Full JSON ---\n");
    process.stdout.write(formatJson(result) + "\n");
  }
}

function createDemoWorldModel(): WorldModelSpec {
  return {
    id: "demo-world",
    version: "0.3.0",
    variables: [
      {
        id: "market_stress",
        label: "Market Stress Level",
        domain: "market",
        priorBand: { low: 0.2, high: 0.8 },
        volatilityHint: "medium",
      },
      {
        id: "counterparty_trust",
        label: "Counterparty Trust",
        domain: "ops",
        priorBand: { low: 0.4, high: 0.9 },
      },
      {
        id: "timeline_pressure",
        label: "Timeline Pressure",
        domain: "ops",
        priorBand: { low: 0.1, high: 0.6 },
      },
    ],
    observationModels: [
      {
        id: "market_obs",
        label: "Market Observation",
        targetVariableIds: ["market_stress"],
        effect: "narrow",
        strength: 0.5,
        minQualityThreshold: 0.3,
        provenancePattern: "market:*",
      },
      {
        id: "news_obs",
        label: "News Observation",
        targetVariableIds: ["market_stress"],
        effect: "widen",
        strength: 0.3,
        minQualityThreshold: 0.2,
        provenancePattern: "news:*",
      },
    ],
  };
}

function createDemoEvidenceCandidates(): EvidenceCandidate[] {
  return [
    {
      id: "cand1",
      label: "Check VIX index",
      kind: "market_check",
      targetVariableIds: ["market_stress"],
      expectedCost: { timeMinutes: 5, cognitiveLoad: "low" },
      reliabilityBand: { low: 0.7, high: 0.9 },
      provenancePlan: {
        wouldHavePointer: true,
        sourceKinds: ["bloomberg"],
      },
    },
    {
      id: "cand2",
      label: "Ask counterparty about timeline",
      kind: "question",
      targetVariableIds: ["timeline_pressure", "counterparty_trust"],
      expectedCost: { timeMinutes: 15, cognitiveLoad: "medium" },
      reliabilityBand: { low: 0.4, high: 0.7 },
      provenancePlan: {
        wouldHavePointer: false,
        sourceKinds: ["counterparty"],
      },
    },
    {
      id: "cand3",
      label: "Review past deal history",
      kind: "document",
      targetVariableIds: ["counterparty_trust"],
      expectedCost: { timeMinutes: 30, cognitiveLoad: "low" },
      reliabilityBand: { low: 0.6, high: 0.8 },
      provenancePlan: {
        wouldHavePointer: true,
        sourceKinds: ["crm", "contracts"],
      },
    },
  ];
}

function printWorldState(posterior: PosteriorState): void {
  console.log("\n=== World State (Posterior) ===");
  console.log(`Model: ${posterior.worldSpecId}`);
  console.log(`Seed: ${posterior.seed.slice(0, 16)}...`);
  console.log(`Model Strength: ${(posterior.modelStrength * 100).toFixed(0)}%`);
  console.log("");

  for (const variable of posterior.variables) {
    const width = variable.posteriorBand.high - variable.posteriorBand.low;
    console.log(`${variable.variableId}:`);
    console.log(`  Band: [${variable.posteriorBand.low.toFixed(2)}, ${variable.posteriorBand.high.toFixed(2)}] (width: ${width.toFixed(2)})`);
    console.log(`  Prior: [${variable.priorBand.low.toFixed(2)}, ${variable.priorBand.high.toFixed(2)}]`);
    console.log(`  Observations: ${variable.observationCount}`);
    console.log(`  Provenance: ${variable.provenanceRefs.length} refs`);
    console.log("");
  }
}

function printVoiReport(report: VoiReport): void {
  console.log("\n=== Value of Information (VOI) ===");
  console.log(`Baseline Uncertainty: ${report.baselineUncertainty.toFixed(3)}`);
  console.log(`Seed: ${report.seed.slice(0, 16)}...`);
  console.log("");
  console.log("Ranked Evidence:");
  console.log("-".repeat(80));

  for (let i = 0; i < report.candidates.length; i++) {
    const c = report.candidates[i];
    console.log(`${i + 1}. ${c.candidateId}`);
    console.log(`   Expected Gain: ${c.expectedGain.toFixed(4)}`);
    console.log(`   Cost-Adjusted Score: ${c.costAdjustedScore.toFixed(4)}`);
    console.log(`   Targets: ${c.targetVariables.join(", ")}`);
    console.log(`   Flip Relevance: ${c.flipRelevanceEstimate}`);
    console.log("");
  }
}

async function runSignalsCommand(inputPath: string, catalogDir: string | undefined): Promise<void> {
  console.log("\n=== Zeo Signals ===");
  console.log("Note: Signals command is a placeholder - full pipeline implementation pending");
  console.log(`Input: ${inputPath}`);
  console.log(`Catalog: ${catalogDir || "default"}`);

  try {
    const resolvedPath = resolve(inputPath);
    const rawContent = readFileSync(resolvedPath, "utf8");
    const payload = JSON.parse(rawContent);
    console.log(`Type: ${payload.type || "unknown"}`);
    console.log(`Items: ${payload.items?.length || 0}`);

    console.log("\n--- Full Payload JSON ---\n");
    process.stdout.write(formatJson(payload) + "\n");
  } catch (err) {
    console.error("Error reading signal file:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

const isMainModule = process.argv[1] &&
  import.meta.url.replace(/\\/g, '/').endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule) {
  main().catch((err) => {
    if (err instanceof Error && ZeoError) {
      const zeError = ZeoError.from(err);
      printError(zeError.code, zeError.message, zeError.details);
    } else {
      console.error("Unknown error:", err);
    }
    process.exit(1);
  });
}

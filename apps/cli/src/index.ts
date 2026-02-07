import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
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

interface CliArgs {
  example: "negotiation" | "ops";
  depth: number;
  jsonOnly: boolean;
  out: string | undefined;
  seed: string | undefined;
  strict: boolean;
  packetOut: string | undefined;
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
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--example" && next) {
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
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
Zeo CLI - Epistemic Decision Engine

Usage: zeo [options]

Options:
  --example <name>    Example to run: "negotiation" or "ops" (default: negotiation)
  --depth <n>        Branching depth: 1-5 (default: 2)
  --json-only        Output JSON only, no summary
  --out <path>       Write JSON result to file
  --seed <string>    Random seed for deterministic runs (optional)
  --strict           Exit non-zero on invariant violations (default: true)
  --packet-out <path> Write evidence packet (JSON + MD) to directory
  --help, -h         Show this help message

Examples:
  zeo --example negotiation --depth 3
  zeo --example ops --seed my-seed --packet-out ./output
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
  const args = parseArgs(process.argv.slice(2));
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

if (require.main === module) {
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

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { makeNegotiationExample, makeOpsExample, runDecision } from "@zeo/core";
import type { RunDecisionOpts } from "@zeo/core";

export type CliArgs = {
  example: "negotiation" | "ops";
  depth: 2 | 3;
  jsonOnly: boolean;
  out: string | undefined;
};

export function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {
    example: "negotiation",
    depth: 2,
    jsonOnly: false,
    out: undefined,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--example" && next) {
      if (next === "negotiation" || next === "ops") result.example = next;
      i++;
    } else if (arg === "--depth" && next) {
      const d = parseInt(next, 10);
      if (d === 2 || d === 3) result.depth = d;
      i++;
    } else if (arg === "--json-only") {
      result.jsonOnly = true;
    } else if (arg === "--out" && next) {
      result.out = next;
      i++;
    }
  }

  return result;
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const spec = args.example === "ops" ? makeOpsExample() : makeNegotiationExample();
  const opts: RunDecisionOpts = { depth: args.depth };
  const result = runDecision(spec, opts);

  const json = formatJson(result);

  if (args.out) {
    const outPath = resolve(process.cwd(), args.out);
    writeFileSync(outPath, json + "\n", "utf8");
  }

  if (args.jsonOnly) {
    process.stdout.write(json + "\n");
    return;
  }

  const robustness = result.evaluations.find(e => e.lens === "robustness");
  console.log("\n=== Zeo CLI ===");
  console.log(`Decision: ${spec.title}`);
  console.log(`Horizon: ${spec.horizon}`);
  console.log(`Depth: ${args.depth}`);
  console.log(`Branches: ${result.graph.nodes.length} nodes, ${result.graph.edges.length} edges`);
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

  if (!args.out) {
    console.log("\n--- Full JSON ---\n");
    process.stdout.write(json + "\n");
  } else {
    console.log(`\nJSON written to: ${args.out}`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err?.message || err);
  process.exit(1);
});

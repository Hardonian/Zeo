import { makeNegotiationExample, makeOpsExample, runDecision } from "@zeo/core";

function parseArgs(argv: string[]): { example: "negotiation" | "ops" } {
  const idx = argv.indexOf("--example");
  if (idx >= 0 && argv[idx + 1]) {
    const v = argv[idx + 1];
    if (v === "negotiation" || v === "ops") return { example: v };
  }
  return { example: "negotiation" };
}

function printJson(obj: unknown): void {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const spec = args.example === "ops" ? makeOpsExample() : makeNegotiationExample();
  const result = runDecision(spec, { depth: 2 });

  // Print a concise, operator-friendly summary first
  const robustness = result.evaluations.find(e => e.lens === "robustness");
  console.log("\n=== Zeo CLI ===");
  console.log(`Decision: ${spec.title}`);
  console.log(`Horizon: ${spec.horizon}`);
  console.log(`Branches: ${result.graph.nodes.length} nodes, ${result.graph.edges.length} edges`);
  if (robustness) {
    console.log(`Robust actions (ids): ${robustness.robustActions.join(", ") || "none"}`);
    console.log(`Dominated actions (ids): ${robustness.dominatedActions.join(", ") || "none"}`);
  }
  console.log("\nTop evidence pulls:");
  for (const n of result.nextBestEvidence) console.log(`- ${n.prompt} — ${n.rationale}`);

  console.log("\n--- Full JSON ---\n");
  printJson(result);
}

main().catch((err) => {
  console.error("Fatal:", err?.message || err);
  process.exit(1);
});

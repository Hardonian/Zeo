import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { executeZeoliteOperation, type ZeoliteOperation } from "./zeolite-core.js";

export interface ZeoliteCliArgs {
  operation: ZeoliteOperation | null;
  inputPath: string | null;
}

const OPERATIONS: ZeoliteOperation[] = [
  "load_context",
  "submit_evidence",
  "compute_flip_distance",
  "rank_evidence_by_voi",
  "generate_regret_bounded_plan",
];

export function parseZeoliteArgs(argv: string[]): ZeoliteCliArgs {
  const op = argv[0];
  const operation = OPERATIONS.includes(op as ZeoliteOperation) ? (op as ZeoliteOperation) : null;

  const inputIdx = argv.indexOf("--input");
  const inputPath = inputIdx >= 0 && argv[inputIdx + 1] ? argv[inputIdx + 1] : null;

  return { operation, inputPath };
}

function readInput(path: string | null): Record<string, unknown> {
  if (!path) return {};
  const content = readFileSync(resolve(path), "utf8");
  const parsed = JSON.parse(content);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Input JSON must be an object");
  }
  return parsed as Record<string, unknown>;
}

function printHelp(): void {
  console.log(`
Zeo Zeolite Commands

Usage:
  zeo zeolite <operation> [--input file.json]

Operations:
  load_context
  submit_evidence
  compute_flip_distance
  rank_evidence_by_voi
  generate_regret_bounded_plan
`);
}

export async function runZeoliteCommand(args: ZeoliteCliArgs): Promise<number> {
  if (!args.operation) {
    printHelp();
    return 1;
  }

  try {
    const payload = readInput(args.inputPath);
    const result = executeZeoliteOperation(args.operation, payload);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(JSON.stringify({ error: { code: "ZEO_OP_FAILED", message } }) + "\n");
    return 1;
  }
}

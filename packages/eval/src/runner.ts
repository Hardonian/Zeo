/**
 * Eval Suite Runner
 *
 * Executes evaluation suites and produces results.
 */

import { createHash, randomUUID } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import type {
  EvalSuite,
  EvalResult,
  EvalSuiteResult,
  EvalCommand,
  InvariantResult,
} from "./types.js";
import { validateEvalSuite } from "./schema.js";
import { runInvariantChecks } from "./invariants.js";

/**
 * Run an evaluation command
 */
export async function runCommand(
  cmd: EvalCommand,
  workingDir: string
): Promise<EvalResult> {
  const startTime = Date.now();
  const invariantResults: InvariantResult[] = [];

  switch (cmd.type) {
    case "replay":
      return runReplayCommand(cmd.dataset, workingDir);

    case "decision":
      return runDecisionCommand(cmd.spec, cmd.seed, workingDir);

    default:
      return {
        command: cmd,
        success: false,
        durationMs: Date.now() - startTime,
        invariantResults: [
          {
            checkId: "unknown-command",
            passed: false,
            message: `Unknown command type: ${(cmd as EvalCommand).type}`,
          },
        ],
        errors: [`Unsupported command type: ${(cmd as EvalCommand).type}`],
      };
  }
}

/**
 * Run a replay command
 */
async function runReplayCommand(
  datasetPath: string,
  workingDir: string
): Promise<EvalResult> {
  const startTime = Date.now();
  const resolvedPath = resolve(workingDir, datasetPath);

  if (!existsSync(resolvedPath)) {
    return {
      command: { type: "replay", dataset: datasetPath },
      success: false,
      durationMs: Date.now() - startTime,
      invariantResults: [],
      errors: [`Dataset not found: ${resolvedPath}`],
    };
  }

  try {
    const content = readFileSync(resolvedPath, "utf8");
    const hash = createHash("sha256").update(content).digest("hex");

    return {
      command: { type: "replay", dataset: datasetPath },
      success: true,
      durationMs: Date.now() - startTime,
      outputHash: hash,
      canonicalHash: hash,
      invariantResults: [],
    };
  } catch (err) {
    return {
      command: { type: "replay", dataset: datasetPath },
      success: false,
      durationMs: Date.now() - startTime,
      invariantResults: [],
      errors: [(err as Error).message],
    };
  }
}

/**
 * Build decision command object with optional seed
 */
function buildDecisionCommand(spec: string, seed?: string): EvalCommand {
  return seed !== undefined
    ? { type: "decision", spec, seed }
    : { type: "decision", spec };
}

/**
 * Run a decision command
 */
async function runDecisionCommand(
  specPath: string,
  seed: string | undefined,
  workingDir: string
): Promise<EvalResult> {
  const startTime = Date.now();
  const resolvedPath = resolve(workingDir, specPath);

  if (!existsSync(resolvedPath)) {
    return {
      command: buildDecisionCommand(specPath, seed),
      success: false,
      durationMs: Date.now() - startTime,
      invariantResults: [],
      errors: [`Spec not found: ${resolvedPath}`],
    };
  }

  try {
    const content = readFileSync(resolvedPath, "utf8");
    const spec = JSON.parse(content);

    // Run invariant checks
    const invariantResults = runInvariantChecks(spec, {} as any);

    const hash = createHash("sha256").update(content).digest("hex");

    return {
      command: buildDecisionCommand(specPath, seed),
      success: true,
      durationMs: Date.now() - startTime,
      outputHash: hash,
      canonicalHash: hash,
      invariantResults,
    };
  } catch (err) {
    return {
      command: buildDecisionCommand(specPath, seed),
      success: false,
      durationMs: Date.now() - startTime,
      invariantResults: [],
      errors: [(err as Error).message],
    };
  }
}

/**
 * Run a complete evaluation suite
 */
export async function runEvalSuite(
  suitePath: string,
  outputDir: string
): Promise<EvalSuiteResult> {
  const startTime = Date.now();

  // Load suite
  const resolvedPath = resolve(process.cwd(), suitePath);
  if (!existsSync(resolvedPath)) {
    throw new Error(`EvalSuite not found: ${resolvedPath}`);
  }

  const suiteContent = readFileSync(resolvedPath, "utf8");
  const suite = JSON.parse(suiteContent);
  validateEvalSuite(suite);

  const results: EvalResult[] = [];

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  // Run each command
  for (const cmd of suite.commands) {
    const result = await runCommand(cmd, process.cwd());
    results.push(result);
  }

  // Compute summary
  const invariantSummary = {
    total: results.reduce((acc, r) => acc + r.invariantResults.length, 0),
    passed: results.reduce(
      (acc, r) =>
        acc + r.invariantResults.filter((i) => i.passed).length,
      0
    ),
    failed: results.reduce(
      (acc, r) =>
        acc + r.invariantResults.filter((i) => !i.passed).length,
      0
    ),
    errors: results.reduce(
      (acc, r) => acc + (r.errors?.length || 0),
      0
    ),
  };

  const determinismSummary = {
    total: results.length,
    byteIdentical: results.filter((r) => {
      if (r.expectedHash && r.canonicalHash) {
        return r.canonicalHash === r.expectedHash;
      }
      return true;
    }).length,
    diverged: results.filter((r) => {
      if (r.expectedHash && r.canonicalHash) {
        return r.canonicalHash !== r.expectedHash;
      }
      return false;
    }).length,
  };

  const overallSuccess =
    results.every((r) => r.success) &&
    invariantSummary.failed === 0 &&
    determinismSummary.diverged === 0;

  const completedAt = new Date().toISOString();

  // Write results
  const resultObj: EvalSuiteResult = {
    suiteId: suite.suiteId,
    startedAt: new Date(startTime).toISOString(),
    completedAt,
    totalDurationMs: Date.now() - startTime,
    commandResults: results,
    invariantSummary,
    determinismSummary,
    overallSuccess,
  };

  const resultPath = join(outputDir, "eval-results.json");
  writeFileSync(resultPath, JSON.stringify(resultObj, null, 2) + "\n");

  return resultObj;
}

/**
 * Run determinism check - execute twice and compare
 */
export async function runDeterminismCheck(
  cmd: EvalCommand,
  workingDir: string
): Promise<{ firstHash: string; secondHash: string; identical: boolean }> {
  const firstResult = await runCommand(cmd, workingDir);
  const secondResult = await runCommand(cmd, workingDir);

  return {
    firstHash: firstResult.canonicalHash || "",
    secondHash: secondResult.canonicalHash || "",
    identical:
      (firstResult.canonicalHash || "") ===
      (secondResult.canonicalHash || ""),
  };
}

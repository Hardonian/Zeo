/**
 * eval-zeo-principles.mjs
 *
 * CLI-first, local-only, deterministic evaluator for Zeo principle compliance.
 * Scores a model_response against the nine Zeo architectural principles.
 *
 * Usage:
 *   node scripts/eval-zeo-principles.mjs --input <path-to-response.json>
 *   cat response.txt | node scripts/eval-zeo-principles.mjs --stdin
 *   node scripts/eval-zeo-principles.mjs --input <path> --output <result.json>
 *
 * Output: strict JSON written to stdout (and optionally --output file).
 * Exit code: 0 = pass, 1 = fail / hard-fail, 2 = usage error.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI arg parsing ──────────────────────────────────────────────────────────

function parseArgs(argv) {
  const result = { input: null, stdin: false, output: null, help: false, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { result.help = true; }
    else if (a === '--stdin') { result.stdin = true; }
    else if (a === '--verbose' || a === '-v') { result.verbose = true; }
    else if ((a === '--input' || a === '-i') && argv[i + 1]) { result.input = argv[++i]; }
    else if ((a === '--output' || a === '-o') && argv[i + 1]) { result.output = argv[++i]; }
  }
  return result;
}

function printHelp() {
  process.stdout.write(`
eval-zeo-principles — Zeo Principle Compliance Evaluator

Usage:
  node scripts/eval-zeo-principles.mjs --input <response.json|response.txt>
  node scripts/eval-zeo-principles.mjs --input <path> --output <result.json>
  cat response.txt | node scripts/eval-zeo-principles.mjs --stdin

Options:
  --input,  -i <path>   Path to file containing the model response (JSON or plain text)
  --output, -o <path>   Write JSON result to this file in addition to stdout
  --stdin               Read model response from stdin
  --verbose, -v         Emit scoring rationale to stderr
  --help,   -h          Show this help

Output (stdout): strict JSON
  {
    "scores": {
      "cli_correctness":    0-5,
      "local_first":        0-5,
      "determinism":        0-5,
      "governance":         0-5,
      "technical_depth":    0-5
    },
    "pass":                 true|false,
    "violation_type":       "",
    "architectural_risk":   "",
    "fix_recommendation":   ""
  }

Exit codes: 0 = pass, 1 = fail/hard-fail, 2 = usage error
`);
}

// ── Hard-fail pattern tables ─────────────────────────────────────────────────

/**
 * Each entry: { label, pattern: RegExp, type, risk, fix }
 * Evaluated in order; first match wins hard-fail.
 */
const HARD_FAIL_RULES = [
  {
    label: 'cloud_assumption',
    // Assumes cloud infrastructure when local-first is required.
    pattern: /\b(deploy\s+to\s+(aws|gcp|azure|cloud)|lambda\s+function|serverless\s+(function|deploy)|cloud[\s-]hosted\s+(api|service|endpoint)|saas\s+(api|integration)|remote\s+api\s+(call|endpoint)\s+required|requires?\s+(internet|connectivity|network\s+access)\s+to\s+(run|execute|work))\b/i,
    violation_type: 'cloud_assumption_when_local_first_required',
    architectural_risk: 'Response mandates cloud infrastructure without a local-first fallback, violating the local-first integrity principle.',
    fix_recommendation: 'Provide a local execution path (WASM engine, embedded DB, filesystem). Document cloud as opt-in only.',
  },
  {
    label: 'disable_safeguards',
    // Suggests disabling safeguards, auth, or approval gates.
    pattern: /\b(disable\s+(auth|authentication|authorization|approval|safeguard|security|validation|verification|governance)|bypass\s+(auth|approval|gate|guard|security|validation)|skip\s+(approval|auth|validation|verification|governance)|--no-verify\b|--skip-checks?\b|remove\s+(auth|approval)\s+(gate|check|guard))\b/i,
    violation_type: 'safeguard_disabled',
    architectural_risk: 'Response proposes removing or bypassing security controls, approval gates, or validation logic.',
    fix_recommendation: 'Never disable approval gates or auth checks. Model the exception as a governed override with an audit trail.',
  },
  {
    label: 'nondeterminism',
    // Introduces nondeterministic behavior without explicit seeding.
    pattern: /\b(Math\.random\(\)|crypto\.randomUUID\(\)|Date\.now\(\)|new\s+Date\(\)|Math\.random|uuid\(\)|nanoid\(\))\s*(\/\/[^\n]*)?\n(?!.*seed)/i,
    violation_type: 'nondeterministic_output',
    architectural_risk: 'Response introduces nondeterministic calls (random, uuid, timestamp) that break reproducibility without seeding.',
    fix_recommendation: 'Seed all randomness from a deterministic source. Use content-addressed identifiers (SHA-256) where unique IDs are required.',
  },
  {
    label: 'speculative_no_detail',
    // Speculative architecture without implementation detail.
    pattern: /\b(could\s+potentially|might\s+work\s+if|hypothetically\s+(you\s+could|this\s+could)|this\s+approach\s+might|consider\s+building|you\s+might\s+want\s+to\s+design|a\s+possible\s+architecture)\b(?![^.]*(?:```|function|class|interface|type\s+\w|const\s+\w|import\s+|export\s+))/i,
    violation_type: 'speculative_architecture_without_implementation',
    architectural_risk: 'Response proposes speculative design patterns without providing concrete implementation artifacts (code, schemas, CLI commands).',
    fix_recommendation: 'Replace speculation with a working prototype, typed interface, or concrete CLI invocation. Remove hedging language unless paired with runnable code.',
  },
];

// ── Scoring rubrics ──────────────────────────────────────────────────────────

/**
 * Returns a score 0–5 for each dimension.
 * Scoring is additive: start at 0, award points for positive signals, deduct for negative.
 * Clamped to [0, 5].
 */

function scoreCLI(text) {
  let score = 0;
  // Positive signals
  if (/```[\s\S]*?```/.test(text)) score += 1;                          // has code blocks
  if (/\$\s+\w+/.test(text) || /node\s+\w|pnpm\s+\w|npx\s+\w/.test(text)) score += 1; // CLI invocations
  if (/--\w+/.test(text)) score += 1;                                    // flag usage
  if (/exit\s+(code|status)|process\.exit/.test(text)) score += 1;      // exit code awareness
  if (/usage:|options:|arguments:|flags:/i.test(text)) score += 1;      // usage documentation
  // Negative signals
  if (/open\s+the\s+(ui|dashboard|browser)|click\s+(on|the)|navigate\s+to\s+the\s+(settings|panel)/i.test(text)) score -= 2; // GUI-only
  if (score < 0 && !/cli|command.line|terminal|shell/i.test(text)) score -= 1;
  return Math.max(0, Math.min(5, score));
}

function scoreLocalFirst(text) {
  let score = 3; // start neutral-good
  // Positive signals
  if (/local(ly)?[\s-](run|execute|stor|process)|filesystem|offline|embedded\s+(db|database|store)/i.test(text)) score += 1;
  if (/wasm|webassembly|\.wasm/i.test(text)) score += 1;
  // Negative signals
  if (/requires?\s+(internet|cloud|network)|cloud[\s-]only|hosted[\s-]service\s+required/i.test(text)) score -= 3;
  if (/aws|gcp|azure|heroku|fly\.io|vercel|netlify/.test(text) && !/optional|alternative|fallback/i.test(text)) score -= 2;
  if (/api[\s_-]?key\s+required|must\s+have\s+(an\s+)?api\s+key/i.test(text)) score -= 1;
  return Math.max(0, Math.min(5, score));
}

function scoreDeterminism(text) {
  let score = 3; // start neutral-good
  // Positive signals
  if (/sha[-_]?256|content[\s-]addressed|deterministic[\s-](hash|output|build)/i.test(text)) score += 1;
  if (/frozen.lockfile|lockfile|pinned\s+version|exact\s+version/i.test(text)) score += 1;
  // Negative signals — unseeded randomness
  if (/Math\.random\(\)|crypto\.randomUUID\(\)/.test(text) && !/seed/i.test(text)) score -= 3;
  if (/Date\.now\(\)|new\s+Date\(\)/.test(text) && !/seed|deterministic|replay/i.test(text)) score -= 2;
  if (/nondeterministic|non-deterministic|may\s+vary\s+between\s+runs/i.test(text)) score -= 2;
  return Math.max(0, Math.min(5, score));
}

function scoreGovernance(text) {
  let score = 2; // start slightly below neutral
  // Positive signals
  if (/approval\s+(gate|required|flow|step)|requiresApproval/i.test(text)) score += 1;
  if (/audit\s+(log|trail|record)|governance[\s-]aware/i.test(text)) score += 1;
  if (/explicit\s+(tool|invocation|approval)|tool\s+invocation/i.test(text)) score += 1;
  if (/trust\s+(envelope|boundary|level)|scope:\s*['"]?(read|write)/i.test(text)) score += 1;
  // Negative signals
  if (/bypass\s+(approval|auth|gate)|disable\s+(auth|governance)/i.test(text)) score -= 3;
  if (/no\s+approval\s+needed|approval[\s-]optional|skip\s+(approval|auth)/i.test(text)) score -= 2;
  return Math.max(0, Math.min(5, score));
}

function scoreTechnicalDepth(text) {
  let score = 0;
  // Positive signals
  const codeBlockCount = (text.match(/```[\s\S]*?```/g) || []).length;
  score += Math.min(2, codeBlockCount);                                  // up to 2 pts for code blocks
  if (/interface\s+\w+|type\s+\w+\s*=|class\s+\w+/i.test(text)) score += 1; // typed definitions
  if (/function\s+\w+|const\s+\w+\s*=\s*(\(|async)/.test(text)) score += 1; // concrete implementations
  if (/test\s+(case|suite|coverage)|vitest|jest|describe\s*\(/i.test(text)) score += 1; // testability
  // Negative signals
  if (/could\s+potentially|might\s+work|hypothetically/i.test(text) && codeBlockCount === 0) score -= 2;
  if (/todo:|fixme:|placeholder/i.test(text)) score -= 1;
  return Math.max(0, Math.min(5, score));
}

// ── Core evaluator ───────────────────────────────────────────────────────────

function evaluate(responseText, verbose) {
  const text = typeof responseText === 'object'
    ? JSON.stringify(responseText)
    : String(responseText);

  // 1. Hard-fail check (deterministic, first-match wins)
  let hardFail = null;
  for (const rule of HARD_FAIL_RULES) {
    if (rule.pattern.test(text)) {
      hardFail = rule;
      if (verbose) process.stderr.write(`[hard-fail] matched rule: ${rule.label}\n`);
      break;
    }
  }

  // 2. Dimension scores
  const scores = {
    cli_correctness: scoreCLI(text),
    local_first: scoreLocalFirst(text),
    determinism: scoreDeterminism(text),
    governance: scoreGovernance(text),
    technical_depth: scoreTechnicalDepth(text),
  };

  if (verbose) {
    for (const [dim, val] of Object.entries(scores)) {
      process.stderr.write(`[score] ${dim}: ${val}/5\n`);
    }
  }

  // 3. Aggregate pass/fail
  //    Hard fail overrides everything.
  //    Soft fail if any dimension < 2 or total < 15.
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const anyDimFail = Object.values(scores).some((s) => s < 2);
  const pass = hardFail === null && !anyDimFail && total >= 15;

  const result = {
    scores,
    pass,
    violation_type: hardFail ? hardFail.violation_type : (anyDimFail ? 'dimension_below_threshold' : ''),
    architectural_risk: hardFail
      ? hardFail.architectural_risk
      : (anyDimFail
        ? `One or more dimensions scored below 2/5: ${Object.entries(scores).filter(([, v]) => v < 2).map(([k]) => k).join(', ')}`
        : ''),
    fix_recommendation: hardFail
      ? hardFail.fix_recommendation
      : (anyDimFail
        ? 'Review and strengthen the lowest-scoring dimensions. Consult DETERMINISM_SPEC.md, GOVERNANCE.md, and ARCHITECTURE.md.'
        : ''),
  };

  return result;
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  let responseText = '';

  if (args.stdin) {
    // Read from stdin
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    responseText = Buffer.concat(chunks).toString('utf8');
  } else if (args.input) {
    const inputPath = resolve(process.cwd(), args.input);
    responseText = readFileSync(inputPath, 'utf8');
  } else {
    process.stderr.write('[eval-zeo-principles] Error: no input provided. Use --input <path> or --stdin.\n');
    printHelp();
    process.exit(2);
  }

  // Parse JSON if the file looks like JSON
  let parsed = responseText;
  try {
    const candidate = JSON.parse(responseText);
    // If it has a "response" or "content" key, use that as the text
    if (typeof candidate === 'object' && candidate !== null) {
      parsed = candidate.response ?? candidate.content ?? candidate.text ?? candidate;
    }
  } catch {
    // plain text — use as-is
  }

  const result = evaluate(parsed, args.verbose);
  const json = JSON.stringify(result, null, 2);

  process.stdout.write(json + '\n');

  if (args.output) {
    const outPath = resolve(process.cwd(), args.output);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, json + '\n', 'utf8');
    if (args.verbose) process.stderr.write(`[eval-zeo-principles] result written to ${outPath}\n`);
  }

  process.exit(result.pass ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`[eval-zeo-principles] fatal: ${err.message}\n`);
  process.exit(2);
});

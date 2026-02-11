import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve, dirname, basename, join } from "node:path";
import { execSync } from "node:child_process";

export interface AnalyzePrArgs {
  target?: string;
  json: boolean;
  explain: boolean;
  policy?: string;
}

type Domain = "SEC" | "ENG" | "OPS";
type RiskCategory = "auth" | "infra" | "migration" | "config";

interface RuleHit {
  category: RiskCategory;
  file: string;
  rule: string;
  points: number;
}

interface AnalysisResult {
  schema_version: "1.0.0";
  input: {
    target: string;
    target_hash: string;
    generated_at: string;
    policy_pack: string | null;
  };
  modified_files: string[];
  risk_signals: RuleHit[];
  policy_impacts: string[];
  risk_score: number;
  impacted_domains: Domain[];
  required_evidence: string[];
  assumption_deltas: string[];
  suggested_follow_up_decisions: string[];
  replay: {
    algorithm_version: "analyze-pr-v1";
    deterministic_seed: string;
    generated_files: {
      analysis_json: string;
      decision_template: string;
    };
  };
}

const RULES: Array<{ category: RiskCategory; pattern: RegExp; points: number; rule: string }> = [
  { category: "auth", pattern: /(^|\/)(auth|oauth|login|session|permission|rbac|acl)(\/|\.|$)/i, points: 25, rule: "auth-surface-change" },
  { category: "infra", pattern: /(^|\/)(dockerfile|k8s|helm|terraform|infra|deploy|nginx|cloudbuild|github\/workflows)(\/|\.|$)/i, points: 20, rule: "infrastructure-change" },
  { category: "migration", pattern: /(^|\/)(migration|migrations|schema|prisma\/migrations|sql)(\/|\.|$)/i, points: 30, rule: "data-migration-change" },
  { category: "config", pattern: /(^|\/)(\.env|config|settings|toml|yaml|yml|json)(\/|\.|$)/i, points: 12, rule: "configuration-change" },
];

function parseAnalyzePrArgs(argv: string[]): AnalyzePrArgs {
  const result: AnalyzePrArgs = { json: false, explain: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--json") result.json = true;
    else if (arg === "--explain") result.explain = true;
    else if (arg === "--policy" && next) {
      result.policy = next;
      i++;
    } else if (!arg.startsWith("-") && !result.target) {
      result.target = arg;
    }
  }
  return result;
}

function loadDiff(target: string): string {
  const resolved = resolve(process.cwd(), target);
  if (existsSync(resolved) && statSync(resolved).isFile()) return readFileSync(resolved, "utf8");
  try {
    return execSync(`git diff --no-color -- ${JSON.stringify(target)}`, { encoding: "utf8" });
  } catch {
    return execSync(`git diff --no-color ${JSON.stringify(target)}`, { encoding: "utf8" });
  }
}

function parseModifiedFiles(diff: string): string[] {
  const files = new Set<string>();
  for (const line of diff.split("\n")) {
    if (!line.startsWith("+++ b/")) continue;
    const file = line.slice("+++ b/".length).trim();
    if (file && file !== "/dev/null") files.add(file);
  }
  return [...files].sort();
}

function collectSignals(files: string[]): RuleHit[] {
  const hits: RuleHit[] = [];
  for (const file of files) {
    for (const rule of RULES) {
      if (rule.pattern.test(file)) hits.push({ category: rule.category, file, rule: rule.rule, points: rule.points });
    }
  }
  return hits.sort((a, b) => a.file.localeCompare(b.file) || a.rule.localeCompare(b.rule));
}

function impactedDomainsFromSignals(signals: RuleHit[]): Domain[] {
  const domains = new Set<Domain>(["ENG"]);
  for (const signal of signals) {
    if (signal.category === "auth") domains.add("SEC");
    if (signal.category === "infra" || signal.category === "migration" || signal.category === "config") domains.add("OPS");
  }
  return [...domains].sort() as Domain[];
}

function buildPolicyImpacts(signals: RuleHit[], policy?: string): string[] {
  const impacts = new Set<string>();
  if (policy) impacts.add(`policy-pack:${policy}`);
  for (const signal of signals) {
    if (signal.category === "auth") impacts.add("security-review-required");
    if (signal.category === "migration") impacts.add("migration-plan-required");
    if (signal.category === "infra") impacts.add("ops-rollout-check-required");
    if (signal.category === "config") impacts.add("configuration-audit-required");
  }
  return [...impacts].sort();
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function buildAnalysis(target: string, diff: string, policy?: string): AnalysisResult {
  const files = parseModifiedFiles(diff);
  const signals = collectSignals(files);
  const riskScore = Math.min(100, signals.reduce((sum, s) => sum + s.points, Math.max(5, Math.min(20, files.length * 3))));
  const impacts = buildPolicyImpacts(signals, policy);
  const requiredEvidence = uniqueSorted([
    ...signals.filter((s) => s.category === "auth").map((s) => `auth test coverage for ${s.file}`),
    ...signals.filter((s) => s.category === "migration").map((s) => `rollback plan for ${s.file}`),
    ...signals.filter((s) => s.category === "infra").map((s) => `deployment blast radius note for ${s.file}`),
    ...signals.filter((s) => s.category === "config").map((s) => `effective configuration diff review for ${s.file}`),
  ]);
  const assumptionDeltas = uniqueSorted([
    ...signals.filter((s) => s.category === "migration").map(() => "Assumption changed: schema compatibility across deployment windows"),
    ...signals.filter((s) => s.category === "auth").map(() => "Assumption changed: authentication boundaries remain equivalent"),
    ...signals.filter((s) => s.category === "infra").map(() => "Assumption changed: infrastructure defaults match production constraints"),
  ]);
  const followUps = uniqueSorted([
    ...signals.filter((s) => s.category === "auth").map(() => "Run focused security decision review"),
    ...signals.filter((s) => s.category === "migration").map(() => "Approve migration cutover decision"),
    ...signals.filter((s) => s.category === "infra").map(() => "Approve rollout sequencing decision"),
    ...signals.filter((s) => s.category === "config").map(() => "Approve configuration compatibility decision"),
  ]);

  const targetHash = createHash("sha256").update(diff).digest("hex");
  const seed = createHash("sha256").update(JSON.stringify({ target, targetHash, policy: policy ?? null })).digest("hex");
  const artifactRoot = resolve(process.cwd(), ".zeo", "analyze-pr", seed.slice(0, 12));

  return {
    schema_version: "1.0.0",
    input: {
      target,
      target_hash: targetHash,
      generated_at: "1970-01-01T00:00:00.000Z",
      policy_pack: policy ?? null,
    },
    modified_files: files,
    risk_signals: signals,
    policy_impacts: impacts,
    risk_score: riskScore,
    impacted_domains: impactedDomainsFromSignals(signals),
    required_evidence: requiredEvidence,
    assumption_deltas: assumptionDeltas,
    suggested_follow_up_decisions: followUps,
    replay: {
      algorithm_version: "analyze-pr-v1",
      deterministic_seed: seed,
      generated_files: {
        analysis_json: join(artifactRoot, "analysis.json"),
        decision_template: join(artifactRoot, "decision-template.md"),
      },
    },
  };
}

function buildSummary(analysis: AnalysisResult): string {
  return [
    "=== analyze-pr summary ===",
    `target: ${analysis.input.target}`,
    `risk_score: ${analysis.risk_score}`,
    `impacted_domains: ${analysis.impacted_domains.join(", ") || "none"}`,
    `modified_files: ${analysis.modified_files.length}`,
    `policy_impacts: ${analysis.policy_impacts.join(", ") || "none"}`,
  ].join("\n");
}

function buildDecisionTemplate(analysis: AnalysisResult): string {
  const evidence = analysis.required_evidence.length === 0 ? "- none" : analysis.required_evidence.map((e) => `- ${e}`).join("\n");
  const assumptions = analysis.assumption_deltas.length === 0 ? "- no assumption deltas detected" : analysis.assumption_deltas.map((a) => `- ${a}`).join("\n");
  return `# Decision Template: PR Risk Review\n\n` +
    `- Decision Seed: ${analysis.replay.deterministic_seed}\n` +
    `- Policy Pack: ${analysis.input.policy_pack ?? "none"}\n` +
    `- Risk Score: ${analysis.risk_score}\n\n` +
    `## Required Evidence\n${evidence}\n\n` +
    `## Assumption Deltas\n${assumptions}\n\n` +
    `## Suggested Follow-up Decisions\n${analysis.suggested_follow_up_decisions.map((d) => `- ${d}`).join("\n") || "- none"}\n`;
}

function writeArtifacts(analysis: AnalysisResult): void {
  const analysisPath = analysis.replay.generated_files.analysis_json;
  const templatePath = analysis.replay.generated_files.decision_template;
  const dir = dirname(analysisPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(analysisPath, `${JSON.stringify(analysis, null, 2)}\n`, "utf8");
  writeFileSync(templatePath, buildDecisionTemplate(analysis), "utf8");
}

export async function runAnalyzePrCommand(argv: string[]): Promise<number> {
  const args = parseAnalyzePrArgs(argv);
  const target = args.target ?? "HEAD";
  const diff = loadDiff(target);
  const analysis = buildAnalysis(target, diff, args.policy);
  writeArtifacts(analysis);

  if (!args.json) console.log(buildSummary(analysis));
  if (args.explain) {
    const lines = analysis.risk_signals.map((s) => `- ${s.file}: ${s.rule} (+${s.points})`);
    console.log("\n=== explain ===");
    console.log(lines.join("\n") || "- no risk rule hits");
  }
  process.stdout.write(`${JSON.stringify(analysis, null, 2)}\n`);
  if (!args.json) {
    console.log(`\nreplay artifact: ${analysis.replay.generated_files.analysis_json}`);
    console.log(`decision template: ${analysis.replay.generated_files.decision_template}`);
  }
  return 0;
}

export const __private__ = { parseAnalyzePrArgs, parseModifiedFiles, collectSignals, buildAnalysis, loadDiff, buildDecisionTemplate };

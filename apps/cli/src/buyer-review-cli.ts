import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runAnalyzePrCommand } from "./analyze-pr-cli.js";

interface Analysis {
  run_id: string;
  schemaVersion: string;
  summary: { risk_score: number; must_review_count: number; top_domains: string[] };
  input: { target: string; generated_at: string; policy_pack: string | null };
  fingerprints: { diff_hash: string; policy_hash: string | null; repo_hash: string | null };
  policies_triggered: string[];
  findings: Array<{ severity: string; category: string; file: string; description: string; suggested_next_action: string; evidence: string[] }>;
  replay: { artifact_dir: string; manifest_hash: string };
}

function sha256(value: string): string { return createHash("sha256").update(value).digest("hex"); }

function parseArgs(argv: string[]): { target?: string; output?: string; policy?: string } {
  const result: { target?: string; output?: string; policy?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--out" && next) { result.output = next; i++; }
    else if (arg === "--policy" && next) { result.policy = next; i++; }
    else if (!arg.startsWith("-") && !result.target) result.target = arg;
  }
  return result;
}

/**
 * Buyer workflow: turn Zeo's deterministic PR risk analysis into a review
 * handoff. It is intentionally read-only: no deployment or repository writes.
 */
export async function runBuyerReviewCommand(argv: string[]): Promise<number> {
  const args = parseArgs(argv);
  const chunks: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string | Uint8Array) => { chunks.push(String(chunk)); return true; }) as typeof process.stdout.write;
  let exitCode: number;
  try {
    const analysisArgs = [args.target ?? "--cached", "--json", "--safe", ...(args.policy ? ["--policy", args.policy] : [])];
    exitCode = await runAnalyzePrCommand(analysisArgs);
  } finally {
    process.stdout.write = originalWrite;
  }

  const json = chunks.join("").trim();
  let analysis: Analysis | null = null;
  try { analysis = JSON.parse(json) as Analysis; } catch { /* failure status below */ }
  if (!analysis || !analysis.run_id) {
    console.error("[E_BUYER_REVIEW] analysis failed; no buyer packet was written");
    console.error("Rollback: no repository or deployment changes were made. Remove any partial .zeo/analyze-pr artifacts if desired.");
    return exitCode || 5;
  }

  const high = analysis.findings.filter((finding) => finding.severity === "high").length;
  const status = high > 0 ? "blocked" : analysis.summary.risk_score >= 40 ? "review_required" : "reviewed";
  const outputDir = resolve(process.cwd(), args.output ?? join(".zeo", "buyer-reviews", analysis.run_id));
  mkdirSync(outputDir, { recursive: true });

  const packet = {
    packet_version: "buyer-review.v1",
    status,
    run_id: analysis.run_id,
    generated_at: new Date().toISOString(),
    decision: status === "reviewed" ? "Eligible for buyer review; not a production-readiness certification." : "Do not treat as approved; resolve findings and re-run review.",
    risk: analysis.summary,
    policy: { triggered: analysis.policies_triggered, policy_hash: analysis.fingerprints.policy_hash },
    evidence: {
      diff_hash: analysis.fingerprints.diff_hash,
      repo_hash: analysis.fingerprints.repo_hash,
      replay_manifest_hash: analysis.replay.manifest_hash,
      findings: analysis.findings,
    },
    limitations: [
      "Static, deterministic diff analysis only; runtime behavior and controls are not verified.",
      "Evidence is point-in-time and must be refreshed when the diff, policy, or repository changes.",
      "This packet is not a security certification, deployment approval, or production-readiness claim.",
    ],
  };
  const packetText = JSON.stringify(packet, null, 2);
  const packetHash = sha256(packetText);
  writeFileSync(join(outputDir, "buyer-review.json"), `${packetText}\n`, "utf8");
  writeFileSync(join(outputDir, "status.json"), `${JSON.stringify({ status, run_id: analysis.run_id, packet_sha256: packetHash, evidence: packet.evidence }, null, 2)}\n`, "utf8");
  const rollback = [
    "# Buyer review rollback",
    "",
    "This workflow is read-only and does not deploy, mutate git, or change buyer systems.",
    "",
    "- If the packet is stale or incorrect, delete this directory and re-run: zeo buyer-review <target>.",
    `- If a downstream process consumed this packet, withdraw it by packet SHA-256: ${packetHash}.`,
    "- Resolve findings before re-running; a new run produces a new run ID and evidence hashes.",
    "",
  ].join("\\n");
  writeFileSync(join(outputDir, "ROLLBACK.md"), rollback, "utf8");

  process.stdout.write(`${JSON.stringify({ status, run_id: analysis.run_id, output: outputDir, packet_sha256: packetHash, evidence: packet.evidence }, null, 2)}\n`);
  return status === "blocked" ? 4 : 0;
}

export const __private__ = { parseArgs };

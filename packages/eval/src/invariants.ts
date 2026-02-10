/**
 * Invariant Checkers
 *
 * Implements epistemic invariant checks for evaluation.
 */

import { createHash } from "crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { DecisionSpec, EvidencePacketJSON } from "@zeo/contracts";
import type { InvariantResult } from "./types.js";

/**
 * Minimum uncertainty width for text-derived priors (Invariant 9)
 */
export const MIN_TEXT_UNCERTAINTY_WIDTH = 0.2;

/**
 * Check if text-derived prior band is too narrow
 */
export function checkMinUncertaintyWidth(spec: DecisionSpec): InvariantResult {
  const issues: string[] = [];

  for (const assumption of spec.assumptions || []) {
    if (assumption.probability) {
      const width = assumption.probability.high - assumption.probability.low;
      if (width < MIN_TEXT_UNCERTAINTY_WIDTH) {
        issues.push(
          `${assumption.id} has width ${width.toFixed(3)} < ${MIN_TEXT_UNCERTAINTY_WIDTH}`
        );
      }
    }
  }

  return {
    checkId: "inv-min-uncertainty",
    passed: issues.length === 0,
    message:
      issues.length === 0
        ? "All priors meet minimum uncertainty width"
        : `Found ${issues.length} priors too narrow: ${issues.join(", ")}`,
    details: { narrowPriors: issues },
  };
}

/**
 * Check for prohibited causal/fact/truth claims without labeling
 */
export function checkCausalLabeling(text: string): InvariantResult {
  // Patterns that indicate improper causal/fact claims
  const prohibitedPatterns = [
    { pattern: /\bcauses?\b/i, label: "causal" },
    { pattern: /\bproves?\b/i, label: "causal" },
    { pattern: /\bdefinitely\b/i, label: "fact" },
    { pattern: /\babsolutely\b/i, label: "fact" },
    { pattern: /\bital truth\b/i, label: "truth" },
    { pattern: /\bthe fact that\b/i, label: "fact" },
  ];

  const findings: string[] = [];

  for (const { pattern, label } of prohibitedPatterns) {
    if (pattern.test(text)) {
      // Check if properly labeled as candidate
      const hasCandidateLabel =
        /\bcandidate\b/i.test(text) ||
        /\bhypothesis\b/i.test(text) ||
        /\bpossible\b/i.test(text);

      if (!hasCandidateLabel) {
        findings.push(
          `Found unlabeled ${label} claim without 'candidate' or 'hypothesis' qualifier`
        );
      }
    }
  }

  return {
    checkId: "inv-causal-labeling",
    passed: findings.length === 0,
    message:
      findings.length === 0
        ? "All causal/fact claims properly labeled"
        : `Found ${findings.length} unlabeled claims: ${findings.join("; ")}`,
    details: { findings },
  };
}

/**
 * Check packet for provenance requirements
 */
export function checkProvenance(packet: EvidencePacketJSON): InvariantResult {
  const issues: string[] = [];

  // Check if facts in assumptions have provenance (Invariant 1)
  // Facts must have provenance pointers
  for (const claim of packet.decision.spec.assumptions || []) {
    if (claim.status === "fact" && (!claim.provenance || claim.provenance.length === 0)) {
      issues.push(`Claim "${claim.text.slice(0, 50)}..." marked as fact without provenance`);
    }
  }

  // Check results claims if available
  for (const claim of packet.results?.explanation?.whatWouldChange || []) {
    // Check if assumption exists for the ID referenced
    const assumption = packet.decision.spec.assumptions.find(a => a.id === claim.assumptionId);
    if (assumption && assumption.status === "fact" && (!assumption.provenance || assumption.provenance.length === 0)) {
      issues.push(`Assumption ${claim.assumptionId} marked as fact without provenance`);
    }
  }

  return {
    checkId: "inv-provenance",
    passed: issues.length === 0,
    message:
      issues.length === 0
        ? "All facts have provenance"
        : `Found ${issues.length} facts without provenance: ${issues.join(", ")}`,
    details: { issues },
  };
}

/**
 * Verify file contents match expected hash
 */
export function verifyHash(filePath: string, expectedHash: string): InvariantResult {
  if (!existsSync(filePath)) {
    return {
      checkId: "inv-hash-match",
      passed: false,
      message: `File not found: ${filePath}`,
    };
  }

  const content = readFileSync(filePath);
  const actualHash = createHash("sha256").update(content).digest("hex");

  const passed = actualHash === expectedHash;

  return {
    checkId: "inv-hash-match",
    passed,
    message: passed
      ? "Output hash matches expected"
      : `Hash mismatch: expected ${expectedHash.slice(0, 16)}..., got ${actualHash.slice(0, 16)}...`,
    details: {
      filePath,
      expectedHash: expectedHash.slice(0, 16) + "...",
      actualHash: actualHash.slice(0, 16) + "...",
    },
  };
}

/**
 * Run all invariant checks on a decision spec
 */
export function runInvariantChecks(spec: DecisionSpec, packet: EvidencePacketJSON): InvariantResult[] {
  return [
    checkMinUncertaintyWidth(spec),
    checkProvenance(packet),
  ];
}

/**
 * Run text-based invariant checks
 */
export function runTextInvariantChecks(text: string): InvariantResult[] {
  return [checkCausalLabeling(text)];
}


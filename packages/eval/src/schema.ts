/**
 * EvalSuite schema definition and validation
 */

import type { EvalSuite, InvariantCheck, ExpectedOutput } from "./types";

/**
 * Minimum uncertainty width for text-derived priors (Invariant 9)
 */
export const MIN_TEXT_UNCERTAINTY_WIDTH = 0.2;

/**
 * Maximum dominance cap for strategies (Invariant 10)
 */
export const MAX_DOMINANCE_CAP = 0.6;

/**
 * Default evaluation suite template
 */
export function createDefaultEvalSuite(): EvalSuite {
  return {
    version: "0.5.1",
    suiteId: "zeo-core-eval-v051",
    description: "Core evaluation suite for Zeo epistemic invariants",
    createdAt: new Date().toISOString(),
    fixtures: [],
    commands: [],
    expectedOutputs: [],
    invariantChecks: [
      {
        id: "inv-001",
        description: "No text-derived prior is narrower than minimum width (0.2)",
        severity: "error",
        category: "min_uncertainty",
      },
      {
        id: "inv-002",
        description: "No causal/fact/truth claims without candidate labeling",
        severity: "error",
        category: "causal_labeling",
      },
      {
        id: "inv-003",
        description: "Packet exports include provenance pointers where required",
        severity: "error",
        category: "provenance",
      },
      {
        id: "inv-004",
        description: "Widen-only rule is not violated",
        severity: "error",
        category: "widen_only",
      },
      {
        id: "inv-005",
        description: "Outputs are byte-identical on repeated runs",
        severity: "error",
        category: "determinism",
      },
    ],
  };
}

/**
 * Validate an EvalSuite structure
 */
export function validateEvalSuite(value: unknown): asserts value is EvalSuite {
  if (!value || typeof value !== "object") {
    throw new Error("EvalSuite must be an object");
  }

  const suite = value as Record<string, unknown>;

  if (typeof suite.version !== "string") {
    throw new Error("EvalSuite.version must be a string");
  }

  if (typeof suite.suiteId !== "string") {
    throw new Error("EvalSuite.suiteId must be a string");
  }

  if (!Array.isArray(suite.fixtures)) {
    throw new Error("EvalSuite.fixtures must be an array");
  }

  if (!Array.isArray(suite.commands)) {
    throw new Error("EvalSuite.commands must be an array");
  }

  if (!Array.isArray(suite.invariantChecks)) {
    throw new Error("EvalSuite.invariantChecks must be an array");
  }
}

/**
 * Validate an InvariantCheck structure
 */
export function validateInvariantCheck(value: unknown): asserts value is InvariantCheck {
  if (!value || typeof value !== "object") {
    throw new Error("InvariantCheck must be an object");
  }

  const check = value as Record<string, unknown>;

  if (typeof check.id !== "string") {
    throw new Error("InvariantCheck.id must be a string");
  }

  if (typeof check.description !== "string") {
    throw new Error("InvariantCheck.description must be a string");
  }

  if (check.severity !== "error" && check.severity !== "warning") {
    throw new Error("InvariantCheck.severity must be 'error' or 'warning'");
  }

  const validCategories = [
    "determinism",
    "widen_only",
    "provenance",
    "causal_labeling",
    "fact_claims",
    "min_uncertainty",
  ];

  if (!validCategories.includes(check.category as string)) {
    throw new Error(
      `InvariantCheck.category must be one of: ${validCategories.join(", ")}`
    );
  }
}

/**
 * Validate an ExpectedOutput structure
 */
export function validateExpectedOutput(value: unknown): asserts value is ExpectedOutput {
  if (!value || typeof value !== "object") {
    throw new Error("ExpectedOutput must be an object");
  }

  const output = value as Record<string, unknown>;

  if (typeof output.filePattern !== "string") {
    throw new Error("ExpectedOutput.filePattern must be a string");
  }

  if (typeof output.hash !== "string") {
    throw new Error("ExpectedOutput.hash must be a string");
  }

  if (typeof output.canonicalHash !== "string") {
    throw new Error("ExpectedOutput.canonicalHash must be a string");
  }
}


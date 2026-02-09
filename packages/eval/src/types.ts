/**
 * Evaluation Suite Types
 *
 * Defines schemas for evaluation suites, fixtures, and invariant checks.
 * @module @zeo/eval
 */

import type { DecisionSpec, ReplayDataset } from "@zeo/contracts";

/**
 * Type of evaluation command to run
 */
export type EvalCommand =
  | { type: "replay"; dataset: string }
  | { type: "calibration"; dataset: string }
  | { type: "tournament"; config: string }
  | { type: "decision"; spec: string; seed?: string };

/**
 * Expected output hash for comparison
 */
export type ExpectedOutput = {
  filePattern: string; // glob pattern for expected output files
  hash: string; // SHA-256 hash of expected content
  canonicalHash: string; // hash of canonically-ordered content
};

/**
 * Invariant check configuration
 */
export type InvariantCheck = {
  id: string;
  description: string;
  severity: "error" | "warning";
  category: InvariantCategory;
};

export type InvariantCategory =
  | "determinism"
  | "widen_only"
  | "provenance"
  | "causal_labeling"
  | "fact_claims"
  | "min_uncertainty";

/**
 * Fixture definition - input data for evaluation
 */
export type EvalFixture = {
  id: string;
  description: string;
  category: "replay" | "tournament" | "decision" | "calibration";
  files: string[]; // paths to fixture files
};

/**
 * Complete evaluation suite
 */
export type EvalSuite = {
  version: string;
  suiteId: string;
  description: string;
  createdAt: string;
  fixtures: EvalFixture[];
  commands: EvalCommand[];
  expectedOutputs: ExpectedOutput[];
  invariantChecks: InvariantCheck[];
};

/**
 * Result of running an invariant check
 */
export type InvariantResult = {
  checkId: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
};

/**
 * Result of running an evaluation command
 */
export type EvalResult = {
  command: EvalCommand;
  success: boolean;
  durationMs: number;
  outputHash?: string;
  canonicalHash?: string;
  expectedHash?: string;
  invariantResults: InvariantResult[];
  errors?: string[];
};

/**
 * Summary of evaluation suite run
 */
export type EvalSuiteResult = {
  suiteId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  commandResults: EvalResult[];
  invariantSummary: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
  };
  determinismSummary: {
    total: number;
    byteIdentical: number;
    diverged: number;
  };
  overallSuccess: boolean;
};


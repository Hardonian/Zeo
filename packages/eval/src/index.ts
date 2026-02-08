/**
 * @zeo/eval
 *
 * Evaluation harness for epistemic regressions and determinism checks.
 */

// Re-export types
export type {
  EvalCommand,
  ExpectedOutput,
  InvariantCheck,
  InvariantCategory,
  EvalFixture,
  EvalSuite,
  InvariantResult,
  EvalResult,
  EvalSuiteResult,
} from "./types.js";

// Re-export schema values (avoiding duplicate MIN_TEXT_UNCERTAINTY_WIDTH)
export {
  createDefaultEvalSuite,
  validateEvalSuite,
  validateInvariantCheck,
  validateExpectedOutput,
  MIN_TEXT_UNCERTAINTY_WIDTH,
  MAX_DOMINANCE_CAP,
} from "./schema.js";

// Re-export invariants
export {
  MIN_TEXT_UNCERTAINTY_WIDTH as INVARIANT_MIN_UNCERTAINTY_WIDTH,
  checkMinUncertaintyWidth,
  checkCausalLabeling,
  checkProvenance,
  verifyHash,
  runInvariantChecks,
  runTextInvariantChecks,
} from "./invariants.js";

// Re-export runner
export {
  runCommand,
  runEvalSuite,
  runDeterminismCheck,
} from "./runner.js";

export type {
  ExplanationLevel,
  ExplanationContent,
  ExplanationGenerator,
  AutoSelectionRules,
  ExplanationSelectionContext,
  ExplanationRecord,
} from "./types.js";

export {
  ExplanationGeneratorImpl,
  generateExplanation,
  ensureConsistency,
} from "./generator.js";

export {
  ExplanationSelector,
  autoSelectExplanationLevel,
  shouldEscalateLevel,
  createDefaultRules,
} from "./selector.js";
export type {
  ExplanationLevel,
  ExplanationContent,
  ExplanationGenerator,
  AutoSelectionRules,
  ExplanationSelectionContext,
  ExplanationRecord,
} from "./types";

export {
  ExplanationGeneratorImpl,
  generateExplanation,
  ensureConsistency,
} from "./generator";

export {
  ExplanationSelector,
  autoSelectExplanationLevel,
  shouldEscalateLevel,
  createDefaultRules,
} from "./selector";

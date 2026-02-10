/**
 * @zeo/repro-pack
 *
 * Reproducibility packs, replay verification, assumption tracking,
 * typed cost/time/risk, sanitization.
 */

// Types
export type {
    Assumption,
    AssumptionSource,
    Uncertainty,
    UncertaintyKind,
    TypedCost,
    TypedDuration,
    TypedRisk,
    BudgetConstraints,
    PlanResult,
    FeasiblePlan,
    InfeasiblePlanExplanation,
    PlanStatus,
    RunEvent,
    RunEventType,
    ReproPackManifest,
    BuildReproPackParams,
    RunData,
} from "./types.js";

// Pack builder
export {
    buildReproPackContents,
    buildReproPackZip,
    readReproPackZip,
    sha256,
    type ReproPackContents,
} from "./pack-builder.js";

// Replay & Verify
export {
    validatePack,
    parsePack,
    deepDiff,
    replayFromPack,
    EXIT_CODES,
    type ParsedPack,
    type PackValidationResult,
    type DiffEntry,
    type ReplayPipeline,
    type ReplayResult,
} from "./replay.js";

// Assumptions
export {
    AssumptionTracker,
    createAssumptionTracker,
} from "./assumptions.js";

// Determinism
export {
    DeterminismGate,
    DeterminismError,
    gate,
    type Clock,
} from "./determinism-gate.js";
export * from "./support-bundle.js";

// Sanitizer
export {
    sanitizeString,
    sanitizeValue,
    getSecretPatternNames,
} from "./sanitizer.js";

// Typed Cost / Duration / Risk
export {
    validateCost,
    validateDuration,
    validateRisk,
    durationToMinutes,
    parseCost,
    parseDuration,
    checkPlanFeasibility,
} from "./typed-cost.js";

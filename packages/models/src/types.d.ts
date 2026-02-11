import type { UUID } from "@zeo/contracts";
/**
 * Represents epistemic uncertainty (we don't know) vs aleatoric uncertainty (world is stochastic).
 */
export type UncertaintyKind = "epistemic" | "aleatoric";
/**
 * A probability distribution representation supporting both
 * parametric forms and empirical samples.
 */
export type ProbabilityDistribution = {
    kind: "beta";
    alpha: number;
    beta: number;
} | {
    kind: "normal";
    mean: number;
    std: number;
} | {
    kind: "interval";
    low: number;
    high: number;
} | {
    kind: "empirical";
    samples: number[];
    provenance: string;
};
/**
 * A latent variable in the world state with full uncertainty characterization.
 */
export type LatentVariable = {
    id: UUID;
    name: string;
    description: string;
    value: number;
    distribution: ProbabilityDistribution;
    uncertaintyKind: UncertaintyKind;
    lastUpdated: string;
    evidenceIds: UUID[];
};
/**
 * Observation likelihood maps an EvidenceEvent to a likelihood
 * under different world state hypotheses.
 */
export type ObservationLikelihood = {
    evidenceId: UUID;
    variableId: UUID;
    likelihoodFunction: "gaussian" | "bernoulli" | "beta" | "custom";
    parameters: Record<string, number>;
    noiseModel: "additive" | "multiplicative" | "heteroscedastic";
    biasCounterweights: BiasCounterweight[];
};
/**
 * Explicit bias counterweights for news/media observations.
 */
export type BiasCounterweight = {
    sourceType: "news" | "market" | "social" | "official" | "analyst";
    direction: "upward" | "downward" | "left" | "right" | "sensationalist" | "conservative";
    magnitude: number;
    confidence: number;
    rationale: string;
};
/**
 * The complete world state representation.
 */
export type WorldState = {
    id: UUID;
    timestamp: string;
    variables: LatentVariable[];
    observations: ObservationLikelihood[];
    regime: RegimeIndicator;
};
/**
 * Regime indicators for detecting structural shifts.
 */
export type RegimeIndicator = {
    currentRegime: string;
    regimeConfidence: number;
    changePoints: ChangePoint[];
    stabilityScore: number;
};
export type ChangePoint = {
    timestamp: string;
    variableId: UUID;
    fromRegime: string;
    toRegime: string;
    detectionMethod: "cusum" | "bayesian" | "manual";
    confidence: number;
};
/**
 * Types of belief updates supported.
 */
export type BeliefUpdateType = "bayesian" | "heuristic" | "human_override";
/**
 * Interface for updating beliefs given new evidence.
 */
export type BeliefUpdate = {
    id: UUID;
    timestamp: string;
    variableId: UUID;
    updateType: BeliefUpdateType;
    priorDistribution: ProbabilityDistribution;
    posteriorDistribution: ProbabilityDistribution;
    evidenceIds: UUID[];
    klDivergence?: number;
    humanVerifier?: {
        verifierId: string;
        confirmedAt: string;
        overrideRationale: string;
    };
    metadata: {
        epistemicIntegrityScore: number;
        aleatoricVarianceExplained: number;
        uncertaintyWidened: boolean;
    };
};
/**
 * Posterior summary returned by the Python inference engine.
 */
export type PosteriorSummary = {
    variableId: UUID;
    mean: number;
    median: number;
    std: number;
    credibleInterval: {
        low: number;
        high: number;
    };
    samples: number[];
    convergenceDiagnostics: {
        rHat: number;
        effectiveSampleSize: number;
        divergences: number;
    };
};
/**
 * Request/response types for Python bridge.
 */
export type InferenceRequest = {
    worldState: WorldState;
    newEvidence: {
        evidenceId: UUID;
        observationValue: number;
        likelihood: ObservationLikelihood;
    }[];
    method: "mcmc" | "variational" | "analytic";
    mcmcConfig?: {
        chains: number;
        draws: number;
        tune: number;
    };
};
export type InferenceResponse = {
    success: boolean;
    error?: string;
    updates: BeliefUpdate[];
    posteriors: PosteriorSummary[];
    computationTime: number;
    modelEvidence?: number;
};
//# sourceMappingURL=types.d.ts.map
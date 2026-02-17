import {
    Budget,
    BudgetUsage,
    DecisionResult,
    ZeoError
} from "@zeo/contracts";

export class BudgetReachedError extends Error {
    constructor(
        public readonly partialResult: Partial<DecisionResult>,
        public readonly remediationHint: string
    ) {
        super("Budget reached");
        this.name = "BudgetReachedError";
    }
}

export class BudgetManager {
    private usage: BudgetUsage = {
        wallMs: 0,
        stepsUsed: 0,
        evidenceItemsUsed: 0,
        alternativesConsidered: 0,
        computeUnitsUsed: 0,
        tokensUsed: 0,
    };
    private startTime: number;
    private readonly budget: Budget;

    constructor(budget: Budget = {}) {
        this.budget = budget;
        this.startTime = Date.now();
    }

    public start() {
        this.startTime = Date.now();
    }

    private updateTime() {
        this.usage.wallMs = Date.now() - this.startTime;
    }

    public getUsage(): BudgetUsage {
        this.updateTime();
        return { ...this.usage };
    }

    public check(partialResultProvider?: () => Partial<DecisionResult>) {
        this.updateTime();

        // Check Wall Time
        if (this.budget.maxWallMs && this.usage.wallMs > this.budget.maxWallMs) {
            this.throwReached("Increase maxWallMs", partialResultProvider);
        }

        // Check Steps
        if (this.budget.maxSteps && this.usage.stepsUsed > this.budget.maxSteps) {
            this.throwReached("Increase maxSteps", partialResultProvider);
        }

        // Check Evidence
        if (this.budget.maxEvidenceItems && this.usage.evidenceItemsUsed > this.budget.maxEvidenceItems) {
            this.throwReached("Increase maxEvidenceItems", partialResultProvider);
        }

        // Check Plan Alternatives
        if (this.budget.maxPlanAlternatives && this.usage.alternativesConsidered > this.budget.maxPlanAlternatives) {
            this.throwReached("Increase maxPlanAlternatives", partialResultProvider);
        }

        // Check Compute Units
        if (this.budget.maxComputeUnits && this.usage.computeUnitsUsed > this.budget.maxComputeUnits) {
            this.throwReached("Increase maxComputeUnits", partialResultProvider);
        }

        // Check Tokens
        if (this.budget.maxTokens && (this.usage.tokensUsed || 0) > this.budget.maxTokens) {
            this.throwReached("Increase maxTokens", partialResultProvider);
        }
    }

    public incrementSteps(n = 1) {
        this.usage.stepsUsed += n;
        this.usage.computeUnitsUsed += n * 1; // Base cost per step
        this.check(); // Check budget after increment
    }

    public incrementEvidence(n = 1) {
        this.usage.evidenceItemsUsed += n;
        this.usage.computeUnitsUsed += n * 2; // Higher cost for evidence
        this.check();
    }

    public incrementAlternatives(n = 1) {
        this.usage.alternativesConsidered += n;
        this.usage.computeUnitsUsed += n * 5; // Higher cost for plan exploration
        this.check();
    }

    public recordCompute(units: number) {
        this.usage.computeUnitsUsed += units;
        this.check();
    }

    public recordTokens(tokens: number) {
        this.usage.tokensUsed = (this.usage.tokensUsed || 0) + tokens;
        this.check();
    }

    private throwReached(remediation: string, partialResultProvider?: () => Partial<DecisionResult>) {
        const result = partialResultProvider ? partialResultProvider() : {};

        // Enrich the result with budget info
        const enrichedResult: Partial<DecisionResult> = {
            ...result,
            status: "budget_reached",
            budget: this.budget,
            usage: this.getUsage(), // Ensure we attach the *current* usage that triggered it
            remediationHint: remediation,
        };

        throw new BudgetReachedError(enrichedResult, remediation);
    }
}

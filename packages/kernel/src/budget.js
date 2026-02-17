export class BudgetReachedError extends Error {
    partialResult;
    remediationHint;
    constructor(partialResult, remediationHint) {
        super("Budget reached");
        this.partialResult = partialResult;
        this.remediationHint = remediationHint;
        this.name = "BudgetReachedError";
    }
}
export class BudgetManager {
    usage = {
        wallMs: 0,
        stepsUsed: 0,
        evidenceItemsUsed: 0,
        alternativesConsidered: 0,
        computeUnitsUsed: 0,
        tokensUsed: 0,
    };
    startTime;
    budget;
    constructor(budget = {}) {
        this.budget = budget;
        this.startTime = Date.now();
    }
    start() {
        this.startTime = Date.now();
    }
    updateTime() {
        this.usage.wallMs = Date.now() - this.startTime;
    }
    getUsage() {
        this.updateTime();
        return { ...this.usage };
    }
    check(partialResultProvider) {
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
    incrementSteps(n = 1) {
        this.usage.stepsUsed += n;
        this.usage.computeUnitsUsed += n * 1; // Base cost per step
        this.check(); // Check budget after increment
    }
    incrementEvidence(n = 1) {
        this.usage.evidenceItemsUsed += n;
        this.usage.computeUnitsUsed += n * 2; // Higher cost for evidence
        this.check();
    }
    incrementAlternatives(n = 1) {
        this.usage.alternativesConsidered += n;
        this.usage.computeUnitsUsed += n * 5; // Higher cost for plan exploration
        this.check();
    }
    recordCompute(units) {
        this.usage.computeUnitsUsed += units;
        this.check();
    }
    recordTokens(tokens) {
        this.usage.tokensUsed = (this.usage.tokensUsed || 0) + tokens;
        this.check();
    }
    throwReached(remediation, partialResultProvider) {
        const result = partialResultProvider ? partialResultProvider() : {};
        // Enrich the result with budget info
        const enrichedResult = {
            ...result,
            status: "budget_reached",
            budget: this.budget,
            usage: this.getUsage(), // Ensure we attach the *current* usage that triggered it
            remediationHint: remediation,
        };
        throw new BudgetReachedError(enrichedResult, remediation);
    }
}
//# sourceMappingURL=budget.js.map
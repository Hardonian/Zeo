import { Budget, BudgetUsage, DecisionResult } from "@zeo/contracts";
export declare class BudgetReachedError extends Error {
    readonly partialResult: Partial<DecisionResult>;
    readonly remediationHint: string;
    constructor(partialResult: Partial<DecisionResult>, remediationHint: string);
}
export declare class BudgetManager {
    private usage;
    private startTime;
    private readonly budget;
    constructor(budget?: Budget);
    start(): void;
    private updateTime;
    getUsage(): BudgetUsage;
    check(partialResultProvider?: () => Partial<DecisionResult>): void;
    incrementSteps(n?: number): void;
    incrementEvidence(n?: number): void;
    incrementAlternatives(n?: number): void;
    recordCompute(units: number): void;
    recordTokens(tokens: number): void;
    private throwReached;
}
//# sourceMappingURL=budget.d.ts.map
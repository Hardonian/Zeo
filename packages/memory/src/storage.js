/**
 * In-memory storage adapter for testing and development.
 */
export class InMemoryStorageAdapter {
    decisions = new Map();
    outcomes = new Map();
    async saveDecision(record) {
        // Deep freeze to enforce immutability
        const frozen = this.deepFreeze(record);
        this.decisions.set(record.id, frozen);
        this.outcomes.set(record.id, []);
    }
    async getDecision(id) {
        const record = this.decisions.get(id);
        return record ? this.deepFreeze(record) : null;
    }
    async queryDecisions(query) {
        let results = Array.from(this.decisions.values());
        if (query.userId !== undefined) {
            results = results.filter(r => r.userId === query.userId);
        }
        if (query.domain !== undefined) {
            results = results.filter(r => r.domain === query.domain);
        }
        if (query.tags !== undefined && query.tags.length > 0) {
            results = results.filter(r => query.tags.some(tag => r.tags.includes(tag)));
        }
        if (query.dateRange !== undefined) {
            results = results.filter(r => {
                const created = new Date(r.createdAt).getTime();
                return created >= new Date(query.dateRange.from).getTime() &&
                    created <= new Date(query.dateRange.to).getTime();
            });
        }
        if (query.hasOutcome !== undefined) {
            results = results.filter(r => query.hasOutcome ? r.outcomes.length > 0 : r.outcomes.length === 0);
        }
        if (query.status !== undefined) {
            results = results.filter(r => r.outcomes.some(o => o.status === query.status));
        }
        return results.map(r => this.deepFreeze(r));
    }
    async getStats(query) {
        const decisions = query ? await this.queryDecisions(query)
            : Array.from(this.decisions.values());
        const byDomain = {};
        const byHorizon = {};
        let resolvedCount = 0;
        let partialCount = 0;
        let unresolvedCount = 0;
        let totalResolutionTime = 0;
        let resolutionCount = 0;
        for (const d of decisions) {
            byDomain[d.domain] = (byDomain[d.domain] || 0) + 1;
            byHorizon[d.spec.horizon] = (byHorizon[d.spec.horizon] || 0) + 1;
            const statuses = d.outcomes.map(o => o.status);
            if (statuses.includes("resolved")) {
                resolvedCount++;
                // Calculate resolution time
                const created = new Date(d.createdAt).getTime();
                const resolved = d.outcomes
                    .filter(o => o.resolvedAt)
                    .map(o => new Date(o.resolvedAt).getTime());
                if (resolved.length > 0) {
                    const avgResolved = resolved.reduce((a, b) => a + b, 0) / resolved.length;
                    totalResolutionTime += (avgResolved - created) / (1000 * 60 * 60 * 24);
                    resolutionCount++;
                }
            }
            else if (statuses.includes("partially_resolved")) {
                partialCount++;
            }
            else {
                unresolvedCount++;
            }
        }
        return {
            totalDecisions: decisions.length,
            resolvedCount,
            partialCount,
            unresolvedCount,
            byDomain,
            byHorizon,
            averageResolutionTime: resolutionCount > 0 ? totalResolutionTime / resolutionCount : undefined,
        };
    }
    async addOutcome(decisionId, outcome) {
        const existing = this.outcomes.get(decisionId) || [];
        const frozen = this.deepFreeze(outcome);
        this.outcomes.set(decisionId, [...existing, frozen]);
        // Update the decision record's outcomes array
        const decision = this.decisions.get(decisionId);
        if (decision) {
            const updated = { ...decision, outcomes: [...decision.outcomes, frozen] };
            this.decisions.set(decisionId, this.deepFreeze(updated));
        }
    }
    async getOutcomes(decisionId) {
        const outcomes = this.outcomes.get(decisionId) || [];
        return outcomes.map(o => this.deepFreeze(o));
    }
    async healthCheck() {
        return true;
    }
    /**
     * Clear all data - for testing only.
     */
    clear() {
        this.decisions.clear();
        this.outcomes.clear();
    }
    deepFreeze(obj) {
        if (obj === null || typeof obj !== "object")
            return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepFreeze(item));
        }
        const frozen = {};
        for (const [key, value] of Object.entries(obj)) {
            frozen[key] = this.deepFreeze(value);
        }
        return frozen;
    }
}
//# sourceMappingURL=storage.js.map
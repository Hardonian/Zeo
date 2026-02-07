const defaultOptions = {
    minDecisionCount: 5,
    minDomains: 1,
};
/**
 * Pattern Detection Engine - Surfaces weak signals across decisions.
 *
 * Epistemic discipline:
 * - Patterns are ALWAYS hypotheses, never facts or rules
 * - Must show sample size and diversity
 * - Low confidence by default
 * - Explicit falsification conditions
 */
export class PatternDetectionEngine {
    /**
     * Detect patterns across a set of decision records.
     */
    detectPatterns(decisions, options = {}) {
        const opts = { ...defaultOptions, ...options };
        const patterns = [];
        if (decisions.length < opts.minDecisionCount) {
            return []; // Insufficient data
        }
        // Filter by date range if specified
        let filteredDecisions = decisions;
        if (opts.dateRange) {
            filteredDecisions = decisions.filter(d => {
                const created = new Date(d.createdAt).getTime();
                return created >= new Date(opts.dateRange.from).getTime() &&
                    created <= new Date(opts.dateRange.to).getTime();
            });
        }
        // Detect each pattern type
        if (!opts.patternTypes || opts.patternTypes.includes("assumption_failure_cluster")) {
            const failurePattern = this.detectAssumptionFailureCluster(filteredDecisions);
            if (failurePattern)
                patterns.push(failurePattern);
        }
        if (!opts.patternTypes || opts.patternTypes.includes("recurring_regret_driver")) {
            const regretPattern = this.detectRecurringRegretDriver(filteredDecisions);
            if (regretPattern)
                patterns.push(regretPattern);
        }
        if (!opts.patternTypes || opts.patternTypes.includes("fragile_dependency")) {
            const fragilePattern = this.detectFragileDependencies(filteredDecisions);
            if (fragilePattern)
                patterns.push(fragilePattern);
        }
        if (!opts.patternTypes || opts.patternTypes.includes("systematic_bias")) {
            const biasPattern = this.detectSystematicBias(filteredDecisions);
            if (biasPattern)
                patterns.push(biasPattern);
        }
        return patterns;
    }
    /**
     * Detect clusters of failed assumptions.
     */
    detectAssumptionFailureCluster(decisions) {
        // Group by assumption type
        const assumptionOutcomes = new Map();
        for (const decision of decisions) {
            for (const outcome of decision.outcomes) {
                for (const assumptionId of outcome.assumptionsUsed) {
                    const assumption = decision.spec.assumptions.find(a => a.id === assumptionId);
                    if (!assumption)
                        continue;
                    const key = assumption.text.toLowerCase().replace(/[^\w\s]/g, "").slice(0, 30);
                    const existing = assumptionOutcomes.get(key) || { violated: 0, confirmed: 0, decisions: [] };
                    if (outcome.predictionMatch.surpriseLevel === "significant" ||
                        outcome.predictionMatch.surpriseLevel === "black_swan") {
                        existing.violated++;
                    }
                    else {
                        existing.confirmed++;
                    }
                    if (!existing.decisions.includes(decision)) {
                        existing.decisions.push(decision);
                    }
                    assumptionOutcomes.set(key, existing);
                }
            }
        }
        // Find assumptions with high violation rates
        for (const [assumptionKey, data] of assumptionOutcomes) {
            const total = data.violated + data.confirmed;
            if (total >= 5 && data.violated / total > 0.5) {
                return this.createPattern("assumption_failure_cluster", `Assumptions similar to "${assumptionKey}..." appear to be violated more often than expected`, data.decisions, data.violated, "low", [
                    "Violated in >50% of cases where applicable",
                    "May indicate overconfidence in this type of assumption",
                ], [
                    "Small sample size may not generalize",
                    "Context-specific factors not accounted for",
                    "Could be random variation",
                ], [
                    "Find 5+ cases where this assumption type holds true",
                    "Identify contextual factors that predict validity",
                ]);
            }
        }
        return null;
    }
    /**
     * Detect recurring sources of regret.
     */
    detectRecurringRegretDriver(decisions) {
        // Look for outcomes where "would have done differently" indicators exist
        const regretDecisions = [];
        for (const decision of decisions) {
            for (const outcome of decision.outcomes) {
                // Check for indicators of regret
                if (outcome.knownUnknowns.length > 2 ||
                    outcome.status === "partially_resolved" ||
                    outcome.confidence.level === "low") {
                    regretDecisions.push(decision);
                    break;
                }
            }
        }
        if (regretDecisions.length >= 5) {
            // Check if there's a common factor
            const commonDomains = this.getCommonDomains(regretDecisions);
            return this.createPattern("recurring_regret_driver", `Decisions in ${commonDomains.join(", ")} contexts show elevated rates of partial resolution or low confidence outcomes`, regretDecisions, regretDecisions.length, "very_low", [
                "Multiple decisions with incomplete outcomes",
                "May indicate systematic information gaps",
            ], [
                "Could be inherent uncertainty in domain",
                "May reflect measurement issues rather than decision quality",
                "Limited sample may not indicate pattern",
            ], [
                "Collect outcomes from 20+ similar decisions",
                "Identify specific missing information types",
            ]);
        }
        return null;
    }
    /**
     * Detect fragile dependencies that often fail.
     */
    detectFragileDependencies(decisions) {
        // Look at branch graphs to find nodes with many dependencies
        const dependencyFailures = new Map();
        for (const decision of decisions) {
            for (const edge of decision.branchGraph.edges) {
                if (!edge.probability)
                    continue;
                // Low probability edges indicate fragile dependencies
                if (edge.probability.low < 0.3) {
                    const key = `edge_${edge.from}_${edge.to}`;
                    dependencyFailures.set(key, (dependencyFailures.get(key) || 0) + 1);
                }
            }
        }
        // If many decisions have similar fragile paths
        if (dependencyFailures.size >= 3) {
            return this.createPattern("fragile_dependency", "Multiple decision paths contain low-probability transitions that may indicate fragile dependencies", decisions, decisions.length, "low", [
                "Recurring low-confidence transitions in branch graphs",
                "May indicate over-reliance on contingent events",
            ], [
                "Low probability doesn't imply failure",
                "May be appropriate for rare but possible outcomes",
                "Graph structure varies across decisions",
            ], [
                "Track actual outcomes of these transitions",
                "Compare to branches with higher confidence paths",
            ]);
        }
        return null;
    }
    /**
     * Detect potential systematic biases.
     */
    detectSystematicBias(decisions) {
        // Check for systematic over/under-confidence in predictions
        let overconfidentCount = 0;
        let underconfidentCount = 0;
        for (const decision of decisions) {
            for (const outcome of decision.outcomes) {
                if (outcome.status === "resolved") {
                    if (outcome.predictionMatch.surpriseLevel === "significant" ||
                        outcome.predictionMatch.surpriseLevel === "black_swan") {
                        overconfidentCount++;
                    }
                    else if (outcome.predictionMatch.surpriseLevel === "expected") {
                        underconfidentCount++;
                    }
                }
            }
        }
        const total = overconfidentCount + underconfidentCount;
        if (total >= 5 && overconfidentCount / total > 0.6) {
            return this.createPattern("systematic_bias", "Predictions appear systematically overconfident - outcomes more surprising than predicted", decisions, overconfidentCount, "moderate", [
                ">60% of outcomes more surprising than predicted",
                "May indicate underestimation of uncertainty",
            ], [
                "Could be unlucky sample",
                "May reflect difficulty of domain rather than bias",
                "Surprise is subjective",
            ], [
                "Systematically widen prediction intervals",
                "Track calibration metrics over larger sample",
            ]);
        }
        return null;
    }
    /**
     * Create a pattern record with proper epistemic discipline.
     */
    createPattern(patternType, hypothesis, decisions, outcomeCount, confidence, indicators, limitations, falsificationConditions) {
        const now = new Date().toISOString();
        const domains = [...new Set(decisions.map(d => d.domain))];
        const users = [...new Set(decisions.map(d => d.userId))];
        // Calculate timeframe span
        const timestamps = decisions.map(d => new Date(d.createdAt).getTime());
        const timeframeSpan = timestamps.length > 1
            ? (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24)
            : 0;
        // Get examples (up to 3)
        const examples = decisions.slice(0, 3).map(d => ({
            decisionId: d.id,
            description: d.spec.title,
            outcome: d.outcomes[0]?.status || "unknown",
        }));
        return {
            id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            patternType,
            hypothesis,
            confidence,
            evidence: {
                decisionCount: decisions.length,
                outcomeCount,
                domains,
                dateRange: {
                    from: decisions.length > 0 ? decisions[0].createdAt : now,
                    to: now,
                },
            },
            diversity: {
                domainCount: domains.length,
                userCount: users.length,
                assumptionTypeCount: 0, // Would need to calculate
                timeframeSpan,
            },
            examples,
            falsificationConditions,
            limitations: [
                ...limitations,
                `Based on only ${decisions.length} decisions - may not generalize`,
                "Correlation, not necessarily causation",
                "May reflect data quality issues rather than real patterns",
            ],
            detectedAt: now,
            version: 1,
        };
    }
    /**
     * Get common domains from a set of decisions.
     */
    getCommonDomains(decisions) {
        const domainCounts = new Map();
        for (const d of decisions) {
            domainCounts.set(d.domain, (domainCounts.get(d.domain) || 0) + 1);
        }
        return [...domainCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([domain]) => domain);
    }
    /**
     * Generate a pattern report for human review.
     */
    generatePatternReport(patterns) {
        if (patterns.length === 0) {
            return "# Cross-Decision Pattern Report\n\nNo patterns detected. Insufficient data or no significant signals found.\n";
        }
        let report = "# Cross-Decision Pattern Report\n\n";
        report += "⚠️ **IMPORTANT**: All patterns below are HYPOTHESES, not facts. ";
        report += "They represent weak signals that require further validation.\n\n";
        for (const pattern of patterns) {
            report += `## ${pattern.patternType.replace(/_/g, " ").toUpperCase()}\n\n`;
            report += `**Hypothesis**: ${pattern.hypothesis}\n\n`;
            report += `**Confidence**: ${pattern.confidence}\n\n`;
            report += "**Evidence Basis**:\n";
            report += `- ${pattern.evidence.decisionCount} decisions\n`;
            report += `- ${pattern.evidence.outcomeCount} outcomes\n`;
            report += `- Domains: ${pattern.evidence.domains.join(", ") || "N/A"}\n`;
            report += `- Timeframe: ${pattern.diversity.timeframeSpan.toFixed(0)} days\n\n`;
            report += "**Diversity Indicators**:\n";
            report += `- ${pattern.diversity.domainCount} domains\n`;
            report += `- ${pattern.diversity.userCount} users\n\n`;
            report += "**Indicators**:\n";
            for (const indicator of pattern.examples.slice(0, 2)) {
                report += `- ${indicator.description}: ${indicator.outcome}\n`;
            }
            report += "\n";
            report += "**Limitations**:\n";
            for (const limitation of pattern.limitations.slice(0, 3)) {
                report += `- ${limitation}\n`;
            }
            report += "\n";
            report += "**What Would Falsify This**:\n";
            for (const condition of pattern.falsificationConditions) {
                report += `- ${condition}\n`;
            }
            report += "\n---\n\n";
        }
        return report;
    }
}
//# sourceMappingURL=patterns.js.map
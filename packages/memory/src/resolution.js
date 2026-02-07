const defaultMatchingOptions = {
    minimumConfidence: 0.3,
    allowPartialMatches: true,
    ambiguityThreshold: 0.7,
};
/**
 * ResolutionEngine - Maps messy real-world outcomes back onto branches.
 *
 * Epistemic discipline:
 * - Never force resolution
 * - Ambiguity increases uncertainty, not confidence
 * - Explicit "could not be resolved" state
 * - Multiple branches can be partially true
 */
export class ResolutionEngine {
    /**
     * Match an outcome to potential branches with confidence scores.
     */
    matchOutcomeToBranches(outcome, branches, options = {}) {
        const opts = { ...defaultMatchingOptions, ...options };
        const matches = [];
        for (const branch of branches) {
            const match = this.calculateBranchMatch(outcome, branch);
            if (match.confidence >= opts.minimumConfidence) {
                matches.push(match);
            }
        }
        // Sort by confidence descending
        matches.sort((a, b) => b.confidence - a.confidence);
        return matches;
    }
    /**
     * Calculate how well an outcome matches a specific branch.
     */
    calculateBranchMatch(outcome, branch) {
        const matchingFeatures = [];
        const conflictingFeatures = [];
        // Extract key terms from branch label
        const branchTerms = this.extractTerms(branch.label);
        const outcomeTerms = this.extractTerms(outcome.outcomeData.description);
        const outcomeLower = outcome.outcomeData.description.toLowerCase();
        const branchLower = branch.label.toLowerCase();
        // Check for term overlap with stemming-like matching
        for (const term of outcomeTerms) {
            // Direct match or high similarity
            const stemmedTerm = this.stem(term);
            if (branchTerms.some(bt => {
                const stemmedBt = this.stem(bt);
                return stemmedTerm === stemmedBt || this.similarity(term, bt) > 0.6;
            })) {
                matchingFeatures.push(`Term match: ${term}`);
            }
        }
        // Also check if branch label appears directly in outcome text
        const branchCoreTerms = branchTerms.filter(t => t.length > 3);
        for (const coreTerm of branchCoreTerms) {
            if (outcomeLower.includes(coreTerm) ||
                outcomeLower.includes(this.stem(coreTerm))) {
                if (!matchingFeatures.some(f => f.includes(coreTerm))) {
                    matchingFeatures.push(`Direct match: ${coreTerm}`);
                }
            }
        }
        // Check for explicit conflicts in notes
        for (const note of branch.notes) {
            if (this.isConflicting(note, outcome.outcomeData.description)) {
                conflictingFeatures.push(`Conflict: ${note}`);
            }
        }
        // Calculate base confidence from feature overlap
        const totalFeatures = branchTerms.length + outcomeTerms.length;
        const overlapScore = totalFeatures > 0
            ? Math.min(1, (2 * matchingFeatures.length) / Math.max(5, totalFeatures))
            : 0;
        // Adjust for conflicts
        const conflictPenalty = conflictingFeatures.length * 0.15;
        let confidence = Math.max(0, overlapScore - conflictPenalty);
        // Boost confidence for direct label match in description
        const branchLabelKey = branchLower.replace("outcome: ", "").trim();
        if (outcomeLower.includes(branchLabelKey)) {
            confidence = Math.min(1, confidence + 0.3);
        }
        // Boost confidence for exact category match
        if (outcome.outcomeData.category &&
            branchLower.includes(outcome.outcomeData.category.toLowerCase())) {
            confidence = Math.min(1, confidence + 0.2);
        }
        // Generate rationale
        let rationale = `Match confidence: ${(confidence * 100).toFixed(1)}%. `;
        if (matchingFeatures.length > 0) {
            rationale += `Matching features: ${matchingFeatures.length}. `;
        }
        if (conflictingFeatures.length > 0) {
            rationale += `Conflicts detected: ${conflictingFeatures.length}. `;
        }
        return {
            branchId: branch.id,
            confidence,
            rationale,
            matchingFeatures,
            conflictingFeatures,
        };
    }
    /**
     * Resolve an outcome against a decision's branch graph.
     * Returns result that may be partial or ambiguous.
     */
    resolveOutcome(decision, outcome, options = {}) {
        const opts = { ...defaultMatchingOptions, ...options };
        // Get all outcome branches from the graph
        const branches = decision.branchGraph.nodes.filter((n) => n.kind === "outcome");
        const matches = this.matchOutcomeToBranches(outcome, branches, opts);
        // Determine resolution status and ambiguity
        const topMatch = matches[0];
        const secondMatch = matches[1];
        let status;
        let ambiguityLevel;
        let couldNotResolve = false;
        let rationale = "";
        if (matches.length === 0 || !topMatch) {
            // No match found
            status = "unresolved";
            ambiguityLevel = "high";
            couldNotResolve = true;
            rationale = "Outcome could not be mapped to any predicted branch.";
        }
        else if (topMatch.confidence < 0.5) {
            // Low confidence match
            status = "ambiguous";
            ambiguityLevel = "high";
            rationale = `Low confidence match (${(topMatch.confidence * 100).toFixed(1)}%). Outcome may not correspond to any predicted branch.`;
        }
        else if (secondMatch && (topMatch.confidence - secondMatch.confidence) < 0.2) {
            // Close second match - ambiguous
            status = "ambiguous";
            ambiguityLevel = "medium";
            rationale = `Multiple plausible branches. Top match: ${(topMatch.confidence * 100).toFixed(1)}%, Second: ${(secondMatch.confidence * 100).toFixed(1)}%`;
        }
        else if (topMatch.confidence > opts.ambiguityThreshold && topMatch.matchingFeatures.length >= 3) {
            // High confidence, good feature match
            status = "resolved";
            ambiguityLevel = "none";
            rationale = `Clear match to branch with ${(topMatch.confidence * 100).toFixed(1)}% confidence.`;
        }
        else {
            // Moderate confidence - partial resolution
            status = "partially_resolved";
            ambiguityLevel = "low";
            rationale = `Partial match with ${(topMatch.confidence * 100).toFixed(1)}% confidence. Some aspects may not align.`;
        }
        // Create mappings for top matches
        const mappings = matches.slice(0, 3).map(match => ({
            outcomeId: outcome.id,
            matchedBranchIds: [match.branchId],
            matchConfidence: {
                low: Math.max(0, match.confidence - 0.1),
                high: Math.min(1, match.confidence + 0.1),
            },
            mappingRationale: match.rationale,
            ambiguity: {
                level: match.confidence > 0.8 ? "none" : match.confidence > 0.5 ? "low" : "medium",
                description: match.conflictingFeatures.length > 0
                    ? `Conflicts: ${match.conflictingFeatures.join("; ")}`
                    : "No major conflicts detected",
            },
        }));
        // Calculate overall confidence interval
        const confidences = matches.map(m => m.confidence);
        const avgConfidence = confidences.length > 0
            ? confidences.reduce((a, b) => a + b, 0) / confidences.length
            : 0;
        return {
            outcomeId: outcome.id,
            status,
            mappings,
            ambiguity: {
                level: ambiguityLevel,
                description: rationale,
                alternativeBranches: matches.slice(1).map(m => m.branchId),
            },
            confidence: {
                low: Math.max(0, avgConfidence - 0.15),
                high: Math.min(1, avgConfidence + 0.15),
            },
            couldNotResolve,
            rationale,
        };
    }
    /**
     * Handle partial resolution where multiple branches may be partially true.
     */
    calculatePartialResolution(decision, outcome) {
        const branches = decision.branchGraph.nodes.filter((n) => n.kind === "outcome");
        const matches = this.matchOutcomeToBranches(outcome, branches);
        const resolvedAspects = [];
        const unresolvedAspects = [];
        const conflictingEvidence = [];
        // Analyze what aspects are resolved
        for (const match of matches) {
            if (match.confidence > 0.6) {
                resolvedAspects.push(...match.matchingFeatures);
            }
            else if (match.confidence > 0.3) {
                unresolvedAspects.push(`Possible match to branch ${match.branchId} (${(match.confidence * 100).toFixed(0)}% confidence)`);
            }
            conflictingEvidence.push(...match.conflictingFeatures);
        }
        // Calculate resolution degree (0-1)
        const firstMatch = matches[0];
        const resolutionDegree = firstMatch !== undefined
            ? Math.min(1, firstMatch.confidence + (firstMatch.matchingFeatures.length * 0.1))
            : 0;
        return {
            outcomeId: outcome.id,
            resolutionDegree,
            resolvedAspects: [...new Set(resolvedAspects)],
            unresolvedAspects: [...new Set(unresolvedAspects)],
            conflictingEvidence: [...new Set(conflictingEvidence)],
        };
    }
    /**
     * Extract searchable terms from text.
     */
    extractTerms(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter((t) => t.length > 2);
    }
    /**
     * Calculate string similarity (0-1).
     */
    similarity(a, b) {
        if (a === b)
            return 1;
        if (a.length === 0 || b.length === 0)
            return 0;
        // Simple Jaccard similarity on character bigrams
        const getBigrams = (s) => {
            const bigrams = new Set();
            for (let i = 0; i < s.length - 1; i++) {
                bigrams.add(s.slice(i, i + 2));
            }
            return bigrams;
        };
        const aBigrams = getBigrams(a);
        const bBigrams = getBigrams(b);
        const intersection = new Set([...aBigrams].filter(x => bBigrams.has(x)));
        const union = new Set([...aBigrams, ...bBigrams]);
        return intersection.size / union.size;
    }
    /**
     * Check if note conflicts with outcome description.
     */
    isConflicting(note, outcome) {
        const noteLower = note.toLowerCase();
        const outcomeLower = outcome.toLowerCase();
        // Simple conflict detection - opposite outcomes
        const opposites = [
            ["accept", "reject"],
            ["success", "failure"],
            ["win", "lose"],
            ["increase", "decrease"],
            ["positive", "negative"],
        ];
        for (const [pos, neg] of opposites) {
            if ((noteLower.includes(pos) && outcomeLower.includes(neg)) ||
                (noteLower.includes(neg) && outcomeLower.includes(pos))) {
                return true;
            }
        }
        return false;
    }
    /**
     * Simple stemming function to normalize words.
     * Strips common suffixes to match words like "accepted" -> "accept"
     */
    stem(word) {
        const lower = word.toLowerCase();
        // Handle common irregular forms
        const irregulars = {
            "accepted": "accept",
            "rejected": "reject",
            "countered": "counter",
            "received": "receive",
            "provided": "provide",
            "increased": "increase",
            "decreased": "decrease",
        };
        if (irregulars[lower])
            return irregulars[lower];
        // Strip common suffixes
        const suffixes = ["ing", "ed", "s", "ly", "tion", "ness", "ment", "able", "ible", "ful", "less"];
        for (const suffix of suffixes) {
            if (lower.endsWith(suffix) && lower.length > suffix.length + 2) {
                return lower.slice(0, -suffix.length);
            }
        }
        return lower;
    }
}
//# sourceMappingURL=resolution.js.map
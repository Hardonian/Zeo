import { DecisionResult, LensEvaluation, Uncertainty } from "@zeo/contracts";
import { RunData } from "@zeo/repro-pack";

export interface Citation {
    id: string;
    label: string;
    description?: string;
}

export interface ReportSection {
    id: string;
    title: string;
    content: string; // Markdown content
    citations: Citation[];
}

export interface DecisionReport {
    summary: string;
    sections: ReportSection[];
    markdown: string;
}

export function generateDecisionReport(result: DecisionResult, runData?: RunData): DecisionReport {
    const sections: ReportSection[] = [];

    // 1. Executive Summary
    const summarySection = buildSummarySection(result);
    sections.push(summarySection);

    // 2. Rationale (Why)
    const rationaleSection = buildRationaleSection(result, runData);
    sections.push(rationaleSection);

    // 3. Alternatives & Sensitivity (Why Not / What Would Change)
    const alternativesSection = buildAlternativesSection(result, runData);
    if (alternativesSection) sections.push(alternativesSection);

    // 4. Assumptions & Uncertainty
    const assumptionsSection = buildAssumptionsSection(result, runData);
    if (assumptionsSection) sections.push(assumptionsSection);

    // 5. Budget & Operational Constraints
    const budgetSection = buildBudgetSection(result);
    if (budgetSection) sections.push(budgetSection);

    // 6. Evaluations
    const evaluationsSection = buildEvaluationsSection(result);
    if (evaluationsSection) sections.push(evaluationsSection);

    // Combine into full markdown
    const fullMarkdown = sections.map(s => {
        let md = `## ${s.title}\n\n${s.content}`;
        if (s.citations.length > 0) {
            md += `\n\n**Sources:**\n${s.citations.map(c => `- ${c.label}: ${c.description || ''}`).join('\n')}`;
        }
        return md;
    }).join('\n\n');

    return {
        summary: summarySection.content,
        sections,
        markdown: `# Decision Report\n\n${fullMarkdown}`
    };
}

// Helper functions

function buildSummarySection(result: DecisionResult): ReportSection {
    let content = "";
    if (result.status) {
        content += `**Status:** ${result.status.toUpperCase()}\n\n`;
    }

    if (result.status === "failed" || result.status === "budget_reached") {
        content += `**Warning:** This run did not complete standard execution.\n`;
    }

    if (result.remediationHint) {
        content += `**Hint:** ${result.remediationHint}\n\n`;
    }

    // Attempt to synthesize a top-level recommendation if available
    // Usually via the first "Why" or explicit recommendation field if passing
    if (result.explanation && result.explanation.why.length > 0) {
        content += `**Recommendation:** ${result.explanation.why[0]}`;
    } else {
        content += `**Recommendation:** No clear recommendation generated.`;
    }

    return {
        id: "summary",
        title: "Executive Summary",
        content: content,
        citations: []
    };
}

function buildRationaleSection(result: DecisionResult, runData?: RunData): ReportSection {
    const citations: Citation[] = [];
    let content = "";

    if (result.explanation && result.explanation.why.length > 0) {
        content += result.explanation.why.map(w => `- ${w}`).join('\n');
    } else {
        content += "No rationale provided.";
    }

    // Add citations from artifacts if available
    if (runData?.artifacts?.voiRankings) {
        citations.push({
            id: "voi",
            label: "VOI Structure",
            description: "Value of Information analysis"
        });
    }

    return {
        id: "rationale",
        title: "Rationale",
        content,
        citations
    };
}

function buildAlternativesSection(result: DecisionResult, runData?: RunData): ReportSection | null {
    if (!result.explanation?.whatWouldChange?.length) return null;

    let content = "";
    const citations: Citation[] = [];

    content += "The following conditions would trigger a different recommendation:\n\n";
    result.explanation.whatWouldChange.forEach(fc => {
        content += `- If **${fc.flipCondition}**\n`;
        citations.push({
            id: fc.assumptionId,
            label: "Flip Condition",
            description: `Assumption ID: ${fc.assumptionId}`
        });
    });

    if (runData?.artifacts?.flipDistance) {
        citations.push({
            id: "flip-distance",
            label: "Flip Distance Analysis",
            description: "Computed distance to decision boundary"
        });
    }

    return {
        id: "alternatives",
        title: "Alternatives & Sensitivity",
        content,
        citations
    };
}

function buildAssumptionsSection(result: DecisionResult, runData?: RunData): ReportSection | null {
    const assumptions = runData?.assumptions || result.assumptions;
    const uncertaintyMap = runData?.uncertaintyMap || result.uncertaintyMap;

    if (!assumptions?.length && !uncertaintyMap) return null;

    let content = "";

    if (assumptions && assumptions.length > 0) {
        content += "### Key Assumptions\n";
        assumptions.forEach(a => {
            content += `- **${a.label}** (${a.units}): ${a.value} (Sensitivity: ${a.sensitivity})\n`;
        });
        content += "\n";
    }

    if (uncertaintyMap) {
        content += "### Uncertainty Disclosures\n";
        Object.entries(uncertaintyMap).forEach(([key, u]) => {
            const uTyped = u as Uncertainty;
            content += `- **${key}**: ${uTyped.kind} ${uTyped.note ? `(${uTyped.note})` : ''}\n`;
        });
    }

    return {
        id: "assumptions",
        title: "Assumptions & Uncertainty",
        content,
        citations: []
    };
}

function buildBudgetSection(result: DecisionResult): ReportSection | null {
    if (!result.usage && !result.budget) return null;

    let content = "";
    if (result.usage) {
        content += `**Resources Used:**\n`;
        content += `- Steps: ${result.usage.stepsUsed}\n`;
        content += `- Time: ${result.usage.wallMs}ms\n`;
    }

    return {
        id: "budget",
        title: "Budget & Resources",
        content,
        citations: []
    };
}

function buildEvaluationsSection(result: DecisionResult): ReportSection | null {
    if (!result.evaluations || result.evaluations.length === 0) return null;

    let content = "";
    result.evaluations.forEach(e => {
        content += `### ${formatLensName(e.lens)}\n`;
        content += `${e.summary}\n`;
        if (e.robustActions.length > 0) {
            content += `- **Robust Actions:** ${e.robustActions.join(", ")}\n`;
        }
        if (e.fragileAssumptions.length > 0) {
            content += `- **Fragile Assumptions:** ${e.fragileAssumptions.join(", ")}\n`;
        }
        content += "\n";
    });

    return {
        id: "evaluations",
        title: "Lens Evaluations",
        content,
        citations: []
    };
}

function formatLensName(lens: string): string {
    return lens.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Keep backward compatibility for now if needed, or just export the new one.
export function renderDecisionSummary(result: DecisionResult): string {
    return generateDecisionReport(result).markdown;
}

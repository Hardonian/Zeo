
import { DecisionResult } from "@zeo/contracts";

export function renderDecisionSummary(result: DecisionResult): string {
    const lines: string[] = [];
    lines.push(`# Decision Summary`);

    // Status
    lines.push("");
    if (result.status) {
        lines.push(`**Status:** ${result.status.toUpperCase()}`);
    }
    if (result.remediationHint) {
        lines.push(`**Hint:** ${result.remediationHint}`);
    }

    // Budget Usage
    if (result.usage) {
        lines.push("");
        lines.push(`**Usage:** ${result.usage.stepsUsed} steps / ${result.usage.wallMs}ms`);
    }

    lines.push("");

    // Reasoning
    if (result.explanation && result.explanation.why.length > 0) {
        lines.push(`## Reasoning`);
        result.explanation.why.forEach(w => lines.push(`- ${w}`));
        lines.push("");
    }

    // Flip Conditions (What Would Change)
    if (result.explanation && result.explanation.whatWouldChange.length > 0) {
        lines.push(`## What Would Change`);
        result.explanation.whatWouldChange.forEach(fc => lines.push(`- ${fc.flipCondition}`));
        lines.push("");
    }

    // Evaluations
    if (result.evaluations && result.evaluations.length > 0) {
        lines.push(`## Evaluations`);
        result.evaluations.forEach(e => {
            lines.push(`### ${formatLensName(e.lens)}`);
            lines.push(e.summary);
            if (e.robustActions.length > 0) {
                lines.push(`- **Robust Actions:** ${e.robustActions.join(", ")}`);
            }
            if (e.fragileAssumptions.length > 0) {
                lines.push(`- **Fragile Assumptions:** ${e.fragileAssumptions.join(", ")}`);
            }
            lines.push("");
        });
    }

    // Next Steps
    if (result.nextBestEvidence && result.nextBestEvidence.length > 0) {
        lines.push(`## Next Best Evidence`);
        result.nextBestEvidence.forEach(n => lines.push(`- **${n.prompt}**\n  *${n.rationale}*`));
        lines.push("");
    }

    return lines.join("\n");
}

function formatLensName(lens: string): string {
    return lens.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

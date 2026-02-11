import { DecisionResult } from "@zeo/contracts";
import { RunData } from "@zeo/repro-pack";
export interface Citation {
    id: string;
    label: string;
    description?: string;
}
export interface ReportSection {
    id: string;
    title: string;
    content: string;
    citations: Citation[];
}
export interface DecisionReport {
    summary: string;
    sections: ReportSection[];
    markdown: string;
}
export declare function generateDecisionReport(result: DecisionResult, runData?: RunData): DecisionReport;
export declare function renderDecisionSummary(result: DecisionResult): string;
//# sourceMappingURL=reporting.d.ts.map
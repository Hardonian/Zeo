export type DashboardPersona = "exec" | "tech" | "security";
export type DashboardConfidenceBand = "low" | "med" | "high";
export interface DashboardFingerprint {
    zeoVersion: string;
    configHash: string;
    policyHash: string | null;
    inputsHash: string;
    artifactsHash: string;
}
export interface DashboardKpis {
    riskScore: number;
    evidenceCompleteness: number;
    policyCompliance: number;
    replayStability: number;
    confidenceBand: DashboardConfidenceBand;
}
export interface DashboardStory {
    statusLine: string;
    changeLine: string;
    causeLine: string;
    actionLine: string;
    mode: "deterministic";
}
export interface DashboardRiskPoint {
    t: string;
    v: number;
    source?: string;
}
export interface DashboardDriftEvent {
    t: string;
    type: "policy" | "evidence" | "assumption" | "outcome";
    severity: 1 | 2 | 3 | 4 | 5;
    refId: string;
}
export interface DashboardAssumptionFlip {
    t: string;
    assumptionId: string;
    from: string;
    to: string;
    severity: 1 | 2 | 3 | 4 | 5;
}
export interface DashboardGraphNode {
    id: string;
    type: "decision" | "evidence" | "assumption" | "policy" | "outcome";
    label: string;
    severity?: number;
    meta?: Record<string, unknown>;
}
export interface DashboardGraphEdge {
    from: string;
    to: string;
    type: "supports" | "constrains" | "violates" | "depends_on";
    weight?: number;
    meta?: Record<string, unknown>;
}
export interface DashboardFinding {
    id: string;
    category: string;
    severity: number;
    title: string;
    file?: string;
    rationaleRefs: string[];
}
export interface DashboardEvidenceItem {
    id: string;
    qualityScore: number;
    freshness: "fresh" | "aging" | "stale" | "expired" | "unknown";
    ageDays: number;
    expiresAt?: string;
}
export interface DashboardPolicyItem {
    id: string;
    status: "pass" | "warn" | "fail";
    severity: number;
    rationaleRefs: string[];
}
export interface DashboardCta {
    label: string;
    command: string;
    reason: string;
    priority: 1 | 2 | 3 | 4 | 5;
}
export interface DashboardViewModel {
    schemaVersion: "dashboard.viewmodel.v1";
    id: string;
    generatedAt: string;
    persona: DashboardPersona;
    verificationStatus: {
        verified: boolean;
        reason: string;
    };
    fingerprint: DashboardFingerprint;
    summary: DashboardKpis;
    story: DashboardStory;
    trends: {
        riskTrajectory: DashboardRiskPoint[];
        driftEvents: DashboardDriftEvent[];
        assumptionFlips: DashboardAssumptionFlip[];
    };
    graph: {
        nodes: DashboardGraphNode[];
        edges: DashboardGraphEdge[];
    };
    lists: {
        findings: DashboardFinding[];
        evidence: DashboardEvidenceItem[];
        policies: DashboardPolicyItem[];
    };
    ctas: DashboardCta[];
}
//# sourceMappingURL=dashboard.d.ts.map
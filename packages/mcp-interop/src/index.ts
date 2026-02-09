/**
 * @zeo/mcp-interop — Canonical Interchange Schema
 *
 * Defines the zeo.interop.json schema for notebook/notes app integration.
 * Contains: notes, evidence, kpis, runs, packets, links.
 */

import type {
    DecisionSpec,
    DecisionResult,
    BranchGraph,
    LensEvaluation,
} from "@zeo/contracts";

/**
 * Top-level interchange format for Zeo data.
 */
export interface ZeoInterop {
    version: "1.4.0";
    exportedAt: string;
    source: string;
    notes: InteropNote[];
    evidence: InteropEvidence[];
    kpis: InteropKpi[];
    runs: InteropRun[];
    packets: InteropPacket[];
    links: InteropLink[];
}

export interface InteropNote {
    id: string;
    title: string;
    body: string;
    tags: string[];
    source: string;
    createdAt: string;
    contentHash: string;
}

export interface InteropEvidence {
    id: string;
    eventType: string;
    observedAt: string;
    contentType: "text" | "structured";
    text?: string;
    structured?: Record<string, unknown>;
    tags: string[];
    contentHash: string;
    provenanceHash: string;
}

export interface InteropKpi {
    id: string;
    name: string;
    value: number | string;
    unit?: string;
    category?: string;
    measuredAt: string;
    tags: string[];
}

export interface InteropRun {
    runId: string;
    decisionTitle: string;
    startedAt: string;
    finishedAt: string;
    nodeCount: number;
    edgeCount: number;
    evaluationCount: number;
    specHash: string;
    graphHash: string;
    summary: string[];
}

export interface InteropPacket {
    packetId: string;
    exportedAt: string;
    recordCount: number;
    bundleHash: string;
    path?: string;
}

export interface InteropLink {
    from: { type: string; id: string };
    to: { type: string; id: string };
    relationship: string;
}

/**
 * Create an empty interop document.
 */
export function createEmptyInterop(source: string = "zeo-mcp"): ZeoInterop {
    return {
        version: "1.4.0",
        exportedAt: new Date().toISOString(),
        source,
        notes: [],
        evidence: [],
        kpis: [],
        runs: [],
        packets: [],
        links: [],
    };
}

/**
 * Convert a Zeo DecisionResult + DecisionSpec into notebook cells.
 * Each cell is a markdown string followed by optional JSON data.
 */
export interface NotebookCell {
    type: "markdown" | "json";
    content: string;
}

export function runToNotebookCells(
    spec: DecisionSpec,
    result: DecisionResult,
    meta?: { runId?: string; startedAt?: string; finishedAt?: string }
): NotebookCell[] {
    const cells: NotebookCell[] = [];

    // Header cell
    cells.push({
        type: "markdown",
        content: [
            `# Zeo Decision Run: ${spec.title}`,
            "",
            `**Decision ID:** ${spec.id}`,
            `**Context:** ${spec.context}`,
            meta?.runId ? `**Run ID:** ${meta.runId}` : "",
            meta?.startedAt ? `**Started:** ${meta.startedAt}` : "",
            meta?.finishedAt ? `**Finished:** ${meta.finishedAt}` : "",
            "",
            "---",
        ]
            .filter(Boolean)
            .join("\n"),
    });

    // Graph summary
    cells.push({
        type: "markdown",
        content: [
            "## Branch Graph",
            "",
            `- **Nodes:** ${result.graph.nodes.length}`,
            `- **Edges:** ${result.graph.edges.length}`,
            "",
            "### Nodes",
            "",
            ...result.graph.nodes.map(
                n => `- **${n.label}** (${n.kind}) — ${n.notes.join("; ") || "no notes"}`
            ),
        ].join("\n"),
    });

    // Graph JSON
    cells.push({
        type: "json",
        content: JSON.stringify(result.graph, null, 2),
    });

    // Evaluations
    cells.push({
        type: "markdown",
        content: [
            "## Evaluations",
            "",
            ...result.evaluations.map(
                e => `### ${e.lens}\n\n${e.summary}\n\n- Robust actions: ${e.robustActions.length}\n- Dominated actions: ${e.dominatedActions.length}`
            ),
        ].join("\n"),
    });

    cells.push({
        type: "json",
        content: JSON.stringify(result.evaluations, null, 2),
    });

    // Explanation
    cells.push({
        type: "markdown",
        content: [
            "## Explanation",
            "",
            "### Why",
            ...result.explanation.why.map(w => `- ${w}`),
            "",
            "### What Would Change",
            ...result.explanation.whatWouldChange.map(
                w => `- If assumption \`${w.assumptionId}\` changed: ${w.flipCondition}`
            ),
        ].join("\n"),
    });

    // Next best evidence
    if (result.nextBestEvidence.length > 0) {
        cells.push({
            type: "markdown",
            content: [
                "## Next Best Evidence",
                "",
                ...result.nextBestEvidence.map(
                    e => `### ${e.prompt}\n\n${e.rationale}`
                ),
            ].join("\n"),
        });
    }

    return cells;
}

/**
 * Convert a packet export to a markdown summary with embedded JSON evidence.
 */
export function packetToMarkdown(packet: InteropPacket, evidence: InteropEvidence[]): string {
    const lines: string[] = [
        `# Evidence Packet: ${packet.packetId}`,
        "",
        `**Exported:** ${packet.exportedAt}`,
        `**Records:** ${packet.recordCount}`,
        `**Bundle Hash:** \`${packet.bundleHash}\``,
        packet.path ? `**Path:** ${packet.path}` : "",
        "",
        "---",
        "",
        "## Evidence Items",
        "",
    ];

    for (const e of evidence) {
        lines.push(`### ${e.id}`);
        lines.push("");
        lines.push(`- **Type:** ${e.eventType}`);
        lines.push(`- **Observed:** ${e.observedAt}`);
        lines.push(`- **Content Hash:** \`${e.contentHash}\``);
        lines.push(`- **Tags:** ${e.tags.join(", ") || "none"}`);
        lines.push("");
        if (e.text) {
            lines.push(e.text);
            lines.push("");
        }
        if (e.structured) {
            lines.push("```json");
            lines.push(JSON.stringify(e.structured, null, 2));
            lines.push("```");
            lines.push("");
        }
    }

    return lines.filter(l => l !== undefined).join("\n");
}

/**
 * @zeo/mcp-interop — Test Suite
 */

import { describe, it, expect } from "vitest";
import {
    createEmptyInterop,
    runToNotebookCells,
    packetToMarkdown,
    ZeoInterop,
    NotebookCell,
    InteropEvidence,
    InteropPacket,
} from "./index.js";

// Minimal mock types matching @zeo/contracts
interface MockDecisionSpec {
    id: string;
    title: string;
    context: string;
}

interface MockBranchNode {
    label: string;
    kind: "state" | "event" | "outcome";
    notes: string[];
}

interface MockDecisionResult {
    graph: {
        nodes: MockBranchNode[];
        edges: Array<{ from: string; to: string }>;
    };
    evaluations: Array<{
        lens: string;
        summary: string;
        robustActions: string[];
        dominatedActions: string[];
    }>;
    explanation: {
        why: string[];
        whatWouldChange: Array<{ assumptionId: string; flipCondition: string }>;
    };
    nextBestEvidence: Array<{ prompt: string; rationale: string }>;
}

describe("@zeo/mcp-interop", () => {
    describe("createEmptyInterop", () => {
        it("creates a valid empty interop document", () => {
            const interop = createEmptyInterop("test-source");
            
            expect(interop.version).toBe("1.4.0");
            expect(interop.source).toBe("test-source");
            expect(interop.notes).toEqual([]);
            expect(interop.evidence).toEqual([]);
            expect(interop.kpis).toEqual([]);
            expect(interop.runs).toEqual([]);
            expect(interop.packets).toEqual([]);
            expect(interop.links).toEqual([]);
            expect(typeof interop.exportedAt).toBe("string");
        });

        it("uses default source when not provided", () => {
            const interop = createEmptyInterop();
            expect(interop.source).toBe("zeo-mcp");
        });
    });

    describe("runToNotebookCells", () => {
        it("converts a run result to notebook cells", () => {
            const spec: MockDecisionSpec = {
                id: "test-decision-1",
                title: "Test Decision",
                context: "Testing the conversion",
            };
            
            const result: MockDecisionResult = {
                graph: {
                    nodes: [
                        { label: "Initial State", kind: "state", notes: ["Starting point"] },
                        { label: "Action A", kind: "event", notes: ["First action"] },
                        { label: "Outcome X", kind: "outcome", notes: ["Positive result"] },
                    ],
                    edges: [
                        { from: "node-1", to: "node-2" },
                        { from: "node-2", to: "node-3" },
                    ],
                },
                evaluations: [
                    {
                        lens: "negotiation",
                        summary: "Accept the offer",
                        robustActions: ["action-a"],
                        dominatedActions: [],
                    },
                ],
                explanation: {
                    why: ["Good risk-reward"],
                    whatWouldChange: [
                        { assumptionId: "timeline", flipCondition: "if timeline > 2 weeks" },
                    ],
                },
                nextBestEvidence: [
                    { prompt: "Check competitor pricing", rationale: "High impact variable" },
                ],
            };

            const cells = runToNotebookCells(spec as any, result as any);
            
            expect(cells.length).toBeGreaterThan(0);
            
            // Check header cell
            const header = cells[0];
            expect(header.type).toBe("markdown");
            expect(header.content).toContain("Test Decision");
            
            // Check graph summary
            const graphCell = cells.find((c: NotebookCell) =>
                c.type === "markdown" && c.content.includes("Branch Graph")
            );
            expect(graphCell).toBeDefined();
            
            // Check next best evidence
            const evidenceCell = cells.find((c: NotebookCell) =>
                c.type === "markdown" && c.content.includes("Next Best Evidence")
            );
            expect(evidenceCell).toBeDefined();
        });

        it("handles empty nextBestEvidence", () => {
            const spec: MockDecisionSpec = {
                id: "test-decision-2",
                title: "No Evidence",
                context: "Testing empty case",
            };
            
            const result: MockDecisionResult = {
                graph: {
                    nodes: [{ label: "Start", kind: "state", notes: [] }],
                    edges: [],
                },
                evaluations: [],
                explanation: { why: [], whatWouldChange: [] },
                nextBestEvidence: [],
            };

            const cells = runToNotebookCells(spec as any, result as any);
            
            // Should not have Next Best Evidence section
            const evidenceCell = cells.find((c: NotebookCell) =>
                c.content.includes("Next Best Evidence")
            );
            expect(evidenceCell).toBeUndefined();
        });
    });

    describe("packetToMarkdown", () => {
        it("converts a packet to markdown", () => {
            const packet: InteropPacket = {
                packetId: "packet-123",
                exportedAt: "2024-01-01T00:00:00Z",
                recordCount: 5,
                bundleHash: "abc123",
                path: "/evidence/packet-123",
            };
            
            const evidence: InteropEvidence[] = [
                {
                    id: "ev-1",
                    eventType: "negotiation",
                    observedAt: "2024-01-01T00:00:00Z",
                    contentType: "text",
                    text: "Received counteroffer at 7%",
                    tags: ["counteroffer", "pricing"],
                    contentHash: "hash1",
                    provenanceHash: "prov1",
                },
            ];

            const markdown = packetToMarkdown(packet, evidence);
            
            expect(markdown).toContain("Evidence Packet: packet-123");
            expect(markdown).toContain("Received counteroffer at 7%");
            expect(markdown).toContain("counteroffer, pricing");
            expect(markdown).toContain("hash1");
        });
    });

    describe("type definitions", () => {
        it("ZeioInterop has correct structure", () => {
            const interop: ZeoInterop = createEmptyInterop("test");
            expect(interop.version).toBeDefined();
            expect(interop.exportedAt).toBeDefined();
            expect(interop.source).toBeDefined();
            expect(Array.isArray(interop.notes)).toBe(true);
            expect(Array.isArray(interop.evidence)).toBe(true);
            expect(Array.isArray(interop.kpis)).toBe(true);
            expect(Array.isArray(interop.runs)).toBe(true);
            expect(Array.isArray(interop.packets)).toBe(true);
            expect(Array.isArray(interop.links)).toBe(true);
        });

        it("NotebookCell accepts markdown and json", () => {
            const markdownCell: NotebookCell = {
                type: "markdown",
                content: "# Hello",
            };
            
            const jsonCell: NotebookCell = {
                type: "json",
                content: '{"key": "value"}',
            };
            
            expect(markdownCell.type).toBe("markdown");
            expect(jsonCell.type).toBe("json");
        });
    });
});

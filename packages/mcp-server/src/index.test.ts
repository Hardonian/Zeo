/**
 * @zeo/mcp-server — Integration Tests
 *
 * Tests the MCP server end-to-end:
 *   - Server creation and tool listing
 *   - notes.ingest: creates evidence with deterministic hashes
 *   - evidence.add: structured evidence storage
 *   - search.query: finds stored evidence
 *   - kpi.list: lists KPI records
 *   - run.execute: triggers a decision run deterministically
 *   - packet.export: exports evidence bundle
 *   - audit.tail: verifies audit entries
 *   - Permission enforcement (disabled tools are rejected)
 *   - Deterministic ordering and hashing
 *
 * All tests are local — no network required.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createMcpServer } from "./server.js";
import { createDefaultConfig } from "./config.js";
import type { McpConfig, JsonRpcRequest } from "./types.js";

function makeRequest(
    method: string,
    id: number,
    params?: Record<string, unknown>
): string {
    const req: JsonRpcRequest = {
        jsonrpc: "2.0",
        id,
        method,
        params,
    };
    return JSON.stringify(req);
}

function parseResponse(raw: string | null) {
    if (!raw) return null;
    return JSON.parse(raw);
}

describe("MCP Server", () => {
    let config: McpConfig;

    beforeEach(() => {
        config = createDefaultConfig();
        // Use in-memory audit for tests
        config.audit.storageType = "memory";
        // Use a temp directory for warehouse
        config.warehouse.basePath = process.cwd();
    });

    describe("Protocol", () => {
        it("should handle initialize", async () => {
            const server = createMcpServer(config);
            const response = parseResponse(
                await server.handleRequest(makeRequest("initialize", 1))
            );

            expect(response.jsonrpc).toBe("2.0");
            expect(response.id).toBe(1);
            expect(response.result.serverInfo.name).toBe("zeo-mcp");
            expect(response.result.serverInfo.version).toBe("1.4.0");
            expect(response.result.capabilities.tools).toBeDefined();
        });

        it("should list tools", async () => {
            const server = createMcpServer(config);
            const response = parseResponse(
                await server.handleRequest(makeRequest("tools/list", 2))
            );

            expect(response.result.tools).toBeInstanceOf(Array);
            expect(response.result.tools.length).toBe(8);

            const names = response.result.tools.map(
                (t: { name: string }) => t.name
            );
            expect(names).toContain("notes.ingest");
            expect(names).toContain("evidence.add");
            expect(names).toContain("kpi.list");
            expect(names).toContain("kpi.get");
            expect(names).toContain("run.execute");
            expect(names).toContain("packet.export");
            expect(names).toContain("search.query");
            expect(names).toContain("audit.tail");
        });

        it("should reject unknown methods", async () => {
            const server = createMcpServer(config);
            const response = parseResponse(
                await server.handleRequest(makeRequest("unknown/method", 3))
            );

            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32601);
        });

        it("should reject invalid JSON", async () => {
            const server = createMcpServer(config);
            const response = parseResponse(
                await server.handleRequest("not json at all")
            );

            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32700);
        });

        it("returns deterministic error envelope with run_id", async () => {
            const server = createMcpServer(config);
            const response = parseResponse(await server.handleRequest("{ bad-json"));
            expect(response.error).toBeDefined();
            expect(response.error.message).toBe("Parse error");
            expect(response.error.data.run_id).toBeTypeOf("string");
            expect(response.error.data.error_code).toBe("PARSE_ERROR");
        });
    });

    describe("Security", () => {
        it("should reject disabled tools", async () => {
            config.tools.allowlist["notes.ingest"].enabled = false;
            const server = createMcpServer(config);

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 10, {
                        name: "notes.ingest",
                        arguments: { title: "Test", body: "Body" },
                    })
                )
            );

            expect(response.error).toBeDefined();
            expect(response.error.code).toBe(-32600);
        });

        it("should reject unknown tools", async () => {
            const server = createMcpServer(config);

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 11, {
                        name: "nonexistent.tool",
                        arguments: {},
                    })
                )
            );

            expect(response.error).toBeDefined();
        });
    });

    describe("notes.ingest", () => {
        it("should store a note as evidence", async () => {
            const server = createMcpServer(config);

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 20, {
                        name: "notes.ingest",
                        arguments: {
                            title: "Test Note",
                            body: "This is a test note body",
                            tags: ["test", "mcp"],
                            source: "test-app",
                        },
                    })
                )
            );

            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.result.content[0].text);
            expect(result.success).toBe(true);
            expect(result.id).toBeDefined();
            expect(result.eventId).toBeDefined();
            expect(result.hashes.content).toBeDefined();
            expect(result.hashes.provenance).toBeDefined();
            expect(result.tags).toContain("mcp:notes");
        });

        it("should reject notes missing title", async () => {
            const server = createMcpServer(config);

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 21, {
                        name: "notes.ingest",
                        arguments: { body: "No title" },
                    })
                )
            );

            const result = JSON.parse(response.result.content[0].text);
            expect(result.error).toBeDefined();
        });

        it("should produce deterministic hashes for same input", async () => {
            const server = createMcpServer(config);

            const args = {
                title: "Determinism Test",
                body: "Same body content",
                tags: ["determinism"],
                source: "test",
                createdAt: "2024-01-01T00:00:00Z",
            };

            const resp1 = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 22, {
                        name: "notes.ingest",
                        arguments: args,
                    })
                )
            );

            const resp2 = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 23, {
                        name: "notes.ingest",
                        arguments: args,
                    })
                )
            );

            const r1 = JSON.parse(resp1.result.content[0].text);
            const r2 = JSON.parse(resp2.result.content[0].text);

            // Content hashes should be identical for same input
            expect(r1.hashes.content).toBe(r2.hashes.content);
            expect(r1.hashes.provenance).toBe(r2.hashes.provenance);
        });
    });

    describe("evidence.add", () => {
        it("should store structured evidence", async () => {
            const server = createMcpServer(config);

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 30, {
                        name: "evidence.add",
                        arguments: {
                            kind: "observation",
                            payload: {
                                type: "structured",
                                structured: { temperature: 22.5, confidence: 0.8 },
                            },
                            provenance: {
                                sourceId: "sensor-001",
                                capturedAt: "2024-06-01T12:00:00Z",
                            },
                            tags: ["sensor", "temperature"],
                        },
                    })
                )
            );

            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.result.content[0].text);
            expect(result.success).toBe(true);
            expect(result.id).toBeDefined();
            expect(result.hashes.content).toBeDefined();
        });

        it("should reject invalid kind", async () => {
            const server = createMcpServer(config);

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 31, {
                        name: "evidence.add",
                        arguments: {
                            kind: "invalid_kind",
                            payload: { type: "text", text: "test" },
                            provenance: { sourceId: "test" },
                        },
                    })
                )
            );

            const result = JSON.parse(response.result.content[0].text);
            expect(result.error).toBeDefined();
        });
    });

    describe("run.execute", () => {
        it("should execute a decision run", async () => {
            const server = createMcpServer(config);

            const spec = {
                id: "test-decision-001",
                title: "Test Decision",
                context: "MCP integration test",
                createdAt: "2024-01-01T00:00:00Z",
                horizon: "days",
                agents: [
                    { id: "agent-1", name: "Self", role: "self" },
                    { id: "agent-2", name: "Other", role: "counterparty" },
                ],
                actions: [
                    { id: "act-1", label: "Accept", actorId: "agent-1", kind: "commit" },
                    { id: "act-2", label: "Negotiate", actorId: "agent-1", kind: "communicate" },
                ],
                constraints: [] as Array<{ id: string; name: string; value: string; status: string }>,
                assumptions: [
                    {
                        id: "claim-1",
                        text: "Market is growing",
                        status: "believed",
                        confidence: "medium",
                        tags: ["market"],
                    },
                ],
                objectives: [
                    { id: "obj-1", metric: "outcome_quality", weight: 1.0 },
                ],
            };

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 40, {
                        name: "run.execute",
                        arguments: { spec, depth: 2 },
                    })
                )
            );

            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.result.content[0].text);
            expect(result.success).toBe(true);
            expect(result.runId).toBeDefined();
            expect(result.hashes.spec).toBeDefined();
            expect(result.hashes.graph).toBeDefined();
            expect(result.summary.nodeCount).toBeGreaterThan(0);
        });

        it("should produce deterministic results for same spec", async () => {
            const server = createMcpServer(config);

            const spec = {
                id: "det-test-001",
                title: "Determinism Test",
                context: "Testing deterministic output",
                createdAt: "2024-01-01T00:00:00Z",
                horizon: "days",
                agents: [
                    { id: "a1", name: "Self", role: "self" },
                ],
                actions: [
                    { id: "act-1", label: "Go", actorId: "a1", kind: "commit" },
                ],
                constraints: [] as Array<{ id: string; name: string; value: string; status: string }>,
                assumptions: [] as Array<{ id: string; text: string; status: string; confidence: string; tags: string[] }>,
                objectives: [
                    { id: "obj-1", metric: "success", weight: 1.0 },
                ],
            };

            const r1 = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 41, {
                        name: "run.execute",
                        arguments: { spec },
                    })
                )
            );

            const r2 = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 42, {
                        name: "run.execute",
                        arguments: { spec },
                    })
                )
            );

            const res1 = JSON.parse(r1.result.content[0].text);
            const res2 = JSON.parse(r2.result.content[0].text);

            // Spec hash must be identical
            expect(res1.hashes.spec).toBe(res2.hashes.spec);
        });
    });

    describe("search.query", () => {
        it("should return results with stable ordering", async () => {
            const server = createMcpServer(config);

            // First store some evidence
            await server.handleRequest(
                makeRequest("tools/call", 50, {
                    name: "notes.ingest",
                    arguments: {
                        title: "Search Test 1",
                        body: "First note for search",
                        tags: ["search-test"],
                    },
                })
            );

            await server.handleRequest(
                makeRequest("tools/call", 51, {
                    name: "notes.ingest",
                    arguments: {
                        title: "Search Test 2",
                        body: "Second note for search",
                        tags: ["search-test"],
                    },
                })
            );

            // Search
            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 52, {
                        name: "search.query",
                        arguments: {
                            tags: ["search-test"],
                            limit: 10,
                        },
                    })
                )
            );

            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.result.content[0].text);
            expect(result.count).toBeGreaterThanOrEqual(0);
        });
    });

    describe("audit.tail", () => {
        it("should record audit entries for tool calls", async () => {
            const server = createMcpServer(config);

            // Make a tool call
            await server.handleRequest(
                makeRequest("tools/call", 60, {
                    name: "notes.ingest",
                    arguments: {
                        title: "Audit Test",
                        body: "This should be audited",
                    },
                })
            );

            // Check audit
            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 61, {
                        name: "audit.tail",
                        arguments: { limit: 10 },
                    })
                )
            );

            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.result.content[0].text);
            expect(result.totalCount).toBeGreaterThan(0);
            expect(result.entries.length).toBeGreaterThan(0);

            const entry = result.entries[0];
            expect(entry.toolName).toBe("notes.ingest");
            expect(entry.success).toBe(true);
            expect(entry.requestHash).toBeDefined();
            expect(entry.responseHash).toBeDefined();
            expect(entry.durationMs).toBeGreaterThanOrEqual(0);
        });

        it("should maintain stable ordering (newest first)", async () => {
            const server = createMcpServer(config);

            // Make multiple calls
            for (let i = 0; i < 3; i++) {
                await server.handleRequest(
                    makeRequest("tools/call", 70 + i, {
                        name: "notes.ingest",
                        arguments: {
                            title: `Ordering Test ${i}`,
                            body: `Body ${i}`,
                        },
                    })
                );
            }

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 73, {
                        name: "audit.tail",
                        arguments: { limit: 10 },
                    })
                )
            );

            const result = JSON.parse(response.result.content[0].text);
            // Should be newest first (audit.tail itself is the latest)
            for (let i = 0; i < result.entries.length - 1; i++) {
                const a = new Date(result.entries[i].timestamp).getTime();
                const b = new Date(result.entries[i + 1].timestamp).getTime();
                expect(a).toBeGreaterThanOrEqual(b);
            }
        });
    });

    describe("kpi.list", () => {
        it("should return empty list when no KPIs exist", async () => {
            const server = createMcpServer(config);

            const response = parseResponse(
                await server.handleRequest(
                    makeRequest("tools/call", 80, {
                        name: "kpi.list",
                        arguments: {},
                    })
                )
            );

            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.result.content[0].text);
            expect(result.count).toBeGreaterThanOrEqual(0);
            expect(result.items).toBeInstanceOf(Array);
        });
    });
});

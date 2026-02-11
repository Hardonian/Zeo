/**
 * @zeo/mcp-server — MCP Server Core
 *
 * Implements the MCP protocol over JSON-RPC 2.0.
 * Supports stdio transport (default) and optional HTTP transport.
 *
 * Protocol methods:
 *   - initialize       → server info + capabilities
 *   - tools/list        → list available tools
 *   - tools/call        → call a tool
 *   - notifications/initialized → client ready (no-op ack)
 */

import type { WarehouseAdapter } from "@zeo/warehouse";
import { FilesystemWarehouseAdapter } from "@zeo/warehouse";
import type {
    McpConfig,
    JsonRpcRequest,
    JsonRpcResponse,
    McpToolDefinition,
    McpToolCallParams,
    McpToolResult,
} from "./types.js";
import { createAuditBridge, type AuditBridge } from "./audit-bridge.js";
import { validateToolPermission, validateRequestSize, redactSecrets } from "./security.js";
import { mcpPolicyEngine } from "./policy.js";
import { MetricsRegistry, StructuredLogger, Tracer } from "./observability.js";
import { DeterministicCache } from "./deterministic-cache.js";
import { randomUUID, createHash } from "node:crypto";

// Tool implementations
import { notesIngestDefinition, notesIngest } from "./tools/notes-ingest.js";
import { evidenceAddDefinition, evidenceAdd } from "./tools/evidence-add.js";
import { kpiListDefinition, kpiList } from "./tools/kpi-list.js";
import { kpiGetDefinition, kpiGet } from "./tools/kpi-get.js";
import { runExecuteDefinition, runExecute } from "./tools/run-execute.js";
import { packetExportDefinition, packetExport } from "./tools/packet-export.js";
import { searchQueryDefinition, searchQuery } from "./tools/search-query.js";
import { auditTailDefinition, auditTail } from "./tools/audit-tail.js";

// New Zeo Tools (v0.7.0)
import { transcriptVerifyDefinition, transcriptVerify } from "./tools/transcript-verify.js";
import { transcriptInspectDefinition, transcriptInspect } from "./tools/transcript-inspect.js";
import { trustShowDefinition, trustShow } from "./tools/trust-show.js";
import { trustRecordDefinition, trustRecord } from "./tools/trust-record.js";
import { zeoHealthDefinition, zeoHealth } from "./tools/zeo-health.js";
import { zeoIngestDefinition, zeoIngest } from "./tools/zeo-ingest.js";
import { zeoSummaryDefinition, zeoSummary } from "./tools/zeo-summary.js";

/**
 * Registry of all tool definitions and their handlers.
 */
const TOOL_REGISTRY: Array<{
    definition: McpToolDefinition;
    handler: (
        params: Record<string, unknown>,
        warehouse: WarehouseAdapter,
        auditBridge: AuditBridge,
        basePath: string
    ) => Promise<McpToolResult> | McpToolResult;
}> = [
        {
            definition: notesIngestDefinition,
            handler: (params, warehouse) => notesIngest(params, warehouse),
        },
        {
            definition: evidenceAddDefinition,
            handler: (params, warehouse) => evidenceAdd(params, warehouse),
        },
        {
            definition: kpiListDefinition,
            handler: (params, warehouse) => kpiList(params, warehouse),
        },
        {
            definition: kpiGetDefinition,
            handler: (params, warehouse) => kpiGet(params, warehouse),
        },
        {
            definition: runExecuteDefinition,
            handler: (params) => runExecute(params),
        },
        {
            definition: packetExportDefinition,
            handler: (params, warehouse, _audit, basePath) =>
                packetExport(params, warehouse, basePath),
        },
        {
            definition: searchQueryDefinition,
            handler: (params, warehouse) => searchQuery(params, warehouse),
        },
        {
            definition: auditTailDefinition,
            handler: (params, _warehouse, auditBridge) => auditTail(params, auditBridge),
        },
        // Zeo Specific Tools
        {
            definition: zeoHealthDefinition,
            handler: () => zeoHealth(),
        },
        {
            definition: zeoIngestDefinition,
            handler: (params, warehouse) => zeoIngest(params, warehouse),
        },
        {
            definition: zeoSummaryDefinition,
            handler: (params, warehouse) => zeoSummary(params, warehouse),
        },
        {
            definition: { ...packetExportDefinition, name: "zeo.exportReproPack", description: "Export a repro pack (evidence bundle) for external use. Alias for packet.export." },
            handler: (params, warehouse, _audit, basePath) =>
                packetExport(params, warehouse, basePath),
        },
        {
            definition: transcriptVerifyDefinition,
            handler: (params) => transcriptVerify(params),
        },
        {
            definition: transcriptInspectDefinition,
            handler: (params) => transcriptInspect(params),
        },
        {
            definition: trustShowDefinition,
            handler: (params) => trustShow(params),
        },
        {
            definition: trustRecordDefinition,
            handler: (params) => trustRecord(params),
        },
    ];

export interface McpServer {
    handleRequest(raw: string): Promise<string | null>;
    getToolDefinitions(): McpToolDefinition[];
    getAuditBridge(): AuditBridge;
}

export function createMcpServer(config: McpConfig): McpServer {
    const warehouse: WarehouseAdapter = new FilesystemWarehouseAdapter(
        config.warehouse.basePath
    );
    const auditBridge = createAuditBridge(config);
    const logger = new StructuredLogger();
    const metrics = new MetricsRegistry();
    const cache = new DeterministicCache<JsonRpcResponse>(config.server.version, "zeo.cache.v1");
    const singleFlight = new Map<string, Promise<JsonRpcResponse>>();
    let inFlight = 0;
    let rateWindowStarted = Date.now();
    let rateWindowCount = 0;

    // Filter tools based on allowlist
    const enabledTools = TOOL_REGISTRY.filter(
        t => config.tools.allowlist[t.definition.name]?.enabled !== false
    );

    function getToolDefinitions(): McpToolDefinition[] {
        return enabledTools.map(t => t.definition);
    }

    function getAuditBridge(): AuditBridge {
        return auditBridge;
    }

    async function handleRequest(raw: string): Promise<string | null> {
        const runId = randomUUID();
        const tracer = new Tracer();
        const parseSpan = tracer.startSpan("parse_input");

        const sizeError = validateRequestSize(config, Buffer.byteLength(raw, "utf-8"));
        if (sizeError) {
            metrics.inc("parse_failures");
            return JSON.stringify({ jsonrpc: "2.0", id: 0, error: { code: -32600, message: sizeError.message, data: { run_id: runId, error_code: "REQUEST_TOO_LARGE" } } });
        }

        if (Date.now() - rateWindowStarted >= 60_000) {
            rateWindowStarted = Date.now();
            rateWindowCount = 0;
        }
        rateWindowCount += 1;
        if (rateWindowCount > config.security.rateLimitPerMinute) {
            return JSON.stringify({ jsonrpc: "2.0", id: 0, error: { code: -32000, message: "Too many requests", data: { run_id: runId, error_code: "RATE_LIMITED" } } });
        }

        let request: JsonRpcRequest;
        try {
            request = JSON.parse(raw);
            parseSpan.end("ok");
        } catch {
            parseSpan.end("error");
            metrics.inc("parse_failures");
            return JSON.stringify({ jsonrpc: "2.0", id: 0, error: { code: -32700, message: "Parse error", data: { run_id: runId, error_code: "PARSE_ERROR" } } });
        }

        if (request.id === undefined || request.id === null) return null;

        if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
            metrics.inc("parse_failures");
            return JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32600, message: "Invalid request envelope", data: { run_id: runId, error_code: "INVALID_REQUEST" } } });
        }

        if (inFlight >= config.security.maxInFlightRequests) {
            return JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32000, message: "Server busy", data: { run_id: runId, error_code: "MAX_INFLIGHT_EXCEEDED" } } });
        }

        const reqHash = createHash("sha256").update(raw).digest("hex");
        const cacheKey = cache.makeKey(request, "mcp", { method: request.method }, config.server.version);
        if (config.security.cacheMode !== "off") {
            const cached = cache.get(cacheKey.key);
            if (cached) {
                metrics.inc("cache_hit");
                logger.log({ level: "debug", msg: "mcp cache hit", run_id: runId, trace_id: tracer.traceId, action: request.method, cache_hit: true });
                return JSON.stringify(cached);
            }
            metrics.inc("cache_miss");
        }

        const existing = singleFlight.get(reqHash);
        if (existing) return JSON.stringify(await existing);

        const requestPromise = (async () => {
            inFlight += 1;
            const work = dispatch(request, runId, tracer);
            const timeout = new Promise<JsonRpcResponse>((resolve) => setTimeout(() => {
                metrics.inc("timeouts");
                resolve({ jsonrpc: "2.0", id: request.id, error: { code: -32000, message: "Request timeout", data: { run_id: runId } } });
            }, config.security.requestTimeoutMs));
            return Promise.race([work, timeout]);
        })();

        singleFlight.set(reqHash, requestPromise);
        try {
            const response = await requestPromise;
            if (config.security.cacheMode === "write" && !response.error) {
                cache.set(cacheKey.key, cacheKey.inputHash, response, config.security.cacheTtlMs);
            }
            return JSON.stringify(response);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32603, message, data: { run_id: runId } } });
        } finally {
            inFlight = Math.max(0, inFlight - 1);
            singleFlight.delete(reqHash);
            const summary = tracer.summarize();
            logger.log({ level: "info", msg: "run summary", run_id: runId, trace_id: summary.trace_id, cmd: "mcp", action: request.method, duration_ms: summary.total_duration_ms });
            if (process.env.ZEO_TRACE_VERBOSE === "1") logger.log({ level: "info", msg: "trace summary", run_id: runId, trace_id: summary.trace_id, spans: summary.spans });
        }
    }

    async function dispatch(request: JsonRpcRequest, runId: string, tracer: Tracer): Promise<JsonRpcResponse> {
        switch (request.method) {
            case "initialize":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: {
                        protocolVersion: "2024-11-05",
                        serverInfo: {
                            name: config.server.name,
                            version: config.server.version,
                        },
                        capabilities: {
                            tools: {},
                        },
                    },
                };

            case "notifications/initialized":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: {},
                };

            case "tools/list":
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: {
                        tools: getToolDefinitions(),
                    },
                };

            case "tools/call":
                return handleToolCall(request, runId, tracer);

            default:
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: -32601,
                        message: `Method not found: ${request.method}`,
                    },
                };
        }
    }

    async function handleToolCall(
        request: JsonRpcRequest,
        runId: string,
        tracer: Tracer
    ): Promise<JsonRpcResponse> {
        const params = request.params as unknown as McpToolCallParams | undefined;
        if (!params?.name) {
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: { code: -32602, message: "Missing tool name in params" },
            };
        }

        // Security check
        const permError = validateToolPermission(config, params);
        if (permError) {
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: permError,
            };
        }

        // Policy check (v0.7.0)
        const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;
        const violations = mcpPolicyEngine.validate({
            toolName: params.name,
            arguments: toolArgs,
            timestamp: new Date().toISOString(),
            config
        });

        const blockViolation = violations.find((v: any) => v.severity === "block");
        if (blockViolation) {
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                    code: -32602,
                    message: `Policy Block: ${blockViolation.message}`,
                    data: { remediation: blockViolation.remediation }
                },
            };
        }

        const tool = enabledTools.find(
            t => t.definition.name === params.name
        );
        if (!tool) {
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                    code: -32602,
                    message: `Unknown tool: ${params.name}`,
                },
            };
        }

        const startMs = Date.now();
        const span = tracer.startSpan("compute");
        try {
            metrics.inc("model_calls");
            const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;

            const result = await tool.handler(
                toolArgs,
                warehouse,
                auditBridge,
                config.warehouse.basePath
            );

            const durationMs = Date.now() - startMs;

            // Audit log (redact secrets in logged args)
            auditBridge.record(
                params.name,
                config.security.redactSecrets ? redactSecrets(toolArgs) : toolArgs,
                result.isError ? { error: true } : { success: true },
                !result.isError,
                durationMs
            );

            span.end("ok");
            return {
                jsonrpc: "2.0",
                id: request.id,
                result,
            };
        } catch (err) {
            const durationMs = Date.now() - startMs;
            const errorMessage =
                err instanceof Error ? err.message : String(err);

            auditBridge.record(
                params.name,
                config.security.redactSecrets
                    ? redactSecrets(params.arguments)
                    : params.arguments,
                { error: errorMessage },
                false,
                durationMs
            );

            span.end("error");
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                    code: -32603,
                    message: `Tool execution failed: ${errorMessage}`,
                    data: { run_id: runId },
                },
            };
        }
    }

    return { handleRequest, getToolDefinitions, getAuditBridge };
}

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
import {
    FilesystemWarehouseAdapter,
    EnhancedIndexedWarehouseAdapter,
    FilesystemIndexStorage,
    OllamaEmbeddingProvider,
    NoOpEmbeddingProvider
} from "@zeo/warehouse";
import type {
    McpConfig,
    JsonRpcRequest,
    JsonRpcResponse,
    McpToolDefinition,
    McpToolCallParams,
    McpToolResult,
} from "./types.js";
import { createAuditBridge, type AuditBridge } from "./audit-bridge.js";
import {
    validateToolPermission,
    validateRequestSize,
    redactSecrets,
    validateToolInputAgainstSchema,
    enforcePayloadSize,
    sanitizeToolOutput,
    validateObjectDepth,
    detectSuspiciousOutput,
} from "./security.js";
import { mcpPolicyEngine } from "./policy.js";
import { StructuredLogger, Tracer, MetricsRegistry } from "./observability.js";
import { DeterministicCache } from "./deterministic-cache.js";
import { TokenBucketRateLimiter } from "./rate-limiter.js";
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
 * // retrieval hook: tool schema indexing for agentic RAG
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
    // 1. Core Storage
    const fsAdapter = new FilesystemWarehouseAdapter(config.warehouse.basePath);

    // 2. Index & Embeddings (RAG)
    const indexStorage = new FilesystemIndexStorage(config.warehouse.basePath);

    const embeddingProvider = config.warehouse.semanticSearch
        ? new OllamaEmbeddingProvider()
        : new NoOpEmbeddingProvider();

    // 3. Enhanced Warehouse (Indexes + Semantic)
    const warehouse: WarehouseAdapter = new EnhancedIndexedWarehouseAdapter(
        fsAdapter,
        indexStorage,
        {
            autoRebuildIndex: true,
            fallbackToScan: true
        },
        embeddingProvider
    );
    const auditBridge = createAuditBridge(config);
    const logger = new StructuredLogger();
    const metrics = new MetricsRegistry();
    const cache = new DeterministicCache<JsonRpcResponse>(config.server.version, "zeo.cache.v1");
    const singleFlight = new Map<string, Promise<JsonRpcResponse>>();

    // Smooth rate limiting: capacity = 10% of window, refill = target rate
    const rateLimiter = new TokenBucketRateLimiter(
        Math.max(5, Math.floor(config.security.rateLimitPerMinute * 0.1)),
        config.security.rateLimitPerMinute / 60
    );
    let inFlight = 0;

    // Filter tools based on allowlist
    const enabledTools = TOOL_REGISTRY.filter(
        t => config.tools.allowlist[t.definition.name]?.enabled !== false
    );
    const internalToolNames = new Set(enabledTools.map((t) => t.definition.name));
    const quarantineByTool = new Map<string, { failures: number; quarantinedUntil?: number; reason?: string; lastEvent?: string }>();

    function getToolDefinitions(): McpToolDefinition[] {
        return enabledTools.map(t => t.definition);
    }

    function getAuditBridge(): AuditBridge {
        return auditBridge;
    }

    function trustTierForTool(name: string): "internal" | "external" {
        return internalToolNames.has(name) ? "internal" : "external";
    }

    function getQuarantineState(name: string) {
        return quarantineByTool.get(name) ?? { failures: 0 };
    }

    function noteToolFailure(name: string, reason: string): void {
        const state = getQuarantineState(name);
        const failures = state.failures + 1;
        const next = { ...state, failures, reason };
        if (failures >= config.security.quarantineFailureThreshold) {
            next.quarantinedUntil = Date.now() + config.security.quarantineWindowMs;
            next.lastEvent = new Date().toISOString();
            logger.log({ level: "warn", msg: "tool quarantined", run_id: "system", action: "tools/call", tool_name: name, reason, failures, quarantined_until: next.quarantinedUntil, decision_trace: ["tool_quarantine"] });
            metrics.inc("tool_quarantine");
        }
        quarantineByTool.set(name, next);
    }

    function clearToolFailures(name: string): void {
        if (!quarantineByTool.has(name)) return;
        quarantineByTool.set(name, { failures: 0 });
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

        let request: JsonRpcRequest;
        try {
            request = JSON.parse(raw);
            parseSpan.end("ok");
        } catch {
            parseSpan.end("error");
            metrics.inc("parse_failures");
            return JSON.stringify({ jsonrpc: "2.0", id: 0, error: { code: -32700, message: "Parse error", data: { run_id: runId, error_code: "PARSE_ERROR" } } });
        }

        const authContext = (request as any).params?.sessionId;
        if (config.security.requireAuthContext && !authContext) {
            metrics.inc("auth_failures");
            return JSON.stringify({
                jsonrpc: "2.0",
                id: request.id ?? 0,
                error: {
                    code: -32000,
                    message: "Authentication context required. Provide sessionId in params.",
                    data: { run_id: runId, error_code: "AUTH_REQUIRED" }
                }
            });
        }

        const rateLimitKey = authContext ?? "default";
        if (!rateLimiter.consume(rateLimitKey)) {
            metrics.inc("rate_limited");
            return JSON.stringify({
                jsonrpc: "2.0",
                id: request.id ?? 0,
                error: {
                    code: -32000,
                    message: "Rate limit exceeded. Try again in a few seconds.",
                    data: { run_id: runId, error_code: "RATE_LIMITED", tenant: authContext }
                }
            });
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

        const trustTier = trustTierForTool(params.name);
        if (trustTier === "external" && !config.tools.externalAllowlist.includes(params.name)) {
            metrics.inc("tool_denied_external_allowlist");
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                    code: -32600,
                    message: `External tool denied by default: ${params.name}`,
                    data: { run_id: runId, trust_tier: trustTier, error_code: "EXTERNAL_TOOL_NOT_ALLOWLISTED" },
                },
            };
        }

        const quarantineState = getQuarantineState(params.name);
        if (quarantineState.quarantinedUntil && quarantineState.quarantinedUntil > Date.now()) {
            metrics.inc("tool_denied_quarantine");
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                    code: -32603,
                    message: `Tool is quarantined: ${params.name}`,
                    data: {
                        run_id: runId,
                        trust_tier: trustTier,
                        reason: quarantineState.reason ?? "repeated failures",
                        quarantined_until: quarantineState.quarantinedUntil,
                    },
                },
            };
        }

        if (config.security.requireAuthContext && !config.security.localMode) {
            const sessionId = params.sessionId ?? "";
            if (!sessionId.trim()) {
                metrics.inc("auth_denied");
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: -32600,
                        message: "Missing authenticated session context",
                        data: { run_id: runId, error_code: "AUTH_REQUIRED" },
                    },
                };
            }
        }

        if (params.arguments && (params.arguments as Record<string, unknown>)["proposedToolCallText"]) {
            metrics.inc("injection_denied");
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                    code: -32602,
                    message: "Freeform tool call proposals are denied. Use structured arguments only.",
                    data: { run_id: runId, error_code: "STRUCTURED_PROPOSAL_REQUIRED" },
                },
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
        const depthErrors = validateObjectDepth(toolArgs, config.security.maxArgumentDepth);
        if (depthErrors.length > 0) {
            noteToolFailure(params.name, depthErrors[0]);
            return {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                    code: -32602,
                    message: `Schema validation failed: ${depthErrors.join("; ")}`,
                    data: { run_id: runId, trust_tier: trustTier, error_code: "ARGUMENT_DEPTH_EXCEEDED" },
                },
            };
        }
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
            const argsSizeError = enforcePayloadSize(config.security.maxToolArgsBytes, toolArgs, "Tool args");
            if (argsSizeError) {
                noteToolFailure(params.name, argsSizeError.message);
                metrics.inc("schema_rejects");
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: argsSizeError.code,
                        message: argsSizeError.message,
                        data: { run_id: runId, trust_tier: trustTier },
                    },
                };
            }

            const schemaErrors = validateToolInputAgainstSchema(toolArgs, tool.definition.inputSchema);
            if (schemaErrors.length > 0) {
                noteToolFailure(params.name, schemaErrors[0]);
                metrics.inc("schema_rejects");
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: -32602,
                        message: `Schema validation failed: ${schemaErrors.join("; ")}`,
                        data: { run_id: runId, trust_tier: trustTier },
                    },
                };
            }

            const result = await tool.handler(
                toolArgs,
                warehouse,
                auditBridge,
                config.warehouse.basePath
            );

            const suspiciousPatterns = detectSuspiciousOutput(result);
            if (trustTier === "external" && suspiciousPatterns.length > 0) {
                noteToolFailure(params.name, `suspicious output: ${suspiciousPatterns.join(",")}`);
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: -32603,
                        message: `External tool output blocked by safety filters: ${params.name}`,
                        data: { run_id: runId, trust_tier: trustTier, suspicious_patterns: suspiciousPatterns, decision_trace: ["external_tool_suspicious_output"] },
                    },
                };
            }

            const sanitizedResult = sanitizeToolOutput(result) as McpToolResult;
            const resultSizeError = enforcePayloadSize(config.security.maxToolResultBytes, sanitizedResult, "Tool result");
            if (resultSizeError) {
                noteToolFailure(params.name, resultSizeError.message);
                return {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: resultSizeError.code,
                        message: resultSizeError.message,
                        data: { run_id: runId, trust_tier: trustTier },
                    },
                };
            }

            const durationMs = Date.now() - startMs;

            // Audit log (redact secrets in logged args)
            auditBridge.record(
                params.name,
                config.security.redactSecrets ? redactSecrets(toolArgs) : toolArgs,
                sanitizedResult.isError ? { error: true } : { success: true },
                !sanitizedResult.isError,
                durationMs
            );

            if (sanitizedResult.isError) {
                noteToolFailure(params.name, "tool result returned error");
            } else {
                clearToolFailures(params.name);
            }

            span.end("ok");
            return {
                jsonrpc: "2.0",
                id: request.id,
                result: sanitizedResult,
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
            noteToolFailure(params.name, errorMessage);

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

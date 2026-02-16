/**
 * MCP Handshake Smoke Test
 *
 * Validates JSON-RPC 2.0 compliance by running the full MCP handshake:
 *   1. initialize  → expect serverInfo + capabilities
 *   2. notifications/initialized → expect ack
 *   3. tools/list → expect non-empty tool list
 *   4. tools/call (zeo.health) → expect successful result
 *   5. Invalid method → expect -32601
 *   6. Malformed JSON → expect -32700
 *
 * Returns structured pass/fail results. No I/O beyond server.handleRequest.
 */

import { createMcpServer, type McpServer } from "./server.js";
import { createDefaultConfig } from "./config.js";
import type { McpConfig } from "./types.js";

export interface HandshakeTestCase {
  name: string;
  status: "pass" | "fail";
  durationMs: number;
  error?: string;
}

export interface HandshakeTestResult {
  passed: number;
  failed: number;
  total: number;
  cases: HandshakeTestCase[];
  serverVersion: string;
  toolCount: number;
}

function makeRequest(method: string, id: number, params?: Record<string, unknown>): string {
  return JSON.stringify({ jsonrpc: "2.0", id, method, params });
}

function parseResponse(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  return JSON.parse(raw);
}

async function runCase(
  name: string,
  fn: () => Promise<void>,
): Promise<HandshakeTestCase> {
  const start = Date.now();
  try {
    await fn();
    return { name, status: "pass", durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { name, status: "fail", durationMs: Date.now() - start, error: message };
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

/**
 * Run the full MCP handshake smoke test.
 */
export async function runHandshakeTest(configOverrides?: Partial<McpConfig>): Promise<HandshakeTestResult> {
  const config = createDefaultConfig();
  config.audit.storageType = "memory";
  config.security.localMode = true;
  config.security.requireAuthContext = false;
  if (configOverrides) Object.assign(config, configOverrides);

  const server = createMcpServer(config);
  const cases: HandshakeTestCase[] = [];

  let serverVersion = "";
  let toolCount = 0;

  // 1. initialize
  cases.push(await runCase("initialize handshake", async () => {
    const raw = await server.handleRequest(makeRequest("initialize", 1));
    const resp = parseResponse(raw);
    assert(resp !== null, "Expected response, got null");
    assert((resp as any).jsonrpc === "2.0", "Expected jsonrpc 2.0");
    assert((resp as any).id === 1, "Expected id=1");
    assert((resp as any).result?.serverInfo?.name === "zeo-mcp", "Expected serverInfo.name = zeo-mcp");
    assert(typeof (resp as any).result?.serverInfo?.version === "string", "Expected serverInfo.version");
    assert((resp as any).result?.capabilities?.tools !== undefined, "Expected capabilities.tools");
    assert((resp as any).result?.protocolVersion === "2024-11-05", "Expected protocolVersion 2024-11-05");
    serverVersion = (resp as any).result.serverInfo.version;
  }));

  // 2. notifications/initialized
  cases.push(await runCase("notifications/initialized ack", async () => {
    const raw = await server.handleRequest(makeRequest("notifications/initialized", 2));
    const resp = parseResponse(raw);
    assert(resp !== null, "Expected response, got null");
    assert((resp as any).result !== undefined, "Expected ack result");
  }));

  // 3. tools/list
  cases.push(await runCase("tools/list returns tools", async () => {
    const raw = await server.handleRequest(makeRequest("tools/list", 3));
    const resp = parseResponse(raw);
    assert(resp !== null, "Expected response, got null");
    assert(Array.isArray((resp as any).result?.tools), "Expected result.tools array");
    assert((resp as any).result.tools.length > 0, "Expected at least one tool");
    toolCount = (resp as any).result.tools.length;

    // Verify each tool has required fields
    for (const tool of (resp as any).result.tools) {
      assert(typeof tool.name === "string" && tool.name.length > 0, `Tool missing name`);
      assert(typeof tool.description === "string", `Tool ${tool.name} missing description`);
      assert(tool.inputSchema?.type === "object", `Tool ${tool.name} inputSchema.type must be "object"`);
    }
  }));

  // 4. tools/call with kpi.list (a read tool in default allowlist)
  cases.push(await runCase("tools/call kpi.list succeeds", async () => {
    const raw = await server.handleRequest(makeRequest("tools/call", 4, {
      name: "kpi.list",
      arguments: {},
    }));
    const resp = parseResponse(raw);
    assert(resp !== null, "Expected response, got null");
    assert((resp as any).error === undefined, `Expected no error, got: ${JSON.stringify((resp as any).error)}`);
    assert((resp as any).result?.content !== undefined, "Expected result.content");
  }));

  // 5. Unknown method
  cases.push(await runCase("unknown method returns -32601", async () => {
    const raw = await server.handleRequest(makeRequest("nonexistent/method", 5));
    const resp = parseResponse(raw);
    assert(resp !== null, "Expected response, got null");
    assert((resp as any).error?.code === -32601, `Expected error code -32601, got ${(resp as any).error?.code}`);
  }));

  // 6. Malformed JSON
  cases.push(await runCase("malformed JSON returns -32700", async () => {
    const raw = await server.handleRequest("{ this is not json }");
    const resp = parseResponse(raw);
    assert(resp !== null, "Expected response, got null");
    assert((resp as any).error?.code === -32700, `Expected error code -32700, got ${(resp as any).error?.code}`);
  }));

  // 7. Deterministic error envelope
  cases.push(await runCase("error envelopes include run_id", async () => {
    const raw = await server.handleRequest("not-json");
    const resp = parseResponse(raw);
    assert(resp !== null, "Expected response, got null");
    assert(typeof (resp as any).error?.data?.run_id === "string", "Expected run_id in error data");
  }));

  const passed = cases.filter(c => c.status === "pass").length;
  const failed = cases.filter(c => c.status === "fail").length;

  return {
    passed,
    failed,
    total: cases.length,
    cases,
    serverVersion,
    toolCount,
  };
}

/**
 * Format handshake test result for CLI output.
 */
export function formatHandshakeTestResult(result: HandshakeTestResult): string {
  const lines: string[] = [];
  lines.push(`MCP Handshake Test: ${result.passed}/${result.total} passed`);
  lines.push(`  Server: zeo-mcp v${result.serverVersion}`);
  lines.push(`  Tools: ${result.toolCount}`);
  lines.push("");

  for (const c of result.cases) {
    const icon = c.status === "pass" ? "+" : "x";
    lines.push(`  [${icon}] ${c.name} (${c.durationMs}ms)`);
    if (c.error) {
      lines.push(`      ${c.error}`);
    }
  }

  return lines.join("\n");
}

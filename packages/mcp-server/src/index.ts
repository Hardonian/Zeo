#!/usr/bin/env node
/**
 * @zeo/mcp-server — Entry Point
 *
 * Starts the Zeo MCP server with stdio transport (default)
 * or optional HTTP transport (--http flag).
 *
 * Usage:
 *   node dist/index.js           # stdio transport
 *   node dist/index.js --http    # HTTP transport (127.0.0.1:3100)
 */

import { createInterface } from "readline";
import { createServer as createHttpServer } from "http";
import { loadConfig, validateConfig } from "./config.js";
import { createMcpServer } from "./server.js";

export { createMcpServer } from "./server.js";
export { createDefaultConfig, loadConfig, validateConfig, isToolAllowed, requiresConfirmation } from "./config.js";
export type { McpConfig, McpToolDefinition, McpToolResult, McpAuditEntry, ToolPermission, ToolScope } from "./types.js";
export type { McpServer } from "./server.js";
export type { AuditBridge } from "./audit-bridge.js";
export { runHandshakeTest, formatHandshakeTestResult, type HandshakeTestResult, type HandshakeTestCase } from "./handshake-test.js";

/**
 * Stdio transport — reads JSON-RPC messages line-by-line from stdin,
 * writes responses to stdout.
 */
function startStdioTransport(server: ReturnType<typeof createMcpServer>) {
    const rl = createInterface({ input: process.stdin });

    rl.on("line", async (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const response = await server.handleRequest(trimmed);
        if (response) {
            process.stdout.write(response + "\n");
        }
    });

    rl.on("close", () => {
        process.exit(0);
    });
}

/**
 * HTTP transport — listens for POST requests with JSON-RPC body.
 * Only enabled with --http flag, bound to 127.0.0.1 by default.
 */
function startHttpTransport(
    server: ReturnType<typeof createMcpServer>,
    host: string,
    port: number
) {
    const httpServer = createHttpServer(async (req, res) => {
        // Only accept POST to /mcp
        if (req.method !== "POST" || req.url !== "/mcp") {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Not found. POST to /mcp" }));
            return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks).toString("utf-8");

        const response = await server.handleRequest(body);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(response ?? "");
    });

    httpServer.listen(port, host, () => {
        process.stderr.write(
            `[zeo-mcp] HTTP transport listening on http://${host}:${port}/mcp\n`
        );
    });
}

/**
 * Main entry point
 */
async function main() {
    const args = process.argv.slice(2);
    const useHttp = args.includes("--http");

    const config = await loadConfig();

    // Validate config
    const issues = validateConfig(config);
    if (issues.length > 0) {
        process.stderr.write(
            `[zeo-mcp] Configuration issues:\n${issues.map(i => `  - ${i}`).join("\n")}\n`
        );
        process.exit(1);
    }

    const server = createMcpServer(config);
    const toolCount = server.getToolDefinitions().length;

    if (useHttp) {
        if (!config.transport.http.enabled) {
            // Override for explicit --http flag
            config.transport.http.enabled = true;
        }
        process.stderr.write(
            `[zeo-mcp] Starting HTTP transport (${toolCount} tools enabled)\n`
        );
        startHttpTransport(
            server,
            config.transport.http.host,
            config.transport.http.port
        );
    } else {
        process.stderr.write(
            `[zeo-mcp] Starting stdio transport (${toolCount} tools enabled)\n`
        );
        startStdioTransport(server);
    }
}

// Run if executed directly (not imported)
const isDirectExecution =
    typeof process !== "undefined" &&
    process.argv[1] &&
    (process.argv[1].endsWith("index.js") || process.argv[1].endsWith("index.ts"));

if (isDirectExecution) {
    main().catch(err => {
        process.stderr.write(`[zeo-mcp] Fatal error: ${err}\n`);
        process.exit(1);
    });
}

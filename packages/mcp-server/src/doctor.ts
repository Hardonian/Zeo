#!/usr/bin/env node
/**
 * @zeo/mcp-server — Doctor
 *
 * Validates MCP configuration and prints enabled tools.
 * Usage: node dist/doctor.js
 */

import { loadConfig, validateConfig } from "./config";

async function doctor() {
    const config = await loadConfig();
    const issues = validateConfig(config);

    console.log("╔══════════════════════════════════════════╗");
    console.log("║         Zeo MCP Server — Doctor          ║");
    console.log("╚══════════════════════════════════════════╝");
    console.log("");
    console.log(`Server: ${config.server.name} v${config.server.version}`);
    console.log(`Transport: stdio=${config.transport.stdio}, http=${config.transport.http.enabled}`);
    if (config.transport.http.enabled) {
        console.log(`  HTTP: ${config.transport.http.host}:${config.transport.http.port}`);
    }
    console.log(`Warehouse: ${config.warehouse.basePath}`);
    console.log(`Audit: ${config.audit.enabled ? "enabled" : "disabled"} (${config.audit.storageType})`);
    console.log(`Security: redact=${config.security.redactSecrets}, maxSize=${config.security.maxRequestSizeBytes}`);
    console.log("");
    console.log("Tools:");

    const tools = Object.values(config.tools.allowlist);
    for (const tool of tools.sort((a, b) => a.name.localeCompare(b.name))) {
        const status = tool.enabled ? "✓" : "✗";
        const confirm = tool.requireConfirmation ? " [confirm]" : "";
        console.log(`  ${status} ${tool.name} (${tool.scope})${confirm}`);
    }

    console.log("");

    if (issues.length > 0) {
        console.log("⚠ Issues found:");
        for (const issue of issues) {
            console.log(`  - ${issue}`);
        }
        process.exit(1);
    } else {
        console.log("✓ Configuration valid");
    }
}

doctor().catch(err => {
    console.error("Doctor failed:", err);
    process.exit(1);
});

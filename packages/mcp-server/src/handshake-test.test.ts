/**
 * MCP Handshake Smoke Test — Vitest
 *
 * Runs the handshake test and asserts all cases pass.
 */

import { describe, it, expect } from "vitest";
import { runHandshakeTest } from "./handshake-test.js";

describe("MCP Handshake Smoke Test", () => {
  it("passes all handshake test cases", async () => {
    const result = await runHandshakeTest();
    expect(result.failed).toBe(0);
    expect(result.passed).toBe(result.total);
    expect(result.total).toBeGreaterThanOrEqual(7);
  });

  it("reports correct server version", async () => {
    const result = await runHandshakeTest();
    expect(result.serverVersion).toBe("1.4.0");
  });

  it("reports tool count", async () => {
    const result = await runHandshakeTest();
    expect(result.toolCount).toBeGreaterThan(0);
  });
});

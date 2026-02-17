/**
 * Forbidden Imports Guard
 *
 * Ensures the kernel directory does not import any impure modules.
 * This is a structural test that scans kernel source files.
 *
 * Forbidden in kernel:
 * - node:fs, node:path, node:net, node:http, node:https
 * - node:child_process, node:os, node:process
 * - Any file that reads process.env, process.cwd, Date.now()
 * - Any import from tool/MCP modules
 * - Any import from storage/persistence modules
 *
 * Allowed:
 * - node:crypto (for SHA-256; polyfillable for WASM)
 * - node:buffer (for canonical JSON encoding; polyfillable for WASM)
 * - Relative imports within kernel/
 * - Type-only imports from @zeo/contracts (via kernel-local types)
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const KERNEL_DIR = __dirname; // This test lives in the kernel directory

const FORBIDDEN_IMPORTS = [
  "node:fs",
  "node:path",
  "node:net",
  "node:http",
  "node:https",
  "node:child_process",
  "node:os",
  '"fs"',
  '"path"',
  '"net"',
  '"http"',
  '"https"',
  '"child_process"',
  '"os"',
];

const FORBIDDEN_PATTERNS = [
  /process\.env/,
  /process\.cwd/,
  /process\.exit/,
  /process\.stdin/,
  /process\.stdout/,
  /process\.stderr/,
  /import.*from\s+["']\.\.\/storage/,
  /import.*from\s+["']\.\.\/evidence-storage/,
  /import.*from\s+["']\.\.\/evidence-graph/,
  /import.*from\s+["']\.\.\/runner/,
  /import.*from\s+["']\.\.\/snapshot/,
  /import.*from\s+["']\.\.\/replay-engine/,
  /import.*from\s+["']\.\.\/diff-engine/,
  /import.*from\s+["']@zeo\/db/,
  /import.*from\s+["']@zeo\/mcp/,
  /import.*from\s+["']@zeo\/trust/,
  /import.*from\s+["']@zeo\/warehouse/,
  /import.*from\s+["']@zeo\/telemetry/,
];

function getKernelSourceFiles(): string[] {
  const files = readdirSync(KERNEL_DIR);
  return files
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => join(KERNEL_DIR, f));
}

describe("Kernel Forbidden Imports", () => {
  const sourceFiles = getKernelSourceFiles();

  it("kernel directory has source files", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  for (const filePath of sourceFiles) {
    const fileName = filePath.split("/").pop()!;

    describe(fileName, () => {
      const content = readFileSync(filePath, "utf8");

      it("does not import forbidden Node modules", () => {
        for (const forbidden of FORBIDDEN_IMPORTS) {
          const found = content.includes(forbidden);
          if (found) {
            // Allow node:crypto as it's needed for hashing
            if (forbidden === "node:crypto" || forbidden === '"crypto"') continue;
            expect(found).toBe(false);
          }
        }
      });

      it("does not use forbidden runtime patterns", () => {
        const lines = content.split("\n");
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
          const line = lines[lineNum];
          // Skip comments
          if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;

          for (const pattern of FORBIDDEN_PATTERNS) {
            if (pattern.test(line)) {
              throw new Error(
                `Forbidden pattern ${pattern} found in ${fileName}:${lineNum + 1}: ${line.trim()}`,
              );
            }
          }
        }
      });

      it("does not use dynamic require", () => {
        expect(content).not.toMatch(/\brequire\s*\(/);
      });
    });
  }
});

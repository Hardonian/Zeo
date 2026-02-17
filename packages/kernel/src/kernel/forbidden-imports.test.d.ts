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
export {};
//# sourceMappingURL=forbidden-imports.test.d.ts.map
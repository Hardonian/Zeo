#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let failures = 0;

function run(label, cmd) {
  process.stdout.write(`\n[doctor] ${label}... `);
  try {
    execSync(cmd, { cwd: root, stdio: "pipe", timeout: 120_000 });
    process.stdout.write("OK\n");
    return true;
  } catch (err) {
    process.stdout.write("FAIL\n");
    const output = (err.stderr || err.stdout || "").toString().trim();
    if (output) {
      const lines = output.split("\n").filter(l => l.includes("error") || l.includes("FAIL") || l.includes("Error"));
      for (const line of lines.slice(0, 10)) {
        console.log(`  -> ${line.trim()}`);
      }
    }
    failures++;
    return false;
  }
}

console.log("=== Zeo Doctor ===");

// Node version check
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0], 10);
process.stdout.write(`\n[doctor] Node version: ${nodeVersion}... `);
if (nodeMajor >= 20) {
  process.stdout.write("OK\n");
} else {
  process.stdout.write("FAIL (need >=20)\n");
  failures++;
}

// pnpm version check
try {
  const pnpmVersion = execSync("pnpm --version", { encoding: "utf8", cwd: root }).trim();
  const pnpmMajor = parseInt(pnpmVersion.split(".")[0], 10);
  process.stdout.write(`[doctor] pnpm version: ${pnpmVersion}... `);
  if (pnpmMajor >= 9) {
    process.stdout.write("OK\n");
  } else {
    process.stdout.write("FAIL (need >=9)\n");
    failures++;
  }
} catch {
  console.log("[doctor] pnpm version: NOT FOUND");
  console.log("  -> Install pnpm: https://pnpm.io/installation");
  failures++;
}

// Workspace structure check
const requiredPaths = [
  "package.json",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "turbo.json",
  "packages/contracts/package.json",
  "packages/adapters/package.json",
  "packages/core/package.json",
  "apps/cli/package.json",
];
process.stdout.write(`\n[doctor] Workspace structure... `);
const missing = requiredPaths.filter(p => !existsSync(resolve(root, p)));
if (missing.length === 0) {
  process.stdout.write("OK\n");
} else {
  process.stdout.write("FAIL\n");
  for (const m of missing) console.log(`  -> missing: ${m}`);
  failures++;
}

// Typecheck
run("Typecheck (pnpm -r typecheck)", "pnpm -r typecheck");

// Tests
run("Tests (pnpm -r test)", "pnpm -r test");

// Lint
run("Lint (pnpm -r lint)", "pnpm -r lint");

// Summary
console.log("\n=== Doctor Summary ===");
if (failures === 0) {
  console.log("All checks passed.");
} else {
  console.log(`${failures} check(s) failed. Fix the issues above and re-run: pnpm doctor`);
}

process.exit(failures > 0 ? 1 : 0);

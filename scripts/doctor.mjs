#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
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

function checkFile(label, path) {
  process.stdout.write(`[doctor] ${label}... `);
  if (existsSync(resolve(root, path))) {
    process.stdout.write("OK\n");
    return true;
  } else {
    process.stdout.write("FAIL\n");
    console.log(`  -> missing: ${path}`);
    failures++;
    return false;
  }
}

console.log("=== Zeo Doctor ===\n");

// Node version check
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0], 10);
const nodeMinor = parseInt(nodeVersion.slice(1).split(".")[1], 10);
process.stdout.write(`Node version: ${nodeVersion} (require >=20.11.0)... `);
if (nodeMajor > 20 || (nodeMajor === 20 && nodeMinor >= 11)) {
  process.stdout.write("OK\n");
} else {
  process.stdout.write("FAIL (need >=20.11.0)\n");
  failures++;
}

// pnpm version check
try {
  const pnpmVersion = execSync("pnpm --version", { encoding: "utf8", cwd: root }).trim();
  const [pnpmMajor, pnpmMinor, pnpmPatch] = pnpmVersion.split(".").map(Number);
  process.stdout.write(`pnpm version: ${pnpmVersion} (require >=9.15.5)... `);
  if (pnpmMajor > 9 || (pnpmMajor === 9 && (pnpmMinor > 15 || (pnpmMinor === 15 && pnpmPatch >= 5)))) {
    process.stdout.write("OK\n");
  } else {
    process.stdout.write("FAIL (need >=9.15.5)\n");
    failures++;
  }
} catch {
  console.log("pnpm version: NOT FOUND");
  console.log("  -> Install pnpm: https://pnpm.io/installation");
  failures++;
}

// Workspace structure check
console.log("\n--- Workspace Structure ---");
const requiredPaths = [
  "package.json",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "turbo.json",
  ".env.example",
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "packages/contracts/package.json",
  "packages/core/package.json",
  "apps/cli/package.json",
  "apps/web/package.json",
];

const missing = requiredPaths.filter(p => !existsSync(resolve(root, p)));
if (missing.length === 0) {
  process.stdout.write("Workspace structure... OK\n");
} else {
  process.stdout.write("Workspace structure... FAIL\n");
  for (const m of missing) console.log(`  -> missing: ${m}`);
  failures++;
}

// Required documentation
console.log("\n--- Required Documentation ---");
checkFile("CHANGELOG.md", "CHANGELOG.md");
checkFile("LICENSE", "LICENSE");
checkFile("README.md", "README.md");
checkFile("VERSIONING.md", "docs/VERSIONING.md");
checkFile("RELEASE_CHECKLIST.md", "docs/RELEASE_CHECKLIST.md");

// Secret scanning
console.log("\n--- Secret Scanning ---");
const secretPatterns = [
  { pattern: /api[_-]?key\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/i, name: "API Key" },
  { pattern: /api[_-]?secret\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/i, name: "API Secret" },
  { pattern: /password\s*[=:]\s*["'][^"']{8,}["']/i, name: "Password" },
  { pattern: /token\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/i, name: "Token" },
  { pattern: /private[_-]?key\s*[=:]\s*["']/i, name: "Private Key" },
  { pattern: /secret\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/i, name: "Secret" },
];

const scannedExtensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml"];
const excludeDirs = ["node_modules", ".git", "dist", ".next"];

function scanForSecrets(dir) {
  const files = readdirSync(dir);
  let foundSecrets = false;

  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        if (scanForSecrets(fullPath)) foundSecrets = true;
      }
      continue;
    }

    const ext = file.slice(file.lastIndexOf("."));
    if (!scannedExtensions.includes(ext)) continue;

    try {
      const content = readFileSync(fullPath, "utf8");
      for (const { pattern, name } of secretPatterns) {
        if (pattern.test(content)) {
          // Check if it's in .env.example (safe) or marked as SAFE
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (pattern.test(line) && 
                !line.includes(".env.example") && 
                !line.includes("// SAFE:") &&
                !line.includes("process.env.") &&
                !line.includes("{{")) {
              console.log(`  -> ${name} pattern found in: ${fullPath.replace(root, "").slice(1)}`);
              foundSecrets = true;
              failures++;
            }
          }
        }
      }
    } catch (e) {
      // Skip files that can't be read
    }
  }

  return foundSecrets;
}

process.stdout.write("Scanning for secrets... ");
const secretsFound = scanForSecrets(root);
if (!secretsFound) {
  process.stdout.write("OK (none found)\n");
} else {
  process.stdout.write("FAIL (see above)\n");
}

// .env.example check
process.stdout.write(".env.example exists... ");
if (existsSync(resolve(root, ".env.example"))) {
  process.stdout.write("OK\n");
} else {
  process.stdout.write("FAIL\n");
  failures++;
}

// Typecheck
console.log("\n--- Verification ---");
run("Typecheck (pnpm -r typecheck)", "pnpm -r typecheck");

// Tests
run("Tests (pnpm -r test)", "pnpm -r test");

// Lint
run("Lint (pnpm -r lint)", "pnpm -r lint");

// Summary
console.log("\n=== Doctor Summary ===");
if (failures === 0) {
  console.log("All checks passed.");
  console.log("\nNext steps:");
  console.log("  pnpm quickstart:web  - Run the web app");
  console.log("  pnpm quickstart:cli  - Run the CLI demo");
  console.log("  pnpm quickstart:demo - Run offline replay demo");
  console.log("  pnpm verify:full     - Full verification (CI simulation)");
} else {
  console.log(`${failures} check(s) failed. Fix the issues above and re-run: pnpm doctor`);
}

process.exit(failures > 0 ? 1 : 0);

#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let secretsFound = 0;
let filesScanned = 0;

// Patterns that might indicate secrets
const secretPatterns = [
  { 
    pattern: /api[_-]?key\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/gi, 
    name: "API Key",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{", "process.env["]
  },
  { 
    pattern: /api[_-]?secret\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/gi, 
    name: "API Secret",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{", "process.env["]
  },
  { 
    pattern: /password\s*[=:]\s*["'][^"']{8,}["']/gi, 
    name: "Password",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{", "process.env["]
  },
  { 
    pattern: /token\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/gi, 
    name: "Token",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{", "process.env["]
  },
  { 
    pattern: /private[_-]?key\s*[=:]\s*["']/gi, 
    name: "Private Key",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{", "process.env["]
  },
  { 
    pattern: /secret\s*[=:]\s*["'][a-zA-Z0-9]{16,}["']/gi, 
    name: "Secret",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{", "process.env["]
  },
  {
    pattern: /sk-[a-zA-Z0-9]{32,}/g,
    name: "OpenAI-style Secret Key",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{"]
  },
  {
    pattern: /gh[pousr]_[a-zA-Z0-9]{36}/g,
    name: "GitHub Token",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{"]
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/g,
    name: "AWS Access Key ID",
    safeContexts: [".env.example", "// SAFE:", "process.env.", "{{"]
  }
];

const scannedExtensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml", ".mjs"];
const excludeDirs = ["node_modules", ".git", "dist", ".next", "coverage", ".turbo"];

function isSafeLine(line, safeContexts) {
  return safeContexts.some(ctx => line.includes(ctx));
}

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let fileHasSecret = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const { pattern, name, safeContexts } of secretPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          // Check if this is a safe context
          if (!isSafeLine(line, safeContexts)) {
            if (!fileHasSecret) {
              console.log(`\n${filePath.replace(root, "").slice(1)}:`);
              fileHasSecret = true;
            }
            console.log(`  Line ${i + 1}: Potential ${name}`);
            console.log(`    ${line.trim().slice(0, 80)}...`);
            secretsFound++;
          }
        }
      }
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir) {
  const files = readdirSync(dir);

  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        scanDirectory(fullPath);
      }
      continue;
    }

    const ext = file.slice(file.lastIndexOf("."));
    if (!scannedExtensions.includes(ext)) continue;

    filesScanned++;
    scanFile(fullPath);
  }
}

console.log("=== Zeo Secret Scan ===\n");
console.log("Scanning for potential secrets in tracked files...\n");

scanDirectory(root);

console.log("\n--- Scan Complete ---");
console.log(`Files scanned: ${filesScanned}`);
console.log(`Potential secrets found: ${secretsFound}`);

if (secretsFound > 0) {
  console.log("\nWARNING: Potential secrets detected!");
  console.log("   Review the findings above.");
  console.log("   If these are false positives, mark with '// SAFE:' comment.");
  console.log("   If these are real secrets, rotate them immediately.");
  process.exit(1);
} else {
  console.log("\nOK: No potential secrets found.");
  process.exit(0);
}

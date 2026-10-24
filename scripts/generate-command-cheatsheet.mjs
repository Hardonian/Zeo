#!/usr/bin/env node

/**
 * Command Cheatsheet Generator (DEVX-07)
 *
 * Runs `zeo --help`, parses commands and options, and generates
 * an up-to-date markdown reference in docs/COMMAND_CHEATSHEET.md.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cliPath = resolve(process.cwd(), 'apps/cli/dist/apps/cli/src/index.js');
const fallbackCliPath = resolve(process.cwd(), 'apps/cli/dist/index.js');
const targetCli = existsSync(cliPath) ? cliPath : fallbackCliPath;

if (!existsSync(targetCli)) {
  process.stderr.write(`[cheatsheet-gen] Error: CLI entrypoint not found at ${targetCli}\n`);
  process.exit(1);
}

const res = spawnSync('node', [targetCli, '--help'], { encoding: 'utf8' });
if (res.status !== 0) {
  process.stderr.write(`[cheatsheet-gen] Error running CLI --help: ${res.stderr}\n`);
  process.exit(res.status ?? 1);
}

const helpOutput = res.stdout;
const lines = helpOutput.split('\n');

const commands = [];
const options = [];

let currentSection = 'header';

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  if (trimmed.startsWith('Commands:')) {
    currentSection = 'commands';
    continue;
  }
  if (trimmed.startsWith('Options:')) {
    currentSection = 'options';
    continue;
  }

  if (currentSection === 'commands') {
    if (trimmed.startsWith('---')) {
      commands.push({ category: trimmed.replace(/---/g, '').trim(), isCategory: true });
      continue;
    }
    const match = line.match(/^\s{2}([\w\s\-\<\>\|\:]+?)\s{2,}(.+)$/);
    if (match) {
      commands.push({ command: match[1].trim(), description: match[2].trim(), isCategory: false });
    }
  } else if (currentSection === 'options') {
    const match = line.match(/^\s{2}(--[\w\s\-\<\>\|\,\:]+?)\s{2,}(.+)$/);
    if (match) {
      options.push({ flag: match[1].trim(), description: match[2].trim() });
    }
  }
}

const md = `# Zeo CLI Command Cheatsheet

Generated on: ${new Date().toISOString()}  
CLI Version: v1.0.0 &middot; Epistemic Decision Engine

---

## Core Command Reference

| Command | Description |
|---|---|
${commands
  .filter((c) => !c.isCategory)
  .map((c) => `| \`zeo ${c.command.replace(/\|/g, '\\|')}\` | ${c.description.replace(/\|/g, '\\|')} |`)
  .join('\n')}

---

## Global Options & Flags

| Flag | Purpose |
|---|---|
${options
  .map((o) => `| \`${o.flag.replace(/\|/g, '\\|')}\` | ${o.description.replace(/\|/g, '\\|')} |`)
  .join('\n')}

---

## Quickstart Recipes

### 1. Analyze Pull Request Risk
\`\`\`bash
zeo analyze-pr origin/main..HEAD
\`\`\`

### 2. Deterministic Replay
\`\`\`bash
zeo replay examples/negotiation
\`\`\`

### 3. Explain Decision for Executives
\`\`\`bash
zeo explain <decision_id> --audience exec
\`\`\`

### 4. Run Autopilot System Diagnostics
\`\`\`bash
zeo doctor
\`\`\`
`;

const outputPath = resolve(process.cwd(), 'docs/COMMAND_CHEATSHEET.md');
writeFileSync(outputPath, md, 'utf8');

process.stdout.write(`=== ZEO CLI CHEATSHEET GENERATED ===\n`);
process.stdout.write(`Emitted: ${outputPath} (${commands.length} commands, ${options.length} options)\n`);
process.exit(0);

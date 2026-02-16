#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const laneArg = process.argv.find((arg) => arg.startsWith('--lane='));
const lane = laneArg ? laneArg.split('=')[1] : 'main';
const update = process.argv.includes('--update');

const repoRoot = process.cwd();
const cliPath = resolve(repoRoot, 'apps/cli/dist/apps/cli/src/index.js');
const contractsDist = resolve(repoRoot, 'packages/contracts/dist/index.js');
const fixturesDir = resolve(repoRoot, 'tests/golden/fixtures');
const expectedPath = resolve(repoRoot, 'tests/golden/expected.json');
const reportDir = resolve(repoRoot, 'tests/golden/artifacts');
const reportPath = resolve(reportDir, 'golden-report.json');

if (!existsSync(cliPath) || !existsSync(contractsDist)) {
  const build = spawnSync('pnpm', ['-r', '--filter', '@zeo/cli...', 'build'], { encoding: 'utf8' });
  if (build.status !== 0) {
    process.stderr.write(build.stderr || build.stdout || '[golden] build failed\n');
    process.exit(build.status ?? 1);
  }
}

const fixtureFiles = readdirSync(fixturesDir)
  .filter((name) => name.endsWith('.json'))
  .sort();

const selected = lane === 'pr' ? fixtureFiles.slice(0, 3) : fixtureFiles;
const expected = existsSync(expectedPath)
  ? JSON.parse(readFileSync(expectedPath, 'utf8'))
  : { version: 1, fixtures: {} };

const failures = [];
const results = [];

for (const fixtureFile of selected) {
  const fixture = JSON.parse(readFileSync(resolve(fixturesDir, fixtureFile), 'utf8'));
  const cliArgs = Array.isArray(fixture.args) ? fixture.args : [];
  const run = spawnSync('node', [cliPath, ...cliArgs], {
    encoding: 'utf8',
    timeout: 45_000,
    env: { ...process.env, CI: '1', ZEO_PERF: '0' },
  });

  const combinedOutput = `${run.stdout || ''}\n${run.stderr || ''}`;
  const hashMatch = combinedOutput.match(/Decision Hash: ([a-f0-9]+)\.\.\./i);

  if (run.status !== 0) {
    failures.push(`[${fixture.id}] command failed (exit ${run.status})`);
    failures.push(`  command: node ${cliPath} ${cliArgs.join(' ')}`);
    failures.push(`  stderr: ${(run.stderr || '').trim() || '(empty)'}`);
    continue;
  }

  if (!hashMatch) {
    failures.push(`[${fixture.id}] unable to parse decision hash from CLI output`);
    failures.push(`  command: node ${cliPath} ${cliArgs.join(' ')}`);
    continue;
  }

  const observed = hashMatch[1].toLowerCase();
  const expectedEntry = expected.fixtures?.[fixture.id];

  if (update || !expectedEntry) {
    expected.fixtures[fixture.id] = {
      fixtureFile,
      stableIdentifier: 'decisionHashPrefix16',
      value: observed,
    };
  } else if (expectedEntry.value !== observed) {
    failures.push(`[${fixture.id}] decision hash drift`);
    failures.push(`  expected: ${expectedEntry.value}`);
    failures.push(`  observed: ${observed}`);
  }

  results.push({ id: fixture.id, fixtureFile, observed, args: cliArgs });
}

if (update) {
  writeFileSync(expectedPath, `${JSON.stringify(expected, null, 2)}\n`, 'utf8');
  process.stdout.write(`[golden] updated expectations at ${expectedPath}\n`);
}

mkdirSync(reportDir, { recursive: true });
writeFileSync(
  reportPath,
  `${JSON.stringify({ lane, selectedCount: selected.length, failures, results, generatedAt: new Date().toISOString() }, null, 2)}\n`,
  'utf8',
);

if (failures.length > 0) {
  process.stderr.write('[golden] failed\n');
  for (const failure of failures) process.stderr.write(`- ${failure}\n`);
  process.stderr.write(`[golden] report=${reportPath}\n`);
  process.exit(1);
}

process.stdout.write(`[golden] passed lane=${lane} fixtures=${selected.length}\n`);
process.stdout.write(`[golden] report=${reportPath}\n`);

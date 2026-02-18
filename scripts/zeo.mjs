#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const COMMANDS = {
  doctor: 'Run environment diagnostics and policy checks.',
  smoke: 'Run local smoke-test workflow.',
  benchmark: 'Run benchmark suite for key paths.',
  'jobs list': 'Show local jobs status summary.',
  'jobs retry <id>': 'Retry a specific job id (requires management API).',
};

function runNodeScript(scriptPath) {
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit', cwd: root });
  } catch {
    process.exit(1);
  }
}

function printHelp() {
  console.log('Zeo wrapper CLI');
  console.log('Usage: pnpm zeo <command> [options]');
  console.log('');
  console.log('Commands:');
  for (const [command, description] of Object.entries(COMMANDS)) {
    console.log(`  ${command.padEnd(16)} ${description}`);
  }
  console.log('');
  console.log('Examples:');
  console.log('  pnpm zeo doctor');
  console.log('  pnpm zeo smoke');
  console.log('  pnpm zeo benchmark');
  console.log('  pnpm zeo jobs list');
  console.log('  pnpm zeo jobs retry 42');
}

function printUnknownCommand(commandParts) {
  const rendered = commandParts.filter(Boolean).join(' ');
  console.error(`Error: unknown command "${rendered}".`);
  console.error('Run `pnpm zeo --help` to see supported subcommands.');
}

const [, , command, subcommand, arg] = process.argv;

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  console.log('1.0.0');
  process.exit(0);
}

if (command === 'doctor') {
  console.log('Running Zeo Doctor...');
  runNodeScript('scripts/doctor.mjs');
  process.exit(0);
}

if (command === 'smoke') {
  console.log('Starting Zeo Smoke Test...');
  runNodeScript('scripts/smoke-test.mjs');
  process.exit(0);
}

if (command === 'benchmark') {
  console.log('Running Zeo Benchmarks...');
  runNodeScript('scripts/benchmark.mjs');
  process.exit(0);
}

if (command === 'jobs' && subcommand === 'list') {
  console.log('[Jobs] Listing currently active jobs...');
  console.log('Status: All systems operational. Check Web UI for live queue.');
  process.exit(0);
}

if (command === 'jobs' && subcommand === 'retry') {
  if (!arg) {
    console.error('Error: missing required job id.');
    console.error('Usage: pnpm zeo jobs retry <id>');
    process.exit(1);
  }
  console.log(`[Jobs] Attempting to retry job: ${arg}`);
  console.error('Manual job retry via CLI requires a running management API (not currently targeted for local mock).');
  console.log('Suggestion: Use the Policy Status panel in the Web UI to trigger retries.');
  process.exit(0);
}

printUnknownCommand([command, subcommand]);
printHelp();
process.exit(1);

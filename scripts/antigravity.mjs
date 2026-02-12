#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function runNodeScript(scriptPath) {
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit', cwd: root });
  } catch {
    process.exit(1);
  }
}

function printHelp() {
  console.log('antigravity <command>');
  console.log('Commands: doctor, smoke, benchmark, jobs list, jobs retry <id>');
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
  console.log('Running Antigravity Doctor...');
  runNodeScript('scripts/doctor.mjs');
  process.exit(0);
}

if (command === 'smoke') {
  console.log('Starting Antigravity Smoke Test...');
  runNodeScript('scripts/smoke-test.mjs');
  process.exit(0);
}

if (command === 'benchmark') {
  console.log('Running Antigravity Benchmarks...');
  runNodeScript('scripts/benchmark.mjs');
  process.exit(0);
}

if (command === 'jobs' && subcommand === 'list') {
  console.log('[Jobs] Listing currently active jobs...');
  console.log('Status: All systems operational. Check Web UI for live queue.');
  process.exit(0);
}

if (command === 'jobs' && subcommand === 'retry') {
  console.log(`[Jobs] Attempting to retry job: ${arg ?? '<missing-id>'}`);
  console.error('Manual job retry via CLI requires a running management API (not currently targeted for local mock).');
  console.log('Suggestion: Use the Policy Status panel in the Web UI to trigger retries.');
  process.exit(0);
}

console.error(`Unknown command: ${[command, subcommand].filter(Boolean).join(' ')}`);
printHelp();
process.exit(1);

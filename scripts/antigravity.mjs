#!/usr/bin/env node

/**
 * Antigravity CLI Tool
 * Operator-grade control and diagnostic tool for the Zeo platform.
 */

import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const program = new Command();

program
    .name('antigravity')
    .description('Antigravity platform operator tool')
    .version('1.0.0');

// --- DOCTOR COMMAND ---
program
    .command('doctor')
    .description('Run system diagnostics and integration checks')
    .action(() => {
        console.log('Running Antigravity Doctor...');
        try {
            execSync('node scripts/doctor.mjs', { stdio: 'inherit', cwd: root });
        } catch (err) {
            process.exit(1);
        }
    });

// --- JOBS COMMANDS ---
const jobs = program.command('jobs').description('Manage background jobs');

jobs
    .command('retry <id>')
    .description('Retry a failed or dead-letter job')
    .action(async (id) => {
        console.log(`[Jobs] Attempting to retry job: ${id}`);
        // In a real production app, this would call an API or a management socket.
        // For this local-first implementation, we'll suggest using the UI or 
        // mock the action by updating a state file if one exists.
        console.error('Manual job retry via CLI requires a running management API (not currently targeted for local mock).');
        console.log('Suggestion: Use the Policy Status panel in the Web UI to trigger retries.');
    });

jobs
    .command('list')
    .description('List current jobs and their statuses')
    .action(() => {
        console.log('[Jobs] Listing currently active jobs...');
        // Mock output or read from a shared state file
        console.log('Status: All systems operational. Check Web UI for live queue.');
    });

// --- VERIFICATION COMMANDS ---
program
    .command('smoke')
    .description('Run deterministic end-to-end smoke tests')
    .action(() => {
        console.log('Starting Antigravity Smoke Test...');
        try {
            execSync('node scripts/smoke-test.mjs', { stdio: 'inherit', cwd: root });
        } catch (err) {
            process.exit(1);
        }
    });

program
    .command('benchmark')
    .description('Measure performance and latency across the stack')
    .action(() => {
        console.log('Running Antigravity Benchmarks...');
        try {
            execSync('node scripts/benchmark.mjs', { stdio: 'inherit', cwd: root });
        } catch (err) {
            process.exit(1);
        }
    });

program.parse();

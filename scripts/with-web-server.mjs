#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const command = process.argv.slice(2);
if (command.length === 0) {
  console.error('Usage: node scripts/with-web-server.mjs <command> [args...]');
  process.exit(1);
}

const buildIdPath = resolve(process.cwd(), 'apps/web/.next/BUILD_ID');
if (!existsSync(buildIdPath)) {
  const build = spawnSync('pnpm', ['-C', 'apps/web', 'build'], { stdio: 'inherit', env: process.env });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const server = spawn('node', ['.next/standalone/apps/web/server.js'], {
  cwd: resolve(process.cwd(), 'apps/web'),
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: '3005', HOSTNAME: '127.0.0.1' },
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

async function waitForServer(deadlineMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < deadlineMs) {
    try {
      const res = await fetch('http://127.0.0.1:3005/api/health');
      if (res.ok) return;
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for apps/web server.\n${serverOutput}`);
}

try {
  await waitForServer();
  const check = spawn(command[0], command.slice(1), { stdio: 'inherit', env: process.env });
  const exitCode = await new Promise((resolve) => check.on('exit', (code) => resolve(code ?? 1)));
  process.exitCode = exitCode;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
}

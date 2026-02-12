#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (!existsSync('apps/cli/dist/apps/cli/src/index.js')) {
  const build = spawnSync('pnpm', ['-r', '--filter', '@zeo/cli...', 'build'], { encoding: 'utf8' });
  if (build.status !== 0) {
    process.stderr.write(build.stderr || build.stdout || 'build failed\n');
    process.exit(build.status ?? 1);
  }
}

const cliPath = resolve(process.cwd(), 'apps/cli/dist/apps/cli/src/index.js');
const child = spawn('node', [cliPath, 'mcp', 'serve'], { stdio: ['pipe', 'pipe', 'pipe'] });

let buffer = '';
let ready = false;
let done = false;

function send(msg) {
  child.stdin.write(`${JSON.stringify(msg)}\n`);
}

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  if (!ready && text.includes('stdio transport ready')) {
    ready = true;
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  }
});

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.id === 1) {
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
    } else if (message.id === 2) {
      const tools = message.result?.tools ?? [];
      process.stderr.write(`[mcp-smoke] tools=${tools.length}\n`);
      done = true;
      child.kill('SIGINT');
    }
  }
});

child.on('exit', (code) => {
  if (!done) {
    process.stderr.write(`[mcp-smoke] failed exit=${code}\n`);
    process.exit(code ?? 1);
  }
  process.stderr.write('[mcp-smoke] passed\n');
  process.exit(0);
});

setTimeout(() => {
  if (!done) {
    process.stderr.write('[mcp-smoke] timeout\n');
    child.kill('SIGINT');
  }
}, 15000);

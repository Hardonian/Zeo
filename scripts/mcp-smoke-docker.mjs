#!/usr/bin/env node
import { spawn } from 'node:child_process';

const image = process.env.ZEO_DOCKER_IMAGE ?? 'zeolite:dev';
const child = spawn('docker', ['run', '-i', '--rm', image, 'mcp', 'serve'], { stdio: ['pipe', 'pipe', 'pipe'] });


let stdoutBuffer = '';
let ready = false;
let initialized = false;
let done = false;

const timeout = setTimeout(() => {
  if (!done) {
    process.stderr.write('[mcp-smoke-docker] timeout\n');
    child.kill('SIGINT');
  }
}, 20000);

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

child.on('error', (error) => {
  if ((error).code === 'ENOENT') {
    process.stderr.write('[mcp-smoke-docker] docker executable not found. Install Docker to run this check.\n');
    process.exit(2);
  }
  process.stderr.write(`[mcp-smoke-docker] process error: ${String(error)}\n`);
  process.exit(1);
});

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  if (!ready && text.includes('stdio transport ready')) {
    ready = true;
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  }
});

child.stdout.on('data', (chunk) => {
  stdoutBuffer += chunk.toString();
  const lines = stdoutBuffer.split('\n');
  stdoutBuffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.trim()) continue;
    let payload;
    try {
      payload = JSON.parse(line);
    } catch (error) {
      process.stderr.write(`[mcp-smoke-docker] invalid json: ${String(error)}\n`);
      child.kill('SIGINT');
      return;
    }

    if (payload.id === 1) {
      initialized = true;
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
      continue;
    }

    if (payload.id === 2) {
      const tools = payload.result?.tools;
      if (!Array.isArray(tools) || tools.length === 0) {
        process.stderr.write('[mcp-smoke-docker] tools/list returned no tools\n');
        child.kill('SIGINT');
        return;
      }
      done = true;
      clearTimeout(timeout);
      process.stderr.write(`[mcp-smoke-docker] initialized=${initialized} tools=${tools.length}\n`);
      child.kill('SIGINT');
      return;
    }
  }
});

child.on('exit', (code) => {
  if (!done) {
    process.stderr.write(`[mcp-smoke-docker] failed exit=${code}\n`);
    process.exit(code ?? 1);
  }
  process.stderr.write('[mcp-smoke-docker] passed\n');
  process.exit(0);
});

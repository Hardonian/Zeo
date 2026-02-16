#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const timeoutMs = Number(process.env.MCP_SMOKE_TIMEOUT_MS ?? 20_000);
const cliPath = resolve(process.cwd(), 'apps/cli/dist/apps/cli/src/index.js');

if (!existsSync(cliPath)) {
  const build = spawnSync('pnpm', ['-C', 'apps/cli', 'build'], { encoding: 'utf8' });
  if (build.status !== 0) {
    process.stderr.write(build.stderr || build.stdout || '[mcp-client] failed to build CLI\n');
    process.exit(build.status ?? 1);
  }
}

const server = spawn('node', [cliPath, 'mcp', 'serve'], { stdio: ['pipe', 'pipe', 'pipe'] });

let settled = false;
let stdoutBuffer = '';
let initializeAck = false;
let listAck = false;
let callAck = false;
let seenTool = '';

const fail = (message, extra) => {
  if (settled) return;
  settled = true;
  process.stderr.write(`[mcp-client] ${message}\n`);
  if (extra) process.stderr.write(`${extra}\n`);
  server.kill('SIGINT');
  process.exit(1);
};

const pass = () => {
  if (settled) return;
  settled = true;
  process.stdout.write(`[mcp-client] passed tool=${seenTool}\n`);
  server.kill('SIGINT');
  process.exit(0);
};

const send = (payload) => {
  server.stdin.write(`${JSON.stringify(payload)}\n`);
};

server.on('error', (error) => {
  fail('unable to start MCP server', String(error));
});

server.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  if (text.includes('stdio transport ready') && !initializeAck) {
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
  }
});

server.stdout.on('data', (chunk) => {
  stdoutBuffer += chunk.toString();
  const lines = stdoutBuffer.split('\n');
  stdoutBuffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.trim()) continue;

    let payload;
    try {
      payload = JSON.parse(line);
    } catch (error) {
      fail('server returned invalid JSON', String(error));
      return;
    }

    if (payload.id === 1) {
      initializeAck = true;
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
      continue;
    }

    if (payload.id === 2) {
      listAck = true;
      const tools = payload.result?.tools;
      if (!Array.isArray(tools) || tools.length === 0) {
        fail('tools/list returned no tools');
        return;
      }
      const preferred = tools.find((tool) => tool?.name === 'zeo.health') ?? tools[0];
      seenTool = preferred.name;
      send({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: seenTool, arguments: {} },
      });
      continue;
    }

    if (payload.id === 3) {
      callAck = true;
      if (payload.error) {
        fail(`tool call failed for ${seenTool}`, JSON.stringify(payload.error));
        return;
      }
      pass();
      return;
    }
  }
});

server.on('exit', (code) => {
  if (!settled) {
    fail(`server exited before smoke check completed (exit ${code})`, `initialize=${initializeAck} list=${listAck} call=${callAck}`);
  }
});

setTimeout(() => {
  fail('timed out waiting for MCP handshake', `initialize=${initializeAck} list=${listAck} call=${callAck}`);
}, timeoutMs);

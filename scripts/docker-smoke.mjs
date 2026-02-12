#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const image = process.env.ZEO_DOCKER_IMAGE ?? 'zeolite:dev';
const repoRoot = resolve(process.cwd());
const examplesMount = `${repoRoot}/examples:/work/examples:ro`;

function run(label, command, args) {
  process.stdout.write(`- ${label}... `);
  const result = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8' });

  if (result.error && result.error.code === 'ENOENT') {
    process.stdout.write('SKIP\n');
    process.stderr.write(`[docker-smoke] missing executable '${command}'. Install Docker to run container checks.\n`);
    process.exit(2);
  }

  if (result.status !== 0) {
    process.stdout.write('FAIL\n');
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || `${label} failed\n`);
    process.exit(result.status ?? 1);
  }
  process.stdout.write('OK\n');
}

run('docker build', 'docker', ['build', '-t', image, '.']);
run('docker zeo --version', 'docker', ['run', '--rm', image, '--version']);
run('docker zeo --help', 'docker', ['run', '--rm', image, '--help']);
run('docker zeo mcp ping', 'docker', ['run', '--rm', image, 'mcp', 'ping']);
run('docker zeo analyze-pr mounted fixture', 'docker', ['run', '--rm', '-v', examplesMount, image, 'analyze-pr', '/work/examples/analyze-pr-auth/diff.patch']);

console.log(`docker smoke completed for ${image}`);

import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CLI_ENTRY = path.join(ROOT, 'apps/cli/dist/index.js');
const LOG_DIR = path.join(ROOT, 'chaos-logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const RUN_LOG = path.join(LOG_DIR, 'sweep.log');
fs.writeFileSync(RUN_LOG, ''); // Clear log

function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${msg}`);
  fs.appendFileSync(RUN_LOG, `[${timestamp}] ${msg}\n`);
}

function runCommand(args, cwd, env = {}) {
  const result = spawnSync('node', [CLI_ENTRY, ...args], {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    shell: true // Safe here as we construct args array
  });
  return result;
}

function parseJson(output) {
  const lines = output.trim().split('\n').reverse();
  for (const line of lines) {
    try {
      if (line.trim().startsWith('{')) {
        return JSON.parse(line);
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

async function phase1_determinism() {
  log('Phase 1: Determinism Stress (N=20)'); // Use 20 for speed in initial test
  const N = 20;
  const hashes = [];
  const baseDir = path.join(LOG_DIR, 'phase1');
  if (fs.existsSync(baseDir)) fs.rmSync(baseDir, { recursive: true, force: true });
  fs.mkdirSync(baseDir, { recursive: true });

  for (let i = 0; i < N; i++) {
    const runDir = path.join(baseDir, `run_${i}`);
    fs.mkdirSync(runDir, { recursive: true });

    // 1. Start Decision
    let res = runCommand(['start', '--title', 'Determinism Test', '--json'], runDir);
    if (res.status !== 0) {
      log(`FAIL: Run ${i} start failed: ${res.stderr}`);
      continue;
    }
    const startData = parseJson(res.stdout);
    if (!startData || !startData.decisionId) {
      log(`FAIL: Run ${i} failed to parse start output: ${res.stdout}`);
      continue;
    }
    const id = startData.decisionId;

    // 2. Add Evidence
    res = runCommand(['add-note', '--decision', id, '--text', 'The system must be deterministic.', '--json'], runDir);
    if (res.status !== 0) {
       log(`FAIL: Run ${i} add-note failed`);
       continue;
    }

    // 3. Run Decision
    res = runCommand(['run', '--decision', id, '--json'], runDir);
    if (res.status !== 0) {
      log(`FAIL: Run ${i} execution failed: ${res.stderr}`);
      continue;
    }
    const runData = parseJson(res.stdout);
    if (!runData || !runData.transcriptHash) {
       log(`FAIL: Run ${i} no transcript hash`);
       continue;
    }

    hashes.push(runData.transcriptHash);
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  // Check consistency
  const firstHash = hashes[0];
  const distinct = new Set(hashes);
  if (distinct.size === 1) {
    log(`PASS: All ${hashes.length} runs produced hash ${firstHash}`);
    return true;
  } else {
    log(`FAIL: Determinism check failed. Found ${distinct.size} distinct hashes.`);
    log(`Hashes: ${JSON.stringify([...distinct])}`);
    return false;
  }
}

async function main() {
  log('Starting Chaos Sweep...');

  // Verify build artifact exists
  if (!fs.existsSync(CLI_ENTRY)) {
    log(`ERROR: CLI not built at ${CLI_ENTRY}`);
    process.exit(1);
  }

  const p1 = await phase1_determinism();
  if (!p1) {
    log('Phase 1 Failed. Aborting.');
    process.exit(1);
  }

  log('Chaos Sweep Completed (Preview).');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';

const start = performance.now();
spawnSync('node', ['dist/index.js', '--version'], { encoding: 'utf8' });
const end = performance.now();

const duration = end - start;
console.log(`ZEO Startup Profile:`);
console.log(`Duration: ${duration.toFixed(2)}ms`);

if (duration > 150) {
  console.error(`❌ Cold start exceeds 150ms limit!`);
  process.exit(1);
} else {
  console.log(`✅ Cold start target met.`);
}

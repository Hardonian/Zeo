#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const databaseUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log('[db] skipped: SUPABASE_DB_URL or DATABASE_URL is not configured.');
  process.exit(0);
}

const check = spawnSync('psql', ['--version'], { encoding: 'utf8' });
if (check.status !== 0) {
  console.log('[db] skipped: psql client is unavailable in this environment.');
  process.exit(0);
}

const sql = `
WITH expected(table_name, column_name) AS (
  VALUES
    ('decision_runs','user_id'),
    ('decision_runs','tenant_id'),
    ('decision_runs','created_at'),
    ('jobs','status'),
    ('jobs','next_run_at'),
    ('decision_trace_events','run_id'),
    ('decision_trace_events','order_index')
),
indexed AS (
  SELECT t.relname AS table_name, a.attname AS column_name
  FROM pg_class t
  JOIN pg_namespace ns ON ns.oid = t.relnamespace
  JOIN pg_index i ON i.indrelid = t.oid
  JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
  WHERE ns.nspname = 'zeo'
)
SELECT e.table_name, e.column_name
FROM expected e
LEFT JOIN indexed i ON i.table_name = e.table_name AND i.column_name = e.column_name
WHERE i.column_name IS NULL
ORDER BY e.table_name, e.column_name;

EXPLAIN (FORMAT TEXT)
SELECT id FROM zeo.decision_runs
WHERE user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY created_at DESC
LIMIT 25;

EXPLAIN (FORMAT TEXT)
SELECT id FROM zeo.jobs
WHERE status = 'queued'
ORDER BY next_run_at NULLS LAST
LIMIT 25;

EXPLAIN (FORMAT TEXT)
SELECT id FROM zeo.decision_trace_events
WHERE run_id = '00000000-0000-0000-0000-000000000000'
ORDER BY order_index
LIMIT 100;
`;

const run = spawnSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-X', '-A', '-t', '-c', sql], {
  encoding: 'utf8',
  env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? '' },
});

if (run.status !== 0) {
  process.stderr.write(`[db] check failed\n${run.stderr || run.stdout}\n`);
  process.exit(run.status ?? 1);
}

const lines = run.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
const missing = lines.filter((line) => line.includes('|'));

if (missing.length > 0) {
  console.error('[db] missing indexes for RLS/query predicates:');
  for (const line of missing) {
    const [table, column] = line.split('|');
    console.error(` - zeo.${table}(${column})`);
    console.error(`   suggestion: CREATE INDEX IF NOT EXISTS ${table}_${column}_idx ON zeo.${table} (${column});`);
  }
  process.exit(1);
}

const explainOutput = lines.filter((line) => /Seq Scan|Index Scan|Bitmap/.test(line));
const seqScans = explainOutput.filter((line) => /Seq Scan/i.test(line));
if (seqScans.length > 0) {
  console.error('[db] sequential scans detected in hot query EXPLAIN output:');
  for (const line of seqScans) console.error(` - ${line}`);
  process.exit(1);
}

console.log('[db] RLS/index guardrails passed.');

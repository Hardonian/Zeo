#!/usr/bin/env node

/**
 * Storage Corruption Scrubber (WH-03)
 *
 * Traverses warehouse storage and recalculates cryptographic SHA-256 hashes
 * across stored envelopes and content-addressed blobs.
 * Reports corrupted, tampered, or malformed entries.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT_DIR = process.cwd();
const TARGET_DIRS = [
  join(ROOT_DIR, '.zeo', 'warehouse'),
  join(ROOT_DIR, 'data', 'warehouse'),
];

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function canonicalize(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = canonicalize(obj[key]);
  }
  return sorted;
}

function computeContentHash(data) {
  return sha256(JSON.stringify(canonicalize(data)));
}

function walkFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walkFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    process.stderr.write(`[scrubber] Warning: unable to access ${dir}: ${err.message}\n`);
  }
  return files;
}

async function runScrubber() {
  process.stdout.write('=== ZEO WAREHOUSE STORAGE INTEGRITY SCRUBBER (WH-03) ===\n');
  const startMs = Date.now();

  let totalFilesScanned = 0;
  let validRecords = 0;
  let validBlobs = 0;
  const corrupted = [];

  for (const baseDir of TARGET_DIRS) {
    if (!existsSync(baseDir)) continue;

    const files = walkFiles(baseDir);
    for (const file of files) {
      totalFilesScanned++;
      try {
        const raw = readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw);

        // Check if envelope record
        if (parsed.hashes && parsed.hashes.contentHash && parsed.data !== undefined) {
          const expectedHash = parsed.hashes.contentHash;
          const actualHash = computeContentHash(parsed.data);

          if (expectedHash !== actualHash) {
            corrupted.push({
              file,
              type: 'envelope',
              reason: `Hash mismatch: recorded=${expectedHash.slice(0, 16)}..., computed=${actualHash.slice(0, 16)}...`,
            });
          } else {
            validRecords++;
          }
        } else if (parsed.hash && parsed.data && typeof parsed.data === 'string') {
          // Content-addressed blob
          const buffer = Buffer.from(parsed.data, 'base64');
          const computedHash = sha256(buffer);

          if (computedHash !== parsed.hash) {
            corrupted.push({
              file,
              type: 'blob',
              reason: `Blob hash mismatch: expected=${parsed.hash.slice(0, 16)}..., computed=${computedHash.slice(0, 16)}...`,
            });
          } else {
            validBlobs++;
          }
        }
      } catch (err) {
        corrupted.push({
          file,
          type: 'parse_error',
          reason: `Malformed JSON: ${err.message}`,
        });
      }
    }
  }

  const durationMs = Date.now() - startMs;
  process.stdout.write(`Scanned ${totalFilesScanned} warehouse storage objects in ${durationMs}ms\n`);
  process.stdout.write(`Valid envelopes: ${validRecords} | Valid blobs: ${validBlobs}\n`);

  if (corrupted.length > 0) {
    process.stderr.write(`\n[SCRUBBER ALERT] Found ${corrupted.length} corrupted object(s):\n`);
    for (const c of corrupted) {
      process.stderr.write(`  - [${c.type}] ${c.file}: ${c.reason}\n`);
    }
    process.exit(1);
  }

  process.stdout.write('Integrity Status: 100% HEALTHY (Zero corruption detected)\n');
  process.exit(0);
}

runScrubber();

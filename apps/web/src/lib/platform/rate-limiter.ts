/**
 * Sliding-window rate limiter — in-memory per-process.
 * Lightweight token-bucket variant for per-org and per-API-key rate limiting.
 */

import type { RateLimitResult } from './types';

interface BucketEntry {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per second
}

const buckets = new Map<string, BucketEntry>();

const DEFAULT_MAX_TOKENS = 60;
const DEFAULT_REFILL_RATE = 1; // 1 token/second = 60/min
const WINDOW_MS = 60_000;

function getBucket(key: string, maxTokens = DEFAULT_MAX_TOKENS, refillRate = DEFAULT_REFILL_RATE): BucketEntry {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: Date.now(), maxTokens, refillRate };
    buckets.set(key, bucket);
  }
  return bucket;
}

function refill(bucket: BucketEntry): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
  bucket.lastRefill = now;
}

export function checkRateLimit(
  key: string,
  cost = 1,
  maxTokens = DEFAULT_MAX_TOKENS,
  refillRate = DEFAULT_REFILL_RATE,
): RateLimitResult {
  const bucket = getBucket(key, maxTokens, refillRate);
  refill(bucket);

  if (bucket.tokens >= cost) {
    bucket.tokens -= cost;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetAt: Date.now() + WINDOW_MS,
    };
  }

  const waitSeconds = (cost - bucket.tokens) / bucket.refillRate;
  return {
    allowed: false,
    remaining: 0,
    resetAt: Date.now() + WINDOW_MS,
    retryAfter: Math.ceil(waitSeconds),
  };
}

/** Periodic cleanup of stale buckets (call from a timer if desired). */
export function pruneStale(maxAgeMs = 300_000): void {
  const cutoff = Date.now() - maxAgeMs;
  for (const [key, bucket] of buckets) {
    if (bucket.lastRefill < cutoff) {
      buckets.delete(key);
    }
  }
}

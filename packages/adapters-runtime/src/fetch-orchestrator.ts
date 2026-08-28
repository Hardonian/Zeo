/**
 * Fetch orchestrator with caching, retries, rate limiting, and timeouts
 */

import { createHash } from "crypto";
import type {
  FetchOrchestrator,
  CacheEntry,
  CacheConfig,
  RateLimitState,
  RateLimitConfig,
  RetryPolicy,
  FetchMetrics,
} from "./types.js";
import { RateLimitError } from "./errors.js";

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttlMs: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  keyWindowMs: 60000, // 1 minute window for cache key bucketing
};

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  requestsPerWindow: 60,
  windowMs: 60000, // 1 minute
  burstAllowance: 10,
};

interface InMemoryCache {
  entries: Map<string, CacheEntry<unknown>>;
  hits: number;
  misses: number;
}

export function computeCacheKey(
  adapterId: string,
  url: string,
  params: Record<string, unknown>,
  windowMs: number
): string {
  // Round timestamp to window boundary for deterministic caching
  const now = Date.now();
  const windowBoundary = Math.floor(now / windowMs) * windowMs;

  // Create deterministic string
  const paramsStr = JSON.stringify(params, Object.keys(params).sort());
  const keyString = `${adapterId}:${url}:${paramsStr}:${windowBoundary}`;

  return createHash("sha256").update(keyString).digest("hex");
}

export function createFetchOrchestrator(
  cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG,
  rateLimitConfig: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG,
  retryPolicy: RetryPolicy = DEFAULT_RETRY_POLICY
): FetchOrchestrator {
  const cache: InMemoryCache = {
    entries: new Map(),
    hits: 0,
    misses: 0,
  };

  const rateLimits = new Map<string, RateLimitState>();
  const metrics: FetchMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    rateLimitHits: 0,
    retryCount: 0,
    errorCount: 0,
    averageLatencyMs: 0,
  };

  // Cleanup expired cache entries periodically
  function cleanupCache(): void {
    const now = new Date().toISOString();
    for (const [key, entry] of cache.entries) {
      if (entry.expiresAt < now) {
        cache.entries.delete(key);
      }
    }
  }

  // Run cleanup every minute
  const cleanupInterval = setInterval(cleanupCache, 60000);

  // Prevent unhandled rejection on cleanup
  cleanupInterval.unref?.();

  function checkRateLimit(adapterId: string): void {
    const now = new Date();
    let state = rateLimits.get(adapterId);

    if (!state) {
      state = {
        adapterId,
        requestsInWindow: 0,
        windowStart: now.toISOString(),
        limit: rateLimitConfig.requestsPerWindow,
        windowMs: rateLimitConfig.windowMs,
        resetAt: new Date(now.getTime() + rateLimitConfig.windowMs).toISOString(),
      };
      rateLimits.set(adapterId, state);
    }

    // Check if window has reset
    const windowStart = new Date(state.windowStart).getTime();
    if (now.getTime() - windowStart >= rateLimitConfig.windowMs) {
      state.requestsInWindow = 0;
      state.windowStart = now.toISOString();
      state.resetAt = new Date(now.getTime() + rateLimitConfig.windowMs).toISOString();
    }

    // Check if rate limit exceeded (with burst allowance)
    const effectiveLimit = rateLimitConfig.requestsPerWindow + rateLimitConfig.burstAllowance;
    if (state.requestsInWindow >= effectiveLimit) {
      metrics.rateLimitHits++;
      throw new RateLimitError(adapterId, new Date(state.resetAt));
    }

    state.requestsInWindow++;
  }

  function getFromCache<T>(cacheKey: string): CacheEntry<T> | null {
    const entry = cache.entries.get(cacheKey) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = new Date().toISOString();
    if (entry.expiresAt < now) {
      cache.entries.delete(cacheKey);
      return null;
    }

    return entry;
  }

  function setCache<T>(cacheKey: string, data: T, adapterId: string, paramsHash: string): void {
    // Enforce max size by removing oldest entries
    if (cache.entries.size >= cacheConfig.maxSize) {
      const oldestKey = cache.entries.keys().next().value;
      if (oldestKey) {
        cache.entries.delete(oldestKey);
      }
    }

    const now = new Date();
    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + cacheConfig.ttlMs).toISOString(),
      checksum: createHash("sha256").update(JSON.stringify(data)).digest("hex"),
      adapterId,
      paramsHash,
    };

    cache.entries.set(cacheKey, entry);
  }

  async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    attempt: number = 0
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const latency = Date.now() - startTime;
      metrics.averageLatencyMs =
        (metrics.averageLatencyMs * metrics.totalRequests + latency) / (metrics.totalRequests + 1);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      const isRetryable = retryPolicy.retryableStatuses.includes((error as Error).message.match(/HTTP (\d+)/)?.[1] as unknown as number) ||
        error instanceof TypeError; // Network errors

      if (isRetryable && attempt < retryPolicy.maxRetries) {
        metrics.retryCount++;
        const delay = Math.min(
          retryPolicy.baseDelayMs * Math.pow(retryPolicy.backoffMultiplier, attempt),
          retryPolicy.maxDelayMs
        );
        await sleep(delay);
        return fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    }
  }

  return {
    async fetch<T>(
      adapterId: string,
      url: string,
      options: RequestInit,
      params: Record<string, unknown>
    ): Promise<{ data: T; fromCache: boolean; cacheKey: string }> {
      metrics.totalRequests++;

      // Check rate limit first
      checkRateLimit(adapterId);

      // Compute cache key
      const cacheKey = computeCacheKey(adapterId, url, params, cacheConfig.keyWindowMs);

      // Try cache
      const cached = getFromCache<T>(cacheKey);
      if (cached) {
        metrics.cacheHits++;
        return { data: cached.data, fromCache: true, cacheKey };
      }

      metrics.cacheMisses++;

      // Fetch from source
      try {
        const data = await fetchWithRetry<T>(url, options);

        // Store in cache
        const paramsHash = createHash("sha256").update(JSON.stringify(params)).digest("hex");
        setCache(cacheKey, data, adapterId, paramsHash);

        return { data, fromCache: false, cacheKey };
      } catch (error) {
        metrics.errorCount++;
        throw error;
      }
    },

    clearCache(adapterId?: string): void {
      if (adapterId) {
        for (const [key, entry] of cache.entries) {
          if (entry.adapterId === adapterId) {
            cache.entries.delete(key);
          }
        }
      } else {
        cache.entries.clear();
      }
    },

    getRateLimitState(adapterId: string): RateLimitState {
      let state = rateLimits.get(adapterId);

      if (!state) {
        const now = new Date();
        state = {
          adapterId,
          requestsInWindow: 0,
          windowStart: now.toISOString(),
          limit: rateLimitConfig.requestsPerWindow,
          windowMs: rateLimitConfig.windowMs,
          resetAt: new Date(now.getTime() + rateLimitConfig.windowMs).toISOString(),
        };
        rateLimits.set(adapterId, state);
      }

      return state;
    },
  };
}

